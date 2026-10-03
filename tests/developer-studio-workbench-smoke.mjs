import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const studio = read("webwindows-vue/src/developer-studio/DeveloperStudio.vue");
const editor = read("webwindows-vue/src/developer-studio/editor/MonacoEditor.vue");
const monaco = read("webwindows-vue/src/developer-studio/editor/monaco-runtime.js");
const tree = read("webwindows-vue/src/developer-studio/project/tree-model.js");
const page = read("developer-studio.html");
const locale = read("assets/js/tw.js");
const viteConfig = read("webwindows-vue/vite.developer-studio.config.js");

assert.match(studio, /WebWindows\?\.fileDialog/);
assert.match(studio, /fileDialog\.saveBlob/);
assert.match(studio, /purpose:\s*"developer-studio-build-export"/);
assert.doesNotMatch(studio, /URL\.createObjectURL|anchor\.download/);
assert.doesNotMatch(studio, /WebWindowsNative|NativeAdapter/);

for (const panel of ["explorer", "inspector", "bottom"]) {
  assert.match(studio, new RegExp(`togglePanel\\(\\"${panel}\\"\\)`));
}
for (const shortcut of ["Ctrl+N", "Ctrl+S", "Ctrl+Shift+B", "Ctrl+B", "Ctrl+J", "Ctrl+Alt+I", "Shift+F5"]) {
  assert.ok(studio.includes(shortcut), `missing shortcut label: ${shortcut}`);
}
assert.match(studio, /webwindows-developer-studio-layout/);
assert.match(studio, /webwindows-developer-studio-theme/);
assert.match(studio, /StudioIcon name="file-add"/);
assert.match(studio, /StudioIcon name="folder-add"/);
assert.match(studio, /StudioIcon name="rename"/);
assert.match(studio, /StudioIcon name="delete"/);

assert.match(editor, /webwindows-studio-dark/);
assert.match(monaco, /tag\.html/);
assert.match(monaco, /attribute\.name\.html/);
assert.match(monaco, /attribute\.name\.css/);
assert.match(monaco, /regexp/);
assert.match(monaco, /setMonarchTokensProvider/);
assert.doesNotMatch(monaco, /definitions\/(?:css|html|javascript)\/register\.js/);
assert.match(tree, /svg:\s*"html"/);
assert.match(viteConfig, /base:\s*"\.\/"/);

assert.match(page, /assets\/js\/tw\.js/);
assert.match(page, /assets\/js\/cloud-file-dialog\.js/);
for (const language of ["languageCatalog.en", "languageCatalog.tw", "languageCatalog.jp"]) {
  assert.ok(locale.includes(language));
}
for (const label of ["保存 ZIP 到云资料", "项目资源管理器", "深色主题", "权限诊断"]) {
  assert.ok(locale.includes(label), `missing localized Studio label: ${label}`);
}

console.log("developer studio workbench smoke tests passed");
