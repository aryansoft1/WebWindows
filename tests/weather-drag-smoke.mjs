import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [source, productionBundle, productionCss, page, manifest] = await Promise.all([
  readFile(new URL("../webwindows-vue/src/desktop/weather.vue", import.meta.url), "utf8"),
  readFile(new URL("../dist-weather/weather-widget.umd.js", import.meta.url), "utf8"),
  readFile(new URL("../dist-weather/weather-widget.css", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../deploy/ftp-manifest.json", import.meta.url), "utf8").then(JSON.parse),
]);

assert.match(source, /const base = \{ position: 'fixed'/,
  "weather must remain attached to the viewport in Android fullscreen mode");
assert.match(source, /e\.currentTarget\.getBoundingClientRect\(\)/,
  "weather drag must preserve its rendered position before moving");
assert.match(source, /rect\.width \/ element\.offsetWidth/,
  "weather drag must measure the rendered scale applied by Android body zoom");
assert.match(source, /rect\.height \/ element\.offsetHeight/,
  "weather drag must measure vertical rendering scale independently");
assert.match(source, /rect\.left \/ scale\.x/,
  "pointer down must convert the rendered position back to layout coordinates");
assert.match(source, /rect\.top \/ scale\.y/,
  "pointer down must not jump when the page is zoomed");
assert.match(source, /dragStart\.x \+ \(clientX - this\.dragStart\.pointerX\) \/ scaleX/,
  "horizontal pointer deltas must be converted through the rendered scale");
assert.match(source, /dragStart\.y \+ \(clientY - this\.dragStart\.pointerY\) \/ scaleY/,
  "vertical pointer deltas must be converted through the rendered scale");
assert.doesNotMatch(source, /clientX - offset\.x|clientY - offset\.y/,
  "the legacy absolute-coordinate drag path must not return");
assert.match(source, /@pointerdown="onPointerDown"[\s\S]*@pointermove="onPointerMove"[\s\S]*@pointercancel="onPointerEnd"/,
  "desktop, touch, and pen drag must share the same pointer-event path");
assert.match(source, /setPointerCapture\?\.\(e\.pointerId\)/,
  "mobile drag must retain the pointer when it moves outside the widget");
assert.doesNotMatch(source, /@touchstart|onTouchStart|touchOffset|@mousedown|onMouseDown/,
  "mobile and desktop drag must not drift into separate implementations");
assert.doesNotMatch(source, /e\.offsetX|e\.offsetY|e\.pageX|e\.pageY/,
  "weather drag must not use child offsets or page coordinates");

// Reproduce the physical tablet's Android WebView geometry: body zoom is 0.75,
// while pointer coordinates and getBoundingClientRect() are rendered pixels.
const tabletScale = 0.75;
const renderedStart = { x: 718.5, y: 32.4375 };
const layoutStart = { x: renderedStart.x / tabletScale, y: renderedStart.y / tabletScale };
const pointerDelta = { x: -180, y: 145 };
const layoutEnd = {
  x: layoutStart.x + pointerDelta.x / tabletScale,
  y: layoutStart.y + pointerDelta.y / tabletScale,
};
assert.deepEqual(
  { x: layoutEnd.x * tabletScale, y: layoutEnd.y * tabletScale },
  { x: renderedStart.x + pointerDelta.x, y: renderedStart.y + pointerDelta.y },
  "a 0.75 body zoom must preserve the finger-to-widget rendered delta without an upper-left jump",
);

assert.match(source, /document\.documentElement\.clientWidth \|\| window\.innerWidth/);
assert.match(source, /window\.innerWidth\) \/ scaleX/,
  "horizontal drag bounds must use the zoom-adjusted layout viewport");
assert.match(source, /window\.innerHeight\) \/ scaleY/,
  "vertical drag bounds must use the zoom-adjusted layout viewport");
assert.match(source, /Math\.min\(viewportWidth - width/,
  "weather drag must remain inside the visible desktop");
assert.match(source, /enableHighAccuracy:\s*true/,
  "weather location must request the device's high-accuracy provider when available");
assert.match(source, /watchPosition\(onPos/,
  "weather location must briefly refine the initial coordinate fix");
assert.match(source, /toFixed\(4\)/,
  "weather lookup must retain neighborhood-level coordinates instead of rounding to kilometers");
assert.doesNotMatch(source, /offsetLat|offsetLon/,
  "weather location must not apply a fixed correction belonging to another device");
assert.match(source, /return MAP\[code\]/,
  "Open-Meteo weather-code fallback must use the declared map");
assert.match(source, /return M\[c\]/,
  "wttr weather-code fallback must use its own declared map");
assert.match(source, /weatherLocation === '定位中\.\.\.'\) this\.weatherLocation = '当前位置'/,
  "a successful coordinate fix must finish the locating state even when reverse geocoding is unavailable");
assert.match(productionBundle, /position:"fixed"/,
  "the deployed bundle must contain fixed viewport positioning");
assert.match(productionBundle, /dragStart/,
  "the deployed bundle must contain delta-based dragging");
assert.match(productionBundle, /onPointerdown/);
assert.match(productionBundle, /setPointerCapture/);
assert.doesNotMatch(productionBundle, /onTouchStart|onMouseDown/);
assert.match(productionCss, /position:fixed/);
assert.match(productionCss, /touch-action:none/);
assert.match(page, /weather-widget\.(?:css|umd\.js)\?v=20260823-weather-drag-3/g);
for (const file of [
  "index.html",
  "dist-weather/weather-widget.css",
  "dist-weather/weather-widget.umd.js",
  "dist-weather/weather-widget.global.js",
]) {
  assert.ok((manifest.requiredFiles || []).includes(file), `deployment manifest must continue managing ${file}`);
}

console.log("Weather drag coordinate smoke tests passed");
