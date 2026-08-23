import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const [index, main, translations, localeRegion, settings, settingsPage] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/main.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/tw.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/locale-region.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/settings.js", import.meta.url), "utf8"),
  readFile(new URL("../settings.html", import.meta.url), "utf8"),
]);

assert.match(index, /id="about-overlay"/);
assert.match(main, /function openAbout\(\)[\s\S]*WebWindowsI18n[\s\S]*i18n\.applyTo\(overlay, i18n\.getLanguage\(\)\)/,
  "the welcome/about surface must refresh only its own text before it is shown");
assert.doesNotMatch(main, /i18n\.apply\(document/,
  "opening the welcome surface must not restart translation for the whole desktop");
assert.match(translations, /localStorage\.getItem\("lang"\)[\s\S]*!== language\) return/,
  "queued records from a stale language observer must not overwrite source text");
assert.match(translations, /applyTo: \(element,[\s\S]*applyLanguage\(language, element\)/);
assert.match(index, /main\.js\?v=20260820-boot-language-1/);
assert.match(index, /locale-region\.js\?v=20260819-language-source-1/);
assert.match(index, /tw\.js\?v=20260823-mobile-parity-1/);
assert.match(main, /data-boot-status[\s\S]*正在启动 WebWindows…/,
  "the startup welcome screen must contain a stable Simplified Chinese source string");
assert.match(main, /i18n\.applyTo\(loader, i18n\.getLanguage\(\)\)/,
  "the startup welcome screen must be translated before it is attached to the page");
for (const text of ["Starting WebWindows…", "WebWindows を起動しています…", "正在啟動 WebWindows…"]) {
  assert.ok(translations.includes(`"${text}"`), `missing startup welcome translation: ${text}`);
}
assert.match(settingsPage, /settings\.js\?v=20260819-language-source-1/);
assert.match(localeRegion, /function initializeLanguage\(\)/);
assert.match(localeRegion, /!source && migration !== LANGUAGE_MIGRATION_VERSION[\s\S]*localStorage\.setItem\("lang", detectedLanguage\)/,
  "legacy language defaults must migrate once to the current system language");
assert.match(localeRegion, /source === "system" && savedLanguage !== detectedLanguage/,
  "system-managed language must follow a changed operating-system language");
assert.match(translations, /setLanguage\(language, options\)[\s\S]*webwindows\.language\.source", "manual"/,
  "an explicit language selection must become a manual preference");
assert.match(translations, /setLanguage\(language, \{ source: "sync" \}\)/,
  "language propagation into child applications must not turn a system default into a manual preference");
assert.match(settings, /webwindows\.language\.source", "manual"/,
  "the standalone Settings fallback must preserve manual language intent");

function runLocaleMigration(initialStorage) {
  const values = new Map(Object.entries(initialStorage));
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
  };
  const context = {
    localStorage,
    navigator: { languages: ["ja-JP"], language: "ja-JP" },
    Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: "Asia/Tokyo" }) }) },
    CustomEvent: function CustomEvent() {},
    dispatchEvent() {},
  };
  context.window = context;
  vm.runInNewContext(localeRegion, context, { filename: "assets/js/locale-region.js" });
  return values;
}

const legacyJapanese = runLocaleMigration({ lang: "zh" });
assert.equal(legacyJapanese.get("lang"), "jp");
assert.equal(legacyJapanese.get("webwindows.language.source"), "system");
const manualChinese = runLocaleMigration({ lang: "zh", "webwindows.language.source": "manual" });
assert.equal(manualChinese.get("lang"), "zh", "a manual Chinese preference must survive on a Japanese system");
for (const text of ["你好，我是 WebWindows", "我是谁", "我能做什么", "继续了解", "我们公司"]) {
  assert.ok(translations.includes(`"${text}"`), `missing welcome translation source: ${text}`);
}
for (const text of ["我是誰", "我能做什麼", "繼續瞭解", "成都亞原軟體有限公司 出品"]) {
  assert.ok(translations.includes(`"${text}"`), `missing Traditional Chinese welcome translation: ${text}`);
}
new vm.Script(translations, { filename: "assets/js/tw.js" });
console.log("Welcome language smoke tests passed");
