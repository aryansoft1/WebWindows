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
assert.equal(errors.status, "preview-and-production-battery-pilot");

assert.equal(methods.defaultDecision, "deny");
assert.equal(methods.wildcardsAllowed, false);
assert.equal(methods.unknownMethods, "deny");
/* Round 17 G1/G2 edition: battery pilot rows stay first and byte-identical; nine candidate
 * methods follow verbatim from the two approved drafts (proposed-disabled in production). */
assert.deepEqual(methods.methods.slice(0, 2).map((method) => method.id), ["device.battery.getState", "device.battery.refresh"]);
const batteryMethods = methods.methods.slice(0, 2);
const candidateMethods = methods.methods.slice(2);
assert.equal(methods.methods.length, 11);
assert.equal(new Set(methods.methods.map((method) => method.id)).size, methods.methods.length);
assert.deepEqual(candidateMethods.map((method) => method.id), [
  "device.storage.stat", "device.storage.readChunk",
  "device.storage.writeSession.begin", "device.storage.writeSession.writeChunk",
  "device.storage.writeSession.commit", "device.storage.writeSession.abort", "device.storage.writeSession.status",
  "device.media.getCapabilities", "ai.desktalk.requestAssist"
]);
for (const method of candidateMethods) {
  assert.equal(method.previewAvailability, "proposed-enabled");
  assert.equal(method.productionAvailability, "proposed-disabled");
  assert.equal(method.currentStatus, "draft");
}
const methodRegistryText = JSON.stringify(methods);
for (const forbidden of ["WebWindowsNative", "NativeAdapter", "invokeNative", "WebWindows.apps"]) {
  assert.doesNotMatch(methodRegistryText, new RegExp(escapeRegExp(forbidden)), forbidden);
}
/* no authority carries a wildcard: ids and patterns are schema-enforced, the remaining
 * authority fields are asserted explicitly (prose like "cloud.files.* flows" in a
 * sanitization string is descriptive, not an authority claim) */
for (const method of methods.methods) {
  for (const field of ["id", "publicNamespace", "publicMember", "requiredRuntimeCapability"]) {
    assert.doesNotMatch(String(method[field]), /\*/, `${method.id}.${field}`);
  }
  if (typeof method.requiredPermission === "string") {
    assert.doesNotMatch(method.requiredPermission, /\*/, `${method.id}.requiredPermission`);
  }
  assert.equal(methods.wildcardsAllowed, false);
}
for (const method of batteryMethods) {
  assert.equal(`${method.publicNamespace}.${method.publicMember}`, method.id);
  assert.match(publicApi, new RegExp(`${method.publicMember.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`));
  const permission = permissions.permissions.find((item) => item.id === method.requiredPermission);
  assert.ok(permission, method.requiredPermission);
  assert.equal(permission.publicApiTargets.includes(method.id), true, method.id);
  for (const runtime of compatibility.hostRuntimes.filter((item) => item.capabilities)) {
    assert.ok(runtime.capabilities[method.requiredRuntimeCapability], `${runtime.id}:${method.requiredRuntimeCapability}`);
  }
  assert.equal(method.previewAvailability, "enabled");
  assert.equal(method.productionAvailability, "enabled");
  assert.equal(method.currentStatus, "enabled");
}
for (const method of candidateMethods) {
  /* Candidates are contract rows only: no d.ts facade members yet (d.ts edit deferred per repo rule 4). */
  const facadeTarget = `${method.publicNamespace}.${method.publicMember}`;
  if (method.requiredPermission !== null) {
    const permission = permissions.permissions.find((item) => item.id === method.requiredPermission);
    assert.ok(permission, `${method.id}: ${method.requiredPermission}`);
    /* the facade target is what the permission authorizes; the broker id may differ from it
     * (ai rides namespace "ai", so ai.desktalk.requestAssist authorizes the facet ai.requestAssist) */
    assert.equal(permission.publicApiTargets.includes(facadeTarget), true, `${method.id} -> ${facadeTarget}`);
  } else {
    assert.equal(method.id, "device.media.getCapabilities", "null permission is reserved for the capability handshake");
  }
  /* the factual compatibility table must NOT claim candidate capabilities yet (no overclaim) */
  for (const runtime of compatibility.hostRuntimes.filter((item) => item.capabilities)) {
    assert.equal(Object.hasOwn(runtime.capabilities, method.requiredRuntimeCapability), false, `${runtime.id}:${method.requiredRuntimeCapability} must not be claimed before its runtime review`);
  }
}
/* no candidate facade member has shipped into the public vocabulary */
for (const absent of ["writeSession", "requestAssist", "desktalk"]) {
  assert.doesNotMatch(publicApi, new RegExp(absent), `${absent} has no facade member yet`);
}
assert.deepEqual([...methods.explicitlyExcluded].sort(), [
  "ai.complete", "ai.desktalk.attachFile", "ai.desktalk.readThread", "ai.desktalk.send",
  "device.media.record", "device.media.upload",
  "device.storage.listDirectory", "device.storage.listVolumes", "device.storage.pickDirectory", "device.storage.requestPermission",
  "fileDialog.open", "fileDialog.read", "fileDialog.save", "fileDialog.saveBlob", "fileDialog.write"
].sort());
assert.equal(methods.explicitlyExcluded.includes("device.storage"), false, "the blanket device.storage exclusion was split in the round 17 edition (directory surface stays excluded via its four explicit ids)");

/* registry status and edition notes (R4 provenance + pending facade honesty note) */
assert.equal(methods.status, "preview-and-production-battery-pilot");
assert.equal(methods.notes.length, 2);
assert.match(methods.notes[0], /registered verbatim as candidates/);
assert.match(methods.notes[1], /Facade generation for the candidate namespaces is pending/);

/* one reviewed event contract: ai.assist.received bound to the assist permission */
assert.deepEqual(methods.events.map((event) => event.id), ["ai.assist.received"]);
const assistEvent = methods.events[0];
assert.equal(`${assistEvent.publicNamespace}.${assistEvent.publicMember}`, "ai.on");
assert.equal(assistEvent.direction, "host-to-sandbox");
{
  const permission = permissions.permissions.find((item) => item.id === assistEvent.requiredPermission);
  assert.ok(permission, assistEvent.requiredPermission);
  assert.equal(permission.publicApiTargets.includes("ai.on"), true);
}
assert.deepEqual(assistEvent.payloadSchema.required, ["ticketId", "proposals"]);
assert.ok(methods.$defs.sanitizedMediaCapabilities, "getCapabilities result ref must be resolvable in the registry $defs");

/* reviewed-and-declined rows: battery-era four stay first, five carried verbatim from the drafts */
assert.deepEqual(methods.reviewedNotSelected.map((row) => row.id).slice(0, 4), ["device.network.getState", "device.runtime.getInfo", "device.display.getInfo", "device.audio.getVolume"]);
assert.deepEqual(methods.reviewedNotSelected.map((row) => row.id).slice(4), ["device.storage.seek", "device.media.getPerformanceInfo", "device.media.pickTrack", "ai.desktalk.findAssistTargets", "ai.desktalk.cancelAssist"]);

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
assert.equal(policy.manifestPermissionDeclaration.status, "resolved-by-manifest-v2-contract-preview-pilot-enabled");
assert.equal(policy.manifestPermissionDeclaration.sourceManifestSchema, "data/sdk/manifest-v2.schema.json");
assert.equal(batteryMethods.every((method) => method.productionAvailability === "enabled"), true);
assert.deepEqual(batteryMethods.map((method) => method.id), ["device.battery.getState", "device.battery.refresh"]);
assert.equal(candidateMethods.every((method) => method.productionAvailability === "proposed-disabled"), true);
assert.equal(manifestSchema.$defs.sourceManifest.properties.permissions, undefined);

console.log("capability broker v1 contract smoke test passed");

function validBattery() {
  return { supported: true, present: true, level: 0.72, charging: false, connected: false, source: "runtime" };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
