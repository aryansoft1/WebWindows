import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createHash, webcrypto } from "node:crypto";
import JSZip from "jszip";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [source, lookupApi, packageApi, page, contract, registry, device, native] = await Promise.all([
  read("assets/js/package-runtime.js"), read("api/runtime-release.asp"), read("api/function-package.asp"),
  read("package-runtime.html"), read("data/sdk/verified-runtime-package-identity-v1.json").then(JSON.parse),
  read("assets/js/app-registry.js"), read("assets/js/device-api.js"), read("docs/NATIVE_BRIDGE_V1.md")
]);

assert.equal(contract.contract, "webwindows-verified-runtime-package-identity-v1");
assert.deepEqual(contract.trustStates, ["system-trusted", "verified-release", "legacy-unverified", "verification-failed"]);
for (const code of contract.errors) assert.match(source + lookupApi + packageApi, new RegExp(code));
for (const table of ["webwindows_published_releases", "webwindows_catalog_release_bindings", "webwindows_function_catalog_versions"])
  assert.match(lookupApi, new RegExp(table));
assert.match(lookupApi, /b\.package_sha256=pr\.package_sha256/);
assert.match(lookupApi, /b\.approved_permissions_base64=pr\.approved_permissions_base64/);
assert.doesNotMatch(lookupApi, /review_note|risk_summary|api_key|cookie|Native/i);
assert.match(packageApi, /p\.submission_id=pr\.submission_id AND p\.package_sha256=pr\.package_sha256/);
assert.match(packageApi, /X-WebWindows-Published-Release/);
assert.match(source, /crypto\.subtle\.digest\("SHA-256"/);
const verifiedFlow = source.slice(source.indexOf("async function prepareVerified"), source.indexOf("async function prepareLegacy"));
assert.ok(verifiedFlow.indexOf("sha256Hex(packageBytes)") < verifiedFlow.indexOf("readArchive(packageBytes)"), "ZIP SHA must precede unzip");
assert.match(page, /sandbox="allow-scripts allow-forms allow-modals allow-downloads"/);
assert.doesNotMatch(page, /allow-same-origin/);
assert.match(source, /window\.WebWindows\?\.device\?\.battery/);
assert.doesNotMatch(source, /WebWindowsNative|window\.ProductionBrokerContext|window\.WebWindows\s*=/);
assert.doesNotMatch(registry, /runtimeTrustState\s*=|verifiedRuntimePackageIdentity\s*=/);
assert.doesNotMatch(device + native, /VerifiedRuntimePackageIdentity/);

const hook = '  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error)));';
assert.ok(source.includes(hook));
const instrumented = source.replace(hook, `
  globalThis.__runtimeIdentityTest = Object.freeze({
    canonicalizeJson, sha256Hex, validateExpectedIdentity, readArchive, verifySourceManifest,
    prepareVerified, prepareLegacy, executePreparedPackage, start,
    getTrustState: () => runtimeTrustState,
    getVerifiedIdentity: () => verifiedRuntimePackageIdentity
  });
${hook}`);

const canonicalize = (value) => value === null || typeof value !== "object" ? JSON.stringify(value)
  : Array.isArray(value) ? `[${value.map(canonicalize).join(",")}]`
    : `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const manifestSha = (manifest) => sha(Buffer.from(canonicalize(manifest)));
const releaseId = `rel_${"1".repeat(32)}`;
const manifest = {
  manifestVersion: 2, sdk: { apiVersion: "1" }, permissions: ["device.battery-status.read"],
  id: "com.example.verified", type: "application", name: "Verified", version: "1.0.0",
  icon: "icon.svg", entry: "index.html", install: { defaultState: "available", source: "repository", uninstallable: true },
  placement: { desktop: false, startMenu: true, allFunctions: true, taskbar: false },
  window: { mode: "iframe", singleton: true, width: "800px", height: "600px" }
};
async function zipFor(sourceManifest = manifest, manifestPath = "manifest.json") {
  const zip = new JSZip();
  zip.file(manifestPath, JSON.stringify(sourceManifest));
  zip.file("index.html", "<!doctype html><title>verified</title><script>globalThis.packageExecuted=true</script>");
  zip.file("icon.svg", "<svg xmlns='http://www.w3.org/2000/svg'/>");
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE", platform: "UNIX" });
}
const zipBytes = await zipFor();
function identity(overrides = {}) {
  return {
    publishedReleaseId: releaseId, appId: manifest.id, publisherId: "42", version: manifest.version,
    packageSha256: sha(zipBytes), sourceManifestSha256: manifestSha(manifest), manifestVersion: 2,
    sdkVersion: "1", reviewDecisionId: "rvd_verified", approvedPermissions: ["device.battery-status.read"],
    reviewPolicyVersion: 1, releaseStatus: "active", catalogRevisionId: 10,
    packageDownloadIdentity: { publishedReleaseId: releaseId, downloadUrl: `/api/function-package.asp?release=${releaseId}` },
    ...overrides
  };
}

let activeIdentity = identity();
let activeBytes = zipBytes;
let lookupStatus = 200;
let lookupCode = null;
let loadCount = 0;
let stages = [];
const runtimeState = { hidden: false, dataset: {}, classList: { add() {} }, querySelector: () => ({ textContent: "" }) };
const frame = { srcdoc: "", hidden: true };
const context = {
  console, URLSearchParams, TextDecoder, TextEncoder, Uint8Array, ArrayBuffer, Map, Set, Object, Array, String, Number, RegExp, Error, Promise, Date,
  btoa, location: { search: "" }, crypto: {
    subtle: { digest: async (...args) => { stages.push("sha"); return webcrypto.subtle.digest(...args); } },
    randomUUID: () => webcrypto.randomUUID(),
    getRandomValues: (value) => webcrypto.getRandomValues(value)
  },
  fetch: async (url) => {
    if (String(url).startsWith("/api/runtime-release.asp")) return {
      ok: lookupStatus === 200, status: lookupStatus,
      json: async () => lookupStatus === 200 ? { ok: true, identity: activeIdentity } : { ok: false, code: lookupCode, message: "release denied" }
    };
    return { ok: true, status: 200, headers: new Map([["X-WebWindows-Package-SHA256", "f".repeat(64)]]), arrayBuffer: async () => activeBytes };
  },
  JSZip: { loadAsync: async (...args) => { loadCount += 1; stages.push("unzip"); return JSZip.loadAsync(...args); } },
  DOMParser: class { parseFromString() { return { querySelector: () => null, createElement: () => ({ attributes: new Map() }), head: { prepend() {} }, querySelectorAll: () => [], documentElement: { outerHTML: "<html></html>" } }; } },
  document: { addEventListener() {}, getElementById(id) { return id === "packageFrame" ? frame : id === "runtimeState" ? runtimeState : { textContent: "" }; } }
};
context.globalThis = context;
context.window = context;
vm.runInNewContext(instrumented, context, { filename: "package-runtime.js" });
const runtime = context.__runtimeIdentityTest;
const params = () => new URLSearchParams(`release=${releaseId}&appId=${manifest.id}&version=${manifest.version}&entry=index.html`);

const prepared = await runtime.prepareVerified(params());
assert.equal(prepared.entry, "index.html");
assert.deepEqual(stages.slice(0, 2), ["sha", "unzip"]);
assert.equal(runtime.getTrustState(), "verified-release");
const verifiedIdentity = runtime.getVerifiedIdentity();
assert.equal(Object.isFrozen(verifiedIdentity), true);
assert.equal(Object.isFrozen(verifiedIdentity.approvedPermissions), true);
assert.equal(verifiedIdentity.publishedReleaseId, releaseId);
assert.equal(context.VerifiedRuntimePackageIdentity, undefined);
assert.equal(context.runtimeTrustState, undefined);

const beforeTamperLoads = loadCount;
activeBytes = Uint8Array.from(zipBytes);
activeBytes[activeBytes.length - 1] ^= 1;
await assert.rejects(() => runtime.prepareVerified(params()), (error) => error.code === "package-integrity-failed");
assert.equal(loadCount, beforeTamperLoads, "hash mismatch must not reach unzip or execution");
assert.equal(frame.srcdoc, "");

const wrongManifest = { ...manifest, id: "com.example.other" };
activeBytes = await zipFor(wrongManifest);
activeIdentity = identity({ packageSha256: sha(activeBytes), sourceManifestSha256: manifestSha(wrongManifest) });
await assert.rejects(() => runtime.prepareVerified(params()), (error) => error.code === "manifest-identity-mismatch");

activeBytes = await zipFor(manifest, "nested/manifest.json");
activeIdentity = identity({ packageSha256: sha(activeBytes) });
await assert.rejects(() => runtime.prepareVerified(params()), (error) => error.code === "manifest-integrity-failed");

activeBytes = zipBytes;
activeIdentity = identity({ approvedPermissions: ["device.battery-status.read", "device.unrequested.read"] });
await assert.rejects(() => runtime.prepareVerified(params()), (error) => error.code === "release-binding-mismatch");

lookupStatus = 404; lookupCode = "release-not-found";
await assert.rejects(() => runtime.prepareVerified(params()), (error) => error.code === "release-not-found");
lookupStatus = 409; lookupCode = "release-not-active";
await assert.rejects(() => runtime.prepareVerified(params()), (error) => error.code === "release-not-active");

lookupStatus = 200; activeIdentity = identity({ releaseStatus: "delisted" }); activeBytes = zipBytes;
await runtime.prepareVerified(params());
assert.equal(runtime.getTrustState(), "verified-release", "server-authorized delisted compatibility reference remains runnable");

context.location.search = `?appId=${manifest.id}&version=${manifest.version}&entry=index.html`;
await runtime.prepareLegacy(new URLSearchParams(context.location.search));
assert.equal(runtime.getTrustState(), "legacy-unverified");
assert.equal(runtime.getVerifiedIdentity(), null);

console.log("production runtime package identity verification smoke test passed");
