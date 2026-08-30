import assert from "node:assert/strict";
import { PreviewBatteryBroker } from "../webwindows-vue/src/developer-studio/broker/preview-battery-broker.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

const contracts = await loadStudioContracts();
const baseState = Object.freeze({
  supported: true, present: true, level: 0.75, charging: false, connected: false,
  source: "browser", adapterSecret: "must-not-cross"
});

assert.deepEqual(await broker({ manifest: manifestV1() }).createLaunchDescriptor(), { facadeEnabled: false });

const missingCalls = { capabilities: 0, state: 0, refresh: 0 };
const missing = broker({ manifest: manifestV2([]), publicApi: publicApi({ calls: missingCalls }) });
const missingLaunch = await missing.createLaunchDescriptor();
assert.equal(missingLaunch.facadeEnabled, true);
assert.equal(missingLaunch.handshake.ok, false);
assert.equal(missingLaunch.handshake.error.code, "permission-not-declared");
assert.equal(JSON.stringify(missingLaunch).includes("adapterSecret"), false);
assert.equal(missingCalls.state, 0, "an undeclared permission must not read a handshake state");
assert.equal((await missing.handleEnvelope(request(missing, "missing-permission"))).error.code, "permission-not-declared");

const deniedCalls = { capabilities: 0, state: 0, refresh: 0 };
const denied = broker({ platformPolicyPermits: false, publicApi: publicApi({ calls: deniedCalls }) });
assert.equal((await denied.createLaunchDescriptor()).handshake.error.code, "policy-denied");
assert.equal((await denied.handleEnvelope(request(denied, "policy-denied"))).error.code, "policy-denied");
assert.equal(deniedCalls.state, 0);
const grantDeniedBroker = broker({ grantResolver: () => false });
assert.equal((await grantDeniedBroker.createLaunchDescriptor()).handshake.error.code, "permission-denied");
const unsupportedCalls = { capabilities: 0, state: 0, refresh: 0 };
const unsupported = broker({ publicApi: publicApi({ capability: false, calls: unsupportedCalls }) });
assert.equal((await unsupported.createLaunchDescriptor()).handshake.error.code, "capability-unsupported");
assert.equal((await unsupported.handleEnvelope(request(unsupported, "unsupported"))).error.code, "capability-unsupported");
assert.equal(unsupportedCalls.state, 0, "unsupported capability must not leak a Battery state");

const apiCalls = { capabilities: 0, state: 0, refresh: 0 };
const eligible = broker({ publicApi: publicApi({ calls: apiCalls }) });
const launch = await eligible.createLaunchDescriptor();
assert.equal(launch.handshake.ok, true);
assert.deepEqual(launch.handshake.result, {
  supported: true, present: true, level: 0.75, charging: false, connected: false, source: "browser"
});
assert.equal(Object.hasOwn(launch.handshake.result, "adapterSecret"), false);
assert.equal(apiCalls.state, 1);

const success = await eligible.handleEnvelope(request(eligible, "success"));
assert.equal(success.ok, true);
assert.deepEqual(success.result, launch.handshake.result);
assert.equal(Object.hasOwn(success.result, "adapterSecret"), false);
assert.equal(apiCalls.refresh, 1, "dispatch must use the stable public refresh member");

assert.equal((await eligible.handleEnvelope(request(eligible, "unknown", { method: "device.network.getState" }))).error.code, "method-not-allowed");
assert.equal((await eligible.handleEnvelope(request(eligible, "invalid", { params: { extra: true } }))).error.code, "invalid-params");
const sandboxClaims = request(eligible, "sandbox-claims", {
  params: { userGesture: true, grantState: "session-grant", capability: true, policyVersion: 999, token: "secret-sentinel" }
});
assert.equal((await eligible.handleEnvelope(sandboxClaims)).error.code, "invalid-params",
  "sandbox authority claims must be rejected as application parameters");
const oversized = request(eligible, "oversized", { padding: "x".repeat(20_000) });
assert.equal((await eligible.handleEnvelope(oversized)).error.code, "request-too-large");
const duplicateRequest = request(eligible, "duplicate");
assert.equal((await eligible.handleEnvelope(duplicateRequest)).ok, true);
assert.equal((await eligible.handleEnvelope(duplicateRequest)).error.code, "duplicate-request-id");
assert.equal((await eligible.handleEnvelope(request(eligible, "stale", { sessionId: "session-stale-identity" }))).error.code, "session-invalid");

const rateContracts = structuredClone(contracts);
rateContracts.brokerPolicy.limits.maximumRequestsPerMinute = 1;
const rate = broker({ contracts: rateContracts });
assert.equal((await rate.handleEnvelope(request(rate, "rate-1"))).ok, true);
assert.equal((await rate.handleEnvelope(request(rate, "rate-2"))).error.code, "rate-limited");

let resolveSlow;
let timeoutCallback;
const slow = broker({
  publicApi: publicApi({ refresh: () => new Promise((resolve) => { resolveSlow = resolve; }) }),
  setTimer: (callback) => { timeoutCallback = callback; return 1; }, clearTimer: () => {}
});
const timed = slow.handleEnvelope(request(slow, "timed"));
await Promise.resolve();
timeoutCallback();
assert.equal((await timed).error.code, "request-timeout");
resolveSlow(baseState);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(slow.getAudit().filter((entry) => entry.requestId === "timed" && entry.resultCategory === "success").length, 0,
  "late results must not resolve or be recorded as success");
assert.equal(slow.getAudit().some((entry) => entry.requestId === "timed" && entry.resultCategory === "late-result-ignored"), true);

let resolveCancelled;
const cancelled = broker({ publicApi: publicApi({ refresh: () => new Promise((resolve) => { resolveCancelled = resolve; }) }) });
const pending = cancelled.handleEnvelope(request(cancelled, "cancelled"));
await Promise.resolve();
assert.equal(await cancelled.handleEnvelope(request(cancelled, "cancelled", { type: "cancel", omitParams: true })), null);
assert.equal((await pending).error.code, "request-cancelled");
resolveCancelled(baseState);

const huge = broker({ publicApi: publicApi({ refresh: () => ({ ...baseState, padding: "x".repeat(5000) }) }) });
assert.equal((await huge.handleEnvelope(request(huge, "huge"))).error.code, "response-too-large");
const malformed = broker({ publicApi: publicApi({ refresh: () => ({ ...baseState, level: 2 }) }) });
assert.equal((await malformed.handleEnvelope(request(malformed, "malformed"))).error.code, "internal-error");

const expired = broker({ session: session({ expiresAt: "2026-01-01T00:00:00.000Z" }), now: () => Date.parse("2026-01-01T00:00:01.000Z") });
assert.equal((await expired.handleEnvelope(request(expired, "expired"))).error.code, "session-expired");

const callsB = { capabilities: 0, state: 0, refresh: 0 };
const sessionA = broker();
const sessionB = broker({
  session: session({ sessionId: "session-preview-identity-0002", snapshotId: "snapshot-preview-identity-0002" }),
  publicApi: publicApi({ calls: callsB })
});
assert.notEqual(sessionA.channelId, sessionB.channelId, "each Preview session must rotate its Broker channel identity");
assert.equal((await sessionB.handleEnvelope(request(sessionA, "cross-session"))).error.code, "session-invalid");
assert.equal(callsB.refresh, 0, "Session A must not dispatch through Session B");

let resolveClosed;
const closed = broker({ publicApi: publicApi({ refresh: () => new Promise((resolve) => { resolveClosed = resolve; }) }) });
const closedPending = closed.handleEnvelope(request(closed, "closed"));
await Promise.resolve();
closed.close();
assert.equal((await closedPending).error.code, "request-cancelled");
resolveClosed(baseState);

const auditEntries = eligible.getAudit();
const auditKeys = new Set(auditEntries.flatMap((entry) => Object.keys(entry)));
for (const forbidden of ["params", "result", "adapterSecret", "privateStack", "nativeTransport", "cookie", "apiKey"]) {
  assert.equal(auditKeys.has(forbidden), false, `audit must exclude ${forbidden}`);
}
const diagnostics = eligible.getDiagnostics();
assert.equal(diagnostics.some((entry) => entry.grantState === "not-required" && entry.policyVersion === 1), true);
const diagnosticKeys = new Set(diagnostics.flatMap((entry) => Object.keys(entry)));
for (const forbidden of ["params", "result", "token", "credential", "adapter", "provider", "privateStack", "nativeMethod"]) {
  assert.equal(diagnosticKeys.has(forbidden), false, `developer diagnostics must exclude ${forbidden}`);
}
assert.equal(JSON.stringify(diagnostics).includes("secret-sentinel"), false, "diagnostics must not echo request data");
const auditCount = eligible.getAudit().length;
eligible.clearDiagnostics();
assert.equal(eligible.getDiagnostics().length, 0);
assert.equal(eligible.getAudit().length, auditCount, "clearing the developer projection must not affect Broker audit/state");
assert.equal((await eligible.handleEnvelope(request(eligible, "after-clear"))).ok, true);
assert.equal(eligible.getDiagnostics().length > 0, true);
assert.equal(apiCalls.capabilities > 0, true);
console.log("developer studio battery broker runtime smoke test passed");

function broker(overrides = {}) {
  const item = new PreviewBatteryBroker({
    session: overrides.session || session(),
    manifest: overrides.manifest || manifestV2(["device.battery-status.read"]),
    contracts: overrides.contracts || contracts,
    publicApi: overrides.publicApi || publicApi(),
    platformPolicyPermits: overrides.platformPolicyPermits ?? true,
    grantResolver: overrides.grantResolver,
    now: overrides.now,
    setTimer: overrides.setTimer,
    clearTimer: overrides.clearTimer
  });
  return item;
}

function session(overrides = {}) {
  return {
    sessionId: "session-preview-identity-0001", snapshotId: "snapshot-preview-identity-0001",
    projectUuid: "project-preview-identity-0001", expiresAt: "2099-01-01T00:00:00.000Z", ...overrides
  };
}

function manifestV1() {
  return { id: "com.webwindows.v1", name: "v1", version: "1.0.0", entry: "index.html" };
}

function manifestV2(permissions) {
  return { manifestVersion: 2, id: "com.webwindows.battery", name: "Battery", version: "1.0.0", entry: "index.html", sdk: { apiVersion: "1" }, permissions };
}

function publicApi({ capability = true, refresh, calls = { capabilities: 0, state: 0, refresh: 0 } } = {}) {
  return {
    device: {
      battery: {
        getCapabilities() { calls.capabilities += 1; return { status: { supported: capability } }; },
        getState() { calls.state += 1; return baseState; },
        refresh() { calls.refresh += 1; return refresh ? refresh() : Promise.resolve(baseState); }
      }
    }
  };
}

function request(instance, requestId, overrides = {}) {
  const message = {
    protocol: contracts.brokerPolicy.protocol, version: contracts.brokerPolicy.protocolVersion, type: "request",
    sessionId: instance.session.sessionId, snapshotId: instance.session.snapshotId, channelId: instance.channelId,
    requestId, method: "device.battery.refresh", params: {}, ...overrides
  };
  if (overrides.omitParams) delete message.params;
  delete message.omitParams;
  return message;
}
