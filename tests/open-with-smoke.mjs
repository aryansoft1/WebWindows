import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(
  new URL("../cloud/browser/open-with.js", import.meta.url),
  "utf8"
);

function element(tag) {
  return {
    tagName: tag,
    children: [],
    style: {},
    dataset: {},
    className: "",
    textContent: "",
    title: "",
    type: "",
    checked: false,
    disabled: false,
    removed: false,
    setAttribute() {},
    appendChild(child) { this.children.push(child); return child; },
    append(...items) { this.children.push(...items); },
    addEventListener(type, fn) { (this._listeners ||= {})[type] = fn; },
    remove() { this.removed = true; }
  };
}

function makeHost({ handlers, defaultHandler, unknown, installed, withParentFT = true }) {
  const overrides = new Map();
  const ft = {
    getOpenWithMenu: () => ({
      fileName: "a.jpg",
      typeId: "webwindows.image.jpeg",
      extension: ".jpg",
      handlers: handlers.slice(),
      defaultHandler,
      unknown: Boolean(unknown)
    }),
    getUserOverride: (id) => (overrides.has(id) ? overrides.get(id) : null),
    setDefaultHandler: (id, h) => { overrides.set(id, h); },
    clearDefaultHandler: (id) => { overrides.delete(id); },
    _overrides: overrides
  };
  const apps = {
    get: async (id) => ({ id, name: `App ${id}` }),
    isInstalled: async (id) => installed[id] !== false,
    listInstalled: async () => [{ id: "webwindows.system.file-preview", name: "文件预览" }]
  };
  const created = [];
  const document = {
    head: element("head"),
    body: element("body"),
    createElement: (tag) => { const el = element(tag); created.push(el); return el; },
    createTextNode: (text) => ({ text })
  };
  const windowObject = {
    WebWindows: {},
    parent: null,
    document,
    localStorage: { getItem: () => null, setItem: () => {} }
  };
  windowObject.parent = withParentFT ? {
    WebWindows: { fileTypes: ft, apps },
    openResource: async () => {}
  } : { WebWindows: {} };
  const context = vm.createContext({
    window: windowObject,
    document,
    localStorage: windowObject.localStorage,
    console, Object, Array, String, JSON, Map, Promise, Error, RegExp
  });
  vm.runInContext(source, context, { filename: "open-with.js" });
  return { api: windowObject.WebWindowsOpenWith, ft, apps, document, created };
}

// submenu data: names, defaults, installed flags
{
  const { api } = makeHost({
    handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"],
    defaultHandler: "webwindows.photos",
    installed: { "webwindows.photos": false, "webwindows.paint": false, "webwindows.system.file-preview": true }
  });
  const data = await api.menuData({ name: "a.JPG", mimeType: "image/jpeg" });
  assert.equal(data.available, true);
  assert.equal(data.typeId, "webwindows.image.jpeg");
  assert.equal(data.handlers.length, 3);
  assert.equal(data.handlers[0].name, "照片"); // friendly zh label
  assert.equal(data.handlers[0].isDefault, true);
  assert.equal(data.handlers[0].installed, false);
  assert.equal(data.handlers[2].installed, true);
}

// no registry -> unavailable, never throws (legacy opener path preserved)
{
  const { api } = makeHost({ handlers: [], defaultHandler: null, withParentFT: false });
  const data = await api.menuData({ name: "a.jpg" });
  assert.equal(data.available, false);
  let opened = 0;
  assert.equal(await api.openDefault({ name: "a.jpg" }, async () => { opened += 1; }), "legacy");
  assert.equal(opened, 1);
}

// openability verdicts
{
  const jpg = makeHost({
    handlers: ["webwindows.photos", "webwindows.system.file-preview"],
    defaultHandler: "webwindows.photos",
    installed: { "webwindows.photos": true, "webwindows.system.file-preview": true }
  });
  assert.equal((await jpg.api.openable({ name: "a.jpg" })).open, true);

  const unk = makeHost({ handlers: [], defaultHandler: null, unknown: true, installed: {} });
  const verdict = await unk.api.openable({ name: "a.xyz123" });
  assert.equal(verdict.open, false);
  assert.equal(verdict.reason, "unknown");

  const none = makeHost({
    handlers: ["webwindows.photos"], defaultHandler: "webwindows.photos", installed: { "webwindows.photos": false }
  });
  assert.equal((await none.api.openable({ name: "a.jpg" })).reason, "no-installed-handler");
}

// openDefault: known -> legacy opener; unknown -> dialog, opener untouched
{
  const { api } = makeHost({
    handlers: ["webwindows.photos", "webwindows.system.file-preview"],
    defaultHandler: "webwindows.photos",
    installed: { "webwindows.photos": true, "webwindows.system.file-preview": true }
  });
  let opened = 0;
  assert.equal(await api.openDefault({ name: "a.jpg" }, async () => { opened += 1; }), "opened");
  assert.equal(opened, 1);

  const unk = makeHost({ handlers: [], defaultHandler: null, unknown: true, installed: {} });
  let opened2 = 0;
  const status = await unk.api.openDefault({ name: "a.xyz123" }, async () => { opened2 += 1; });
  assert.equal(status, "unknown");
  assert.equal(opened2, 0);
  const overlay = unk.document.body.children.at(-1);
  assert.ok(overlay && overlay.className === "ww-ow-overlay");
  const row = overlay.children[0].children.at(-1);
  assert.equal(row.children.length, 3); // 选择应用 / 商店 / 取消
}

// one-time open restores the previous default afterwards
{
  const { api, ft } = makeHost({
    handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"],
    defaultHandler: "webwindows.photos",
    installed: { "webwindows.photos": true, "webwindows.paint": true, "webwindows.system.file-preview": true }
  });
  ft.setDefaultHandler("webwindows.image.jpeg", "webwindows.system.file-preview");
  let seenDuringOpen = null;
  await api.openWithOneTime("webwindows.image.jpeg", "webwindows.paint", async () => {
    seenDuringOpen = ft.getUserOverride("webwindows.image.jpeg");
  });
  assert.equal(seenDuringOpen, "webwindows.paint");
  assert.equal(ft.getUserOverride("webwindows.image.jpeg"), "webwindows.system.file-preview");

  // no previous override -> cleaned up, not left behind
  ft.clearDefaultHandler("webwindows.image.jpeg");
  await api.openWithOneTime("webwindows.image.jpeg", "webwindows.paint", async () => {});
  assert.equal(ft.getUserOverride("webwindows.image.jpeg"), null);
}

// choose dialog: "始终使用" persists the default
{
  const { api, ft } = makeHost({
    handlers: ["webwindows.paint", "webwindows.system.file-preview"],
    defaultHandler: "webwindows.system.file-preview",
    installed: { "webwindows.paint": true, "webwindows.system.file-preview": true }
  });
  let opened = 0;
  const dlg = await api.showChooseDialog({
    fileName: "a.jpg",
    extension: ".jpg",
    typeId: "webwindows.image.jpeg",
    entries: [
      { id: "webwindows.paint", name: "画图", installed: true },
      { id: "webwindows.system.file-preview", name: "文件预览", installed: true }
    ],
    openFn: async () => { opened += 1; }
  });
  const card = dlg.children[0];
  const list = card.children[1];
  const checkWrap = card.children[2];
  checkWrap.children[0].checked = true;
  await list.children[0]._listeners.click();
  assert.equal(opened, 1);
  assert.equal(ft.getUserOverride("webwindows.image.jpeg"), "webwindows.paint");
}

// shared submenu renderer: handlers + choose entry, uninstalled disabled
{
  const { api, document } = makeHost({
    handlers: ["webwindows.photos", "webwindows.paint", "webwindows.system.file-preview"],
    defaultHandler: "webwindows.photos",
    installed: { "webwindows.photos": false, "webwindows.paint": true, "webwindows.system.file-preview": true }
  });
  const data = await api.menuData({ name: "a.jpg" });
  const host = {
    firstChild: null,
    children: [],
    removeChild() {},
    appendChild(child) { this.children.push(child); return child; }
  };
  api.renderMenuEntries(host, data);
  assert.equal(host.children.length, 4); // 3 handlers + choose-other
  assert.equal(host.children[0].dataset.owHandler, "webwindows.photos");
  assert.equal(host.children[0].disabled, true);
  assert.equal(host.children[1].disabled, false);
  assert.equal(host.children[3].dataset.owChoose, "1");
  assert.ok(host.children[0].textContent.includes("照片"));
}

console.log("open-with smoke test passed");
