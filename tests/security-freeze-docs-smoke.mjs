import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => fs.readFile(new URL(path, root), "utf8");
const [audit, checklist, config, methods, permissions] = await Promise.all([
  read("docs/WEBWINDOWS_SECURITY_FREEZE_PHASE_2E.md"),
  read("docs/WEBWINDOWS_PRODUCTION_BROKER_RELEASE_CHECKLIST_V1.md"),
  read("data/config/runtime-features-v1.json").then(JSON.parse),
  read("data/sdk/capability-broker-methods-v1.json").then(JSON.parse),
  read("data/sdk/permissions-v1.json").then(JSON.parse)
]);

assert.equal(config.productionCapabilityBrokerV1, false);
assert.deepEqual(methods.methods.filter((item) => item.productionAvailability === "enabled").map((item) => item.id), ["device.battery.getState", "device.battery.refresh"]);
assert.deepEqual(permissions.sourceDeclaration.declarablePermissionIds, ["device.battery-status.read"]);
for (const heading of ["Authority matrix", "Adversarial results", "Findings by severity", "Browser acceptance", "Freeze conclusion"]) assert.match(audit, new RegExp(heading));
assert.match(audit, /Admin state-changing endpoints[\s\S]*no frozen CSRF/i);
for (const heading of ["IIS and host", "Database", "Server endpoints", "Runtime and sandbox", "End-to-end acceptance", "Recorded release-candidate hashes"]) assert.match(checklist, new RegExp(heading));

for (const path of [
  "server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe",
  "dist-production-broker/production-battery-broker.global.js", "assets/js/package-runtime.js",
  "api/runtime-release.asp", "api/function-package.asp", "developer_api/v1.asp", "admin_api/developerPlatform.asp"
]) {
  const digest = crypto.createHash("sha256").update(await fs.readFile(new URL(path, root))).digest("hex");
  assert.match(checklist, new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]+${digest}`));
}

console.log("Phase 2E security freeze baseline and release checklist smoke test passed");
