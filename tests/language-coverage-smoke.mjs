import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = process.argv[2] || fileURLToPath(new URL("..", import.meta.url));
const languageSource = fs.readFileSync(path.join(root, "assets/js/tw.js"), "utf8");
const context = { window: {}, document: { addEventListener() {} }, localStorage: { getItem: () => "zh", setItem() {} },
  navigator: { language: "zh-CN", languages: ["zh-CN"] }, Node: { ELEMENT_NODE: 1 }, NodeFilter: { SHOW_TEXT: 4 },
  MutationObserver: class {}, CustomEvent: class {} };
vm.runInNewContext(languageSource + ";globalThis.__catalog=languageCatalog;globalThis.__translate=translateText;", context);

for (const language of ["tw", "en", "jp"]) assert.ok(Object.keys(context.__catalog[language]).length >= 100, `${language} catalog is unexpectedly small`);

const surfaces = ["index.html", "settings.html", "login.html", "worker_SheetCreater.html", "worker_WriteEditor.html",
  "worker_SlideEditor.html", "function-center.html", "developer.html", "cloud/browser/files.asp", "cloud/browser/private-files.asp"];
for (const file of surfaces) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(source, /assets\/js\/tw\.js/, `${file} is not connected to the shared language library`);
}

const critical = ["设置", "语言与区域", "登录", "用户名", "密码", "云资料", "保存", "取消", "功能中心", "开发者中心",
  "从云资料打开", "另存到云资料", "正在保存", "保存失败", "未保存", "关闭", "最小化", "最大化"];
for (const source of critical) {
  for (const language of ["tw", "en", "jp"]) {
    assert.ok(Object.prototype.hasOwnProperty.call(context.__catalog[language], source), `missing ${language} translation key: ${source}`);
  }
}
console.log("shared language coverage and hard-coded surface scan passed");
