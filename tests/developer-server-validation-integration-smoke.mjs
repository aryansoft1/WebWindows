import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [developerApi, adminApi, adminUi, rules, runtime, publicApi, nativeAdapter] = await Promise.all([
  read("developer_api/v1.asp"), read("admin_api/developerPlatform.asp"),
  read("SystemManager/assets/js/developer-platform-admin.js"), read("data/sdk/studio-validator-rules-v1.json").then(JSON.parse),
  read("assets/js/package-runtime.js"), read("assets/js/device-api.js"), read("docs/NATIVE_BRIDGE_V1.md")
]);

assert.match(developerApi, /webwindows_submission_validations/);
assert.match(developerApi, /validation_status VARCHAR\(30\)/);
assert.match(developerApi, /active_validation_id BIGINT/);
assert.match(developerApi, /RunTrustedPackageValidator\(packageBytes, outerManifest, expectedAppId/);
assert.match(developerApi, /SELECT developer_id FROM webwindows_function_ownership WHERE app_id=\?/);
assert.match(developerApi, /APP_ID_OWNED/);
assert.match(developerApi, /App_Data\/developer-validation/);
assert.match(developerApi, /developer-package-validator\/runtime\/WebWindows\.DeveloperPackageValidator\.exe/);
assert.match(developerApi, /status='published' AND validation_status='not-validated'/);
assert.match(developerApi, /validation_status='validating'/);
assert.match(developerApi, /validation-failed/);
assert.match(developerApi, /validationReport/);
const validatorFunction = developerApi.slice(developerApi.indexOf("Function RunTrustedPackageValidator"), developerApi.indexOf("End Function", developerApi.indexOf("Function RunTrustedPackageValidator")));
assert.match(validatorFunction, /CStr\(publisherId\)/);
assert.doesNotMatch(validatorFunction, /apiKey|credential|token/i, "validator invocation must receive publisher identity, never API credentials");

assert.match(adminApi, /SERVER_VALIDATION_REQUIRED/);
assert.match(adminApi, /v\.passed AS validation_passed/);
assert.match(adminApi, /validated_package_sha256/);
assert.match(adminApi, /validationReport/);
assert.match(adminApi, /serverValidated/);
assert.match(adminUi, /Server validation:/);
assert.match(adminUi, /验证报告/);
assert.match(adminUi, /!submission\.serverValidated/);

const trustRules = rules.rules.filter((rule) => rule.ruleId.startsWith("WWT"));
assert.deepEqual(trustRules.map((rule) => rule.ruleId), Array.from({ length: 12 }, (_, index) => `WWT${String(index + 1).padStart(3, "0")}`));
assert.equal(new Set(rules.rules.map((rule) => rule.ruleId)).size, rules.rules.length);

assert.doesNotMatch(runtime, /ServerValidationReport|ProductionBrokerContext|publishedAppIdentity/);
assert.doesNotMatch(publicApi, /ProductionBrokerContext|approvedPermissions/);
assert.doesNotMatch(nativeAdapter, /PublishedAppIdentity|ServerValidationReport/);
console.log("developer server validation integration and production boundary smoke test passed");
