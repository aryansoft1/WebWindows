import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = async (relative) => fs.readFile(new URL(`../${relative}`, import.meta.url), "utf8");

const html = await read("aplay.html");
const manifest = JSON.parse(await read("data/apps/system-apps.json"));
const resourceOpenSource = await read("assets/js/resource-open.js");
const cloudDialogSource = await read("assets/js/cloud-file-dialog.js");
const deviceSource = await read("cloud/browser/device-locations.js");
const sourceApi = await read("api/aplay-source.asp");
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
assert.match(html, /new URL\('\/api\/aplay-source\.asp', location\.origin\)/);
assert.match(html, /fetchAPlaySource\('apple-chart'/);
assert.match(html, /fetchAPlaySource\('apple-search'/);
assert.match(html, /sourceUrl\.searchParams\.set\('source','bili-popular'\)/);
assert.doesNotMatch(html, /https:\/\/(?:rsshub\.app|r\.jina\.ai|api\.allorigins\.win|itunes\.apple\.com|www\.youtube\.com\/feeds\/videos\.xml)/i);
assert.match(html, /CC BY 4\.0 · 需署名/);
assert.match(html, /incompetech\.com\/music\/royalty-free\/mp3-royaltyfree\/Carefree\.mp3/);
assert.match(html, /incompetech\.com\/music\/royalty-free\/mp3-royaltyfree\/New%20Friendly\.mp3/);
assert.match(html, /sourceUrl:'https:\/\/incompetech\.com\/music\/royalty-free\/index\.html\?isrc=/);
assert.doesNotMatch(html, /freepd\.com|SoundHelix|ice1\.somafm\.com/i);
assert.match(html, /ice5\.somafm\.com\/groovesalad-128-mp3/);
assert.match(html, /ice6\.somafm\.com\/groovesalad-128-mp3/);
assert.match(html, /audio\.addEventListener\('error',onError,\{once:true\}\)/);
assert.match(html, /title\.textContent=v\.title/);
assert.match(html, /songTitle\.textContent=s\.title/);
assert.match(html, /数据源暂不可用，已显示上次成功结果/);
assert.match(html, /localStorage\.setItem\(storageKey,JSON\.stringify\(\{time:now,items\}\)\)/);
assert.match(manifest.apps.find((candidate) => candidate.id === "com.aryansoft.webwindows.aplay")?.entry || "", /source-proxy-2/);

assert.match(sourceApi, /Case "apple-chart"/);
assert.match(sourceApi, /Case "apple-search"/);
assert.match(sourceApi, /Case "bili-popular"/);
assert.match(sourceApi, /Case "bili-partition"/);
assert.match(sourceApi, /fallbackUpstream = "https:\/\/rsshub\.app\/bilibili\/popular\/all"/);
assert.match(sourceApi, /api\.bilibili\.com\/x\/web-interface\/popular/);
assert.match(sourceApi, /IsAllowedChannel/);
assert.doesNotMatch(sourceApi, /QueryString\("url"\)/i);
assert.match(sourceApi, /APLAY_MAX_RESPONSE_CHARS/);

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
