import assert from "node:assert/strict";
import fs from "node:fs/promises";

async function read(path) {
  return fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const [
  index,
  mainCss,
  windowSource,
  legacyWindowSource,
  desktopMenusSource,
  deskTalkCss,
  deskTalkJs,
  functionCenterCss,
  writeEditor,
  slideEditor,
  sheetEditor,
  appManifestSource
] = await Promise.all([
  read("index.html"),
  read("assets/css/main.css"),
  read("webwindows-vue/src/desktop/WindowManager.vue"),
  read("webwindows-vue/src/stores/legacyWindow.js"),
  read("webwindows-vue/src/desktop/DesktopContextMenus.vue"),
  read("assets/css/desktalk.css"),
  read("assets/js/desktalk.js"),
  read("assets/css/function-center.css"),
  read("worker_WriteEditor.html"),
  read("worker_SlideEditor.html"),
  read("worker_SheetCreater.html"),
  read("data/apps/system-apps.json")
]);

assert.match(index, /name="viewport"[^>]+viewport-fit=cover/);
assert.match(mainCss, /#start-menu[\s\S]*box-sizing:\s*border-box/);
assert.match(mainCss, /\.taskbar-app-strip[\s\S]*overflow-x:\s*auto/);
assert.match(windowSource, /MOBILE_ICON_POSITIONS_KEY/);
assert.match(windowSource, /isCompactDesktopLayout\(\)/);
assert.match(windowSource, /\.window\s*\{[\s\S]*position:\s*fixed\s*!important/);
assert.match(legacyWindowSource, /taskbar-app-strip/);
assert.match(legacyWindowSource, /isCompactWindowLayout\(\)/);
assert.match(desktopMenusSource, /longPressTimer/);
assert.match(desktopMenusSource, /pointerType === 'mouse'/);
assert.match(deskTalkCss, /#presence-sheet[\s\S]*bottom:\s*51px/);
assert.match(deskTalkJs, /const isFab/);
assert.match(functionCenterCss, /max-width:\s*820px/);

for (const editor of [writeEditor, slideEditor, sheetEditor]) {
  assert.match(editor, /WebWindows\.fileDialog\.(?:open|save|write|saveBlob)/);
  assert.doesNotMatch(editor, /showOpenFilePicker|showSaveFilePicker|type=["']file["']/);
  assert.match(editor, /max-width:820px/);
}

const appManifest = JSON.parse(appManifestSource);
for (const [id, version] of [
  ["com.aryansoft.webwindows.sheet", "mobile-4"],
  ["com.aryansoft.webwindows.write", "mobile-2"],
  ["com.aryansoft.webwindows.slide", "mobile-2"]
]) {
  const app = appManifest.apps.find((candidate) => candidate.id === id);
  assert.ok(app, `missing ${id}`);
  assert.match(app.entry, new RegExp(version));
}

console.log("mobile frontend smoke test passed");
