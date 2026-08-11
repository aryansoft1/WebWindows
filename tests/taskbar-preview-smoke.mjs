import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../assets/js/taskbar-experience.js", import.meta.url), "utf8");
const css = await readFile(new URL("../assets/css/main.css", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

assert.match(index, /taskbar-experience\.js\?v=20260811-preview-1/);
assert.match(source, /frameDocument\?\.body/);
assert.match(source, /PREVIEW_SHOW_DELAY\s*=\s*110/);
assert.match(source, /PREVIEW_HIDE_DELAY\s*=\s*240/);
assert.match(source, /thumbnailCache\.delete/);
assert.match(source, /preview\?\.dataset\.windowId[\s\S]*hidePreview/);
assert.match(css, /\.taskbar-window-preview__snapshot/);
console.log("Taskbar preview smoke tests passed");
