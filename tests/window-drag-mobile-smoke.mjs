import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [source, styles, bundle, bundleCss, page, manifest] = await Promise.all([
  readFile(new URL("../webwindows-vue/src/stores/legacyWindow.js", import.meta.url), "utf8"),
  readFile(new URL("../webwindows-vue/src/desktop/WindowManager.vue", import.meta.url), "utf8"),
  readFile(new URL("../dist-window/window-manager-widget.js", import.meta.url), "utf8"),
  readFile(new URL("../dist-window/window-manager-widget.css", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../deploy/ftp-manifest.json", import.meta.url), "utf8").then(JSON.parse),
]);

assert.match(source, /header\?\.addEventListener\('pointerdown'/,
  "window title bars must use Pointer Events for mouse, pen, and touch");
assert.match(source, /setPointerCapture\(movePointerId\)/,
  "title-bar dragging must retain touch capture outside the header");
assert.match(source, /pointercancel/,
  "interrupted Android gestures must cleanly finish window dragging");
assert.match(source, /rect\.width \/ element\.offsetWidth/,
  "window dragging must measure the Android rendered scale");
assert.match(source, /rect\.height \/ element\.offsetHeight/,
  "window dragging must measure independent horizontal and vertical scales");
assert.match(source, /left: rect\.left \/ scale\.x/,
  "pointer down must convert the rendered window position to layout coordinates");
assert.match(source, /top: rect\.top \/ scale\.y/,
  "pointer down must not make zoomed windows jump toward the upper-left");
assert.match(source, /\(ev\.clientX - moveStart\.pointerX\) \/ scale\.x/,
  "horizontal touch deltas must be converted through body zoom");
assert.match(source, /\(ev\.clientY - moveStart\.pointerY\) \/ scale\.y/,
  "vertical touch deltas must be converted through body zoom");
assert.match(source, /\(ev\.clientX - startX\) \/ resizeScale\.x/,
  "window resizing must share the zoom conversion");
assert.match(source, /function fitWindowToViewport\(winEl\)/,
  "non-compact mobile viewports must clamp newly opened windows to the workspace");
assert.match(source, /Math\.min\(winEl\.offsetWidth[\s\S]*?maxWidth\)/,
  "oversized default window widths must be reduced before display");
assert.match(source, /window\.visualViewport\?\.addEventListener\('resize', fitAllWindows\)/,
  "window bounds must be recomputed after mobile viewport and keyboard changes");
assert.match(styles, /\.window-header\s*\{[\s\S]*?touch-action:\s*none/,
  "the title bar must prevent Android WebView from stealing the drag gesture");

const tabletScale = 0.75;
const renderedStart = { x: 76.819442749, y: 89.375 };
const pointerDelta = { x: 222, y: 163 };
const layoutStart = { x: renderedStart.x / tabletScale, y: renderedStart.y / tabletScale };
const layoutEnd = {
  x: layoutStart.x + pointerDelta.x / tabletScale,
  y: layoutStart.y + pointerDelta.y / tabletScale,
};
assert.deepEqual(
  { x: layoutEnd.x * tabletScale, y: layoutEnd.y * tabletScale },
  { x: renderedStart.x + pointerDelta.x, y: renderedStart.y + pointerDelta.y },
  "the physical tablet window must follow the finger without a zoom-induced jump",
);

assert.match(bundle, /pointerdown/);
assert.match(bundle, /setPointerCapture/);
assert.match(bundle, /pointerX/);
assert.match(bundle, /scaleX/,
  "the production bundle must contain zoom-aware delta-based window dragging");
assert.match(bundleCss, /touch-action:none/);
assert.match(page, /window-manager-widget\.(?:css|js)\?v=20260826-window-fit-1/g);
for (const file of [
  "index.html",
  "dist-window/window-manager-widget.css",
  "dist-window/window-manager-widget.js",
  "dist-window/window-manager-widget.umd.js",
]) {
  assert.ok((manifest.uploadFiles || []).includes(file), `window drag release must upload ${file}`);
}

console.log("Mobile window drag smoke tests passed");
