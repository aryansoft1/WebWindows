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
  "从云资料打开", "另存到云资料", "正在保存", "保存失败", "未保存", "关闭", "最小化", "最大化",
  // 设置 → 应用（启动项）选项卡（T-031：其它语言下必须整句翻译，缺键会半截混排）
  "应用", "启动项", "启用", "毫秒", "后台启动", "最小化启动", "正常窗口",
  "管理 WebWindows 应用的桌面行为。启动项只保存当前使用者的配置，应用自身不能绕过启动管理修改该列表。",
  "桌面会话就绪（session-ready）后，已启用的启动项会按设定延迟依次自动启动。关闭开关即停止该应用的自动启动。",
  "启动项服务尚未就绪，请重新打开设置。", "正在读取启动项……", "启动项读取失败。", "当前没有可配置的应用。",
  " 的启动项已保存。", " 的启动项保存失败。", " 启动模式", " 启动延迟（毫秒）"];
for (const source of critical) {
  for (const language of ["tw", "en", "jp"]) {
    assert.ok(Object.prototype.hasOwnProperty.call(context.__catalog[language], source), `missing ${language} translation key: ${source}`);
  }
}
console.log("shared language coverage and hard-coded surface scan passed");
