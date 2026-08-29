import assert from "node:assert/strict";
import fs from "node:fs/promises";
import validateManifest from "../webwindows-vue/src/developer-studio/manifest/generated-manifest-validator.js";
import { createHelloWebWindowsTemplate } from "../webwindows-vue/src/developer-studio/project/hello-template.js";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [sdk, monacoRuntime, studioHtml, studioSource, systemAppsSource, studioBundle] = await Promise.all([
  read("data/sdk/webwindows-public-api-v1.d.ts"),
  read("webwindows-vue/src/developer-studio/editor/monaco-runtime.js"),
  read("developer-studio.html"),
  read("webwindows-vue/src/developer-studio/DeveloperStudio.vue"),
  read("data/apps/system-apps.json"),
  read("dist-developer-studio/developer-studio.js")
]);

assert.match(sdk, /readonly device: DeviceAPI/);
assert.match(sdk, /readonly fileDialog: CloudFileDialogAPI/);
for (const privateSurface of ["WebWindowsNative", "NativeAdapter", "invokeNative", "WebWindows.apps", "readonly apps:"]) {
  assert.doesNotMatch(sdk, new RegExp(privateSurface.replace(".", "\\.")), privateSurface);
  assert.doesNotMatch(monacoRuntime, new RegExp(privateSurface.replace(".", "\\.")), privateSurface);
}

assert.match(monacoRuntime, /fetch\("\/data\/sdk\/webwindows-public-api-v1\.d\.ts"/);
assert.match(monacoRuntime, /addExtraLib\(sdkText/);
assert.match(monacoRuntime, /fetch\("\/data\/sdk\/manifest-v1\.schema\.json"/);
assert.match(monacoRuntime, /fileMatch: \["\*\*\/manifest\.json"\]/);
assert.doesNotMatch(studioHtml, /https?:\/\//);
assert.doesNotMatch(studioHtml, /unsafe-eval/);
assert.match(studioHtml, /worker-src 'self'/);
assert.match(studioSource, />Run<\/button>/);
assert.match(studioSource, /PreviewSessionController/);
assert.doesNotMatch(studioSource, /WebWindowsNative|parent\.WebWindows|Capability Broker/);
const entryReference = /import\s+["']\.\/([^"']+)["']/.exec(studioBundle)?.[1];
const lazyEntryBundle = entryReference ? await read(`dist-developer-studio/${entryReference}`) : studioBundle;
assert.match(lazyEntryBundle, /monaco-runtime-[A-Za-z0-9_-]+\.js/);
assert.match(lazyEntryBundle, /deterministic-builder-[A-Za-z0-9_-]+\.js/);
assert.ok(Buffer.byteLength(studioBundle) + Buffer.byteLength(lazyEntryBundle) < 500_000,
  "Studio entry should not eagerly contain Monaco or JSZip");

const template = createHelloWebWindowsTemplate();
const sourceManifest = JSON.parse(template.files.find((entry) => entry.path === "manifest.json").content);
assert.equal(validateManifest(sourceManifest), true, JSON.stringify(validateManifest.errors));
assert.equal(validateManifest({ ...sourceManifest, version: "not-a-version" }), false);
assert.equal(sourceManifest.catalog, undefined);
assert.equal(sourceManifest.package, undefined);
assert.equal(sourceManifest.runtime, undefined);

const systemApps = JSON.parse(systemAppsSource);
const registration = systemApps.apps.find((app) => app.id === "webwindows.system.developer-studio");
assert.equal(registration.install.defaultState, "installed");
assert.equal(registration.install.uninstallable, false);
assert.equal(registration.window.mode, "iframe");

console.log("developer studio SDK boundary smoke test passed");
