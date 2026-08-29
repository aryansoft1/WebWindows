import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { validateProjectSnapshot } from "../webwindows-vue/src/developer-studio/validation/project-validator.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

const contracts = await loadStudioContracts();
const runtimeSource = await fs.readFile(new URL("../assets/js/package-runtime.js", import.meta.url), "utf8");
const hook = '  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error.message)));';
assert.ok(runtimeSource.includes(hook));
const instrumented = runtimeSource.replace(hook, `
  globalThis.__runtimePolicy = { MAX_FILES, MAX_UNCOMPRESSED_BYTES, ALLOWED_EXTENSIONS, normalizePath };
${hook}`);
const context = { document: { addEventListener() {} }, console, Set, Map, Object, Array, String, Number, RegExp, Error, Promise };
context.globalThis = context;
context.window = context;
vm.runInNewContext(instrumented, context, { filename: "package-runtime.js" });
const runtime = context.__runtimePolicy;
const policy = contracts.packagePolicy;

assert.equal(runtime.MAX_FILES, policy.limits.maxFiles);
assert.equal(runtime.MAX_UNCOMPRESSED_BYTES, policy.limits.maxUnpackedBytes);
assert.deepEqual([...runtime.ALLOWED_EXTENSIONS], policy.allowedExtensions);
assert.equal(contracts.runtimeCompatibility.packageRuntime.limits.maxFiles, policy.limits.maxFiles);
assert.equal(contracts.runtimeCompatibility.packageRuntime.limits.maxUnpackedBytes, policy.limits.maxUnpackedBytes);
assert.equal(contracts.runtimeCompatibility.packageRuntime.limits.maxPathCharacters, policy.limits.maxPathCharacters);

const manifest = JSON.stringify({
  id: "com.example.contract", type: "application", name: "Contract", version: "1.0.0",
  icon: "icon.svg", entry: "index.html",
  install: { defaultState: "available", source: "repository", uninstallable: true },
  placement: { desktop: false, startMenu: true, allFunctions: true, taskbar: false },
  window: { mode: "iframe", singleton: true, width: "640px", height: "480px" }
});
const baseFiles = [
  { path: "manifest.json", content: manifest },
  { path: "index.html", content: "<!doctype html><title>Contract</title>" },
  { path: "icon.svg", content: "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>" }
];
function snapshot(files) {
  return {
    snapshotId: "contract-fixture", projectUuid: "fixture", files,
    fileCount: files.length,
    totalBytes: files.reduce((total, file) => total + new TextEncoder().encode(file.content).byteLength, 0)
  };
}

for (const fixture of ["index.html", "./scripts\\app.js", "assets/icon.svg"]) {
  const normalized = runtime.normalizePath(fixture);
  const files = baseFiles.some((file) => file.path === normalized)
    ? baseFiles : [...baseFiles, { path: normalized, content: "ok" }];
  const report = await validateProjectSnapshot(snapshot(files), { contracts });
  assert.equal(report.diagnostics.some((item) => item.ruleId === "WWP002"), false, fixture);
}
for (const unsafe of ["../escape.js", "/absolute.js", "C:/drive.js", "a//b.js", "a/./b.js", `a${String.fromCharCode(0)}b.js`]) {
  assert.throws(() => runtime.normalizePath(unsafe));
  const report = await validateProjectSnapshot(snapshot([...baseFiles, { path: unsafe, content: "x" }]), { contracts });
  assert.equal(report.diagnostics.some((item) => item.ruleId === "WWP002"), true, unsafe);
}

const unsupported = await validateProjectSnapshot(snapshot([...baseFiles, { path: "run.exe", content: "x" }]), { contracts });
assert.equal(runtime.ALLOWED_EXTENSIONS.has(".exe"), false);
assert.equal(unsupported.diagnostics.some((item) => item.ruleId === "WWP005"), true);

const overLimitsFixture = snapshot(baseFiles);
overLimitsFixture.fileCount = policy.limits.maxFiles + 1;
overLimitsFixture.totalBytes = policy.limits.maxUnpackedBytes + 1;
const overLimits = await validateProjectSnapshot(overLimitsFixture, { contracts });
assert.equal(overLimits.diagnostics.some((item) => item.ruleId === "WWP003"), true);
assert.equal(overLimits.diagnostics.some((item) => item.ruleId === "WWP004"), true);

console.log("developer studio/package runtime policy contract smoke test passed");
