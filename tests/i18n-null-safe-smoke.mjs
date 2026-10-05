import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const languageSource = fs.readFileSync(new URL("../assets/js/tw.js", import.meta.url), "utf8");
const context = {
  window: {},
  document: { addEventListener() {} },
  localStorage: { getItem: () => "zh", setItem() {} },
  navigator: { language: "zh-CN", languages: ["zh-CN"] },
  Node: { ELEMENT_NODE: 1 },
  NodeFilter: { SHOW_TEXT: 4 },
  MutationObserver: class {},
  CustomEvent: class {}
};

vm.runInNewContext(languageSource + ";globalThis.__translate=translateText;", context);
assert.equal(context.__translate(null, "en"), "", "missing attribute values must not throw during translation");
assert.equal(context.__translate(undefined, "jp"), "", "undefined translations remain safe");
assert.equal(context.__translate(42, "en"), "42", "non-string values are safely normalized");
console.log("i18n null-input smoke test passed");
