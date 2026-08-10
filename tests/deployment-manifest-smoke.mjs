import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, "deploy/ftp-manifest.json"), "utf8"));
const catalog = JSON.parse(await readFile(resolve(root, "data/apps/system-apps.json"), "utf8"));
const catalogApi = await readFile(resolve(root, "api/function-catalog.asp"), "utf8");

assert.equal(manifest.schemaVersion, 1);
assert.equal(catalog.repository.catalogVersion, manifest.catalogVersion,
  "FTP release and AppRegistry catalog versions must advance together");
assert.match(catalogApi, /VersionIsNewer\(fileVersion, activeVersion\)/,
  "catalog API must compare numeric version parts before keeping a database snapshot");
assert.doesNotMatch(catalogApi, /StrComp\(fileVersion, activeVersion/,
  "lexical comparison misorders legacy catalog labels and date versions");

for (const relative of manifest.requiredFiles) {
  await access(resolve(root, relative));
}
for (const app of catalog.apps) {
  const entry = String(app.entry || "").split("?")[0];
  if (entry && entry !== "about:blank") await access(resolve(root, entry));
  if (app.icon) await access(resolve(root, String(app.icon).split("?")[0]));
}

console.log(`deployment manifest smoke test passed: ${manifest.requiredFiles.length} files`);
