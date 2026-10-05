import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../assets/js/tw.js", import.meta.url), "utf8");
const supplement = await readFile(new URL("../assets/js/sysinfo-i18n.js", import.meta.url), "utf8");
const html = await readFile(new URL("../sysinfo.html", import.meta.url), "utf8");
const listeners = new Map();
const document = { addEventListener: (name, callback) => listeners.set(name, callback) };
const window = { addEventListener() {}, dispatchEvent() {} };
const localStorage = { getItem: () => "zh", setItem() {} };
const context = vm.createContext({ window, document, localStorage, console });

vm.runInContext(source, context, { filename: "tw.js" });
vm.runInContext(supplement, context, { filename: "sysinfo-i18n.js" });
const translate = (text, language) => window.WebWindowsI18n.translate(text, language);

for (const [sourceText, expected] of [
  ["系统信息", "システム情報"],
  ["设备接口能力", "Device API の機能"],
  ["存储提供程序", "ストレージプロバイダー"],
  ["设备接口不可用", "Device API を利用できません"],
  ["浏览器 / WebWindows OS", "ブラウザー / WebWindows OS"],
  ["3.00% 已使用（兼容默认 1 GB）", "3.00% 使用済み（互換用の既定容量 1 GB）"],
]) assert.equal(translate(sourceText, "jp"), expected, `Japanese translation: ${sourceText}`);

assert.equal(translate("设备接口能力", "en"), "Device API capabilities");
assert.equal(translate("设备接口能力", "tw"), "裝置 API 能力");
assert.match(html, /tw\.js[^\n]*[\s\S]*sysinfo-i18n\.js[^\n]*[\s\S]*sysinfo\.js/);
assert.match(html, /sysinfo-i18n\.js\?v=20261006-sysinfo-i18n-1/);
console.log("System Information i18n smoke passed (Japanese, English, Traditional Chinese, dynamic labels, script order).");
