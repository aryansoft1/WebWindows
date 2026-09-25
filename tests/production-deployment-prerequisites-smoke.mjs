import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, ...relativePath.split("/")), "utf8");
const sha256 = (text) => createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");

const [webConfig, connection, validatorConfig, developerApi, adminPlatform, adminCatalog,
  publicCatalog, runtimeRelease, functionPackage, schemaGate, migration, migrationTool,
  artifactTool, aclTool, stagingDoc, readiness, featureConfig, adminSecurity, validatorSource] = await Promise.all([
  read("web.config"), read("inc/conn.asp"), read("inc/validator-deployment-config.asp"),
  read("developer_api/v1.asp"), read("admin_api/developerPlatform.asp"), read("admin_api/functionCatalog.asp"),
  read("api/function-catalog.asp"), read("api/runtime-release.asp"), read("api/function-package.asp"),
  read("inc/trust-schema.asp"), read("database/migrations/001_webwindows_trust_schema.sql"),
  read("tools/Invoke-WebWindowsTrustMigration.ps1"), read("tools/Test-WebWindowsArtifactDeployment.ps1"),
  read("tools/Test-WebWindowsValidatorDeployment.ps1"), read("docs/WEBWINDOWS_PRODUCTION_STAGING_REQUIREMENTS_V1.md"),
  read("data/deploy/production-prerequisite-readiness-v1.json"), read("data/config/runtime-features-v1.json"),
  read("inc/admin-security.asp"), read("server-tools/developer-package-validator/Program.cs"),
]);

assert.match(webConfig, /Reject insecure WebWindows trust APIs/);
assert.match(webConfig, /statusCode="403"/);
assert.match(webConfig, /Redirect insecure SystemManager pages/);
assert.match(webConfig, /https:\/\/www\.y0\.hk\/\{R:0\}/);
assert.match(webConfig, /Strict-Transport-Security/);
assert.doesNotMatch(webConfig, /X-Forwarded|Forwarded/);

assert.match(connection, /WEBWINDOWS_DB_CONNECTION_STRING/);
assert.doesNotMatch(connection, /(?:Pwd|Password|Uid|User ID)\s*=/i);
assert.doesNotMatch(connection, /MySQL ODBC [0-9.]+ Driver/);
assert.match(connection, /DATABASE_CONFIG_REQUIRED/);

assert.match(validatorConfig, /WEBWINDOWS_VALIDATOR_EXECUTABLE_PATH/);
assert.match(validatorConfig, /WEBWINDOWS_VALIDATOR_QUARANTINE_PATH/);
assert.match(validatorConfig, /ValidatorDeploymentDriveAbsolute/);
assert.match(validatorConfig, /ValidatorDeploymentWithin\(canonicalExecutable, canonicalWebRoot\)/);
assert.match(validatorConfig, /ValidatorDeploymentWithin\(canonicalQuarantine, canonicalWebRoot\)/);
assert.doesNotMatch(developerApi, /App_Data\/developer-validation|server-tools\/developer-package-validator\/runtime/);
assert.match(developerApi, /RANDOM_BYTES\(16\)/);
assert.match(validatorSource, /Wait\(TimeSpan\.FromSeconds\(30\)\)/);

for (const [name, source] of Object.entries({ developerApi, adminPlatform, adminCatalog, publicCatalog })) {
  assert.doesNotMatch(source, /CREATE TABLE IF NOT EXISTS|ALTER TABLE/i, `${name} must not mutate trust schema`);
  assert.match(source, /WebWindowsTrustSchemaReady/);
}
for (const source of [runtimeRelease, functionPackage]) assert.match(source, /WebWindowsTrustSchemaReady/);

// A pending trust-schema migration must not surface as a 503 to every desktop boot.
// function-catalog.asp serves the static catalog instead, because that is the same
// document the client already falls back to. It must still fail closed for anything the
// trust schema protects: a catalog carrying developer releases cannot be binding-checked
// without the schema, so it must keep returning trust-schema-required.
assert.match(publicCatalog, /staticCatalogTrusted = \(fileCatalog <> "" And _/,
  "the schema gate must be conditioned on whether the static catalog is safe to serve");
assert.match(publicCatalog, /"""sourceType"":""developer-release"""/,
  "the gate must detect developer releases in the static catalog");
assert.match(publicCatalog, /If Not tableReady And Not staticCatalogTrusted Then[\s\S]*?trust-schema-required/,
  "the 503 must remain for a catalog that cannot be verified without the trust schema");
assert.ok(
  publicCatalog.indexOf("fileCatalog = ReadCatalogFile()") < publicCatalog.indexOf("tableReady = WebWindowsTrustSchemaReady()"),
  "the static catalog must be read before the schema gate decides whether to fail");
assert.match(publicCatalog, /json-fallback/,
  "serving the static catalog must be reported as the existing json-fallback source");

// The degradation above is only safe while the deployed catalog makes no trust claim.
const deployedCatalog = await read("data/apps/system-apps.json");
assert.doesNotMatch(deployedCatalog, /"sourceType"\s*:\s*"developer-release"/,
  "system-apps.json must not carry developer releases, or the schema-less fallback would serve unverified packages");

const migrationHash = sha256(migration);
assert.match(schemaGate, new RegExp(migrationHash));
assert.match(migration, /webwindows_schema_migrations/);
assert.match(migration, /checksum_sha256 CHAR\(64\)/);
assert.match(migration, /success TINYINT\(1\)/);
assert.match(migrationTool, /ValidateSet\('Check', 'Apply', 'Verify'\)/);
assert.match(migrationTool, /Migration checksum\/success drift/);
assert.match(migrationTool, /Test-TrustSchema/);

assert.match(artifactTool, /expectedSha256/);
assert.match(artifactTool, /trusted-validator:\/\*/);
assert.match(aclTool, /validatorNoWriteOrModify/);
assert.match(aclTool, /quarantineAnonymousNoAllow/);
assert.match(stagingDoc, /64-bit application pool/);
assert.match(stagingDoc, /MySQL Connector\/ODBC 8\.0 Unicode/);
assert.match(stagingDoc, /pre-auth ASP session identifier/);
assert.match(stagingDoc, /X-Forwarded-Proto/);

assert.match(adminSecurity, /WEBWINDOWS_ADMIN_STAGING_ORIGIN/);
assert.doesNotMatch(adminSecurity, /HTTP_X_FORWARDED|HTTP_FORWARDED/);

const readinessResult = JSON.parse(readiness);
assert.equal(readinessResult.repositoryReady, true);
assert.equal(readinessResult.phase2FPassed, false);
assert.equal(readinessResult.stagingReady, false);
assert.equal(readinessResult.productionVerified, false);
assert.equal(readinessResult.limitedRolloutAllowed, false);
assert.equal(readinessResult.findings.length, 9);
assert.equal(readinessResult.findings.filter((item) => item.severity === "high").length, 7);
assert.equal(readinessResult.findings.filter((item) => item.severity === "medium").length, 2);

assert.equal(JSON.parse(featureConfig).productionCapabilityBrokerV1, false);
assert.doesNotMatch(connection + validatorConfig + schemaGate, /WebWindowsNative|window\.WebWindows/);

console.log("Production deployment prerequisite hardening smoke test passed (Phase 2F remains blocked, gate false).");
