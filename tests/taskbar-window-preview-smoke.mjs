import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const index = read("index.html");
const activeScript = /taskbar-experience\.js/.test(index)
  ? "assets/js/taskbar-experience.js"
  : "assets/js/taskbar-window-preview.js";
const preview = read(activeScript);

assert.match(index, /vendor\/html2canvas\.min\.js\?v=1\.4\.1/);
assert.match(index, /taskbar-(?:experience|window-preview)\.js/);
assert.equal(fs.existsSync(path.join(root, "assets/js/vendor/html2canvas.min.js")), true);
assert.match(preview, /window\.html2canvas\(win/);
assert.match(preview, /pixelValue\(winStyle\.width\)\s*\|\|\s*640/);
assert.match(preview, /pixelValue\(winStyle\.height\)\s*\|\|\s*420/);
assert.match(preview, /buildWindowSnapshot\(win, viewport, requestId\)/);
assert.doesNotMatch(preview, /if\s*\(!win\.querySelector\("iframe"\)\)\s*buildWindowSnapshot/);
const sameVisibleBranch = preview.match(/if\s*\(sameVisible\)\s*\{([\s\S]*?)\n\s{4}\}/)?.[1] || "";
assert.match(sameVisibleBranch, /current\?\.dataset\?\.miniature\s*===\s*"1"/);
assert.match(sameVisibleBranch, /liveMiniature\(icon, win\)/);
assert.match(sameVisibleBranch, /if\s*\(needsSnapshot\s*&&\s*win\s*&&\s*viewport\)\s*buildWindowSnapshot\(win, viewport, previewRequest\)/);
assert.match(preview, /document\.createElement\("canvas"\)/);
assert.match(preview, /context\.drawImage/);
assert.match(preview, /(?:THUMBNAIL_WIDTH|thumbnail\.width)\s*=\s*280/);
assert.match(preview, /(?:THUMBNAIL_HEIGHT|thumbnail\.height)\s*=\s*176/);
assert.doesNotMatch(preview, /srcdoc/);
assert.match(preview, /liveMiniature/);
assert.match(preview, /event\.dataTransfer\.setDragImage\(dragImage,\s*0,\s*0\)/);
assert.match(preview, /function gateWindowRootUntilSessionReady\(\)/);
assert.match(preview, /root\.style\.opacity\s*=\s*"0"/);
assert.match(preview, /root\.style\.pointerEvents\s*=\s*"none"/);
assert.match(preview, /webwindows:session-ready/);

console.log("taskbar window preview smoke test passed");
