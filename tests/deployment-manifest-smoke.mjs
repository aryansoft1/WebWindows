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
} else if (manifest.releaseScope === "admin-login-security-repair") {
  assert.deepEqual(uploadFiles, [
    "inc/admin-security.asp",
    "SystemManager/assets/js/admin-login.js",
    "SystemManager/assets/css/admin-login.css",
    "SystemManager/login.html",
    "deploy/ftp-manifest.json",
  ], "admin login repairs must upload the missing security include, the CSRF-aware client, the login page that cache-stamps it, and the manifest last");
} else if (manifest.releaseScope === "admin-console-tailwind") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/index.html",
    "SystemManager/datacenter.html",
    "deploy/ftp-manifest.json",
  ], "the admin console stylesheet repair must upload only the two pages that pointed at the Tailwind stub, plus the manifest last");
} else if (manifest.releaseScope === "visitor-geo-map") {
  assert.deepEqual(uploadFiles, [
    "admin_api/visitorAnalytics.asp",
    "api/visitor-analytics.asp",
    "SystemManager/visitor-analytics.html",
    "SystemManager/assets/js/visitor-analytics.js",
    "SystemManager/assets/js/visitor-analytics-charts.js",
    "SystemManager/assets/css/visitor-analytics.css",
    "deploy/ftp-manifest.json",
  ], "the visitor geolocation release must upload only the collector, the admin aggregate API, the analytics page chain and the manifest last");
} else if (manifest.releaseScope === "visitor-window-dwell") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/visitor-analytics.html",
    "SystemManager/assets/js/visitor-analytics.js",
    "SystemManager/assets/js/visitor-analytics-charts.js",
    "SystemManager/assets/css/visitor-analytics.css",
    "deploy/ftp-manifest.json",
  ], "the per-window dwell release must upload only the analytics page chain and the manifest last");
} else if (manifest.releaseScope === "visitor-geo-enable") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "api/visitor-analytics.asp",
    "admin_api/visitorAnalytics.asp",
    "SystemManager/visitor-analytics.html",
    "SystemManager/assets/js/visitor-analytics.js",
    "SystemManager/assets/css/visitor-analytics.css",
    "deploy/ftp-manifest.json",
  ], "the geolocation enablement must upload the shared resolver, both callers, the admin page chain and the manifest last");
} else if (manifest.releaseScope === "visitor-geo-path-fix") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "api/visitor-analytics.asp",
    "admin_api/visitorAnalytics.asp",
    "deploy/ftp-manifest.json",
  ], "the geolocation path fix must upload only the shared resolver, its two callers and the manifest last");
} else if (manifest.releaseScope === "visitor-map-label-scope") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/assets/js/visitor-analytics-charts.js",
    "SystemManager/visitor-analytics.html",
    "deploy/ftp-manifest.json",
  ], "the label-scope release must upload the charts script, the page that stamps it, and the manifest last");
} else if (manifest.releaseScope === "visitor-map-cache-stamp") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/visitor-analytics.html",
    "deploy/ftp-manifest.json",
  ], "the cache-stamp release must upload only the page that carries the stamp, and the manifest last");
} else if (manifest.releaseScope === "visitor-map-geo-proxy") {
  assert.ok(uploadFiles.includes("deploy/ftp-manifest.json"),
    "the manifest must always be uploaded last");
  assert.ok(uploadFiles.every((file) => /^(api|inc|admin_api|SystemManager|deploy)\//.test(file)),
    "the proxy release must not touch unrelated trees");
  assert.ok(!uploadFiles.includes("api/visitor-analytics.config.asp"),
    "server-side config is never part of an upload slice");
  assert.ok(manifest.requiredFiles.includes("api/region-geo.asp"),
    "the new same-origin proxy endpoint must be tracked in the manifest");
} else if (manifest.releaseScope === "visitor-map-labels-and-referrer") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/assets/js/visitor-analytics-charts.js",
    "SystemManager/visitor-analytics.html",
    "deploy/ftp-manifest.json",
  ], "the label/referrer release must upload only the charts script, the page that stamps it, and the manifest last");
} else if (manifest.releaseScope === "visitor-geo-repair-tick") {
  assert.ok(uploadFiles.includes("deploy/ftp-manifest.json"),
    "the manifest must always be uploaded last");
  assert.ok(uploadFiles.every((file) => /^(inc|api|admin_api|SystemManager|deploy)\//.test(file)),
    "the repair-tick release must not touch unrelated trees");
} else if (manifest.releaseScope === "visitor-geo-time-budget") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "deploy/ftp-manifest.json",
  ], "the time-budget release must upload only the shared resolver and the manifest last");
} else if (manifest.releaseScope === "visitor-geo-selfrepair") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "api/visitor-analytics.asp",
    "admin_api/visitorAnalytics.asp",
    "SystemManager/assets/js/visitor-analytics.js",
    "SystemManager/visitor-analytics.html",
    "deploy/ftp-manifest.json",
  ], "the self-repair release must upload the resolver, both callers, the page and its script, with the manifest last");
  assert.ok(!manifest.requiredFiles.includes("api/visitor-analytics.config.example.asp"),
    "the config template is tracked but must never be deployed, matching the other proxy config examples");
} else if (manifest.releaseScope === "visitor-geo-cache-probe") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "deploy/ftp-manifest.json",
  ], "the cache-probe release must upload only the shared resolver and the manifest last");
} else if (manifest.releaseScope === "visitor-geo-parse-fixes") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "deploy/ftp-manifest.json",
  ], "the parse-fix release must upload only the shared resolver and the manifest last");
} else if (manifest.releaseScope === "visitor-geo-provider-fallback") {
  assert.deepEqual(uploadFiles, [
    "inc/visitor-geo.asp",
    "api/visitor-analytics.asp",
    "deploy/ftp-manifest.json",
  ], "the provider fallback release must upload only the shared resolver, the collector and the manifest last");
  assert.ok(!manifest.requiredFiles.includes("api/visitor-analytics.config.example.asp"),
    "the config template is tracked but must never be deployed, matching the other proxy config examples");
} else if (manifest.releaseScope === "systemmanager-sidebar-css-fix") {
  assert.deepEqual(uploadFiles, [
    "SystemManager/assets/css/admin-utilities.css",
    "SystemManager/index.html",
    "deploy/ftp-manifest.json"
  ], "sidebar CSS fix must upload the stylesheet, entry page, and manifest in order");
} else if (manifest.releaseScope === "systemmanager-dashboard-json-fix") {
  assert.deepEqual(uploadFiles, [
    "admin_api/dashboardStats.asp",
    "deploy/ftp-manifest.json"
  ], "dashboard JSON fix must upload only the affected endpoint and the manifest last");
} else if (manifest.releaseScope === "systemmanager-completion") {
  assert.equal(uploadFiles.length, 53, "SystemManager release must use the approved 53-file scope");
  for (const required of [
    "SystemManager/assets/css/admin-utilities.css",
    "developer-samples/hello-webwindows.zip",
    "deploy/ftp-manifest.json"
  ]) {
    assert.ok(uploadFiles.includes(required), `SystemManager release is missing ${required}`);
  }
  for (const alreadyManaged of [
    "assets/js/developer-center.js",
    "developer-samples/hello-webwindows/index.html",
    "developer-samples/hello-webwindows/manifest.json",
    ...onlineReleaseFiles
  ]) {
    assert.ok(!uploadFiles.includes(alreadyManaged),
      `SystemManager release must not re-upload unchanged dependency ${alreadyManaged}`);
  }
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
