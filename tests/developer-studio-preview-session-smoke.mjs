import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import { createHelloWebWindowsTemplate } from "../webwindows-vue/src/developer-studio/project/hello-template.js";
import { ProjectRepository } from "../webwindows-vue/src/developer-studio/project/project-repository.js";
import { createProjectSnapshot, getSnapshotFile } from "../webwindows-vue/src/developer-studio/snapshot/project-snapshot.js";
import { PreviewSessionController } from "../webwindows-vue/src/developer-studio/preview/preview-session-controller.js";
import { PREVIEW_CSP, PREVIEW_SESSION_CONTRACT } from "../webwindows-vue/src/developer-studio/preview/preview-protocol.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";
import { FakeDOMParser } from "./helpers/fake-preview-dom.mjs";

const contracts = await loadStudioContracts();
const repository = new ProjectRepository({ indexedDB, databaseName: `studio-preview-${Date.now()}` });
const project = await repository.createProject(createHelloWebWindowsTemplate());
const firstSnapshot = await createProjectSnapshot(repository, project.uuid, { createdAt: "2026-01-01T00:00:00.000Z" });
const host = new FakeHost();
const controller = new PreviewSessionController({ hostClient: host });

const started = await controller.run(firstSnapshot, { contracts, domParser: new FakeDOMParser() });
assert.equal(started.started, true);
assert.equal(started.validationReport.passed, true);
assert.equal(started.session.contract, PREVIEW_SESSION_CONTRACT);
assert.equal(started.session.projectUuid, project.uuid);
assert.equal(started.session.snapshotId, firstSnapshot.snapshotId);
assert.equal(started.session.state, "running");
assert.match(host.starts[0].html, new RegExp(PREVIEW_CSP.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(host.starts[0].html, /data-webwindows-preview-bootstrap|previewConsoleBootstrap/);
assert.match(host.starts[0].html, /button\.addEventListener/);
assert.match(host.starts[0].html, /data:image\/svg\+xml/);
assert.equal(host.starts[0].launch.facadeEnabled, false);
assert.doesNotMatch(host.starts[0].html, /data-webwindows-preview-sdk/);

const runningContent = getSnapshotFile(controller.activeSession.snapshot, "scripts/app.js").content;
await repository.writeTextFile(project.uuid, "scripts/app.js", "console.log('new workspace revision');\n");
assert.equal(getSnapshotFile(controller.activeSession.snapshot, "scripts/app.js").content, runningContent);
assert.equal(host.starts.length, 1, "workspace edits must not mutate/reload a running session");

const secondSnapshot = await createProjectSnapshot(repository, project.uuid);
assert.notEqual(secondSnapshot.snapshotId, firstSnapshot.snapshotId);
const reloaded = await controller.reload(secondSnapshot, { contracts, domParser: new FakeDOMParser() });
assert.equal(reloaded.started, true);
assert.notEqual(reloaded.session.sessionId, started.session.sessionId);
assert.equal(reloaded.session.snapshotId, secondSnapshot.snapshotId);
assert.equal(host.stops[0].sessionId, started.session.sessionId);
assert.notEqual(host.starts[0].session.token, host.starts[1].session.token, "reload must rotate the opaque token");

const manifest = JSON.parse(await repository.readTextFile(project.uuid, "manifest.json"));
manifest.entry = "missing.html";
await repository.writeTextFile(project.uuid, "manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
const invalidSnapshot = await createProjectSnapshot(repository, project.uuid);
const blocked = await controller.reload(invalidSnapshot, { contracts, domParser: new FakeDOMParser() });
assert.equal(blocked.started, false);
assert.equal(blocked.validationReport.passed, false);
assert.equal(host.starts.length, 2, "invalid snapshot must never reach Preview Host");
assert.equal(controller.activeSession.snapshotId, secondSnapshot.snapshotId, "invalid reload must not replace the valid running snapshot");

await controller.stop();
assert.equal(controller.activeSession, null);
assert.equal(controller.sessions.size, 0);
assert.equal(host.stops.length, 2);
assert.equal(host.stops[1].token, host.starts[1].session.token);

manifest.entry = "index.html";
await repository.writeTextFile(project.uuid, "manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
const expiringSnapshot = await createProjectSnapshot(repository, project.uuid);
const expiringHost = new FakeHost();
const expiringController = new PreviewSessionController({ hostClient: expiringHost, ttlMs: 10 });
await expiringController.run(expiringSnapshot, { contracts, domParser: new FakeDOMParser() });
await new Promise((resolve) => setTimeout(resolve, 30));
assert.equal(expiringController.activeSession, null, "expired sessions must be revoked");
assert.equal(expiringHost.stops.length, 1);

const failingController = new PreviewSessionController({
  hostClient: { start: async () => { throw new Error("host failed"); }, stop: async () => {}, disconnect() {} }
});
await assert.rejects(
  () => failingController.run(expiringSnapshot, { contracts, domParser: new FakeDOMParser() }),
  /host failed/
);
assert.equal(failingController.activeSession, null);
assert.equal(failingController.sessions.size, 0, "failed session credentials must be revoked");

const v2Manifest = JSON.parse(await repository.readTextFile(project.uuid, "manifest.json"));
v2Manifest.manifestVersion = 2;
v2Manifest.sdk = { apiVersion: "1" };
v2Manifest.permissions = ["device.battery-status.read"];
await repository.writeTextFile(project.uuid, "manifest.json", `${JSON.stringify(v2Manifest, null, 2)}\n`);
const v2Snapshot = await createProjectSnapshot(repository, project.uuid);
const v2Host = new FakeHost();
const publicCalls = { state: 0, refresh: 0 };
const projectedDiagnostics = [];
const v2Controller = new PreviewSessionController({
  hostClient: v2Host,
  onBrokerDiagnostic: (entry) => projectedDiagnostics.push(entry),
  publicApiProvider: () => ({ device: { battery: {
    getCapabilities: () => ({ status: { supported: true } }),
    getState: () => { publicCalls.state += 1; return batteryState(); },
    refresh: async () => { publicCalls.refresh += 1; return batteryState(); }
  } } })
});
const v2Started = await v2Controller.run(v2Snapshot, { contracts, domParser: new FakeDOMParser() });
assert.equal(v2Started.session.brokerEnabled, true);
assert.equal(v2Host.starts[0].launch.facadeEnabled, true);
assert.equal(v2Host.starts[0].launch.handshake.ok, true);
assert.match(v2Host.starts[0].html, /webwindows-studio-preview-sdk-init-v1/);
assert.match(v2Host.starts[0].html, /device\.battery\.refresh/);
assert.equal(publicCalls.state, 1);
assert.equal(projectedDiagnostics.some((entry) => entry.grantState === "not-required"), true);
assert.equal(v2Controller.getBrokerDiagnostics().length > 0, true);
const activeBeforeClear = v2Controller.activeSession.sessionId;
v2Controller.clearBrokerDiagnostics();
assert.equal(v2Controller.getBrokerDiagnostics().length, 0);
assert.equal(v2Controller.activeSession.sessionId, activeBeforeClear, "Clear must not change Broker session state");
const v2Reloaded = await v2Controller.reload(v2Snapshot, { contracts, domParser: new FakeDOMParser() });
assert.notEqual(v2Reloaded.session.sessionId, activeBeforeClear, "Reload must create a fresh permission decision scope");
assert.equal(v2Controller.getBrokerDiagnostics().some((entry) => entry.policyVersion === 1), true);
await v2Controller.stop();
assert.equal(v2Controller.getBrokerDiagnostics().length, 0, "Stop must discard session diagnostics and grants");

const after = await repository.readProjectState(project.uuid);
assert.equal(after.project.uuid, project.uuid);
assert.equal(after.entries.some((entry) => entry.path === "manifest.json"), true);
await repository.close();
console.log("developer studio preview session smoke test passed");

function FakeHost() {
  this.starts = [];
  this.stops = [];
  this.start = async (session, html, launch) => {
    this.starts.push({ session: { ...session }, html, launch: structuredClone(launch) });
    return { state: "created" };
  };
  this.stop = async (session) => { this.stops.push({ ...session }); };
  this.disconnect = () => {};
}

function batteryState() {
  return { supported: true, present: true, level: 0.6, charging: false, connected: false, source: "browser" };
}
