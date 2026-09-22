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
// 该哈希必须覆盖 data/sdk/** 合约与 hello-template 的任何改动：
// 2026-09-14 的 976d940（dialog API）同时改动了 webwindows-public-api-v1.d.ts
// 与 hello-template.js，因此这里固定值随之更新。修改合约后请重新运行本测试。
assert.equal(builds[0].sha256, "48c442412bc44901b61bda051508569da7d384906056b1d63a5b4a82517aa6b0");
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
