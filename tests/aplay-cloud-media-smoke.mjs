import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const resourceOpenSource = fs.readFileSync(new URL("../assets/js/resource-open.js", import.meta.url), "utf8");
const aplaySource = fs.readFileSync(new URL("../aplay.html", import.meta.url), "utf8");
const catalog = JSON.parse(fs.readFileSync(new URL("../data/apps/system-apps.json", import.meta.url), "utf8"));
const publicBrowser = fs.readFileSync(new URL("../cloud/browser/files.asp", import.meta.url), "utf8");
const publicReader = fs.readFileSync(new URL("../cloud/browser/openResource.asp", import.meta.url), "utf8");
const privateBrowser = fs.readFileSync(new URL("../cloud/browser/private-files.asp", import.meta.url), "utf8");
const privateReader = fs.readFileSync(new URL("../cloud/browser/private-resource.asp", import.meta.url), "utf8");

const inlineScripts = [...aplaySource.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.ok(inlineScripts.length, "APlay must contain its application script");
new vm.Script(inlineScripts.at(-1)[1], { filename: "aplay.html:inline.js" });

const aplay = catalog.apps.find((app) => app.id === "com.aryansoft.webwindows.aplay");
assert.ok(aplay, "APlay must remain in the system app catalog");
const handler = aplay.fileHandlers?.find((item) => item.adapter === "cloud-media");
assert.ok(handler, "APlay must register the unified cloud-media adapter");
for (const extension of [".mp3", ".flac", ".mp4", ".webm", ".mkv"]) {
  assert.ok(handler.extensions.includes(extension), `APlay handler must include ${extension}`);
}

assert.match(aplaySource, /WebWindows\?\.fileDialog\?\.open/);
assert.match(aplaySource, /await host\.openResource\(/);
assert.doesNotMatch(aplaySource, /showOpenFilePicker|showDirectoryPicker|storage\.openFile/);
assert.doesNotMatch(aplaySource, /id="btn-open-url"/);

for (const source of [publicBrowser, publicReader, privateBrowser, privateReader]) {
  assert.match(source, /audio\/mpeg/);
  assert.match(source, /video\/mp4/);
}

const sent = [];
const listeners = new Map();
const frame = {
  contentWindow: { postMessage(message, origin) { sent.push({ message, origin }); } },
  addEventListener() {}
};
let launched = null;
const windowObject = {
  location: { href: "https://www.y0.hk/index.html", origin: "https://www.y0.hk" },
  alert() {},
  addEventListener(type, listener) { listeners.set(type, listener); },
  WebWindows: {
    apps: {
      async resolveResource() { return { app: aplay, handler }; },
      async launch(appId, context) { launched = { appId, context }; }
    }
  }
};
const context = vm.createContext({
  window: windowObject,
  document: { querySelector(selector) { return selector === "#win-aplay iframe" ? frame : null; } },
  URL,
  console,
  Object,
  String,
  Math
});
vm.runInContext(resourceOpenSource, context);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  version: "1.1",
  scope: "device",
  nodeId: "private-device-volume",
  path: "content://provider/secret/song.mp3",
  name: "song.mp3",
  mimeType: "audio/mpeg",
  url: "blob:https://www.y0.hk/opaque-media-token"
});
assert.equal(launched.appId, aplay.id);
assert.equal(launched.context.instanceId, "aplay");
const delivered = sent.at(-1).message.media;
assert.deepEqual(Object.keys(delivered).sort(), ["kind", "mimeType", "name", "sourceLabel", "url"]);
assert.equal(delivered.kind, "audio");
assert.equal(delivered.sourceLabel, "此设备");
assert.doesNotMatch(JSON.stringify(delivered), /content:\/\/|private-device-volume|secret/);

await assert.rejects(() => windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  scope: "device",
  name: "unsafe.mp3",
  mimeType: "audio/mpeg",
  url: "content://provider/unsafe.mp3"
}), /读取地址不安全/);

console.log("APlay cloud media smoke test passed");
