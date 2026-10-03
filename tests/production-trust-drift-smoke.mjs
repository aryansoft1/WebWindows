import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [developerApi, adminReview, adminCatalog, packageDownload, packageRuntime, trustDoc] = await Promise.all([
  read("developer_api/v1.asp"),
  read("admin_api/developerPlatform.asp"),
  read("admin_api/functionCatalog.asp"),
  read("api/function-package.asp"),
  read("assets/js/package-runtime.js"),
  read("docs/WEBWINDOWS_PRODUCTION_TRUST_MODEL_V1.md")
]);

assert.match(developerApi, /Request\.Form\("manifestJson"\)/);
assert.match(developerApi, /Request\.Form\("appId"\)/);
assert.match(developerApi, /Request\.Form\("version"\)/);
assert.match(developerApi, /LOWER\(SHA2\(package_blob,256\)\)/i, "server currently computes uploaded package SHA-256");
assert.match(developerApi, /webwindows_function_ownership/);
assert.match(developerApi, /RunTrustedPackageValidator|source_manifest_sha256/,
  "Phase 2D.1 must integrate trusted validation and Source Manifest binding");
assert.doesNotMatch(developerApi, /approvedPermissions/,
  "Developer submission authentication must not become review authority");

assert.match(adminReview, /targetStatus = "approved"/);
assert.match(adminReview, /releaseTargetStatus = "revoked"/);
assert.match(adminReview, /package_sha256.*integrity_sha256/is);
assert.match(adminReview, /webwindows_review_decisions/);
assert.match(adminReview, /webwindows_published_releases/);
assert.match(adminReview, /approved_permissions_base64|review_policy_version|review_decision_id/i,
  "Phase 2D.2 admin review must create package-bound immutable trust records");

assert.match(adminCatalog, /webwindows_function_catalog_versions/);
assert.match(adminCatalog, /catalogJson/);
assert.match(adminCatalog, /webwindows_catalog_release_bindings/);
assert.match(adminCatalog, /RELEASE_AUTHORITY_REQUIRED|RELEASE_BOUND_FIELD_READ_ONLY/);

assert.match(packageDownload, /X-WebWindows-Package-SHA256/);
assert.match(packageDownload, /webwindows_published_releases/);
assert.match(packageRuntime, /downloadPackage\(packageUrl\)/);
assert.match(packageRuntime, /crypto\.subtle\.digest/,
  "Phase 2D.4 Runtime cryptographically binds downloaded bytes to release identity");

for (const phrase of [
  "ZIP-root `manifest.json` is the only Source Manifest authority",
  "Current production drift",
  "Package Runtime, Production Broker/facade, Native Bridge, and the public Device API remain unchanged through Phase 2D.3"
]) assert.match(trustDoc, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

console.log("production trust current implementation drift smoke test passed");
