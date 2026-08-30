export function evaluatePermissionDecision({
  manifest,
  method,
  decisionContract,
  platformPolicyAllowed,
  hostGrant,
  capabilitySupported
}) {
  if (!decisionContract || decisionContract.policyVersion !== 1) {
    throw new TypeError("Permission decision contract v1 is required.");
  }
  const permissionId = method?.requiredPermission || null;
  const methodId = method?.id || null;
  const declared = Boolean(permissionId && Array.isArray(manifest?.permissions)
    && manifest.permissions.includes(permissionId));
  const methodPolicy = method?.previewAvailability === "enabled" && method?.currentStatus === "enabled"
    ? "enabled" : "disabled";
  let policy = "not-evaluated";
  let grantState = "denied";
  let capability = "not-evaluated";
  let denialReason = null;

  if (!declared) {
    denialReason = "not-declared";
  } else {
    const policyFact = typeof platformPolicyAllowed === "function" ? platformPolicyAllowed() : platformPolicyAllowed;
    policy = policyFact === true ? "allowed" : "denied";
    if (policy === "denied") {
      denialReason = "policy-denied";
    } else {
      const grantFact = typeof hostGrant === "function" ? hostGrant() : hostGrant;
      grantState = resolveGrantState(method?.consent, grantFact);
      if (grantState === "denied") {
        denialReason = "grant-denied";
      } else {
        const capabilityFact = typeof capabilitySupported === "function" ? capabilitySupported() : capabilitySupported;
        capability = capabilityFact === true ? "supported" : "unsupported";
        if (capability === "unsupported") denialReason = "capability-unsupported";
        else if (methodPolicy !== "enabled") denialReason = "method-disabled";
      }
    }
  }

  const publicErrorCode = denialReason
    ? decisionContract.stableDenialReasons[denialReason] || "permission-denied"
    : null;
  return Object.freeze({
    contract: decisionContract.contract,
    permissionId,
    methodId,
    declared,
    policy,
    consentMode: method?.consent || "unspecified",
    grantState,
    capability,
    methodPolicy,
    effective: denialReason === null,
    denialReason,
    publicErrorCode,
    policyVersion: decisionContract.policyVersion
  });
}

function resolveGrantState(consentMode, hostGrant) {
  if (hostGrant === false || hostGrant?.allowed === false || hostGrant?.state === "denied") return "denied";
  if (consentMode === "no-consent") return "not-required";
  const state = hostGrant?.state;
  if (hostGrant?.allowed === true && [
    "session-grant", "persistent-user-grant", "resource-scoped-grant"
  ].includes(state)) return state;
  return "denied";
}

export function publicErrorForDecision(decision) {
  return decision?.effective ? null : decision?.publicErrorCode || "permission-denied";
}
