const SHA256 = /^[a-f0-9]{64}$/;

export function createTrustedProductionContext({
  identityContract,
  reviewContract,
  identity,
  review,
  verifiedPackageSha256,
  verifiedManifest,
  runtimeSessionId,
  runtimeCapabilities = {},
  userGrants = [],
  sandbox = null
}) {
  void sandbox;
  const failures = [];
  for (const field of identityContract.required) {
    if (identity?.[field] === undefined || identity?.[field] === ""
        || (identity?.[field] === null && identityContract.fieldTypes[field] !== "string-or-null")) failures.push(`identity-missing:${field}`);
  }
  for (const field of ["packageSha256", "sourceManifestSha256"]) {
    if (!SHA256.test(identity?.[field] || "")) failures.push(`identity-invalid:${field}`);
  }
  if (!runtimeSessionId) failures.push("runtime-session-missing");
  if (verifiedPackageSha256 !== identity?.packageSha256) failures.push("package-hash-mismatch");
  if (verifiedManifest?.appId !== identity?.appId
      || verifiedManifest?.version !== identity?.version
      || verifiedManifest?.manifestVersion !== identity?.manifestVersion
      || verifiedManifest?.sourceManifestSha256 !== identity?.sourceManifestSha256
      || verifiedManifest?.sourceManifestIntegrityVersion !== identity?.sourceManifestIntegrityVersion) failures.push("manifest-mismatch");
  if (review?.decision !== "approved") failures.push(review?.decision === "revoked" ? "release-revoked" : "review-not-approved");
  for (const field of reviewContract.required) {
    if (review?.[field] === undefined || review?.[field] === null || review?.[field] === "") failures.push(`review-missing:${field}`);
  }
  for (const [reviewField, identityField] of [
    ["appId", "appId"], ["publisherId", "publisherId"],
    ["version", "version"], ["packageSha256", "packageSha256"],
    ["sourceManifestSha256", "sourceManifestSha256"], ["sourceManifestIntegrityVersion", "sourceManifestIntegrityVersion"], ["reviewDecisionId", "reviewDecisionId"],
    ["reviewPolicyVersion", "reviewPolicyVersion"]
  ]) {
    if (review?.[reviewField] !== identity?.[identityField]) failures.push(`review-binding-mismatch:${reviewField}`);
  }
  const requested = new Set(review?.requestedPermissions || []);
  const approved = new Set(review?.approvedPermissions || []);
  const manifestRequested = new Set(verifiedManifest?.requestedPermissions || []);
  if (manifestRequested.size !== requested.size || [...manifestRequested].some((permission) => !requested.has(permission))) {
    failures.push("requested-permissions-mismatch");
  }
  if ([...approved].some((permission) => !requested.has(permission))) failures.push("approved-not-requested");
  const denied = new Set(review?.deniedPermissions || []);
  const expectedDenied = [...requested].filter((permission) => !approved.has(permission));
  if (denied.size !== expectedDenied.length || expectedDenied.some((permission) => !denied.has(permission))) {
    failures.push("denied-permissions-mismatch");
  }
  if (failures.length) return Object.freeze({ trusted: false, failures: Object.freeze([...new Set(failures)]), context: null });

  const activeGrantPermissions = new Set(userGrants
    .filter((grant) => grant.state === "active" && grant.appId === identity.appId && grant.publisherId === identity.publisherId)
    .map((grant) => grant.permissionId));
  const effectivePermissions = [...requested].filter((permission) => approved.has(permission) && activeGrantPermissions.has(permission));
  return Object.freeze({
    trusted: true,
    failures: Object.freeze([]),
    context: Object.freeze({
      publishedAppIdentity: Object.freeze(structuredClone(identity)),
      verifiedPackageSha256,
      requestedPermissions: Object.freeze([...requested]),
      approvedPermissions: Object.freeze([...approved]),
      applicableUserGrants: Object.freeze(structuredClone(userGrants)),
      effectivePermissions: Object.freeze(effectivePermissions),
      policyVersion: identity.reviewPolicyVersion,
      runtimeCapabilities: Object.freeze(structuredClone(runtimeCapabilities)),
      runtimeSessionId
    })
  });
}

export function canInheritGrant(grant, nextRelease) {
  if (grant.state !== "active") return false;
  if (grant.appId !== nextRelease.appId || grant.publisherId !== nextRelease.publisherId) return false;
  if (!nextRelease.requestedPermissions.includes(grant.permissionId)
      || !nextRelease.approvedPermissions.includes(grant.permissionId)) return false;
  if (nextRelease.addedPermissions?.includes(grant.permissionId)) return false;
  if (nextRelease.riskIncreased === true || nextRelease.resourceScopeCompatible !== true
      || nextRelease.reviewPolicyCompatible !== true) return false;
  return true;
}

export function revocationSemantics(reviewContract, event) {
  const semantics = reviewContract.revocationEvents[event];
  if (!semantics) throw new TypeError(`Unknown revocation event: ${event}`);
  return semantics;
}
