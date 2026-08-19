import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [index, main, translations] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/main.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/tw.js", import.meta.url), "utf8"),
]);

assert.match(index, /id="about-overlay"/);
assert.match(main, /function openAbout\(\)[\s\S]*WebWindowsI18n[\s\S]*i18n\.applyTo\(overlay, i18n\.getLanguage\(\)\)/,
  "the welcome/about surface must refresh only its own text before it is shown");
assert.doesNotMatch(main, /i18n\.apply\(document/,
  "opening the welcome surface must not restart translation for the whole desktop");
assert.match(translations, /localStorage\.getItem\("lang"\)[\s\S]*!== language\) return/,
  "queued records from a stale language observer must not overwrite source text");
assert.match(translations, /applyTo: \(element,[\s\S]*applyLanguage\(language, element\)/);
assert.match(index, /main\.js\?v=20260819-welcome-language-2/);
assert.match(index, /tw\.js\?v=20260819-welcome-language-2/);
for (const text of ["你好，我是 WebWindows", "我是谁", "我能做什么", "继续了解", "我们公司"]) {
  assert.ok(translations.includes(`"${text}"`), `missing welcome translation source: ${text}`);
}
for (const text of ["我是誰", "我能做什麼", "繼續瞭解", "成都亞原軟體有限公司 出品"]) {
  assert.ok(translations.includes(`"${text}"`), `missing Traditional Chinese welcome translation: ${text}`);
}
new vm.Script(translations, { filename: "assets/js/tw.js" });
console.log("Welcome language smoke tests passed");
