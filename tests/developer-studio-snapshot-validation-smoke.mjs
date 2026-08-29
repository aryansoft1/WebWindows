import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import { createHelloWebWindowsTemplate } from "../webwindows-vue/src/developer-studio/project/hello-template.js";
import { ProjectRepository } from "../webwindows-vue/src/developer-studio/project/project-repository.js";
import { createProjectSnapshot, getSnapshotFile } from "../webwindows-vue/src/developer-studio/snapshot/project-snapshot.js";
import { validateProjectSnapshot } from "../webwindows-vue/src/developer-studio/validation/project-validator.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

const contracts = await loadStudioContracts();
const repository = new ProjectRepository({ indexedDB, databaseName: `studio-snapshot-${Date.now()}` });
const project = await repository.createProject(createHelloWebWindowsTemplate());
const snapshot = await createProjectSnapshot(repository, project.uuid, { createdAt: "2026-01-01T00:00:00.000Z" });

assert.equal(Object.isFrozen(snapshot), true);
assert.equal(Object.isFrozen(snapshot.files), true);
assert.equal(Object.isFrozen(snapshot.files[0]), true);
assert.equal(snapshot.fileCount, 5);
assert.equal(snapshot.manifestPath, "manifest.json");
assert.match(snapshot.snapshotId, /^wws1-[a-f0-9]{64}$/);
assert.throws(() => { snapshot.files[0].content = "mutated"; }, TypeError);

const sameRevision = await createProjectSnapshot(repository, project.uuid, { createdAt: "2030-01-01T00:00:00.000Z" });
assert.equal(sameRevision.snapshotId, snapshot.snapshotId);
assert.notEqual(sameRevision.createdAt, snapshot.createdAt);

const originalScript = getSnapshotFile(snapshot, "scripts/app.js").content;
await repository.writeTextFile(project.uuid, "scripts/app.js", "window.WebWindowsNative.call();\nwindow.WebWindows.apps.open();\nfetch('/api');\n");
assert.equal(getSnapshotFile(snapshot, "scripts/app.js").content, originalScript);
const changedSnapshot = await createProjectSnapshot(repository, project.uuid);
assert.notEqual(changedSnapshot.snapshotId, snapshot.snapshotId);

const validReport = await validateProjectSnapshot(snapshot, { contracts });
assert.equal(validReport.passed, true);
assert.equal(validReport.errorCount, 0);
assert.doesNotThrow(() => JSON.stringify(validReport));

await repository.writeTextFile(project.uuid, "scripts/app.js", `
const documentation = "window.WebWindowsNative and window.WebWindows.apps";
// window.WebWindowsNative is private documentation text only.
console.log(documentation);
`);
const stringOnlySnapshot = await createProjectSnapshot(repository, project.uuid);
const stringOnlyReport = await validateProjectSnapshot(stringOnlySnapshot, { contracts });
assert.equal(stringOnlyReport.diagnostics.some((item) => item.ruleId === "WWS003" || item.ruleId === "WWS004"), false);

await repository.writeTextFile(project.uuid, "scripts/app.js", "window.WebWindowsNative.call();\nwindow.WebWindows.apps.open();\nfetch('/api');\n");
const rescannedSnapshot = await createProjectSnapshot(repository, project.uuid);

const changedReport = await validateProjectSnapshot(rescannedSnapshot, { contracts });
assert.equal(changedReport.passed, false);
assert.ok(changedReport.diagnostics.some((item) => item.ruleId === "WWS003"));
assert.ok(changedReport.diagnostics.some((item) => item.ruleId === "WWS004"));
assert.ok(changedReport.diagnostics.some((item) => item.ruleId === "WWS005" && item.severity === "warning"));

const invalidManifest = JSON.parse(await repository.readTextFile(project.uuid, "manifest.json"));
invalidManifest.version = "invalid";
invalidManifest.entry = "missing.html";
invalidManifest.catalog = { status: "published" };
await repository.writeTextFile(project.uuid, "manifest.json", `${JSON.stringify(invalidManifest, null, 2)}\n`);
const invalidSnapshot = await createProjectSnapshot(repository, project.uuid);
const invalidReport = await validateProjectSnapshot(invalidSnapshot, { contracts });
assert.equal(invalidReport.passed, false);
for (const expected of ["WWM002", "WWM003", "WWP006", "WWS003", "WWS004", "WWS005"]) {
  assert.ok(invalidReport.diagnostics.some((item) => item.ruleId === expected), expected);
}

const catalogRuleIds = new Set(contracts.ruleCatalog.rules.map((rule) => rule.ruleId));
for (const diagnostic of invalidReport.diagnostics) {
  assert.match(diagnostic.ruleId, /^WW[MCPS][0-9]{3}$/);
  assert.equal(catalogRuleIds.has(diagnostic.ruleId), true, diagnostic.ruleId);
  assert.ok(["error", "warning"].includes(diagnostic.severity));
}
const serialized = JSON.stringify(invalidReport);
for (const forbidden of ["WebWindowsNative", "cookie", "localStorage", "apiKey", "NativeAdapter"]) {
  assert.doesNotMatch(serialized, new RegExp(forbidden, "i"));
}

await repository.close();
console.log("developer studio snapshot and validation smoke test passed");
