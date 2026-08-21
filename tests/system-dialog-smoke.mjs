import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const manifest = JSON.parse(
  await fs.readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8")
);
const staleServerManifest = {
  ...manifest,
  apps: manifest.apps.filter((app) => app.id !== "webwindows.system.guide")
};
const registrySource = await fs.readFile(
  new URL("../assets/js/app-registry.js", import.meta.url),
  "utf8"
);
const dialogSource = await fs.readFile(
  new URL("../assets/js/webwindows-message.js", import.meta.url),
  "utf8"
);
const indexSource = await fs.readFile(
  new URL("../index.html", import.meta.url),
  "utf8"
);

const requests = [];
const openedWindows = [];
const windowObject = {
  indexedDB: null,
  WebWindows: {},
  location: { origin: "https://webwindows.test" },
  addEventListener() {},
  dispatchEvent() {},
  alert() {
    throw new Error("Browser-native alert should not be used.");
  },
  openWindow(...args) {
    openedWindows.push(args);
    return args[0];
  }
};

const context = vm.createContext({
  window: windowObject,
  console,
  CustomEvent: class {},
  fetch: async (url) => {
    requests.push(url);
    return {
      ok: true,
      status: 200,
      async json() {
        return url === "api/function-catalog.asp"
          ? staleServerManifest
          : manifest;
      }
    };
  },
  localStorage: {
    getItem() { return null; },
    setItem() {}
  },
  sessionStorage: {
    getItem() { return null; }
  },
  Map,
  Set,
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
await windowObject.WebWindows.apps.ready();
await new Promise((resolve) => setTimeout(resolve, 0));
await windowObject.WebWindows.apps.launch("webwindows.system.guide");

assert.deepEqual(requests, [
  "api/function-catalog.asp",
  "data/apps/system-apps.json"
]);
assert.equal(openedWindows.at(-1)[0], "guide");
assert.equal(openedWindows.at(-1)[2], "guide.html");
assert.match(indexSource, /assets\/js\/webwindows-message\.js/);
assert.match(dialogSource, /role="alertdialog"/);
assert.match(dialogSource, /child\.alert = function webWindowsFrameAlert/);
assert.match(dialogSource, /global\.alert = function webWindowsAlert/);
assert.doesNotMatch(dialogSource, /\.innerHTML\\s*=\\s*message/);

console.log("system dialog smoke test passed");
