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
const onlineReleaseFiles = [
  "sysinfo.html",
  "assets/js/sysinfo.js",
  "api/release-version.asp",
  "api/mobile-version.asp",
  "data/apps/system-apps.json",
];
if (manifest.releaseScope === "navigation-map") {
  assert.deepEqual(uploadFiles, [
    "assets/css/navigation.css",
    "assets/js/navigation-app.js",
    "assets/js/navigation-providers.js",
    "data/apps/system-apps.json",
    "road.html",
    "deploy/ftp-manifest.json",
  ], "navigation map releases must upload only the navigation runtime slice");
} else if (manifest.releaseScope === "camera-registry") {
  assert.deepEqual(uploadFiles, [
    "data/apps/system-apps.json",
    "camera.html",
    "assets/css/camera.css",
    "assets/icons/camera.svg",
    "assets/js/camera-app.js",
    "assets/js/camera-core.js",
    "deploy/ftp-manifest.json",
  ], "camera-registry releases must not include unrelated runtime files");
} else if (manifest.releaseScope === "camera-network-experience") {
  assert.deepEqual(uploadFiles, [
    "camera.html",
    "assets/css/camera.css",
    "assets/js/camera-app.js",
    "assets/js/tw.js",
    "data/apps/system-apps.json",
    "settings.html",
    "assets/css/settings.css",
    "assets/js/network-speed.js",
    "dist-window/window-manager-widget.css",
    "dist-window/window-manager-widget.js",
    "dist-window/window-manager-widget.umd.js",
    "deploy/ftp-manifest.json",
  ], "camera and network experience release must upload only its runtime slice");
} else if (manifest.releaseScope === "camera-recovery") {
  assert.deepEqual(uploadFiles, [
    "assets/js/camera-app.js",
    "assets/js/tw.js",
    "camera.html",
    "data/apps/system-apps.json",
    "dist-window/window-manager-widget.css",
    "dist-window/window-manager-widget.js",
    "dist-window/window-manager-widget.umd.js",
    "deploy/ftp-manifest.json",
  ], "camera recovery releases must upload only the camera and window runtime slice");
} else if (manifest.releaseScope === "visitor-analytics") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/index.html",
    "SystemManager/visitor-analytics.html",
    "SystemManager/assets/css/visitor-analytics.css",
    "deploy/ftp-manifest.json",
  ], "visitor analytics fix releases must upload only the admin shell and reporting presentation slice");
} else if (manifest.releaseScope === "catalog-static-fallback") {
  assert.deepEqual(uploadFiles, [
    "api/function-catalog.asp",
    "deploy/ftp-manifest.json",
  ], "the catalog fallback release must upload only the catalog endpoint and the manifest");
} else if (manifest.releaseScope === "desktalk-file-search") {
  assert.deepEqual(uploadFiles, [
    "assets/js/ai-tool-registry.js",
    "assets/js/ai-file-tools.js",
    "assets/js/file-search.js",
    "assets/js/desktalk.js",
    "cloud/browser/files.asp",
    "cloud/browser/private-files.asp",
    "deploy/ftp-manifest.json",
  ], "DeskTalk file search releases must upload only the search tool chain and the two cloud pages that load it");
} else if (manifest.releaseScope === "cloud-layout-hotfix") {
  assert.deepEqual(uploadFiles, [
    "cloud/browser/file-search.css",
    "cloud/browser/styles.css",
    "cloud/browser/files.asp",
    "cloud/browser/private-files.asp",
    "deploy/ftp-manifest.json",
  ], "cloud layout hotfix releases must upload only CSS and the ASP cache-key rollback");
} else if (manifest.releaseScope === "cloud-file-search-submit") {
  assert.deepEqual(uploadFiles, [
    "cloud/browser/search-ui.js",
    "cloud/browser/file-search.css",
    "cloud/browser/files.asp",
    "cloud/browser/private-files.asp",
    "deploy/ftp-manifest.json",
  ], "cloud file search releases must upload only the search UI, its layout CSS and the two pages that load them");
} else if (manifest.releaseScope === "desktalk-presence-identity") {
  assert.deepEqual(uploadFiles, [
    "assets/js/desktalk.js",
    "index.html",
    "deploy/ftp-manifest.json",
  ], "DeskTalk presence identity releases must upload only the client runtime and the entry page that cache-stamps it");
} else {
  for (const onlineReleaseFile of onlineReleaseFiles) {
    assert.ok(uploadFiles.includes(onlineReleaseFile),
      "Android online-version fallback must deploy together: " + onlineReleaseFile);
  }
}
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
const appsToVerify = ["camera-registry", "camera-network-experience", "camera-recovery"].includes(manifest.releaseScope)
  ? catalog.apps.filter((app) => app.id === "webwindows.system.camera")
  : catalog.apps;
for (const app of appsToVerify) {
  const entry = String(app.entry || "").split("?")[0];
  if (entry && entry !== "about:blank") await access(resolve(root, entry));
  if (app.icon) await access(resolve(root, String(app.icon).split("?")[0]));
}

console.log(`deployment manifest smoke test passed: ${manifest.requiredFiles.length} files`);
