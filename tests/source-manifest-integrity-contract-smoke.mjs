import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [contract, validator, runtime, validationContract, review, release, binding, lookup, admin, developerApi, identityDoc] = await Promise.all([
  read("data/sdk/source-manifest-integrity-v1.json").then(JSON.parse),
  read("server-tools/developer-package-validator/Program.cs"), read("assets/js/package-runtime.js"),
  read("data/sdk/server-validation-report-v1.json").then(JSON.parse), read("data/sdk/review-decision-v1.json").then(JSON.parse),
  read("data/sdk/published-release-v1.json").then(JSON.parse), read("data/sdk/catalog-release-binding-v1.json").then(JSON.parse),
  read("api/runtime-release.asp"), read("admin_api/developerPlatform.asp"), read("developer_api/v1.asp"),
  read("data/sdk/published-app-identity-v1.json").then(JSON.parse)
]);

assert.equal(contract.contract, "webwindows-source-manifest-integrity-v1");
assert.equal(contract.sourceManifestSha256.rawBytesDigest, false);
assert.match(contract.sourceManifestSha256.definition, /SHA-256\(RFC-8785-JCS/);
assert.equal(identityDoc.sourceManifestAuthority.rawBytesDigest, false);
assert.match(identityDoc.sourceManifestAuthority.digestDefinition, /zip-root:\/manifest\.json/);
for (const item of [validationContract, review, release, binding]) assert.ok(JSON.stringify(item).includes("sourceManifestSha256"));

assert.match(validator, /var canonical = Canonical\.Write\(manifest\)/);
assert.match(validator, /manifestHash = Sha\(StrictUtf8\.GetBytes\(canonical\)\)/);
assert.match(validator, /static string EcmaNumber/);
assert.match(runtime, /sha256Hex\(new TextEncoder\(\)\.encode\(canonicalizeJson\(manifest\)\)\)/);
assert.match(developerApi, /source_manifest_sha256/);
assert.match(admin, /source_manifest_sha256/);
assert.match(lookup, /pr\.source_manifest_sha256/);
assert.doesNotMatch(lookup, /manifest_blob|manifest_bytes|raw_manifest/i);

console.log("source Manifest canonical integrity contract smoke test passed");
