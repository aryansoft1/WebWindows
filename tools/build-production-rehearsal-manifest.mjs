import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = path.join(root, "data", "deploy", "production-rehearsal-manifest-v1.json");

const artifacts = [
  ["deployment-contract", ".gitattributes", "operator-bundle"],
  ["host", "web.config"],
  ["admin-security", "SystemManager/login.html"],
  ["admin-security", "SystemManager/assets/js/admin-security.js"],
  ["admin-ui", "SystemManager/visitor-analytics.html"],
  ["admin-ui", "SystemManager/assets/js/visitor-analytics.js"],
  ["admin-security", "inc/admin-security.asp"],
  ["host-config", "inc/conn.asp"],
  ["host-config", "inc/trust-schema.asp"],
  ["host-config", "inc/validator-deployment-config.asp"],
  ["admin-api", "admin_api/adminAuth.asp"],
  ["admin-api", "admin_api/developerPlatform.asp"],
  ["admin-api", "admin_api/functionCatalog.asp"],
  ["admin-api", "admin_api/developerPackage.asp"],
  ["admin-api", "admin_api/visitorAnalytics.asp"],
  ["developer-api", "developer_api/v1.asp"],
  ["runtime-api", "api/runtime-release.asp"],
  ["runtime-api", "api/function-package.asp"],
  ["runtime-api", "api/function-catalog.asp"],
  ["runtime-api", "api/visitor-analytics.asp"],
  ["runtime", "assets/js/visitor-analytics.js"],
  ["runtime", "package-runtime.html"],
  ["runtime", "assets/css/package-runtime.css"],
  ["runtime", "assets/js/package-runtime.js"],
  ["runtime", "dist-production-broker/production-battery-broker.global.js"],
  ["configuration", "data/config/runtime-features-v1.json"],
  ["validator", "server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe", "trusted-validator", "WebWindows.DeveloperPackageValidator.exe"],
  ["validator", "server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe.config", "trusted-validator", "WebWindows.DeveloperPackageValidator.exe.config"],
  ["sdk", "data/sdk/capability-broker-errors-v1.json"],
  ["sdk", "data/sdk/capability-broker-methods-v1.json"],
  ["sdk", "data/sdk/capability-broker-policy-v1.json"],
  ["sdk", "data/sdk/capability-broker-v1.schema.json"],
  ["sdk", "data/sdk/catalog-release-binding-v1.json"],
  ["sdk", "data/sdk/manifest-v1.schema.json"],
  ["sdk", "data/sdk/manifest-v2.schema.json"],
  ["sdk", "data/sdk/package-runtime-policy-v1.json"],
  ["sdk", "data/sdk/permission-decision-v1.json"],
  ["sdk", "data/sdk/permissions-v1.json"],
  ["sdk", "data/sdk/persistent-grant-v1.json"],
  ["sdk", "data/sdk/production-broker-context-v1.json"],
  ["sdk", "data/sdk/published-app-identity-v1.json"],
  ["sdk", "data/sdk/published-release-v1.json"],
  ["sdk", "data/sdk/review-decision-v1.json"],
  ["sdk", "data/sdk/runtime-compatibility-v1.json"],
  ["sdk", "data/sdk/server-validation-report-v1.json"],
  ["sdk", "data/sdk/source-manifest-integrity-v1.json"],
  ["sdk", "data/sdk/studio-validator-rules-v1.json"],
  ["sdk", "data/sdk/verified-runtime-package-identity-v1.json"],
  ["sdk", "data/sdk/webwindows-public-api-v1.d.ts"],
  ["database-migration", "database/migrations/001_webwindows_trust_schema.sql", "operator-bundle"],
  ["database-migration", "database/migrations/002_webwindows_visitor_analytics.sql", "operator-bundle"],
  ["database-migration", "database/migrations/verify_webwindows_trust_schema.sql", "operator-bundle"],
  ["deployment-contract", "data/deploy/production-environment-config-v1.json", "operator-bundle"],
  ["deployment-tool", "tools/Invoke-WebWindowsTrustMigration.ps1", "operator-bundle"],
  ["deployment-tool", "tools/Backup-WebWindowsTrustDatabase.ps1", "operator-bundle"],
  ["deployment-tool", "tools/Restore-WebWindowsTrustDatabase.ps1", "operator-bundle"],
  ["deployment-tool", "tools/Test-WebWindowsArtifactDeployment.ps1", "operator-bundle"],
  ["deployment-tool", "tools/Test-WebWindowsValidatorDeployment.ps1", "operator-bundle"],
  ["deployment-tool", "tools/Test-WebWindowsStagingHttp.ps1", "operator-bundle"],
];

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const records = [];
for (const [role, relativePath, targetRoot = "site-root", targetPath = relativePath] of artifacts) {
  const absolutePath = path.join(root, ...relativePath.split("/"));
  const [bytes, metadata] = await Promise.all([readFile(absolutePath), stat(absolutePath)]);
  records.push({
    path: relativePath,
    target: `${targetRoot}:/${targetPath}`,
    role,
    bytes: metadata.size,
    sha256: sha256(bytes),
  });
}

const manifest = {
  contract: "webwindows-production-rehearsal-manifest-v1",
  version: 1,
  sourceBaselineCommit: "0a5ff3e64133ea01fb2738d7cc36af231b88d199",
  featureGate: {
    path: "data/config/runtime-features-v1.json",
    key: "productionCapabilityBrokerV1",
    requiredValue: false,
  },
  deployment: {
    targetKind: "production-like-staging",
    siteRootAuthority: "operator-supplied",
    deployableWithoutTargetEvidence: false,
  },
  artifacts: records,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Wrote ${path.relative(root, outputPath)} (${records.length} artifacts)`);
