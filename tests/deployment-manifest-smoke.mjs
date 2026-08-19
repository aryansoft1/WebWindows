import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, "deploy/ftp-manifest.json"), "utf8"));
const catalog = JSON.parse(await readFile(resolve(root, "data/apps/system-apps.json"), "utf8"));
const catalogApi = await readFile(resolve(root, "api/function-catalog.asp"), "utf8");
const uploadFiles = manifest.uploadFiles || manifest.requiredFiles;

assert.equal(manifest.schemaVersion, 1);
assert.equal(catalog.repository.catalogVersion, manifest.catalogVersion,
  "FTP release and AppRegistry catalog versions must advance together");
assert.match(catalogApi, /VersionIsNewer\(fileVersion, activeVersion\)/,
  "catalog API must compare numeric version parts before keeping a database snapshot");
assert.doesNotMatch(catalogApi, /StrComp\(fileVersion, activeVersion/,
  "lexical comparison misorders legacy catalog labels and date versions");

for (const relative of manifest.requiredFiles) {
  if (relative === "deploy/ftp-manifest.json") continue;
  assert.ok(manifest.integrity?.[relative]?.sha256, `deployment hash must exist for ${relative}`);
  if (uploadFiles.includes(relative)) {
    await access(resolve(root, relative));
    const bytes = await readFile(resolve(root, relative));
    assert.equal(manifest.integrity[relative].sha256,
      createHash("sha256").update(bytes).digest("hex"),
      `deployment hash must match uploaded file ${relative}`);
    assert.equal(manifest.integrity[relative].size, bytes.length,
      `deployment size must match uploaded file ${relative}`);
  }
}
assert.equal(Object.keys(manifest.integrity || {}).length, manifest.requiredFiles.length - 1,
  "every non-self deployment file must have exactly one integrity record");
assert.notEqual(manifest.previousReleaseVersion, manifest.releaseVersion);
assert.ok(manifest.releaseVersion.localeCompare(manifest.previousReleaseVersion, undefined, { numeric: true }) > 0,
  "the release version must advance beyond the production version");
assert.ok(uploadFiles.includes("deploy/ftp-manifest.json"));
assert.ok(uploadFiles.includes("assets/js/desktalk.js") && uploadFiles.includes("api/dt_presence_mem.asp") &&
  uploadFiles.includes("api/dt_discovery.asp"),
  "DeskTalk discovery UI, presence filtering, and account preference API must deploy together");
assert.ok(uploadFiles.includes("news.html") && uploadFiles.includes("assets/js/news.js") &&
  uploadFiles.includes("data/apps/system-apps.json"),
  "the news feed and catalog cache busting must deploy together");
for (const realtimeDependency of ["assets/js/desktalk.js", "api/dt_fetch_links.asp"]) {
  assert.ok(manifest.requiredFiles.includes(realtimeDependency),
    `DeskTalk real-time dependency must remain managed: ${realtimeDependency}`);
}
for (const runtimeDependency of [
  "cloud/browser/styles.css",
  "cloud/browser/toolbar.js",
  "cloud/browser/device-locations.js",
  "cloud/browser/private-files.css"
]) {
  assert.ok(manifest.requiredFiles.includes(runtimeDependency),
    `runtime dependency must be in deployment manifest: ${runtimeDependency}`);
}
for (const app of catalog.apps) {
  const entry = String(app.entry || "").split("?")[0];
  if (entry && entry !== "about:blank") await access(resolve(root, entry));
  if (app.icon) await access(resolve(root, String(app.icon).split("?")[0]));
}

console.log(`deployment manifest smoke test passed: ${manifest.requiredFiles.length} files`);
