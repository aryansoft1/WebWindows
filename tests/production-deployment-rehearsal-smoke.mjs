import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath, encoding = null) => readFile(path.join(root, ...relativePath.split("/")), encoding);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const manifest = JSON.parse(await read("data/deploy/production-rehearsal-manifest-v1.json", "utf8"));
assert.equal(manifest.contract, "webwindows-production-rehearsal-manifest-v1");
assert.equal(manifest.version, 1);
assert.equal(manifest.featureGate.key, "productionCapabilityBrokerV1");
assert.equal(manifest.featureGate.requiredValue, false);
assert.equal(manifest.deployment.deployableWithoutTargetEvidence, false);
assert.ok(manifest.artifacts.length >= 35);

const seen = new Set();
for (const artifact of manifest.artifacts) {
  assert.match(artifact.path, /^(?!\/)(?!.*\\)(?!.*(?:^|\/)\.\.(?:\/|$))[\x20-\x7e]+$/);
  assert.equal(seen.has(artifact.path), false, `duplicate artifact: ${artifact.path}`);
  seen.add(artifact.path);
  const bytes = await read(artifact.path);
  assert.equal(artifact.bytes, bytes.byteLength, `${artifact.path}: byte count drift`);
  assert.equal(artifact.sha256, sha256(bytes), `${artifact.path}: SHA-256 drift`);
  assert.equal(artifact.target, `site-root:/${artifact.path}`);
}

for (const required of [
  "assets/js/package-runtime.js",
  "dist-production-broker/production-battery-broker.global.js",
  "data/config/runtime-features-v1.json",
  "server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe",
  "api/runtime-release.asp",
  "api/function-package.asp",
  "developer_api/v1.asp",
  "admin_api/developerPlatform.asp",
  "inc/admin-security.asp",
  "data/sdk/manifest-v2.schema.json",
  "data/sdk/production-broker-context-v1.json",
]) assert.ok(seen.has(required), `missing deployment authority artifact: ${required}`);

const featureConfig = JSON.parse(await read(manifest.featureGate.path, "utf8"));
assert.equal(featureConfig.productionCapabilityBrokerV1, false, "production Broker gate must remain false");
assert.equal(featureConfig.queryOverrideAllowed, false);
assert.equal(featureConfig.manifestOverrideAllowed, false);

const serialized = JSON.stringify(manifest);
assert.doesNotMatch(serialized, /password|api[_-]?key|cookie|connectionstring/i);

const result = JSON.parse(await read("data/deploy/production-rehearsal-result-v1.json", "utf8"));
assert.equal(result.contract, "webwindows-production-rehearsal-result-v1");
assert.equal(result.overall, "blocked");
assert.equal(result.deploymentPerformed, false);
assert.equal(result.productionStateChanged, false);
assert.equal(result.limitedRolloutEligible, false);
assert.equal(result.featureGateAfterRehearsal, false);
assert.equal(result.decision.phase2FPassed, false);
assert.equal(result.decision.nextCapabilityAllowed, false);
assert.equal(result.decision.productionBrokerGateMayEnable, false);
assert.equal(result.findingCounts.critical, 0);
assert.ok(result.findingCounts.high > 0);
assert.doesNotMatch(JSON.stringify(result), /password|api[_-]?key|cookie|connectionstring/i);

console.log(`Production rehearsal manifest smoke test passed (${manifest.artifacts.length} pinned artifacts, gate false).`);
