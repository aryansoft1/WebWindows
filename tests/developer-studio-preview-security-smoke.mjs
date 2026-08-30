import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { PREVIEW_CSP, PREVIEW_REFERRER_POLICY, PREVIEW_SANDBOX } from "../webwindows-vue/src/developer-studio/preview/preview-protocol.js";
import { createPreviewDocument, resolvePreviewPath, rewriteCss } from "../webwindows-vue/src/developer-studio/preview/preview-snapshot-runtime.js";
import { FakeDOMParser } from "./helpers/fake-preview-dom.mjs";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [hostPage, hostSource, studioPage, runtimePage, runtimeSource, controllerSource, brokerSource, facadeSource] = await Promise.all([
  read("developer-preview-host.html"),
  read("assets/js/developer-preview-host.js"),
  read("developer-studio.html"),
  read("package-runtime.html"),
  read("assets/js/package-runtime.js"),
  read("webwindows-vue/src/developer-studio/preview/preview-session-controller.js"),
  read("webwindows-vue/src/developer-studio/broker/preview-battery-broker.js"),
  read("webwindows-vue/src/developer-studio/preview/preview-sdk-bootstrap.js")
]);

assert.match(studioPage, /frame-src 'self'/);
assert.match(hostPage, /connect-src 'none'/);
assert.match(hostPage, /frame-src 'self'/);
assert.match(hostPage, /script-src 'self' 'unsafe-inline'/,
  "srcdoc inherits the Preview Host CSP, so the Host policy must permit the child Snapshot bootstrap scripts");
assert.doesNotMatch(hostPage, /allow-same-origin/);
assert.match(hostSource, new RegExp(`SANDBOX = ${JSON.stringify(PREVIEW_SANDBOX)}`));
assert.match(hostSource, new RegExp(`REFERRER_POLICY = ${JSON.stringify(PREVIEW_REFERRER_POLICY)}`));
assert.match(hostSource, /event\.source !== parent/);
assert.match(hostSource, /event\.origin !== location\.origin/);
assert.match(hostSource, /MessageChannel/);
assert.match(hostSource, /message\.token !== binding\.token/);
assert.match(hostSource, /active\.consolePort\.close\(\)/);
assert.match(hostSource, /active\.frame\.removeAttribute\("srcdoc"\)/);

for (const source of [hostPage, hostSource, controllerSource, brokerSource, facadeSource]) {
  assert.doesNotMatch(source, /allow-same-origin/);
  assert.doesNotMatch(source, /\b(?:indexedDB|localStorage|sessionStorage)\b/);
  assert.doesNotMatch(source, /\b(?:install|uninstall|catalog|developer\s*api|admin)\b/i);
  assert.doesNotMatch(source, /WebWindowsNative|NativeAdapter|parent\.WebWindows|window\.WebWindows/);
}

for (const source of [brokerSource, facadeSource]) {
  assert.doesNotMatch(source, /WebWindowsNative|NativeAdapter|BrowserAdapter|BatteryManager|android|dreama/i);
  assert.doesNotMatch(source, /device\.(?:network|runtime|display|audio|storage)|fileDialog/);
}
assert.match(brokerSource, /publicApi\?\.device\?\.battery/);
assert.match(brokerSource, /\.getState\(\)/);
assert.match(brokerSource, /\.refresh\(\)/);
assert.doesNotMatch(runtimePage, /webwindows-studio-preview-sdk-init|webwindows-capability-broker/);
assert.doesNotMatch(runtimeSource, /webwindows-studio-preview-sdk-init|webwindows-capability-broker|PreviewBatteryBroker/);

assert.match(PREVIEW_CSP, /default-src 'none'/);
assert.match(PREVIEW_CSP, /connect-src 'none'/);
assert.match(PREVIEW_CSP, /frame-src 'none'/);
assert.match(PREVIEW_CSP, /form-action 'none'/);
assert.doesNotMatch(PREVIEW_CSP, /https?:|\*/);
assert.match(runtimePage, new RegExp(`sandbox=${JSON.stringify(PREVIEW_SANDBOX)}`));
assert.match(runtimePage, new RegExp(`referrerpolicy=${JSON.stringify(PREVIEW_REFERRER_POLICY)}`));
assert.doesNotMatch(runtimePage, /allow-same-origin/);

const hook = '  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error)));';
const instrumented = runtimeSource.replace(hook, `globalThis.__previewContract = { normalizePath, resolvePath, rewriteCss };\n${hook}`);
const context = { document: { addEventListener() {} }, console, Set, Map, Object, Array, String, Number, RegExp, Error, Promise };
context.globalThis = context;
context.window = context;
vm.runInNewContext(instrumented, context, { filename: "package-runtime.js" });
const runtime = context.__previewContract;
for (const [base, reference] of [
  ["index.html", "scripts/app.js"],
  ["styles/app.css", "../assets/icon.svg"],
  ["index.html", "https://example.test/app.js"],
  ["index.html", "data:text/plain,x"],
  ["pages/a.html", "../../escape.js"]
]) {
  assert.equal(resolvePreviewPath(base, reference), runtime.resolvePath(base, reference), `${base} ${reference}`);
}
const urls = new Map([["assets/icon.svg", "data:image/svg+xml;base64,AA=="]]);
assert.equal(
  rewriteCss("body{background:url('../assets/icon.svg')}", "styles/app.css", urls),
  runtime.rewriteCss("body{background:url('../assets/icon.svg')}", "styles/app.css", urls)
);

const previewSession = { sessionId: "session", snapshotId: "snapshot", token: "opaque-token" };
const previewSnapshot = (html) => ({
  projectUuid: "project", snapshotId: "snapshot", fileCount: 2, totalBytes: html.length,
  files: [
    { path: "index.html", content: html },
    { path: "manifest.json", content: JSON.stringify({ entry: "index.html" }) }
  ]
});
assert.throws(
  () => createPreviewDocument(previewSnapshot('<script type="module">export default 1</script>'), previewSession, { domParser: new FakeDOMParser() }),
  /不支持 ES Module/
);
assert.throws(
  () => createPreviewDocument(previewSnapshot('<script src="https://example.test/app.js"></script>'), previewSession, { domParser: new FakeDOMParser() }),
  /脚本必须来自 Snapshot/
);

console.log("developer studio preview security and runtime policy contract smoke test passed");
