import assert from "node:assert/strict";
import { indexedDB } from "fake-indexeddb";
import { createHelloWebWindowsTemplate } from "../webwindows-vue/src/developer-studio/project/hello-template.js";
import { ProjectRepository } from "../webwindows-vue/src/developer-studio/project/project-repository.js";
import { normalizeProjectPath } from "../webwindows-vue/src/developer-studio/project/path-policy.js";

const databaseName = `webwindows-developer-studio-test-${Date.now()}`;
const template = createHelloWebWindowsTemplate();
const repository = new ProjectRepository({ indexedDB, databaseName });
const projectA = await repository.createProject({ ...template, displayName: "Project A" });
const projectB = await repository.createProject({ ...template, displayName: "Project B" });

assert.notEqual(projectA.uuid, projectB.uuid);
assert.match(projectA.uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

await repository.writeTextFile(projectA.uuid, "scripts/app.js", "// A");
assert.equal(await repository.readTextFile(projectA.uuid, "scripts/app.js"), "// A");
assert.notEqual(await repository.readTextFile(projectB.uuid, "scripts/app.js"), "// A");
await repository.createFile(projectB.uuid, "only-b.txt", "B only");
await assert.rejects(() => repository.readTextFile(projectA.uuid, "only-b.txt"), /找不到/);

const manifestA = JSON.parse(await repository.readTextFile(projectA.uuid, "manifest.json"));
const manifestB = JSON.parse(await repository.readTextFile(projectB.uuid, "manifest.json"));
assert.equal(manifestA.id, manifestB.id);
manifestA.id = "com.example.changed";
await repository.writeTextFile(projectA.uuid, "manifest.json", `${JSON.stringify(manifestA, null, 2)}\n`);
assert.equal((await repository.getProject(projectA.uuid)).uuid, projectA.uuid);

for (const unsafePath of ["../escape.js", "/absolute.js", "C:/drive.js", "bad\0name.js", "a//b.js", "a/./b.js", "a/../b.js", ""]) {
  assert.throws(() => normalizeProjectPath(unsafePath), /项目路径/);
  await assert.rejects(() => repository.createFile(projectA.uuid, unsafePath), /项目路径/);
}

await repository.deleteProject(projectA.uuid);
assert.equal(await repository.readTextFile(projectB.uuid, "only-b.txt"), "B only");
await assert.rejects(() => repository.getProject(projectA.uuid), /找不到项目/);

await repository.close();
const reopenedRepository = new ProjectRepository({ indexedDB, databaseName });
assert.equal((await reopenedRepository.getProject(projectB.uuid)).displayName, "Project B");
assert.equal(await reopenedRepository.readTextFile(projectB.uuid, "only-b.txt"), "B only");
await reopenedRepository.close();

console.log("developer studio project isolation smoke test passed");
