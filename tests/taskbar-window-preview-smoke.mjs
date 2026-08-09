import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const index = read("index.html");
const preview = read("assets/js/taskbar-window-preview.js");

assert.match(index, /vendor\/html2canvas\.min\.js\?v=1\.4\.1/);
assert.match(index, /taskbar-window-preview\.js\?v=20260809-window-thumbnail-1/);
assert.equal(fs.existsSync(path.join(root, "assets/js/vendor/html2canvas.min.js")), true);
assert.match(preview, /window\.html2canvas\(win/);
assert.match(preview, /document\.createElement\("canvas"\)/);
assert.match(preview, /context\.drawImage/);
assert.match(preview, /THUMBNAIL_WIDTH = 280/);
assert.match(preview, /THUMBNAIL_HEIGHT = 176/);
assert.doesNotMatch(preview, /cloneNode\(true\)|srcdoc/);

console.log("taskbar window preview smoke test passed");
