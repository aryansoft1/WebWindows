import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [admin, ui, review, release, validation, runtime, publicApi, nativeContract, doc] = await Promise.all([
  read("admin_api/developerPlatform.asp"),
  read("SystemManager/assets/js/developer-platform-admin.js"),
  read("data/sdk/review-decision-v1.json").then(JSON.parse),
  read("data/sdk/published-release-v1.json").then(JSON.parse),
  read("data/sdk/server-validation-report-v1.json").then(JSON.parse),
  read("assets/js/package-runtime.js"),
  read("assets/js/device-api.js"),
  read("docs/NATIVE_BRIDGE_V1.md"),
  read("docs/WEBWINDOWS_REVIEW_AND_RELEASE_V1.md")
]);

assert.equal(review.contract, "webwindows-review-decision-v1");
assert.deepEqual(review.decisions, ["approved", "rejected"]);
for (const field of [
  "reviewDecisionId", "submissionId", "publisherId", "packageSha256",
  "sourceManifestSha256", "validationReportId", "requestedPermissions",
  "approvedPermissions", "deniedPermissions", "reviewPolicyVersion",
  "reviewerIdentity", "riskSummary"
]) assert.ok(review.required.includes(field), `ReviewDecision requires ${field}`);
assert.equal(review.permissionRules.requestedAuthority, "verified-zip-root-source-manifest");
assert.equal(review.permissionRules.approvedMustBeSubsetOfRequested, true);
assert.equal(review.immutability.record, "append-only");

assert.equal(release.contract, "webwindows-published-release-v1");
assert.deepEqual(release.releaseStatuses, ["active", "delisted", "revoked"]);
assert.equal(release.immutability.sameVersionDifferentPackage, "reject");
assert.equal(release.immutability.revokedMayBecomeActive, false);
assert.equal(release.authority.catalog, "release-bound-projection-v1");
assert.ok(validation.required.includes("requestedPermissions"));

for (const table of [
  "webwindows_review_decisions", "webwindows_published_releases",
  "webwindows_published_release_events"
]) assert.match(admin, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));

assert.match(admin, /active_validation_id/);
assert.match(admin, /validation_passed/);
assert.match(admin, /VALIDATION_BINDING_MISMATCH/);
assert.match(admin, /VALIDATION_REPORT_BINDING_INVALID/);
assert.match(admin, /JsonArrayForKey\(reportText, "requestedPermissions"\)/,
  "requested permissions must come from the immutable validation report");
assert.doesNotMatch(admin, /JsonArrayForKey\([^\n]*manifest/i);
assert.match(admin, /CanonicalPermissionSelection\(requestedJson, selectedJson/);
assert.match(admin, /PERMISSION_SELECTION_INVALID/);
assert.match(admin, /supersedes_id/);
assert.match(admin, /decisionText = "approved" Else decisionText = "rejected"/);
assert.match(admin, /reviewerIdentity = "admin:"/);
assert.doesNotMatch(admin, /api_key_hash[^\n]*(webwindows_review_decisions|reviewSql)/i);

const reviewMutation = /UPDATE\s+webwindows_review_decisions|DELETE\s+FROM\s+webwindows_review_decisions/i;
const releaseMutation = /UPDATE\s+webwindows_published_releases|DELETE\s+FROM\s+webwindows_published_releases/i;
assert.doesNotMatch(admin, reviewMutation, "ReviewDecision rows are append-only");
assert.doesNotMatch(admin, releaseMutation, "PublishedRelease rows are append-only");
assert.match(admin, /INSERT INTO webwindows_published_release_events/);
assert.match(admin, /REVOKED_RELEASE_IMMUTABLE/);

assert.match(admin, /RELEASE_PACKAGE_REPLACEMENT_FORBIDDEN/);
assert.match(admin, /CATALOG_RELEASE_MISMATCH/);
assert.match(admin, /UNIQUE KEY uk_published_release_version\(app_id,app_version\)/);
assert.match(admin, /APPROVED_REVIEW_REQUIRED/);
assert.match(admin, /r\.approved_permissions_base64/);
assert.match(admin, /releaseSql[\s\S]*conn\.BeginTrans[\s\S]*conn\.Execute releaseSql[\s\S]*webwindows_function_catalog_versions[\s\S]*status='published'[\s\S]*conn\.CommitTrans/,
  "release, catalog, and projection must commit atomically");
assert.match(admin, /conn\.RollbackTrans/);

assert.match(ui, /validationReport\?\.requestedPermissions/);
assert.match(ui, /approvedPermissionsJson/);
assert.match(ui, /Review approved ≠ Runtime enabled/);
assert.match(ui, /"publish-release"/);
assert.doesNotMatch(ui, /request\(CATALOG_API, "", \{ method: "POST"/,
  "Developer Platform publication must not publish catalog before creating a release");
assert.match(ui, /"release-status"/);

for (const phrase of [
  "submission.status` remains", "append-only", "same-version package replacement",
  "one InnoDB transaction", "do not receive synthetic ReviewDecision"
]) assert.match(doc, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

assert.match(runtime, /approvedPermissions/);
assert.doesNotMatch(runtime, /ProductionBrokerContext|window\.WebWindows|WebWindowsNative/);
assert.doesNotMatch(publicApi, /ReviewDecision|PublishedRelease|approvedPermissions/);
assert.doesNotMatch(nativeContract, /ReviewDecision|PublishedRelease|approvedPermissions/);

function permissionDecision(requested, approved) {
  assert.equal(new Set(requested).size, requested.length);
  assert.equal(new Set(approved).size, approved.length);
  assert.ok(approved.every((permission) => requested.includes(permission)));
  return { approved, denied: requested.filter((permission) => !approved.includes(permission)) };
}
assert.deepEqual(permissionDecision([], []), { approved: [], denied: [] });
assert.deepEqual(permissionDecision(["device.battery-status.read"], ["device.battery-status.read"]), {
  approved: ["device.battery-status.read"], denied: []
});
assert.deepEqual(permissionDecision(["device.battery-status.read"], []), {
  approved: [], denied: ["device.battery-status.read"]
});
assert.throws(() => permissionDecision(["device.battery-status.read"], ["device.unrequested.read"]));

console.log("developer immutable review and release trust boundary smoke test passed");
