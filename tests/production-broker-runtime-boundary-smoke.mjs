import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [config, runtime, page, bundle, facade, methods, policy] = await Promise.all([
  read("data/config/runtime-features-v1.json").then(JSON.parse), read("assets/js/package-runtime.js"), read("package-runtime.html"),
  read("dist-production-broker/production-battery-broker.global.js"), read("webwindows-vue/src/shared/battery-sdk-bootstrap.js"),
  read("data/sdk/capability-broker-methods-v1.json").then(JSON.parse), read("data/sdk/capability-broker-policy-v1.json").then(JSON.parse)
]);
assert.equal(config.productionCapabilityBrokerV1, false);
assert.equal(config.queryOverrideAllowed, false);
assert.match(runtime, /runtime-features-v1\.json/);
assert.doesNotMatch(runtime, /QueryString|params\.get\(["']productionCapabilityBrokerV1/);
assert.match(page, /dist-production-broker\/production-battery-broker\.global\.js/);
assert.doesNotMatch(page, /allow-same-origin/);
assert.match(runtime, /connect-src 'none'/);
assert.equal(policy.sameProtocolForPreviewAndProduction, true);
assert.deepEqual(methods.methods.filter((item) => item.productionAvailability === "enabled").map((item) => item.id), ["device.battery.getState", "device.battery.refresh"]);
for (const forbidden of ["WebWindowsNative", "NativeAdapter", "BrowserAdapter", "BatteryManager", "fileDialog", ".apps", "parent.", "top."]) {
  assert.equal(bundle.includes(forbidden), false, forbidden);
  assert.equal(facade.includes(forbidden), false, forbidden);
}
for (const forbiddenCapability of ["device.network", "device.runtime", "device.display", "device.audio", "device.storage"])
  assert.equal(bundle.includes(forbiddenCapability), false, forbiddenCapability);
assert.match(runtime, /productionBrokerContext/);
assert.doesNotMatch(runtime, /window\.ProductionBrokerContext|window\.VerifiedRuntimePackageIdentity/);
console.log("production Broker feature gate and sandbox boundary smoke test passed");
