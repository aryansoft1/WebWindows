import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../assets/js/webwindows-message.js", import.meta.url), "utf8");
const docs = await fs.readFile(new URL("../docs/SYSTEM_DIALOG_API.md", import.meta.url), "utf8");

assert.match(source, /function showConfirm\(/);
assert.match(source, /confirm:\s*showConfirm/);
assert.match(source, /type:\s*"confirm"/);
assert.match(source, /data-dialog-action="cancel"/);
assert.match(source, /data-dialog-action="confirm"/);
assert.match(source, /request\.resolve\(request\.type === "confirm" \? confirmed === true : undefined\)/);
assert.match(source, /event\.key === "Escape"[\s\S]*closeActive\(false\)/);
assert.match(source, /event\.key === "Enter"[\s\S]*closeActive\(true\)/);
assert.doesNotMatch(source, /global\.confirm\s*=/);
assert.match(docs, /Promise<boolean>/);
assert.match(docs, /不得直接调用浏览器原生/);

const created = {};
function node(name) {
  const listeners = new Map();
  return {
    name, dataset: {}, style: {}, hidden: false, textContent: "", innerHTML: "",
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { listeners.get(type)?.(event); },
    appendChild() {}, querySelectorAll() { return []; }, focus() { created.focused = name; }
  };
}
const title = node("title"), message = node("message"), confirmButton = node("confirm"), cancelButton = node("cancel");
const host = node("host");
host.querySelector = (selector) => ({
  "#ww-system-dialog-title": title,
  "#ww-system-dialog-message": message,
  '[data-dialog-action="confirm"]': confirmButton,
  '[data-dialog-action="cancel"]': cancelButton
}[selector]);
const document = {
  activeElement: null,
  head: node("head"),
  body: node("body"),
  documentElement: Object.assign(node("html"), { dataset: {} }),
  createElement(tag) { return tag === "div" ? host : node(tag); },
  querySelectorAll() { return []; }
};
const window = {
  document,
  WebWindows: {},
  localStorage: { getItem: () => "jp" },
  addEventListener() {}
};
window.window = window;
vm.runInNewContext(source, {
  window, document, WeakSet, MutationObserver: class { observe() {} },
  requestAnimationFrame(callback) { callback(); }, Promise, Object, String, console
});

const rejected = window.WebWindows.dialog.confirm("続行しますか？");
assert.equal(cancelButton.textContent, "キャンセル");
cancelButton.dispatch("click");
assert.equal(await rejected, false);
const accepted = window.WebWindows.dialog.confirm("続行しますか？");
confirmButton.dispatch("click");
assert.equal(await accepted, true);
const alerted = window.WebWindows.dialog.alert("完了");
assert.equal(cancelButton.hidden, true);
confirmButton.dispatch("click");
assert.equal(await alerted, undefined);

console.log("system dialog confirm smoke test passed");
