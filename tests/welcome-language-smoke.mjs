import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [index, main, translations] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/main.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/tw.js", import.meta.url), "utf8"),
]);

assert.match(index, /id="about-overlay"/);
assert.match(main, /function openAbout\(\)[\s\S]*WebWindowsI18n[\s\S]*i18n\.apply\(document, i18n\.getLanguage\(\)\)/,
  "the welcome/about surface must apply the active WebWindows language before it is shown");
for (const text of ["你好，我是 WebWindows", "我是谁", "我能做什么", "继续了解", "我们公司"]) {
  assert.ok(translations.includes(`"${text}"`), `missing welcome translation source: ${text}`);
}
new vm.Script(translations, { filename: "assets/js/tw.js" });
console.log("Welcome language smoke tests passed");
