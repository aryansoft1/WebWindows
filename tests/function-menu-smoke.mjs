import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const manifest = JSON.parse(
  await fs.readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8")
);
const indexSource = await fs.readFile(
  new URL("../index.html", import.meta.url),
  "utf8"
);
const menuSource = await fs.readFile(
  new URL("../assets/js/start-menu-functions.js", import.meta.url),
  "utf8"
);

const visible = manifest.apps.filter((app) => app.placement?.startMenu);
const systemFunctions = visible.filter(
  (app) => app.type === "system" || app.install?.uninstallable === false
);
const userFunctions = visible.filter(
  (app) => app.type !== "system" && app.install?.uninstallable !== false
);

assert.deepEqual(
  systemFunctions.map((app) => app.name),
  ["云资料", "设置", "系统信息", "相机", "功能中心", "Developer Studio", "云秘书", "讯筒", "认识我", "使用向导", "问道", "新闻中心"]
);
const camera = manifest.apps.find((app) => app.id === "webwindows.system.camera");
assert.equal(camera?.entry, "camera.html?v=20261005-camera-ui-1");
assert.equal(camera?.placement?.startMenu, true);
assert.equal(camera?.placement?.allFunctions, true);
assert.equal(camera?.install?.uninstallable, false);
await fs.access(new URL("../assets/icons/camera.svg", import.meta.url));
const i18nSource = await fs.readFile(new URL("../assets/js/tw.js", import.meta.url), "utf8");
const i18nWindow = {};
const i18nContext = vm.createContext({
  window: i18nWindow,
  document: { addEventListener() {} },
  localStorage: { getItem: () => "zh", setItem() {} }
});
vm.runInContext(i18nSource, i18nContext, { filename: "tw.js" });
for (const [language, name] of [["tw", "相機"], ["en", "Camera"], ["jp", "カメラ"]]) {
  assert.equal(i18nWindow.WebWindowsI18n.translate("相机", language), name);
}
for (const [language, description] of [
  ["tw", "拍攝相片、掃描紙本、辨識 QR Code，並翻譯圖片文字。"],
  ["en", "Take photos, scan documents, recognize QR codes, and translate text in images."],
  ["jp", "写真撮影、書類スキャン、QRコード認識、画像内テキストの翻訳に対応します。"]
]) {
  assert.equal(
    i18nWindow.WebWindowsI18n.translate("拍摄照片、扫描文档、识别二维码和翻译图片文字。", language),
    description
  );
}
assert.deepEqual(
  userFunctions.map((app) => app.name),
  ["傲映(APlay)", "Dreama", "Sheet Editor", "Write Editor", "Slide Editor"]
);
assert.ok(systemFunctions.every((app) => app.install.uninstallable === false));
assert.ok(userFunctions.every((app) => app.install.uninstallable === true));
assert.match(indexSource, /id="start-menu-functions"/);
assert.match(indexSource, /id="start-menu-static-fallback"/);
assert.match(indexSource, /start-menu-functions\.js\?v=20261005-camera-entry-i18n-1/);
assert.match(menuSource, /系统功能/);
assert.match(menuSource, /我的功能/);
assert.match(menuSource, /全部功能/);
assert.match(menuSource, /系统组件/);
assert.match(menuSource, /可移除/);

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.dataset = {};
  }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
  addEventListener() {}
  setAttribute() {}
}

const menuHost = new FakeElement("div");
const windowListeners = new Map();
let currentLanguage = "en";
const menuWindow = {
  localStorage: { getItem: () => "[]", setItem() {} },
  WebWindows: { apps: { listInstalled: async () => [camera] } },
  WebWindowsI18n: {
    translate: (text) => i18nWindow.WebWindowsI18n.translate(text, currentLanguage)
  },
  addEventListener(type, listener) {
    const listeners = windowListeners.get(type) || [];
    listeners.push(listener);
    windowListeners.set(type, listeners);
  }
};
const menuContext = vm.createContext({
  window: menuWindow,
  document: {
    readyState: "loading",
    addEventListener() {},
    getElementById(id) {
      if (id === "start-menu-functions") return menuHost;
      return null;
    },
    createElement: (tagName) => new FakeElement(tagName)
  },
  console
});
vm.runInContext(menuSource, menuContext, { filename: "start-menu-functions.js" });
const cameraLabels = () => {
  const button = menuHost.children.flatMap((node) => node.children || [])
    .find((node) => node.dataset?.functionId === camera.id);
  const label = button?.children.flatMap((node) => node.children || [])
    .find((node) => node.className === "function-item-name");
  return { title: button?.title, label: label?.textContent };
};
await menuWindow.WebWindows.functionMenu.render();
assert.deepEqual(cameraLabels(), { title: "Camera", label: "Camera" });
for (const [language, expectedName] of [
  ["tw", "相機"],
  ["jp", "カメラ"],
  ["zh", "相机"]
]) {
  currentLanguage = language;
  await Promise.all((windowListeners.get("webwindows:language-changed") || []).map((listener) => listener()));
  assert.deepEqual(cameraLabels(), { title: expectedName, label: expectedName });
}

console.log("function-menu smoke test passed");
