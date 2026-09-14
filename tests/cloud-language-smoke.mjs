import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const i18nSource = read("cloud/browser/i18n.js");
const privatePage = read("cloud/browser/private-files.asp");
const publicPage = read("cloud/browser/files.asp");
const toolbar = read("cloud/browser/toolbar.js");
const searchUi = read("cloud/browser/search-ui.js");
const dialogSource = read("assets/js/cloud-file-dialog.js");

function createCloudContext(initialLanguage) {
  const values = new Map([["lang", initialLanguage]]);
  const document = {
    readyState: "complete",
    documentElement: { lang: "" },
    body: { dataset: {}, querySelectorAll: () => [] },
    querySelectorAll: () => []
  };
  const window = {
    document,
    navigator: { language: "zh-CN" },
    localStorage: { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, String(value)) },
    addEventListener() {}
  };
  window.window = window;
  vm.runInNewContext(i18nSource, { window, document, console });
  return { window, document, values };
}

{
  const { window, document, values } = createCloudContext("jp");
  assert.equal(window.WebWindowsCloudI18n.language(), "jp");
  assert.equal(window.WebWindowsCloudI18n.text("privateTitle"), "プライベートファイル");
  assert.equal(window.WebWindowsCloudI18n.text("selectedCount", { count: 2 }), "2 件選択");
  assert.equal(document.documentElement.lang, "ja-JP");
  values.set("lang", "en");
  window.WebWindowsCloudI18n.apply(document);
  assert.equal(window.WebWindowsCloudI18n.text("device"), "This device");
  assert.equal(document.documentElement.lang, "en");
}

assert.match(publicPage, /src="i18n\.js\?v=/);
assert.match(privatePage, /src="i18n\.js\?v=/);
assert.match(publicPage, /data-cloud-i18n-aria-label="devicePanel"/);
assert.match(privatePage, /data-cloud-i18n="privateTitle"/);
assert.match(privatePage, /data-cloud-i18n-aria-label="privateToolbar"/);
assert.match(privatePage, /url\.searchParams\.set\("lang", cloudI18n\.language\(\)\)/);
assert.match(dialogSource, /url\.searchParams\.set\("lang", language\(\)\)/);
assert.doesNotMatch(toolbar, /payload\?\.error\?\.message/);
assert.doesNotMatch(privatePage, /payload\?\.error\?\.message/);
assert.match(searchUi, /view\.textContent=t\("failed"\)/);

{
  const values = new Map([["lang", "jp"]]);
  const window = {
    location: { origin: "https://example.test" },
    navigator: { language: "ja-JP" },
    localStorage: { getItem: (key) => values.get(key) || null },
    WebWindowsI18n: { getLanguage: () => values.get("lang") },
    WebWindows: {}
  };
  window.window = window;
  vm.runInNewContext(dialogSource, { window, URL, Blob, URLSearchParams, Date, TypeError, RangeError, console });
  await assert.rejects(window.WebWindows.fileDialog.open({ extensions: [] }), /選択可能なファイル形式/);
  values.set("lang", "en");
  await assert.rejects(window.WebWindows.fileDialog.read({ readUrl: "https://other.test/file" }), /read address is invalid/);
}

console.log("cloud language smoke test passed");
