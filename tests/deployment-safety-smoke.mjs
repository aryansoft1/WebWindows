import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const agents = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");
const preflight = await readFile(new URL("../tools/deployment-preflight.ps1", import.meta.url), "utf8");
const deploy = await readFile(new URL("../tools/deploy-ftp.ps1", import.meta.url), "utf8");

assert.match(agents, /git fetch origin --prune/);
assert.match(agents, /Do not deploy files copied from another dirty or untracked worktree/);
assert.match(preflight, /merge-base --is-ancestor origin\/main HEAD/);
assert.match(preflight, /Current branch is not synchronized/);
assert.match(preflight, /Deployment integrity mismatch/);
assert.match(preflight, /Unchanged production integrity mismatch/);
assert.match(preflight, /uploadFiles/);
assert.match(deploy, /deploy\\backups/);
assert.match(deploy, /Production file changed outside the recorded release/);
assert.match(deploy, /Unrecorded production dependency differs from this release/);
assert.match(deploy, /AdoptUnrecordedProductionFiles/);
assert.match(deploy, /Cannot adopt a file outside this release manifest/);
assert.match(deploy, /adopting_unrecorded_production_file/);
assert.match(deploy, /AllowMissing/);
assert.match(deploy, /Post-upload verification failed/);
assert.match(deploy, /\$uploadFiles/);
assert.doesNotMatch(deploy, /yylwljj|8bdea/i, "deployment tooling must not embed credentials");

console.log("Deployment safety smoke tests passed");
