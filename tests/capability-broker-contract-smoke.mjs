import assert from "node:assert/strict";
import fs from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import { CapabilityBrokerContractHarness } from "./helpers/capability-broker-contract-harness.mjs";

const json = async (path) => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const [schema, methods, errors, policy, permissions, compatibility, manifestSchema, publicApi] = await Promise.all([
  json("data/sdk/capability-broker-v1.schema.json"),
  json("data/sdk/capability-broker-methods-v1.json"),
  json("data/sdk/capability-broker-errors-v1.json"),
  json("data/sdk/capability-broker-policy-v1.json"),
  json("data/sdk/permissions-v1.json"),
  json("data/sdk/runtime-compatibility-v1.json"),
  json("data/sdk/manifest-v1.schema.json"),
  fs.readFile(new URL("../data/sdk/webwindows-public-api-v1.d.ts", import.meta.url), "utf8")
]);

const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addSchema(schema);
const validateMethods = ajv.compile({ $ref: `${schema.$id}#/$defs/methodRegistry` });
const validateErrors = ajv.compile({ $ref: `${schema.$id}#/$defs/errorRegistry` });
assert.equal(validateMethods(methods), true, JSON.stringify(validateMethods.errors));
assert.equal(validateErrors(errors), true, JSON.stringify(validateErrors.errors));

assert.equal(methods.defaultDecision, "deny");
assert.equal(methods.wildcardsAllowed, false);
assert.equal(methods.unknownMethods, "deny");
assert.deepEqual(methods.methods.map((method) => method.id), ["device.battery.getState", "device.battery.refresh"]);
assert.equal(new Set(methods.methods.map((method) => method.id)).size, methods.methods.length);
const methodRegistryText = JSON.stringify(methods);
for (const forbidden of ["*", "WebWindowsNative", "NativeAdapter", "invokeNative", "WebWindows.apps"]) {
  assert.doesNotMatch(methodRegistryText, new RegExp(escapeRegExp(forbidden)), forbidden);
}
for (const method of methods.methods) {
  assert.equal(`${method.publicNamespace}.${method.publicMember}`, method.id);
  assert.match(publicApi, new RegExp(`${method.publicMember.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`));
  const permission = permissions.permissions.find((item) => item.id === method.requiredPermission);
  assert.ok(permission, method.requiredPermission);
  assert.equal(permission.publicApiTargets.includes(method.id), true, method.id);
  for (const runtime of compatibility.hostRuntimes.filter((item) => item.capabilities)) {
    assert.ok(runtime.capabilities[method.requiredRuntimeCapability], `${runtime.id}:${method.requiredRuntimeCapability}`);
  }
  assert.equal(method.previewAvailability, "phase-2b-candidate");
  assert.equal(method.productionAvailability, "disabled");
}
for (const excluded of ["device.storage", "fileDialog.open", "fileDialog.save", "fileDialog.write", "fileDialog.read", "fileDialog.saveBlob"]) {
  assert.ok(methods.explicitlyExcluded.includes(excluded), excluded);
}

const expectedErrors = [
  "method-not-allowed", "permission-not-declared", "permission-denied", "capability-unsupported",
  "invalid-params", "gesture-required", "request-timeout", "request-cancelled", "session-invalid",
  "session-expired", "response-too-large", "broker-unavailable", "internal-error"
];
const errorCodes = new Set(errors.errors.map((error) => error.code));
for (const code of expectedErrors) assert.equal(errorCodes.has(code), true, code);
assert.equal(errorCodes.size, errors.errors.length);
assert.equal(errors.privateDetailsAllowed, false);
for (const definition of errors.errors) {
  assert.doesNotMatch(`${definition.code} ${definition.message}`, /Native|adapter|stack|filesystem|URI|provider/i);
}

const session = {
  sessionId: "session-opaque-123456", snapshotId: "snapshot-opaque-123456",
  channelId: "channel-opaque-123456", expiresAt: 60_000
};
const baseRequest = {
  protocol: policy.protocol, version: policy.protocolVersion, type: "request",
  sessionId: session.sessionId, snapshotId: session.snapshotId, channelId: session.channelId,
  requestId: "request-1", method: "device.battery.refresh", params: {}
};
const validateMessage = ajv.compile(schema);
assert.equal(validateMessage(baseRequest), true, JSON.stringify(validateMessage.errors));
const identity = Object.fromEntries(["protocol", "version", "sessionId", "snapshotId", "channelId", "requestId", "method"]
  .map((key) => [key, baseRequest[key]]));
assert.equal(validateMessage({ ...identity, type: "response", ok: true, result: validBattery() }), true);
assert.equal(validateMessage({
  ...identity, type: "response", ok: false,
  error: { code: "permission-denied", message: "The required permission has not been granted.", retryable: false }
}), true);
assert.equal(validateMessage({ ...identity, type: "cancel" }), true);
assert.equal(validateMessage({ ...identity, type: "event", event: "snapshot.update", detail: {} }), true);
assert.equal(validateMessage({ ...baseRequest, userGesture: true }), false, "sandbox gesture claims are not in the wire schema");
assert.equal(validateMessage({ ...baseRequest, method: "device.*" }), false, "wildcard method is structurally impossible");

const allowedContext = {
  declaredPermissions: ["device.battery-status.read"],
  grantedPermissions: ["device.battery-status.read"],
  platformPolicyPermits: true,
  capabilities: { "battery.status": true },
  hostGesture: false
};
const makeHarness = () => new CapabilityBrokerContractHarness({ schema, methods, errors, policy, session });
const request = (id, overrides = {}) => ({ ...baseRequest, requestId: id, ...overrides });

assert.equal(makeHarness().request(request("unknown", { method: "device.network.getState" }), allowedContext).error.code, "method-not-allowed");
assert.equal(makeHarness().request(request("private", { method: "device.native.getBatteryStatus" }), allowedContext).error.code, "method-not-allowed");
assert.equal(makeHarness().request(request("missing"), { ...allowedContext, declaredPermissions: [] }).error.code, "permission-not-declared");
assert.equal(makeHarness().request(request("denied"), { ...allowedContext, grantedPermissions: [] }).error.code, "permission-denied");
assert.equal(makeHarness().request(request("unsupported"), { ...allowedContext, capabilities: { "battery.status": false } }).error.code, "capability-unsupported");
assert.equal(makeHarness().request(request("invalid", { params: { extra: true } }), allowedContext).error.code, "invalid-params");

const oversized = request("oversized", { params: { value: "x".repeat(policy.limits.maximumRequestBytes) } });
assert.equal(makeHarness().request(oversized, allowedContext).error.code, "request-too-large");

const duplicateHarness = makeHarness();
assert.equal(duplicateHarness.request(request("duplicate"), allowedContext).accepted, true);
assert.equal(duplicateHarness.request(request("duplicate"), allowedContext).error.code, "duplicate-request-id");

const cancelledHarness = makeHarness();
assert.equal(cancelledHarness.request(request("cancelled"), allowedContext).accepted, true);
const cancel = { ...request("cancelled"), type: "cancel" };
delete cancel.params;
assert.equal(cancelledHarness.cancel(cancel).error.code, "request-cancelled");
assert.deepEqual(cancelledHarness.complete("cancelled", validBattery()), { ignored: true, reason: "late-or-stale" });

const timeoutHarness = makeHarness();
assert.equal(timeoutHarness.request(request("timeout"), allowedContext).timeoutMs, 3000);
timeoutHarness.advance(3000);
assert.equal(timeoutHarness.terminal.get("timeout").error.code, "request-timeout");
assert.deepEqual(timeoutHarness.complete("timeout", validBattery()), { ignored: true, reason: "late-or-stale" });

const reloadHarness = makeHarness();
reloadHarness.request(request("reload-old"), allowedContext);
const nextSession = {
  sessionId: "session-opaque-654321", snapshotId: "snapshot-opaque-654321",
  channelId: "channel-opaque-654321", expiresAt: 60_000
};
reloadHarness.reload(nextSession);
assert.equal(reloadHarness.terminal.get("reload-old").error.code, "request-cancelled");
assert.equal(reloadHarness.request(request("stale-after-reload"), allowedContext).error.code, "session-invalid");

const resultHarness = makeHarness();
resultHarness.request(request("valid-result"), allowedContext);
assert.equal(resultHarness.complete("valid-result", validBattery()).ok, true);
const invalidResultHarness = makeHarness();
invalidResultHarness.request(request("invalid-result"), allowedContext);
assert.equal(invalidResultHarness.complete("invalid-result", { ...validBattery(), source: "android-native" }).error.code, "internal-error");
const largeResultHarness = makeHarness();
largeResultHarness.request(request("large-result"), allowedContext);
assert.equal(largeResultHarness.complete("large-result", { ...validBattery(), source: "x".repeat(5000) }).error.code, "response-too-large");

for (const audit of [...timeoutHarness.audit, ...reloadHarness.audit, ...resultHarness.audit]) {
  const text = JSON.stringify(audit);
  for (const forbidden of policy.audit.forbiddenFields) assert.equal(Object.hasOwn(audit, forbidden), false, forbidden);
  assert.doesNotMatch(text, /cookie|apiKey|Native|filesystem|providerUri/i);
}
assert.equal(policy.gestureAuthority.authority, "trusted-host-ui-only");
assert.equal(policy.gestureAuthority.sandboxClaimAccepted, false);
assert.equal(policy.sameProtocolForPreviewAndProduction, true);
assert.deepEqual(policy.modeDifferences, ["identity", "grantPersistence", "policyContext", "assetSource"]);
assert.equal(policy.manifestPermissionDeclaration.status, "required-contract-gap");
assert.equal(manifestSchema.$defs.sourceManifest.properties.permissions, undefined);

console.log("capability broker v1 contract smoke test passed");

function validBattery() {
  return { supported: true, present: true, level: 0.72, charging: false, connected: false, source: "runtime" };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
