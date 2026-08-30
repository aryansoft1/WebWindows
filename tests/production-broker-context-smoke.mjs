import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { webcrypto } from "node:crypto";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [source, contextContract, identityContract, appIdentity, review, release, decision, brokerPolicy, methods, permissions, registry, center, page, device, native] = await Promise.all([
  read("assets/js/package-runtime.js"), read("data/sdk/production-broker-context-v1.json").then(JSON.parse),
  read("data/sdk/verified-runtime-package-identity-v1.json").then(JSON.parse), read("data/sdk/published-app-identity-v1.json").then(JSON.parse),
  read("data/sdk/review-decision-v1.json").then(JSON.parse), read("data/sdk/published-release-v1.json").then(JSON.parse),
  read("data/sdk/permission-decision-v1.json").then(JSON.parse), read("data/sdk/capability-broker-policy-v1.json").then(JSON.parse),
  read("data/sdk/capability-broker-methods-v1.json").then(JSON.parse), read("data/sdk/permissions-v1.json").then(JSON.parse),
  read("assets/js/app-registry.js"), read("assets/js/function-center.js"), read("package-runtime.html"),
  read("assets/js/device-api.js"), read("docs/NATIVE_BRIDGE_V1.md")
]);

assert.equal(contextContract.contract, "webwindows-production-broker-context-v1");
assert.equal(contextContract.contextVersion, 1);
assert.equal(contextContract.creationEligibility.delistedCreatesPrivilegedContext, false);
assert.equal(contextContract.boundaries.productionBrokerEnabled, false);
assert.equal(contextContract.boundaries.productionSdkFacadeEnabled, false);
assert.equal(contextContract.policyVersions.interchangeable, false);
for (const field of ["runtimeSessionId", "requestedPermissions", "approvedPermissions", "effectivePermissions", "reviewPolicyVersion", "permissionPolicyVersion", "runtimeCapabilities", "grantState"])
  assert.ok(contextContract.required.includes(field), `Context requires ${field}`);
for (const consumed of [identityContract.contract, appIdentity.contract, review.contract, release.contract, decision.contract, brokerPolicy.contract, permissions.contract])
  assert.ok(consumed, "existing machine contract must remain readable");

const hook = '  document.addEventListener("DOMContentLoaded", () => start().catch((error) => setError(error)));';
assert.ok(source.includes(hook));
const instrumented = source.replace(hook, `
  globalThis.__productionContextTest = Object.freeze({
    buildProductionBrokerContext, assertContextTrustBinding, opaqueId,
    destroyProductionBrokerContext, isProductionBrokerContextActive,
    getContext: () => productionBrokerContext,
    getDiagnostics: () => productionContextDiagnostics,
    installTrust: (trust, verified, sessionId, context) => {
      runtimeTrustState = trust;
      verifiedRuntimePackageIdentity = verified;
      activeRuntimeSessionId = sessionId;
      productionBrokerContext = context || null;
    }
  });
${hook}`);
const context = {
  console, URLSearchParams, TextDecoder, TextEncoder, Uint8Array, ArrayBuffer, Map, Set, Object, Array, String, Number, RegExp, Error, Promise, Date,
  crypto: webcrypto, btoa, location: { search: "" }, fetch: async () => ({ ok:false }), JSZip: {},
  document: { addEventListener() {}, getElementById() { return null; } },
  addEventListener() {}
};
context.globalThis = context;
context.window = context;
vm.runInNewContext(instrumented, context, { filename: "package-runtime.js" });
const runtime = context.__productionContextTest;
const A = "a".repeat(64), B = "b".repeat(64), releaseId = `rel_${"1".repeat(32)}`;
const expected = {
  publishedReleaseId:releaseId, appId:"com.example.context", publisherId:"42", version:"1.0.0",
  packageSha256:A, sourceManifestSha256:B, manifestVersion:2, sdkVersion:"1", reviewDecisionId:"rvd_context",
  approvedPermissions:["device.battery-status.read"], reviewPolicyVersion:1, releaseStatus:"active"
};
const verified = Object.freeze({ ...expected, releaseState:"active", approvedPermissions:Object.freeze([...expected.approvedPermissions]), verificationTimestamp:new Date().toISOString() });
const contracts = { context:contextContract, decision, brokerPolicy, methods, permissions };
const supported = Object.freeze({ "battery.status":Object.freeze({ supported:true, source:"browser" }) });
const unsupported = Object.freeze({ "battery.status":Object.freeze({ supported:false, source:"unsupported" }) });
const sessionA = runtime.opaqueId("runtime"), sessionB = runtime.opaqueId("runtime");
assert.notEqual(sessionA, sessionB);
assert.doesNotMatch(sessionA, new RegExp(expected.appId.replaceAll(".", "\\.")));
runtime.installTrust("verified-release", verified, sessionA);

const eligible = runtime.buildProductionBrokerContext({
  verified, expected, requestedPermissions:["device.battery-status.read"], runtimeSessionId:sessionA, contracts, runtimeCapabilities:supported
});
assert.equal(Object.isFrozen(eligible), true);
assert.equal(Object.isFrozen(eligible.effectivePermissions), true);
assert.equal(eligible.contextState, "eligible");
assert.deepEqual(Array.from(eligible.requestedPermissions), ["device.battery-status.read"]);
assert.deepEqual(Array.from(eligible.approvedPermissions), ["device.battery-status.read"]);
assert.deepEqual(Array.from(eligible.effectivePermissions), ["device.battery-status.read"]);
assert.equal(eligible.grantState["device.battery-status.read"], "not-required");
assert.equal(eligible.reviewPolicyVersion, 1);
assert.equal(eligible.permissionPolicyVersion, 1);
assert.throws(() => eligible.effectivePermissions.push("device.unreviewed.read"), /not extensible|read only|frozen/i);

const requestedOnly = runtime.buildProductionBrokerContext({ verified:{ ...verified, approvedPermissions:Object.freeze([]) }, expected:{ ...expected, approvedPermissions:[] }, requestedPermissions:["device.battery-status.read"], runtimeSessionId:sessionA, contracts, runtimeCapabilities:supported });
assert.deepEqual(Array.from(requestedOnly.effectivePermissions), []);
const approvedOnly = runtime.buildProductionBrokerContext({ verified, expected, requestedPermissions:[], runtimeSessionId:sessionA, contracts, runtimeCapabilities:supported });
assert.deepEqual(Array.from(approvedOnly.effectivePermissions), []);
const unavailable = runtime.buildProductionBrokerContext({ verified, expected, requestedPermissions:["device.battery-status.read"], runtimeSessionId:sessionA, contracts, runtimeCapabilities:unsupported });
assert.deepEqual(Array.from(unavailable.effectivePermissions), []);

const persistentPermission = "device.future-sensitive.read";
const futureContracts = {
  ...contracts,
  permissions:{ ...permissions, permissions:[...permissions.permissions, { id:persistentPermission }] },
  methods:{ ...methods, methods:[...methods.methods, { requiredPermission:persistentPermission, requiredRuntimeCapability:"future.capability", consent:"persistent-user-grant" }] }
};
const futureExpected = { ...expected, approvedPermissions:[persistentPermission] };
const futureVerified = { ...verified, approvedPermissions:Object.freeze([persistentPermission]) };
const future = runtime.buildProductionBrokerContext({ verified:futureVerified, expected:futureExpected, requestedPermissions:[persistentPermission], runtimeSessionId:sessionA, contracts:futureContracts, runtimeCapabilities:{ "future.capability":{ supported:true } } });
assert.deepEqual(Array.from(future.effectivePermissions), []);
assert.equal(future.grantState[persistentPermission], "denied");

for (const releaseState of ["delisted", "revoked", "security-blocked"]) {
  assert.equal(runtime.buildProductionBrokerContext({ verified:{ ...verified, releaseState }, expected:{ ...expected, releaseStatus:releaseState }, requestedPermissions:["device.battery-status.read"], runtimeSessionId:sessionA, contracts, runtimeCapabilities:supported }), null);
}
for (const [field, bad] of [["packageSha256", "c".repeat(64)], ["sourceManifestSha256", "d".repeat(64)], ["reviewDecisionId", "rvd_other"], ["publisherId", "99"], ["publishedReleaseId", `rel_${"2".repeat(32)}`]]) {
  assert.throws(() => runtime.buildProductionBrokerContext({ verified:{ ...verified, [field]:bad }, expected, requestedPermissions:["device.battery-status.read"], runtimeSessionId:sessionA, contracts, runtimeCapabilities:supported }), /可信运行授权上下文/, field);
}
for (const trust of ["legacy-unverified", "verification-failed", "system-trusted"]) {
  runtime.installTrust(trust, verified, sessionA);
  assert.throws(() => runtime.buildProductionBrokerContext({ verified, expected, requestedPermissions:[], runtimeSessionId:sessionA, contracts, runtimeCapabilities:supported }), /可信运行授权上下文/);
}

runtime.installTrust("verified-release", verified, sessionA, eligible);
assert.equal(runtime.isProductionBrokerContextActive(eligible), true);
assert.equal(runtime.isProductionBrokerContextActive({ ...eligible, runtimeSessionId:sessionB }), false);
const reloaded = runtime.buildProductionBrokerContext({ verified, expected, requestedPermissions:["device.battery-status.read"], runtimeSessionId:sessionB, contracts, runtimeCapabilities:supported });
assert.notEqual(reloaded.runtimeSessionId, eligible.runtimeSessionId);
assert.notEqual(reloaded.contextId, eligible.contextId);
runtime.destroyProductionBrokerContext("test-stop");
assert.equal(runtime.isProductionBrokerContextActive(eligible), false);
assert.equal(runtime.getContext(), null);

assert.doesNotMatch(registry + center, /buildProductionBrokerContext|ProductionBrokerContext\s*=/);
assert.doesNotMatch(source, /MessageChannel|MessagePort|postMessage\([^)]*ProductionBrokerContext|window\.ProductionBrokerContext/);
assert.doesNotMatch(source, /localStorage|indexedDB|document\.cookie/);
assert.match(page, /assets\/js\/device-api\.js/);
assert.doesNotMatch(page, /allow-same-origin/);
assert.doesNotMatch(device + native, /ProductionBrokerContext/);
assert.equal(context.ProductionBrokerContext, undefined);
assert.equal(context.VerifiedRuntimePackageIdentity, undefined);
assert.equal(context.WebWindowsNative, undefined);

console.log("production broker context construction and boundary smoke test passed");
