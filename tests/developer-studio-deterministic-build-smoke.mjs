import assert from "node:assert/strict";
import JSZip from "jszip";
import { indexedDB } from "fake-indexeddb";
import { buildProjectPackage, CANONICAL_ZIP_TIMESTAMP } from "../webwindows-vue/src/developer-studio/build/deterministic-builder.js";
import { createHelloWebWindowsTemplate } from "../webwindows-vue/src/developer-studio/project/hello-template.js";
import { ProjectRepository } from "../webwindows-vue/src/developer-studio/project/project-repository.js";
import { createProjectSnapshot, getSnapshotFile } from "../webwindows-vue/src/developer-studio/snapshot/project-snapshot.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

const contracts = await loadStudioContracts();
const repository = new ProjectRepository({ indexedDB, databaseName: `studio-build-${Date.now()}` });
const project = await repository.createProject(createHelloWebWindowsTemplate());
const beforeBuild = await repository.readProjectState(project.uuid);
const snapshot = await createProjectSnapshot(repository, project.uuid, { createdAt: "2026-01-01T00:00:00.000Z" });
const builds = [];
for (let index = 0; index < 3; index += 1) {
  builds.push(await buildProjectPackage(snapshot, {
    contracts,
    manifest: { id: "must.not.override.snapshot", version: "9.9.9" }
  }));
}

assert.equal(builds.every((build) => build.artifactReady && build.readyForSubmission), true);
assert.equal(new Set(builds.map((build) => build.sha256)).size, 1);
assert.equal(builds[0].sha256, "fbcd4a5f43dd2e92bc93943c4f66e7ab72046ad967c426a0a1a6f07e527b7547");
for (const build of builds.slice(1)) {
  assert.deepEqual(build.zipBytes, builds[0].zipBytes);
}

const archive = await JSZip.loadAsync(builds[0].zipBytes, { checkCRC32: true, createFolders: false });
const paths = Object.keys(archive.files);
assert.deepEqual(paths, snapshot.files.map((file) => file.path));
assert.equal(paths[0], "assets/icon.svg");
assert.equal(paths.includes("manifest.json"), true);
for (const entry of Object.values(archive.files)) {
  assert.equal(entry.dir, false);
  assert.equal(entry.date.toISOString(), CANONICAL_ZIP_TIMESTAMP);
  assert.equal(entry.unixPermissions, 0o100644);
}
const packedManifest = await archive.file("manifest.json").async("string");
assert.equal(packedManifest, getSnapshotFile(snapshot, "manifest.json").content);
assert.doesNotMatch(packedManifest, /must\.not\.override\.snapshot/);

const afterBuild = await repository.readProjectState(project.uuid);
assert.deepEqual(afterBuild, beforeBuild);
assert.doesNotThrow(() => JSON.stringify(builds[0].validationReport));

const manifest = JSON.parse(getSnapshotFile(snapshot, "manifest.json").content);
manifest.entry = "missing.html";
await repository.writeTextFile(project.uuid, "manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
const invalidSnapshot = await createProjectSnapshot(repository, project.uuid);
const blocked = await buildProjectPackage(invalidSnapshot, { contracts });
assert.equal(blocked.artifactReady, false);
assert.equal(blocked.readyForSubmission, false);
assert.equal(blocked.zipBytes, null);
assert.equal(blocked.sha256, null);
assert.equal(blocked.validationReport.passed, false);

await repository.close();
console.log("developer studio deterministic build smoke test passed");
