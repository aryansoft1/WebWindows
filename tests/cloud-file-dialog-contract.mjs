import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(
  new URL("../assets/js/cloud-file-dialog.js", import.meta.url), "utf8"
);

const windowListeners = new Map();
const created = [];

function element(tagName) {
  const listeners = new Map();
  return {
    tagName,
    style: {},
    dataset: {},
    children: [],
    contentWindow: tagName === "iframe" ? {} : undefined,
    setAttribute() {},
    append(...items) { this.children.push(...items); },
    addEventListener(type, listener) { listeners.set(type, listener); },
    dispatch(type, event = {}) { listeners.get(type)?.(event); },
    showModal() { this.open = true; },
    close() { this.open = false; },
    remove() { this.removed = true; }
  };
}

const document = {
  body: {
    appendChild(node) { created.push(node); }
  },
  createElement: element
};

const windowObject = {
  location: { origin: "https://webwindows.test" },
  crypto: { randomUUID: () => "request-123" },
  addEventListener(type, listener) { windowListeners.set(type, listener); },
  removeEventListener(type, listener) {
    if (windowListeners.get(type) === listener) windowListeners.delete(type);
  }
};

const context = vm.createContext({
  window: windowObject,
  document,
  URL,
  URLSearchParams,
  Blob,
  TypeError,
  RangeError,
  fetch: async () => { throw new Error("unexpected fetch"); }
});
new vm.Script(source, { filename: "cloud-file-dialog.js" }).runInContext(context);
assert.equal(windowObject.WebWindows.fileDialog, windowObject.WebWindowsCloudFiles);

const pending = windowObject.WebWindows.fileDialog.open({
  title: "打开工作簿",
  fileTypes: [{ name: "电子表格", extensions: ["xlsx", ".csv"] }],
  multiple: false,
  purpose: "sheet-editor-open"
});
const dialog = created.at(-1);
const frame = dialog.children.find((item) => item.tagName === "iframe");
const url = new URL(frame.src);
assert.equal(url.pathname, "/cloud/browser/files.asp");
assert.equal(url.searchParams.get("action"), "open");
assert.equal(url.searchParams.get("accept"), ".xlsx,.csv");
assert.equal(url.searchParams.get("multiple"), "0");
assert.equal(url.searchParams.get("purpose"), "sheet-editor-open");
assert.equal(url.searchParams.get("requestId"), "request-123");
assert.equal(url.searchParams.get("title"), "打开工作簿");

const resource = {
  name: "budget.xlsx",
  path: "Documents/budget.xlsx",
  nodeId: "local-main",
  scope: "public",
  readUrl: "https://webwindows.test/cloud/browser/openResource.asp?path=Documents%2Fbudget.xlsx"
};
windowListeners.get("message")({
  origin: "https://webwindows.test",
  source: frame.contentWindow,
  data: {
    type: "webwindows:cloud-resource-selected",
    requestId: "request-123",
    resource,
    resources: [resource]
  }
});
assert.deepEqual(await pending, resource);
assert.equal(dialog.removed, true);

const savePending = windowObject.WebWindows.fileDialog.save({
  title: "保存文档",
  fileTypes: [{ name: "Word 文档", extensions: ["docx"] }],
  suggestedName: "计划.docx",
  purpose: "write-editor-save"
});
const saveDialog = created.at(-1);
const saveFrame = saveDialog.children.find((item) => item.tagName === "iframe");
const saveUrl = new URL(saveFrame.src);
assert.equal(saveUrl.pathname, "/cloud/browser/private-files.asp");
assert.equal(saveUrl.searchParams.get("action"), "save");
assert.equal(saveUrl.searchParams.get("multiple"), "0");
assert.equal(saveUrl.searchParams.get("suggestedName"), "计划.docx");
windowListeners.get("message")({
  origin: "https://webwindows.test",
  source: saveFrame.contentWindow,
  data: {
    type: "webwindows:cloud-resource-picker-cancelled",
    requestId: "request-123"
  }
});
assert.equal(await savePending, null);

await assert.rejects(
  () => windowObject.WebWindows.fileDialog.open({
    title: "危险类型",
    fileTypes: [{ extensions: ["../../exe"] }]
  }),
  /至少需要提供/
);

console.log("cloud file dialog contract test passed");
