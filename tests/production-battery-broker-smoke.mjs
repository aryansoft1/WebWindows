import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { ProductionBatteryBroker } from "../webwindows-vue/src/production-broker/production-battery-broker.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

globalThis.crypto ??= webcrypto;
const contracts = await loadStudioContracts();
const state = Object.freeze({ supported:true, present:true, level:0.61, charging:false, connected:false, source:"browser", privateTransport:"drop" });
const calls = { state:0, refresh:0, status:0 };
let authoritativeStatus = "active";
const context = makeContext();
const api = { device:{ battery:{ getState() { calls.state++; return state; }, refresh() { calls.refresh++; return Promise.resolve(state); } } } };
const releaseStatusProvider = async () => { calls.status++; return { ...releaseFact(context), releaseStatus:authoritativeStatus }; };

const eligible = broker({ context, api, releaseStatusProvider });
const launch = await eligible.createLaunchDescriptor();
assert.equal(launch.facadeEnabled, true);
assert.equal(launch.handshake.ok, true);
assert.deepEqual(launch.handshake.result, cleanState());
assert.equal(Object.hasOwn(launch.handshake.result, "privateTransport"), false);
assert.notEqual(eligible.binding.sessionId, context.runtimeSessionId);
assert.notEqual(eligible.binding.snapshotId, context.contextId);
assert.equal(JSON.stringify(eligible.initMessage()).includes(context.publishedReleaseId), false);

for (const ineligibleContext of [
  makeContext({ manifestVersion:1 }),
  makeContext({ trustState:"legacy-unverified", contextState:"ineligible" }),
  makeContext({ releaseState:"delisted", contextState:"ineligible" }),
  makeContext({ sourceManifestIntegrityVersion:0 }),
  makeContext({ sourceManifestIntegrityVersion:2 }),
  (() => { const value = { ...makeContext() }; delete value.sourceManifestIntegrityVersion; return value; })()
]) {
  assert.equal((await broker({ context:ineligibleContext, api, releaseStatusProvider }).createLaunchDescriptor()).facadeEnabled, false);
}

const success = await eligible.handleEnvelope(request(eligible, "allowed"));
assert.equal(success.ok, true);
assert.deepEqual(success.result, cleanState());
assert.equal(calls.status, 2, "every privileged refresh checks authority before dispatch and before response delivery");
assert.equal(calls.refresh, 1);

const missing = broker({ context:makeContext({ requestedPermissions:[], effectivePermissions:[] }), api, releaseStatusProvider });
const missingLaunch = await missing.createLaunchDescriptor();
assert.equal(missingLaunch.facadeEnabled, true);
assert.equal(missingLaunch.handshake.error.code, "permission-not-declared");
assert.equal(calls.state, 1, "missing declaration must not read another Battery handshake");
assert.equal((await missing.handleEnvelope(request(missing, "missing"))).error.code, "permission-not-declared");
for (const confusedPermission of ["Device.Battery-Status.Read", " device.battery-status.read", "device.battery-status.read ",
  "device.battery-status.*", "device.battery-status", "device.battery-status.read.extra", "device.battery‐status.read"]) {
  const confused = broker({ context:makeContext({ requestedPermissions:[confusedPermission], approvedPermissions:[confusedPermission], effectivePermissions:[confusedPermission] }), api, releaseStatusProvider });
  assert.equal((await confused.createLaunchDescriptor()).handshake.error.code, "permission-not-declared", confusedPermission);
}
const normalizedReviewConfusion = broker({ context:makeContext({ approvedPermissions:["Device.Battery-Status.Read"], effectivePermissions:[] }), api, releaseStatusProvider });
assert.equal((await normalizedReviewConfusion.createLaunchDescriptor()).handshake.error.code, "policy-denied");

const reviewDenied = broker({ context:makeContext({ approvedPermissions:[], effectivePermissions:[] }), api, releaseStatusProvider });
assert.equal((await reviewDenied.createLaunchDescriptor()).handshake.error.code, "policy-denied");
assert.equal((await reviewDenied.handleEnvelope(request(reviewDenied, "review-denied"))).error.code, "policy-denied");
const unsupported = broker({ context:makeContext({ effectivePermissions:[], runtimeCapabilities:{ "battery.status":{ supported:false, source:"unsupported" } } }), api, releaseStatusProvider });
assert.equal((await unsupported.createLaunchDescriptor()).handshake.error.code, "capability-unsupported");
assert.equal((await unsupported.handleEnvelope(request(unsupported, "unsupported"))).error.code, "capability-unsupported");

for (const [name, provider] of [
  ["authority-timeout", async () => { throw new Error("timeout"); }],
  ["authority-null", async () => null],
  ["authority-partial", async () => ({ releaseStatus:"active" })],
  ["authority-unknown-state", async () => ({ ...releaseFact(context), releaseStatus:"unknown" })],
  ["authority-old-integrity", async () => ({ ...releaseFact(context), sourceManifestIntegrityVersion:0, releaseStatus:"active" })]
]) {
  const denied = broker({ api, releaseStatusProvider:provider });
  assert.equal((await denied.handleEnvelope(request(denied, name))).error.code, "policy-denied", name);
}
let authorityTimeoutCallback, authorityAborted = false;
const authorityTimeout = broker({ api, releaseStatusProvider:({ signal } = {}) => new Promise(() => {
  signal?.addEventListener("abort", () => { authorityAborted = true; });
}), setAuthorityTimer:(callback) => { authorityTimeoutCallback = callback; return 7; }, clearAuthorityTimer:() => {} });
const authorityTimeoutResponse = authorityTimeout.handleEnvelope(request(authorityTimeout, "authority-bounded-timeout"));
await Promise.resolve(); await Promise.resolve(); authorityTimeoutCallback();
assert.equal((await authorityTimeoutResponse).error.code, "policy-denied");
assert.equal(authorityAborted, true);

let holdAuthority = true, authorityCalls = 0;
const authorityWaiters = [];
const bounded = broker({ api, releaseStatusProvider:() => {
  authorityCalls += 1;
  if (!holdAuthority) return Promise.resolve({ ...releaseFact(context), releaseStatus:"active" });
  return new Promise((resolve) => authorityWaiters.push(resolve));
} });
const concurrentLimit = contracts.brokerPolicy.limits.maximumConcurrentRequests;
const boundedRequests = Array.from({ length:concurrentLimit }, (_, index) => bounded.handleEnvelope(request(bounded, `bounded-${index}`)));
await Promise.resolve();
assert.equal((await bounded.handleEnvelope(request(bounded, "bounded-overflow"))).error.code, "rate-limited");
assert.equal(authorityCalls, concurrentLimit, "overflow must be rejected before authoritative server lookup");
holdAuthority = false;
for (const resolve of authorityWaiters) resolve({ ...releaseFact(context), releaseStatus:"active" });
assert.equal((await Promise.all(boundedRequests)).every((response) => response.ok), true);

assert.equal((await eligible.handleEnvelope(request(eligible, "network", { method:"device.network.getState" }))).error.code, "method-not-allowed");
assert.equal((await eligible.handleEnvelope(request(eligible, "claims", { params:{ permission:"device.battery-status.read", capability:true } }))).error.code, "invalid-params");
assert.equal((await eligible.handleEnvelope(request(eligible, "wrong-protocol", { protocol:"attacker-protocol" }))).error.code, "protocol-unsupported");
assert.equal((await eligible.handleEnvelope(request(eligible, "wrong-version", { version:99 }))).error.code, "protocol-unsupported");
assert.equal((await eligible.handleEnvelope(request(eligible, "wrong-session", { sessionId:"broker-session-attacker" }))).error.code, "session-invalid");
assert.equal((await eligible.handleEnvelope(request(eligible, "wrong-snapshot", { snapshotId:"broker-binding-attacker" }))).error.code, "session-invalid");
assert.equal((await eligible.handleEnvelope(request(eligible, "wrong-channel", { channelId:"broker-channel-attacker" }))).error.code, "session-invalid");
assert.equal((await eligible.handleEnvelope(request(eligible, "extra-nonce", { hostNonce:"sandbox-claim" }))).error.code, "invalid-params");
assert.equal((await eligible.handleEnvelope(request(eligible, "wrong-method-type", { method:{ id:"device.battery.refresh" } }))).error.code, "method-not-allowed");
assert.equal((await eligible.handleEnvelope(request(eligible, "response-injection", { type:"response", ok:true, result:state }))).error.code, "invalid-params");
assert.equal((await eligible.handleEnvelope(request(eligible, "event-injection", { type:"event" }))).error.code, "invalid-params");
assert.equal((await eligible.handleEnvelope(request(eligible, "huge", { padding:"x".repeat(70 * 1024) }))).error.code, "request-too-large");
const cyclic = request(eligible, "cyclic"); cyclic.params.self = cyclic.params;
assert.equal((await eligible.handleEnvelope(cyclic)).error.code, "request-too-large");
const duplicate = request(eligible, "duplicate");
assert.equal((await eligible.handleEnvelope(duplicate)).ok, true);
assert.equal((await eligible.handleEnvelope(duplicate)).error.code, "duplicate-request-id");

const refreshesBeforeRevocation = calls.refresh;
authoritativeStatus = "revoked";
assert.equal((await eligible.handleEnvelope(request(eligible, "revoked"))).error.code, "policy-denied");
assert.equal(calls.refresh, refreshesBeforeRevocation, "authoritative revocation must stop dispatch before the public API");
authoritativeStatus = "security-blocked";
assert.equal((await eligible.handleEnvelope(request(eligible, "blocked"))).error.code, "policy-denied");
authoritativeStatus = "active";

let raceChecks = 0, raceRefreshes = 0;
const race = broker({ api:{ device:{ battery:{ getState:() => state, refresh:async () => { raceRefreshes++; return state; } } } },
  releaseStatusProvider:async () => ({ ...releaseFact(context), releaseStatus:++raceChecks === 1 ? "active" : "revoked" }) });
assert.equal((await race.handleEnvelope(request(race, "revocation-race"))).error.code, "policy-denied");
assert.equal(raceRefreshes, 1, "race fixture must revoke after Public API dispatch");
assert.equal(raceChecks, 2, "response delivery requires a second authoritative check");
assert.equal(race.getDiagnostics().some((item) => item.resultCategory === "release-revoked-before-response"), true);

const sessionB = broker({ context:makeContext({ runtimeSessionId:"runtime-session-production-0002", contextId:"context-production-identity-0002" }), api, releaseStatusProvider });
assert.notEqual(sessionB.binding.channelId, eligible.binding.channelId);
assert.equal((await sessionB.handleEnvelope(request(eligible, "cross-session"))).error.code, "session-invalid");
assert.equal((await sessionB.handleEnvelope(request(eligible, "cancel-other", { type:"cancel", omitParams:true }))).error.code, "session-invalid");

let resolveSlow, timeoutCallback;
const slow = broker({ api:{ device:{ battery:{ getState:() => state, refresh:() => new Promise((resolve) => { resolveSlow = resolve; }) } } },
  releaseStatusProvider, setTimer:(callback) => { timeoutCallback = callback; return 1; }, clearTimer:() => {} });
const timed = slow.handleEnvelope(request(slow, "timeout"));
while (!timeoutCallback) await Promise.resolve();
timeoutCallback();
assert.equal((await timed).error.code, "request-timeout");
resolveSlow(state); await new Promise((resolve) => setImmediate(resolve));
assert.equal(slow.getDiagnostics().some((item) => item.resultCategory === "late-result-ignored"), true);

let resolveCancel;
const cancelling = broker({ api:{ device:{ battery:{ getState:() => state, refresh:() => new Promise((resolve) => { resolveCancel = resolve; }) } } }, releaseStatusProvider });
const pending = cancelling.handleEnvelope(request(cancelling, "cancel"));
while (!resolveCancel) await Promise.resolve();
assert.equal(await cancelling.handleEnvelope(request(cancelling, "cancel", { type:"cancel", omitParams:true })), null);
assert.equal((await pending).error.code, "request-cancelled"); resolveCancel(state);

const malformed = broker({ api:{ device:{ battery:{ getState:() => state, refresh:() => ({ ...state, level:2 }) } } }, releaseStatusProvider });
assert.equal((await malformed.handleEnvelope(request(malformed, "malformed"))).error.code, "internal-error");
const diagnosticKeys = new Set(eligible.getDiagnostics().flatMap((item) => Object.keys(item)));
for (const secret of ["params", "result", "privateTransport", "hostNonce", "apiKey", "cookie", "nativeMethod", "stack"]) assert.equal(diagnosticKeys.has(secret), false, secret);
assert.equal(eligible.getDiagnostics().some((item) => item.declared === true && item.reviewApproved === true && item.effective === true), true);
eligible.close();
assert.equal((await eligible.handleEnvelope(request(eligible, "closed"))).error.code, "session-invalid");
console.log("production Battery Broker authority and protocol smoke test passed");

function broker(overrides = {}) { return new ProductionBatteryBroker({ context:overrides.context || context, contracts,
  publicApi:overrides.api || api, releaseStatusProvider:overrides.releaseStatusProvider || releaseStatusProvider,
  setTimer:overrides.setTimer, clearTimer:overrides.clearTimer,
  setAuthorityTimer:overrides.setAuthorityTimer, clearAuthorityTimer:overrides.clearAuthorityTimer }); }
function makeContext(overrides = {}) { return Object.freeze({ contextVersion:1, contextId:"context-production-identity-0001",
  runtimeSessionId:"runtime-session-production-0001", publishedReleaseId:`rel_${"1".repeat(32)}`, appId:"com.example.production",
  publisherId:"42", version:"1.0.0", packageSha256:"a".repeat(64), sourceManifestSha256:"b".repeat(64), sourceManifestIntegrityVersion:1,
  manifestVersion:2, sdkVersion:"1", reviewDecisionId:"rvd_production", reviewPolicyVersion:1, permissionPolicyVersion:1,
  requestedPermissions:Object.freeze(["device.battery-status.read"]), approvedPermissions:Object.freeze(["device.battery-status.read"]),
  effectivePermissions:Object.freeze(["device.battery-status.read"]), releaseState:"active", trustState:"verified-release", contextState:"eligible",
  runtimeCapabilities:Object.freeze({ "battery.status":Object.freeze({ supported:true, source:"browser" }) }), grantState:Object.freeze({ "device.battery-status.read":"not-required" }), ...overrides }); }
function releaseFact(value) { return { publishedReleaseId:value.publishedReleaseId, appId:value.appId, publisherId:value.publisherId, version:value.version,
  packageSha256:value.packageSha256, sourceManifestSha256:value.sourceManifestSha256, sourceManifestIntegrityVersion:value.sourceManifestIntegrityVersion,
  reviewDecisionId:value.reviewDecisionId, reviewPolicyVersion:value.reviewPolicyVersion, approvedPermissions:[...value.approvedPermissions] }; }
function request(instance, id, overrides = {}) { const value = { protocol:contracts.brokerPolicy.protocol, version:1, type:"request",
  sessionId:instance.binding.sessionId, snapshotId:instance.binding.snapshotId, channelId:instance.binding.channelId,
  requestId:id, method:"device.battery.refresh", params:{}, ...overrides }; if (overrides.omitParams) delete value.params; delete value.omitParams; return value; }
function cleanState() { return { supported:true, present:true, level:0.61, charging:false, connected:false, source:"browser" }; }
