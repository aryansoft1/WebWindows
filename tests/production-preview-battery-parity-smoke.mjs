import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { PreviewBatteryBroker } from "../webwindows-vue/src/developer-studio/broker/preview-battery-broker.js";
import { ProductionBatteryBroker } from "../webwindows-vue/src/production-broker/production-battery-broker.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

globalThis.crypto ??= webcrypto;
const contracts = await loadStudioContracts();
const clean = { supported:true, present:true, level:0.72, charging:true, connected:true, source:"browser" };
const api = (supported = true) => ({ device:{ battery:{
  getCapabilities:() => ({ status:{ supported } }), getState:() => ({ ...clean, hostOnly:"drop" }),
  refresh:async () => ({ ...clean, hostOnly:"drop" })
} } });

for (const scenario of [
  { name:"allowed", declared:true, approved:true, supported:true, expected:null },
  { name:"missing", declared:false, approved:true, supported:true, expected:"permission-not-declared" },
  { name:"review-denied", declared:true, approved:false, supported:true, expected:"policy-denied" },
  { name:"unsupported", declared:true, approved:true, supported:false, expected:"capability-unsupported" }
]) {
  const preview = previewBroker(scenario);
  const production = productionBroker(scenario);
  const [previewLaunch, productionLaunch] = await Promise.all([preview.createLaunchDescriptor(), production.createLaunchDescriptor()]);
  assert.equal(previewLaunch.facadeEnabled, true, `${scenario.name}: Preview facade`);
  assert.equal(productionLaunch.facadeEnabled, true, `${scenario.name}: Production facade`);
  assert.equal(previewLaunch.handshake.error?.code || null, scenario.expected, `${scenario.name}: Preview handshake`);
  assert.equal(productionLaunch.handshake.error?.code || null, scenario.expected, `${scenario.name}: Production handshake`);
  if (!scenario.expected) assert.deepEqual(productionLaunch.handshake.result, previewLaunch.handshake.result);
  const [previewResponse, productionResponse] = await Promise.all([
    preview.handleEnvelope(previewRequest(preview, scenario.name)),
    production.handleEnvelope(productionRequest(production, scenario.name))
  ]);
  assert.equal(previewResponse.error?.code || null, scenario.expected, `${scenario.name}: Preview refresh`);
  assert.equal(productionResponse.error?.code || null, scenario.expected, `${scenario.name}: Production refresh`);
  assert.equal(previewResponse.ok, productionResponse.ok);
  if (previewResponse.ok) assert.deepEqual(productionResponse.result, previewResponse.result);
}

console.log("Preview/Production Battery Broker decision and result parity smoke test passed");

function previewBroker(s) {
  return new PreviewBatteryBroker({ contracts, publicApi:api(s.supported), platformPolicyPermits:s.approved,
    session:{ sessionId:"preview-session-0001", snapshotId:"preview-snapshot-0001", expiresAt:"2099-01-01T00:00:00.000Z" },
    manifest:{ manifestVersion:2, sdk:{ apiVersion:"1" }, id:"com.example.parity", name:"Parity", version:"1.0.0", entry:"index.html",
      permissions:s.declared ? ["device.battery-status.read"] : [] } });
}

function productionBroker(s) {
  const requested = s.declared ? ["device.battery-status.read"] : [];
  const approved = s.approved ? ["device.battery-status.read"] : [];
  const effective = s.declared && s.approved && s.supported ? ["device.battery-status.read"] : [];
  const context = { contextVersion:1, contextId:"production-context-0001", runtimeSessionId:"production-session-0001",
    publishedReleaseId:`rel_${"7".repeat(32)}`, appId:"com.example.parity", publisherId:"42", version:"1.0.0",
    packageSha256:"a".repeat(64), sourceManifestSha256:"b".repeat(64), sourceManifestIntegrityVersion:1,
    manifestVersion:2, sdkVersion:"1", reviewDecisionId:"rvd_parity", reviewPolicyVersion:1, permissionPolicyVersion:1,
    requestedPermissions:requested, approvedPermissions:approved, effectivePermissions:effective,
    releaseState:"active", trustState:"verified-release", contextState:"eligible",
    runtimeCapabilities:{ "battery.status":{ supported:s.supported, source:s.supported ? "browser" : "unsupported" } }, grantState:{} };
  return new ProductionBatteryBroker({ context, contracts, publicApi:api(s.supported), releaseStatusProvider:async () => ({
    publishedReleaseId:context.publishedReleaseId, appId:context.appId, publisherId:context.publisherId, version:context.version,
    packageSha256:context.packageSha256, sourceManifestSha256:context.sourceManifestSha256,
    sourceManifestIntegrityVersion:context.sourceManifestIntegrityVersion, reviewDecisionId:context.reviewDecisionId,
    reviewPolicyVersion:context.reviewPolicyVersion, approvedPermissions:[...context.approvedPermissions], releaseStatus:"active"
  }) });
}

function previewRequest(broker, id) { return { protocol:contracts.brokerPolicy.protocol, version:1, type:"request",
  sessionId:broker.session.sessionId, snapshotId:broker.session.snapshotId, channelId:broker.channelId,
  requestId:`preview-${id}`, method:"device.battery.refresh", params:{} }; }
function productionRequest(broker, id) { return { protocol:contracts.brokerPolicy.protocol, version:1, type:"request",
  sessionId:broker.binding.sessionId, snapshotId:broker.binding.snapshotId, channelId:broker.binding.channelId,
  requestId:`production-${id}`, method:"device.battery.refresh", params:{} }; }
