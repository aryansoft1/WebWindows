import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  canInheritGrant,
  createTrustedProductionContext,
  revocationSemantics
} from "./helpers/production-trust-contract-harness.mjs";

const json = async (path) => JSON.parse(await fs.readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const [identityContract, reportContract, reviewContract, grantContract, brokerPolicy] = await Promise.all([
  json("data/sdk/published-app-identity-v1.json"),
  json("data/sdk/server-validation-report-v1.json"),
  json("data/sdk/review-decision-v1.json"),
  json("data/sdk/persistent-grant-v1.json"),
  json("data/sdk/capability-broker-policy-v1.json")
]);

const A = "a".repeat(64);
const B = "b".repeat(64);
const identity = {
  appId: "com.example.secure", publisherId: "publisher-42", version: "1.0.0", manifestVersion: 2,
  sdkVersion: "1", packageSha256: A, sourceManifestSha256: B, publishedReleaseId: "release-100",
  catalogRevisionId: "catalog-10", reviewDecisionId: "review-100", reviewPolicyVersion: 1
};
const review = {
  reviewDecisionId: "review-100", publishedReleaseId: "release-100", appId: identity.appId,
  publisherId: identity.publisherId, version: identity.version, packageSha256: A,
  sourceManifestSha256: B, requestedPermissions: ["permission.a", "permission.b", "permission.c"],
  approvedPermissions: ["permission.a", "permission.b"], deniedPermissions: ["permission.c"],
  permissionRisk: { "permission.a": "low", "permission.b": "medium", "permission.c": "high" },
  reviewPolicyVersion: 1, decision: "approved",
  decidedBy: { type: "authorized-reviewer", id: "reviewer-7" }, decidedAt: "2026-08-30T00:00:00.000Z"
};
const verifiedManifest = {
  appId: identity.appId, version: identity.version, manifestVersion: 2, sourceManifestSha256: B,
  requestedPermissions: review.requestedPermissions
};
const grants = [
  grant("permission.a"),
  grant("permission.c")
];

const valid = context({ identity, review, verifiedPackageSha256: A, verifiedManifest, userGrants: grants });
assert.equal(valid.trusted, true);
assert.deepEqual(valid.context.effectivePermissions, ["permission.a"],
  "a user grant cannot expand beyond the requested AND approved ceiling");
assert.notDeepEqual(review.requestedPermissions, review.approvedPermissions, "requested and approved permissions are distinct facts");

const appIdOnly = context({ identity: { appId: identity.appId }, review, verifiedPackageSha256: A, verifiedManifest });
assert.equal(appIdOnly.trusted, false);
assert.equal(appIdOnly.failures.includes("identity-missing:publisherId"), true, "appId alone is insufficient");
assert.equal(appIdOnly.failures.includes("identity-missing:packageSha256"), true, "package hash is required");

assert.equal(context({ identity, review, verifiedPackageSha256: "c".repeat(64), verifiedManifest }).failures.includes("package-hash-mismatch"), true);
assert.equal(context({ identity, review, verifiedPackageSha256: A, verifiedManifest: { ...verifiedManifest, version: "2.0.0" } }).failures.includes("manifest-mismatch"), true);
assert.equal(context({ identity, review: { ...review, packageSha256: "c".repeat(64) }, verifiedPackageSha256: A, verifiedManifest }).failures.includes("review-binding-mismatch:packageSha256"), true);
assert.equal(context({
  identity, review, verifiedPackageSha256: A,
  verifiedManifest: { ...verifiedManifest, requestedPermissions: ["permission.a"] }
}).failures.includes("requested-permissions-mismatch"), true, "review requests must match the verified ZIP-root Manifest");

const reviewDeny = context({
  identity, review: { ...review, approvedPermissions: ["permission.a"], deniedPermissions: ["permission.b", "permission.c"] },
  verifiedPackageSha256: A, verifiedManifest, userGrants: [grant("permission.b")]
});
assert.deepEqual(reviewDeny.context.effectivePermissions, [], "user grant cannot override review deny");

const baseGrant = grant("permission.a");
const compatibleRelease = {
  appId: identity.appId, publisherId: identity.publisherId,
  requestedPermissions: ["permission.a"], approvedPermissions: ["permission.a"], addedPermissions: [],
  riskIncreased: false, resourceScopeCompatible: true, reviewPolicyCompatible: true
};
assert.equal(canInheritGrant(baseGrant, compatibleRelease), true);
assert.equal(canInheritGrant(baseGrant, { ...compatibleRelease, addedPermissions: ["permission.a"] }), false,
  "an added permission does not inherit an old grant");
assert.equal(canInheritGrant(baseGrant, { ...compatibleRelease, publisherId: "publisher-new" }), false,
  "publisher transfer forces re-evaluation");

const revoked = context({ identity, review: { ...review, decision: "revoked" }, verifiedPackageSha256: A, verifiedManifest });
assert.equal(revoked.trusted, false);
assert.equal(revoked.failures.includes("release-revoked"), true);
const delistedSemantics = revocationSemantics(reviewContract, "delisted");
const revokedSemantics = revocationSemantics(reviewContract, "release-revoked");
assert.equal(delistedSemantics.newSessionForAlreadyVerifiedInstall, "allow");
assert.equal(revokedSemantics.newSession, "deny");
assert.notDeepEqual(delistedSemantics, revokedSemantics, "delisted and revoked are not equivalent");

const sandboxAssertion = context({
  identity: null, review: null, verifiedPackageSha256: null, verifiedManifest: null,
  sandbox: { ...identity, review, apiKey: "wwdev_not-an-identity", userGesture: true }
});
assert.equal(sandboxAssertion.trusted, false, "sandbox cannot self-assert publisher/review identity");
assert.equal(identityContract.required.includes("apiKey"), false);
assert.equal(identityContract.securityInvariants.includes("api-key-is-submission-authentication-not-runtime-identity"), true);
assert.equal(identityContract.previewProductionIdentity.sharedBrokerProtocol, brokerPolicy.protocol);
assert.equal(identityContract.previewProductionIdentity.productionUsesProjectUuid, false);
assert.equal(identityContract.productionBrokerContext.sandboxInputAccepted, false);
assert.equal(identityContract.sourceManifestAuthority.path, "manifest.json");
assert.equal(identityContract.sourceManifestAuthority.outerManifestPolicy, "absent-or-canonical-semantic-equality");
assert.equal(identityContract.securityInvariants.includes("catalog-cannot-override-verified-package-identity"), true);

assert.equal(reportContract.required.includes("packageSha256"), true);
assert.equal(reportContract.required.includes("sourceManifestSha256"), true);
assert.equal(reportContract.publicationGate.reportIsReviewDecision, false);
for (const secret of ["apiKey", "credential", "privateServerPath", "packageBlob"]) {
  assert.equal(reportContract.forbiddenFields.includes(secret), true);
}
assert.equal(reviewContract.permissionRules.approvedMustBeSubsetOfRequested, true);
assert.equal(reviewContract.binding.appIdForeverApproval, false);
assert.equal(grantContract.upgradeInheritance.publisherChange, "invalidate-all-existing-grants-and-require-new-grant");
assert.equal(grantContract.upgradeInheritance.removedPermission, "invalidate-and-retain-tombstone");
assert.equal(grantContract.persistence.implemented, false);
console.log("production trust identity and review contract smoke test passed");

function context(overrides) {
  return createTrustedProductionContext({
    identityContract, reviewContract, runtimeSessionId: "runtime-session-1", runtimeCapabilities: {},
    userGrants: [], sandbox: null, ...overrides
  });
}

function grant(permissionId) {
  return {
    grantId: `grant-${permissionId}`, userId: "user-1", appId: identity.appId,
    publisherId: identity.publisherId, permissionId, originReleaseId: identity.publishedReleaseId,
    originPackageSha256: A, originReviewDecisionId: identity.reviewDecisionId,
    permissionRisk: "low", resourceScope: null, reviewPolicyVersion: 1, grantVersion: 1,
    grantedAt: "2026-08-30T00:00:00.000Z", expiresAt: null, state: "active"
  };
}
