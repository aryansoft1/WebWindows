import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [contract, developerApi, catalogAdmin, catalogPublic, developerUi, catalogUi, registry, center, runtime, device, native] = await Promise.all([
  read("data/sdk/catalog-release-binding-v1.json").then(JSON.parse),
  read("admin_api/developerPlatform.asp"), read("admin_api/functionCatalog.asp"),
  read("api/function-catalog.asp"), read("SystemManager/assets/js/developer-platform-admin.js"),
  read("SystemManager/assets/js/function-catalog-admin.js"), read("assets/js/app-registry.js"),
  read("assets/js/function-center.js"), read("assets/js/package-runtime.js"),
  read("assets/js/device-api.js"), read("docs/NATIVE_BRIDGE_V1.md")
]);

assert.equal(contract.contract, "webwindows-catalog-release-binding-v1");
assert.deepEqual(contract.sourceTypes, ["system", "developer-release", "legacy-third-party"]);
assert.deepEqual(contract.releaseBindingStates, ["system", "verified", "legacy-unverified"]);
assert.equal(contract.classification["developer-release"].authority, "published-release-record");
assert.equal(contract.classification["legacy-third-party"].productionBrokerTrust, false);
assert.equal(contract.revisionBinding.normalizedTable, "webwindows_catalog_release_bindings");

assert.match(developerApi, /webwindows_catalog_release_bindings/);
assert.match(developerApi, /__WEBWINDOWS_SERVER_RELEASE_ID__/);
assert.match(developerApi, /SELECT CONCAT\('rel_'.*UUID/);
assert.match(developerApi, /publishedReleaseId/);
assert.match(developerApi, /sourceManifestSha256/);
assert.match(developerApi, /approvedPermissions/);
assert.match(developerApi, /CATALOG_RELEASE_MISMATCH/);
assert.match(developerApi, /INSERT INTO webwindows_catalog_release_bindings/);
assert.match(developerApi, /SELECT .*catalog_entry_id.*published_release_identity/s,
  "new revisions must copy historical exact release mappings");
assert.match(developerApi, /CASE WHEN published_release_id=.*releaseTargetStatus/s,
  "delist/revoke must create a status-projected revision mapping");
assert.match(developerApi, /conn\.RollbackTrans/);

for (const code of ["RELEASE_AUTHORITY_REQUIRED", "RELEASE_BOUND_FIELD_READ_ONLY"])
  assert.match(catalogAdmin, new RegExp(code));
assert.match(catalogAdmin, /binding_count/);
assert.match(catalogAdmin, /publishedReleaseId/);
assert.match(catalogPublic, /ReleaseBindingsValid/);
assert.match(catalogPublic, /published_release_identity/);
assert.match(catalogPublic, /referenceMatches\.Count <> bindingCount/,
  "unbound or duplicate release references must fail closed");
assert.match(catalogPublic, /X-WebWindows-Catalog-Release-Binding/);

assert.match(developerUi, /sourceType = "developer-release"/);
assert.match(developerUi, /releaseBinding = "verified"/);
assert.match(developerUi, /packageDownloadIdentity/);
assert.match(developerUi, /changeReleaseStatus/);
assert.match(catalogUi, /releaseProtected/);
assert.match(catalogUi, /Legacy · unverified/);
assert.match(registry, /legacy-third-party/);
assert.match(registry, /App Registry never promotes/);
assert.match(center, /dataset\.sourceType/);
assert.match(center, /dataset\.releaseBinding/);

const release = Object.freeze({
  id: "rel_123", appId: "com.example.app", publisherId: "42", version: "1.0.0",
  packageSha256: "a".repeat(64), sourceManifestSha256: "b".repeat(64),
  manifestVersion: 2, sdkVersion: "1", reviewDecisionId: "rvd_123",
  approvedPermissions: ["device.battery-status.read"], reviewPolicyVersion: 1
});
const projection = project(release);
assert.equal(projection.release.id, release.id);
assert.equal(projection.release.packageSha256, release.packageSha256);
assert.deepEqual(projection.release.approvedPermissions, release.approvedPermissions);
assert.throws(() => assertBinding({ ...projection, version: "2.0.0" }, release));
assert.throws(() => assertBinding({ ...projection, release: { ...projection.release, packageSha256: "c".repeat(64) } }, release));
assert.throws(() => assertBinding({ ...projection, release: { ...projection.release, reviewDecisionId: "rvd_other" } }, release));
assert.throws(() => assertBinding({ ...projection, release: { ...projection.release, approvedPermissions: ["device.battery-status.read", "extra"] } }, release));
assertBinding(projection, release);

assert.match(runtime, /publishedReleaseId|reviewDecisionId/);
assert.doesNotMatch(runtime, /ProductionBrokerContext|WebWindowsNative/);
assert.doesNotMatch(device, /CatalogReleaseBinding|publishedReleaseId|reviewDecisionId/);
assert.doesNotMatch(native, /CatalogReleaseBinding|publishedReleaseId|reviewDecisionId/);
console.log("catalog release binding and authority boundary smoke test passed");

function project(value) {
  return {
    id: value.appId, version: value.version, sourceType: "developer-release", releaseBinding: "verified",
    release: {
      id: value.id, publishedReleaseId: value.id, binding: "verified", publisherId: value.publisherId,
      packageSha256: value.packageSha256, sourceManifestSha256: value.sourceManifestSha256,
      manifestVersion: value.manifestVersion, sdkVersion: value.sdkVersion,
      reviewDecisionId: value.reviewDecisionId, approvedPermissions: [...value.approvedPermissions],
      reviewPolicyVersion: value.reviewPolicyVersion
    }
  };
}

function assertBinding(entry, value) {
  assert.equal(entry.id, value.appId);
  assert.equal(entry.version, value.version);
  assert.equal(entry.release.id, value.id);
  for (const field of ["publisherId", "packageSha256", "sourceManifestSha256", "manifestVersion", "sdkVersion", "reviewDecisionId", "reviewPolicyVersion"])
    assert.deepEqual(entry.release[field], value[field]);
  assert.deepEqual(entry.release.approvedPermissions, value.approvedPermissions);
}
