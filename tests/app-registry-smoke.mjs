import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const manifest = JSON.parse(
  await fs.readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8")
);
const registrySource = await fs.readFile(
  new URL("../assets/js/app-registry.js", import.meta.url),
  "utf8"
);
const resourceOpenSource = await fs.readFile(
  new URL("../assets/js/resource-open.js", import.meta.url),
  "utf8"
);

const storage = new Map();
const session = new Map();
const events = new Map();
const openedWindows = [];
let mailboxOpenCount = 0;
let aboutOpenCount = 0;
const windowObject = {
  indexedDB: null,
  WebWindows: {},
  location: { origin: "https://webwindows.test" },
  addEventListener(type, handler) {
    if (!events.has(type)) events.set(type, []);
    events.get(type).push(handler);
  },
  dispatchEvent() {},
  alert(message) {
    throw new Error(`Unexpected alert: ${message}`);
  },
  openWindow(...args) {
    openedWindows.push(args);
    return args[0];
  },
  openDeskTalkMailbox() {
    mailboxOpenCount += 1;
  },
  openAbout() {
    aboutOpenCount += 1;
  }
};

const context = vm.createContext({
  window: windowObject,
  console,
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
  fetch: async () => ({
    ok: true,
    status: 200,
    async json() {
      return manifest;
    }
  }),
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    }
  },
  sessionStorage: {
    getItem(key) {
      return session.has(key) ? session.get(key) : null;
    },
    setItem(key, value) {
      session.set(key, String(value));
    },
    removeItem(key) {
      session.delete(key);
    }
  },
  Map,
  Object,
  Array,
  String,
  Date,
  Promise,
  Error,
  RegExp,
  JSON,
  URLSearchParams,
  setTimeout,
  clearTimeout
});

vm.runInContext(registrySource, context, { filename: "app-registry.js" });
const apps = windowObject.WebWindows.apps;
await apps.ready();
await new Promise((resolve) => setTimeout(resolve, 0));
vm.runInContext(resourceOpenSource, context, { filename: "resource-open.js" });

assert.equal((await apps.listInstalled()).length, 16);
assert.equal((await apps.listCatalog()).length, 16);
assert.equal(await apps.isDesktopVisible("com.aryansoft.webwindows.sheet"), true);
await apps.setDesktopVisible("com.aryansoft.webwindows.sheet", false);
assert.equal(await apps.isDesktopVisible("com.aryansoft.webwindows.sheet"), false);
await apps.setDesktopVisible("com.aryansoft.webwindows.sheet", true);

await apps.launch("webwindows.system.settings");
assert.deepEqual(openedWindows.at(-1), [
  "settings",
  "设置",
  "settings.html?v=20260729-3",
  "assets/icons/settings.png",
  true,
  "",
  "900px",
  "640px"
]);

await apps.launch("webwindows.system.function-center");
assert.deepEqual(openedWindows.at(-1), [
  "function-center",
  "功能中心",
  "function-center.html?v=20260729-mobile-3",
  "assets/icons/function-center.svg",
  true,
  "",
  "980px",
  "700px"
]);

await apps.launch("webwindows.system.developer-studio");
assert.deepEqual(openedWindows.at(-1), [
  "developer-studio",
  "Developer Studio",
  "developer-studio.html?v=20260901-storage-2",
  "assets/icons/code.svg",
  true,
  "",
  "1280px",
  "800px"
]);

await apps.launch("webwindows.system.guide", { url: "guide.html?topic=cloud-files" });
assert.deepEqual(openedWindows.at(-1), [
  "guide",
  "使用向导",
  "guide.html?topic=cloud-files",
  "assets/icons/guide.svg",
  true,
  "",
  "1060px",
  "740px"
]);

const sheetResource = { name: "budget.xlsx" };
assert.equal(
  (await apps.resolveResource(sheetResource)).app.id,
  "com.aryansoft.webwindows.sheet"
);

const expectedAssociations = new Map([
  ["report.docx", "com.aryansoft.webwindows.write"],
  ["legacy.doc", "com.aryansoft.webwindows.write"],
  ["slides.pptx", "com.aryansoft.webwindows.slide"],
  ["legacy.ppt", "com.aryansoft.webwindows.slide"],
  ["photo.jpg", "webwindows.system.file-preview"],
  ["photo.webp", "webwindows.system.file-preview"],
  ["manual.pdf", "webwindows.system.file-preview"],
  ["notes.txt", "webwindows.system.file-preview"],
  ["readme.md", "webwindows.system.file-preview"],
  ["data.json", "webwindows.system.file-preview"]
]);
for (const [name, appId] of expectedAssociations) {
  assert.equal((await apps.resolveResource({ name })).app.id, appId, name);
}

await apps.launch("com.aryansoft.webwindows.write");
assert.equal(openedWindows.at(-1)[0], "WriteEditor");
assert.equal(openedWindows.at(-1)[2], "worker_WriteEditor.html?v=20260729-mobile-2");

await apps.launch("com.aryansoft.webwindows.slide");
assert.equal(openedWindows.at(-1)[0], "SlideEditor");
assert.equal(openedWindows.at(-1)[2], "worker_SlideEditor.html?v=20260729-mobile-2");

await apps.launch("com.aryansoft.webwindows.dreama");
assert.equal(openedWindows.at(-1)[0], "edge");
assert.equal(openedWindows.at(-1)[2], "dreama.html");
assert.equal(openedWindows.at(-1)[4], true);

await apps.launch("webwindows.system.mailbox");
await apps.launch("webwindows.system.about");
assert.equal(mailboxOpenCount, 1);
assert.equal(aboutOpenCount, 1);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  name: "cloud-report.docx",
  path: "docs/cloud-report.docx",
  url: "cloud/browser/openResource.asp?path=docs%2Fcloud-report.docx",
  permissions: { edit: true }
});
assert.match(openedWindows.at(-1)[0], /^write-/);
assert.match(openedWindows.at(-1)[2], /^worker_WriteEditor\.html\?/);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  name: "deck.pptx",
  path: "slides/deck.pptx",
  url: "cloud/browser/openResource.asp?path=slides%2Fdeck.pptx",
  permissions: { edit: false }
});
assert.match(openedWindows.at(-1)[0], /^slide-/);
assert.match(openedWindows.at(-1)[2], /^worker_SlideEditor\.html\?/);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  name: "manual.pdf",
  path: "manual.pdf",
  url: "cloud/browser/openResource.asp?path=manual.pdf"
});
assert.match(openedWindows.at(-1)[0], /^resource-/);
assert.equal(
  openedWindows.at(-1)[2],
  "cloud/browser/openResource.asp?path=manual.pdf"
);

await apps.uninstall("com.aryansoft.webwindows.sheet", { retainData: true });
assert.equal(await apps.resolveResource(sheetResource), null);
assert.equal(
  (await apps.getInstallation("com.aryansoft.webwindows.sheet")).retainData,
  true
);

session.set("webwindows_user", JSON.stringify({ username: "alice" }));
assert.equal(await apps.isInstalled("com.aryansoft.webwindows.sheet"), true);
await apps.uninstall("com.aryansoft.webwindows.sheet");
assert.equal(await apps.isInstalled("com.aryansoft.webwindows.sheet"), false);
assert.equal(
  (await apps.getInstallation("com.aryansoft.webwindows.sheet")).syncPending,
  true
);
session.delete("webwindows_user");
assert.equal(await apps.isInstalled("com.aryansoft.webwindows.sheet"), false);

await apps.install("com.aryansoft.webwindows.sheet", { source: "test" });
assert.equal(
  (await apps.resolveResource(sheetResource)).app.id,
  "com.aryansoft.webwindows.sheet"
);

await assert.rejects(
  () => apps.uninstall("webwindows.system.settings"),
  /不能卸载/
);
await assert.rejects(
  () => apps.uninstall("com.aryansoft.webwindows.news"),
  /不能卸载/
);
await apps.setDesktopVisible("com.aryansoft.webwindows.news", false);
assert.equal(
  await apps.isDesktopVisible("com.aryansoft.webwindows.news"),
  true
);

await windowObject.openWindow(
  "news",
  "被兼容层覆盖的标题",
  "ignored.html",
  "ignored.png",
  true,
  "",
  "1px",
  "1px"
);
assert.equal(openedWindows.at(-1)[0], "news");
assert.equal(openedWindows.at(-1)[3], "assets/icons/news.png");
assert.equal(openedWindows.at(-1)[6], "820px");

console.log("app-registry smoke test passed");
