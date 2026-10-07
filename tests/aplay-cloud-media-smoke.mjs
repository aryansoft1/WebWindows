import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = async (relative) => fs.readFile(new URL(`../${relative}`, import.meta.url), "utf8");

const html = await read("aplay.html");
const manifest = JSON.parse(await read("data/apps/system-apps.json"));
const resourceOpenSource = await read("assets/js/resource-open.js");
const cloudDialogSource = await read("assets/js/cloud-file-dialog.js");
const deviceSource = await read("cloud/browser/device-locations.js");
const publicPicker = await read("cloud/browser/files.asp");
const privatePicker = await read("cloud/browser/private-files.asp");

for (const [index, source] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((source) => source.trim())
  .entries()) {
  new vm.Script(source, { filename: `aplay.html#inline-${index + 1}` });
}

assert.match(html, /const I18N_TEXT=/);
assert.match(html, /tw:\s*\{/);
assert.match(html, /en:\s*\{/);
assert.match(html, /jp:\s*\{/);
assert.match(html, /webwindows-language-changed/);
assert.match(html, /WebWindows\.fileDialog\.open/);
assert.match(html, /await host\.openResource/);
assert.doesNotMatch(html, /showOpenFilePicker|type\s*=\s*["']file["']/i);

const app = manifest.apps.find((candidate) => candidate.id === "com.aryansoft.webwindows.aplay");
assert.ok(app, "APlay must be registered");
const mediaHandler = app.fileHandlers.find((handler) => handler.adapter === "cloud-media");
assert.ok(mediaHandler, "APlay must own the unified cloud-media association");
for (const extension of [".mp3", ".flac", ".mp4", ".webm", ".mkv"]) {
  assert.ok(mediaHandler.extensions.includes(extension), `${extension} must resolve to APlay`);
}

const frameMessages = [];
const frameWindow = { postMessage(message, origin) { frameMessages.push({ message, origin }); } };
const frame = { contentWindow: frameWindow, addEventListener() {} };
const listeners = new Map();
const windowObject = {
  location: { origin: "https://webwindows.test", href: "https://webwindows.test/index.html" },
  WebWindows: {
    apps: {
      async resolveResource() {
        return { app: { id: app.id, name: app.name, entry: app.entry }, handler: mediaHandler };
      },
      async launch() {}
    }
  },
  addEventListener(type, listener) { listeners.set(type, listener); },
  alert(message) { throw new Error(`Unexpected alert: ${message}`); }
};
const context = vm.createContext({
  window: windowObject,
  document: { querySelector: (selector) => selector === "#win-aplay iframe" ? frame : null },
  console,
  URL,
  URLSearchParams,
  Object,
  String,
  Array,
  Error,
  RegExp
});
new vm.Script(resourceOpenSource, { filename: "resource-open.js" }).runInContext(context);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  scope: "private",
  nodeId: "private-node",
  path: "private/hidden/song.mp3",
  name: "song.mp3",
  mimeType: "audio/mpeg",
  url: "https://webwindows.test/cloud/browser/private-resource.asp?id=42"
});
assert.deepEqual(
  JSON.parse(JSON.stringify(frameMessages.at(-1))),
  {
    message: {
      type: "webwindows-aplay-open-media",
      media: {
        name: "song.mp3",
        mimeType: "audio/mpeg",
        kind: "audio",
        url: "https://webwindows.test/cloud/browser/private-resource.asp?id=42",
        source: "private"
      }
    },
    origin: "https://webwindows.test"
  }
);
assert.doesNotMatch(JSON.stringify(frameMessages.at(-1)), /private-node|private\/hidden/);

await windowObject.openResource({
  protocol: "webwindows-cloud-resource",
  scope: "device",
  nodeId: "local-volume",
  path: "content:\/\/provider\/secret\/movie.mp4",
  name: "movie.mp4",
  mimeType: "video/mp4",
  url: "blob:https://webwindows.test/controlled-media"
});
const devicePayload = JSON.stringify(frameMessages.at(-1));
assert.match(devicePayload, /controlled-media/);
assert.doesNotMatch(devicePayload, /local-volume|content:|provider|secret/);

await assert.rejects(
  () => windowObject.openResource({
    protocol: "webwindows-cloud-resource",
    scope: "device",
    name: "unsafe.mp3",
    mimeType: "audio/mpeg",
    url: "content:\/\/provider\/unsafe.mp3"
  }),
  /读取地址不安全|受控临时地址/
);

assert.match(deviceSource, /scope:\s*"device"/);
assert.match(deviceSource, /blob,/);
assert.match(deviceSource, /pickerAccepts/);
assert.match(cloudDialogSource, /URL\.createObjectURL\(resource\.blob\)/);
assert.match(cloudDialogSource, /delete safe\.path/);
assert.match(cloudDialogSource, /delete safe\.nodeId/);
assert.match(publicPicker, /Case "mp3"/);
assert.match(publicPicker, /Case "mp4", "m4v"/);
assert.match(privatePicker, /Case "mp3": FileMime = "audio\/mpeg"/);
assert.match(privatePicker, /Case "mp4", "m4v": FileMime = "video\/mp4"/);

console.log("APlay i18n and unified cloud media smoke test passed");
