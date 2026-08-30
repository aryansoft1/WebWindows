import assert from "node:assert/strict";
import { evaluatePermissionDecision } from "../webwindows-vue/src/developer-studio/permissions/permission-policy-engine.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

const contracts = await loadStudioContracts();
const method = contracts.brokerMethods.methods.find((item) => item.id === "device.battery.refresh");
const declaredManifest = manifest([method.requiredPermission]);

const allowed = decide({ manifest: declaredManifest });
assert.deepEqual(pick(allowed), {
  declared: true, policy: "allowed", consentMode: "no-consent", grantState: "not-required",
  capability: "supported", methodPolicy: "enabled", effective: true, denialReason: null,
  publicErrorCode: null, policyVersion: 1
});

const calls = [];
const undeclared = decide({
  manifest: manifest([]),
  policy: () => { calls.push("policy"); return true; },
  grant: () => { calls.push("grant"); return true; },
  capability: () => { calls.push("capability"); return true; }
});
assert.equal(undeclared.denialReason, "not-declared");
assert.equal(undeclared.publicErrorCode, "permission-not-declared");
assert.deepEqual(calls, [], "undeclared applications must not reach trusted policy, grant or capability authorities");

const policyDenied = decide({ manifest: declaredManifest, policy: false, grant: { allowed: true, state: "session-grant" } });
assert.equal(policyDenied.denialReason, "policy-denied");
assert.equal(policyDenied.policy, "denied");
assert.equal(policyDenied.capability, "not-evaluated");

const grantDenied = decide({ manifest: declaredManifest, grant: false, capability: true });
assert.equal(grantDenied.denialReason, "grant-denied");
assert.equal(grantDenied.publicErrorCode, "permission-denied");
assert.equal(grantDenied.capability, "not-evaluated");

const unsupported = decide({ manifest: declaredManifest, capability: false });
assert.equal(unsupported.denialReason, "capability-unsupported");
assert.equal(unsupported.publicErrorCode, "capability-unsupported");

const consentMethod = { ...method, id: "test.session-only", consent: "session-grant" };
const sessionGrant = decide({
  manifest: declaredManifest, method: consentMethod,
  grant: { allowed: true, state: "session-grant", sandboxClaim: "ignored" }
});
assert.equal(sessionGrant.grantState, "session-grant");
assert.equal(sessionGrant.effective, true);
const selfGrant = decide({
  manifest: { ...declaredManifest, grant: true, grantState: "session-grant", userGesture: true, capability: true, policyVersion: 999 },
  method: consentMethod, grant: null
});
assert.equal(selfGrant.effective, false, "sandbox/source fields cannot establish a Host grant");
assert.equal(selfGrant.grantState, "denied");
assert.equal(selfGrant.policyVersion, 1, "application input cannot change the trusted policy version");

assert.equal(contracts.permissionDecision.authorities.sandboxClaimsAccepted, false);
assert.deepEqual(Object.keys(contracts.permissionDecision.grantStates), [
  "not-required", "session-grant", "persistent-user-grant", "resource-scoped-grant", "denied"
]);
assert.equal(contracts.permissionDecision.production.brokerEnabled, "feature-gated-battery-only");
assert.equal(contracts.brokerMethods.methods.length, 2);
assert.equal(contracts.brokerMethods.methods.every((item) => item.id.startsWith("device.battery.")), true);
console.log("developer studio permission policy smoke test passed");

function decide({ manifest: source, method: target = method, policy = true, grant = true, capability = true }) {
  return evaluatePermissionDecision({
    manifest: source, method: target, decisionContract: contracts.permissionDecision,
    platformPolicyAllowed: policy, hostGrant: grant, capabilitySupported: capability
  });
}

function manifest(permissions) {
  return { manifestVersion: 2, id: "com.webwindows.policy", permissions };
}

function pick(value) {
  return Object.fromEntries([
    "declared", "policy", "consentMode", "grantState", "capability", "methodPolicy",
    "effective", "denialReason", "publicErrorCode", "policyVersion"
  ].map((key) => [key, value[key]]));
}
