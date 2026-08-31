import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [feature, methods, permissions, developer, admin, catalogAdmin, catalogApi, releaseApi, packageApi, runtime, registry, publicApi, native, migration] = await Promise.all([
  read("data/config/runtime-features-v1.json").then(JSON.parse), read("data/sdk/capability-broker-methods-v1.json").then(JSON.parse),
  read("data/sdk/permissions-v1.json").then(JSON.parse), read("developer_api/v1.asp"), read("admin_api/developerPlatform.asp"),
  read("admin_api/functionCatalog.asp"), read("api/function-catalog.asp"), read("api/runtime-release.asp"),
  read("api/function-package.asp"), read("assets/js/package-runtime.js"), read("assets/js/app-registry.js"),
  read("assets/js/device-api.js"), read("docs/NATIVE_BRIDGE_V1.md"),
  read("database/migrations/001_webwindows_trust_schema.sql")
]);

assert.equal(feature.productionCapabilityBrokerV1, false);
assert.equal(feature.authority, "host-deployment-configuration");
assert.deepEqual(methods.methods.filter((item) => item.productionAvailability === "enabled").map((item) => item.id),
  ["device.battery.getState", "device.battery.refresh"]);
assert.deepEqual(permissions.sourceDeclaration.declarablePermissionIds, ["device.battery-status.read"]);

assert.match(developer, /DeveloperByKey\(uploadApiKey\)/);
assert.match(developer, /WHERE id=\? AND developer_id=\? LIMIT 1/);
assert.match(developer, /uploadStatus <> "submitted" And uploadStatus <> "rejected"/);
assert.match(developer, /GET_LOCK\('" & uploadLockName/);
assert.match(developer, /ReleaseUploadLock/);
assert.match(developer, /RunTrustedPackageValidator\(packageBytes, outerManifest, expectedAppId/);
assert.match(developer, /sourceManifestIntegrityVersion <> 1 Then validationPassed = False/);
assert.match(developer, /active_validation_id=/);
assert.match(developer, /PACKAGE_UPLOAD_LOCKED/);

assert.match(admin, /Session\("webwindows_admin"\) <> True/);
assert.match(admin, /LCase\(Trim\(CStr\(Session\("username"\)\)\)\) <> "admin"/);
assert.match(admin, /MAX\(r2\.id\).*r2\.submission_id=s\.id/s);
assert.match(admin, /LCase\(CStr\(publishRs\("decision"\)\)\) <> "approved"/);
assert.match(admin, /active_validation_id.*validation_record_id/s);
assert.match(migration, /UNIQUE KEY uk_published_release_version \(app_id,app_version\)/);
assert.match(admin, /conn\.BeginTrans[\s\S]*conn\.CommitTrans/);
assert.match(admin, /conn\.RollbackTrans/);
assert.doesNotMatch(admin, /UPDATE\s+webwindows_review_decisions|DELETE\s+FROM\s+webwindows_review_decisions/i);
assert.doesNotMatch(admin, /UPDATE\s+webwindows_published_releases|DELETE\s+FROM\s+webwindows_published_releases/i);

for (const code of ["RELEASE_AUTHORITY_REQUIRED", "RELEASE_BOUND_FIELD_READ_ONLY"]) assert.match(catalogAdmin, new RegExp(code));
assert.match(catalogApi, /referenceMatches\.Count <> bindingCount/);
assert.match(catalogApi, /ReleaseBindingsValid\(catalogText, activeRevisionId\)/);
for (const join of ["package_sha256", "source_manifest_sha256", "source_manifest_integrity_version", "review_decision_id", "approved_permissions_base64", "review_policy_version"])
  assert.match(releaseApi, new RegExp(join));
assert.match(packageApi, /p\.submission_id=pr\.submission_id AND p\.package_sha256=pr\.package_sha256/);
assert.match(packageApi, /X-WebWindows-Published-Release/);

assert.doesNotMatch(runtime, /params\.get\(["']productionCapabilityBrokerV1|localStorage.*productionCapabilityBrokerV1|sessionStorage.*productionCapabilityBrokerV1/);
assert.match(runtime, /releaseStatusProvider:async \(\{ signal \} = \{\}\) => \{[\s\S]*productionBrokerFeatureEnabled\(signal\)/);
assert.match(runtime, /params\.has\("release"\) \? await prepareVerified\(params/);
assert.match(runtime, /prepareLegacy[\s\S]*runtimeTrustState = TRUST_STATES\.LEGACY; verifiedRuntimePackageIdentity = null/);
assert.match(registry, /App Registry never promotes/);
assert.doesNotMatch(runtime, /WebWindowsNative|NativeAdapter|BatteryManager/);
assert.doesNotMatch(publicApi + native, /ProductionBrokerContext|ReviewDecision|approvedPermissions/);

console.log("end-to-end trust authority, API ownership, gate, and allowlist security freeze smoke test passed");
