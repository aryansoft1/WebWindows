import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import validateV1 from "../webwindows-vue/src/developer-studio/manifest/generated-manifest-validator.js";
import validateV2 from "../webwindows-vue/src/developer-studio/manifest/generated-manifest-v2-validator.js";
import {
  migrateManifestV1ToV2,
  selectManifestVersion
} from "../webwindows-vue/src/developer-studio/manifest/manifest-version.js";
import { createHelloWebWindowsTemplate } from "../webwindows-vue/src/developer-studio/project/hello-template.js";
import { validateProjectSnapshot } from "../webwindows-vue/src/developer-studio/validation/project-validator.js";
import { buildProjectPackage } from "../webwindows-vue/src/developer-studio/build/deterministic-builder.js";
import { loadStudioContracts } from "./helpers/load-studio-contracts.mjs";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url));
const text = async (path) => (await read(path)).toString("utf8");
const json = async (path) => JSON.parse(await text(path));
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const contracts = await loadStudioContracts();

assert.equal(sha256(await read("data/sdk/manifest-v1.schema.json")), "7ac345bdd704d0fcaa07b88ef1985aa363c6ece8a47fa0baa9709f618fef068a");
assert.equal(sha256(await read("docs/WEBWINDOWS_MANIFEST_V1.md")), "3b306ad44c477e3ce6da700b2eda3fc775b2587ae822bb63bb5d55e3676c433a");

const v1 = JSON.parse(createHelloWebWindowsTemplate().files.find((file) => file.path === "manifest.json").content);
assert.equal(validateV1(v1), true, JSON.stringify(validateV1.errors));
assert.equal(selectManifestVersion(v1), 1);
assert.equal(selectManifestVersion({ ...v1, permissions: ["device.battery-status.read"] }), 1);
assert.equal(selectManifestVersion({ ...v1, sdk: { apiVersion: "1" } }), 1);
assert.equal(selectManifestVersion({ ...v1, manifestVersion: 2 }), 2);
for (const unsupported of [1, 3, "2", null]) {
  assert.equal(selectManifestVersion({ ...v1, manifestVersion: unsupported }), null);
}

const registry = contracts.permissionRegistry;
const registryIds = new Set(registry.permissions.map((permission) => permission.id));
const declarableIds = registry.sourceDeclaration.declarablePermissionIds;
assert.deepEqual(registry.$defs.permissionId.enum, declarableIds);
assert.equal(new Set(declarableIds).size, declarableIds.length);
assert.equal(declarableIds.every((id) => registryIds.has(id)), true);
assert.deepEqual(declarableIds, ["device.battery-status.read"]);
const batteryPermission = registry.permissions.find((permission) => permission.id === "device.battery-status.read");
assert.equal(batteryPermission.risk, "low");
assert.equal(batteryPermission.prompt, "install-review");
assert.equal(batteryPermission.sourceDeclarable, true);
assert.equal(registry.defaultDecision, "deny");
assert.equal(registry.wildcardsAllowed, false);

const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addSchema(registry);
const schemaV2 = contracts.manifestSchemas[2];
const compiledV2 = ajv.compile(schemaV2);
const batteryManifest = await json("developer-samples/battery-pilot-v2/manifest.json");
assert.equal(compiledV2(batteryManifest), true, JSON.stringify(compiledV2.errors));
assert.equal(validateV2(batteryManifest), true, JSON.stringify(validateV2.errors));
assert.equal(batteryManifest.manifestVersion, 2);
assert.equal(batteryManifest.sdk.apiVersion, "1");
assert.deepEqual(batteryManifest.permissions, ["device.battery-status.read"]);
assert.equal(schemaV2.$defs.sourceManifest.required.includes("manifestVersion"), true);
assert.equal(schemaV2.$defs.sourceManifest.required.includes("sdk"), true);
assert.equal(schemaV2.$defs.sourceManifest.required.includes("permissions"), true);
assert.equal(schemaV2.$defs.sourceManifest.required.includes("runtime"), false);
assert.equal(schemaV2.$defs.sourceManifest.properties.runtime.$ref, "#/$defs/runtime");
assert.equal(schemaV2.$defs.runtime.readOnly, true);
for (const privateField of ["nativeBridgeVersion", "native", "WebWindowsNative", "NativeAdapter"]) {
  assert.equal(schemaV2.$defs.sourceManifest.properties[privateField], undefined);
}

const invalidCases = [
  [{ ...batteryManifest, manifestVersion: 3 }, "WWM005"],
  [{ ...batteryManifest, permissions: ["example.unknown.read"] }, "WWM006"],
  [{ ...batteryManifest, permissions: ["device.battery-status.read", "device.battery-status.read"] }, "WWM007"],
  [{ ...batteryManifest, permissions: ["device.*"] }, "WWM008"],
  [{ ...batteryManifest, permissions: ["native"] }, "WWM008"],
  [{ ...batteryManifest, permissions: ["system"] }, "WWM008"],
  [{ ...batteryManifest, permissions: ["device.network-status.read"] }, "WWM008"],
  [{ ...batteryManifest, sdk: { apiVersion: "2" } }, "WWM009"]
];

for (const [manifest] of invalidCases) {
  assert.equal(compiledV2(manifest), false, `Schema should reject ${JSON.stringify(manifest.permissions || manifest.sdk || manifest.manifestVersion)}`);
}

for (const [manifest, expectedRule] of invalidCases) {
  const report = await validateProjectSnapshot(snapshotFromFiles([
    ["manifest.json", `${JSON.stringify(manifest, null, 2)}\n`],
    ["index.html", "<!doctype html><title>fixture</title>"],
    ["assets/icon.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"]
  ], `invalid-${expectedRule}`), { contracts });
  assert.equal(report.passed, false, expectedRule);
  assert.equal(report.diagnostics.some((diagnostic) => diagnostic.ruleId === expectedRule), true, JSON.stringify(report.diagnostics));
}

const v1WithPermissionField = await validateProjectSnapshot(snapshotFromFiles([
  ["manifest.json", JSON.stringify({ ...v1, permissions: ["device.battery-status.read"] })],
  ["index.html", "<!doctype html><script src=\"scripts/app.js\"></script>"],
  ["scripts/app.js", "window.WebWindows.device.battery.getState();"],
  ["assets/icon.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"]
], "v1-permission-does-not-upgrade"), { contracts });
assert.equal(v1WithPermissionField.manifestIdentity.manifestVersion, 1);
assert.equal(v1WithPermissionField.diagnostics.some((diagnostic) => diagnostic.ruleId === "WWM008"), true);
assert.equal(v1WithPermissionField.diagnostics.some((diagnostic) => diagnostic.ruleId === "WWM010"), true);

const migrated = migrateManifestV1ToV2(v1);
assert.equal(migrated.id, v1.id);
assert.equal(migrated.entry, v1.entry);
assert.deepEqual(migrated.window, v1.window);
assert.deepEqual(migrated.install, v1.install);
assert.deepEqual(migrated.permissions, []);
assert.equal(migrated.manifestVersion, 2);
assert.equal(migrated.sdk.apiVersion, "1");
assert.equal(v1.manifestVersion, undefined);
assert.equal(v1.permissions, undefined);

for (const field of ["catalog", "package", "runtime"]) {
  const manifest = { ...batteryManifest, [field]: {} };
  const report = await validateProjectSnapshot(snapshotFromFiles([
    ["manifest.json", JSON.stringify(manifest)],
    ["index.html", "<!doctype html><title>fixture</title>"],
    ["assets/icon.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"]
  ], `published-${field}`), { contracts });
  assert.equal(report.diagnostics.some((diagnostic) => diagnostic.ruleId === "WWM003"), true, field);
}

const v1Snapshot = templateSnapshot(createHelloWebWindowsTemplate(), "v1-build");
const v2Snapshot = await sampleSnapshot("v2-build");
for (const [label, snapshot] of [["v1", v1Snapshot], ["v2", v2Snapshot]]) {
  const builds = await Promise.all([0, 1, 2].map(() => buildProjectPackage(snapshot, {
    contracts,
    manifest: { id: "must.not.override", version: "9.9.9" }
  })));
  assert.equal(builds.every((build) => build.artifactReady && build.readyForSubmission), true, label);
  assert.equal(new Set(builds.map((build) => build.sha256)).size, 1, label);
  assert.equal(builds.slice(1).every((build) => Buffer.from(build.zipBytes).equals(Buffer.from(builds[0].zipBytes))), true, label);
  assert.doesNotMatch(Buffer.from(builds[0].zipBytes).toString("latin1"), /must\.not\.override/);
  console.log(`${label} deterministic sha256=${builds[0].sha256}`);
}

const [inspector, monacoRuntime, validatorSource, studioSource, brokerMethods, brokerPolicy] = await Promise.all([
  text("webwindows-vue/src/developer-studio/manifest/ManifestInspector.vue"),
  text("webwindows-vue/src/developer-studio/editor/monaco-runtime.js"),
  text("webwindows-vue/src/developer-studio/validation/project-validator.js"),
  text("webwindows-vue/src/developer-studio/DeveloperStudio.vue"),
  json("data/sdk/capability-broker-methods-v1.json"),
  json("data/sdk/capability-broker-policy-v1.json")
]);
for (const source of [inspector, monacoRuntime, validatorSource, studioSource]) {
  assert.match(source, /selectManifestVersion/);
}
assert.match(inspector, /sourceDeclaration/);
assert.match(inspector, /sourceDeclarable/);
assert.doesNotMatch(inspector, /\[\s*["']device\.battery-status\.read/);
assert.match(monacoRuntime, /manifest-v1\.schema\.json/);
assert.match(monacoRuntime, /manifest-v2\.schema\.json/);
assert.match(monacoRuntime, /permissions-v1\.json/);
assert.equal(brokerMethods.methods.every((method) => method.productionAvailability === "disabled"), true);
assert.equal(brokerMethods.status, "preview-pilot-enabled-production-disabled");
assert.equal(brokerMethods.methods.every((method) => method.currentStatus === "enabled"), true);
assert.equal(brokerMethods.methods.every((method) => method.previewAvailability === "enabled"), true);
assert.equal(brokerMethods.methods.every((method) => method.productionAvailability === "disabled"), true);
assert.equal(brokerPolicy.status, "preview-pilot-enabled-production-disabled");
assert.equal(brokerPolicy.defaultDecision, "deny");
assert.equal(brokerPolicy.manifestPermissionDeclaration.status, "resolved-by-manifest-v2-contract-preview-pilot-enabled");

console.log("Manifest v2 and permission declaration smoke test passed");

function snapshotFromFiles(entries, id) {
  const files = entries.map(([path, content]) => ({ path, content, byteLength: Buffer.byteLength(content) }))
    .sort((left, right) => Buffer.from(left.path).compare(Buffer.from(right.path)));
  return Object.freeze({
    contract: "webwindows-project-snapshot-v1",
    schemaVersion: 1,
    projectUuid: `project-${id}`,
    snapshotId: `snapshot-${id}`,
    fileCount: files.length,
    totalBytes: files.reduce((total, file) => total + file.byteLength, 0),
    files: Object.freeze(files.map(Object.freeze))
  });
}

function templateSnapshot(template, id) {
  return snapshotFromFiles(template.files.filter((file) => file.kind === "file").map((file) => [file.path, file.content]), id);
}

async function sampleSnapshot(id) {
  const paths = ["manifest.json", "index.html", "scripts/app.js", "assets/icon.svg"];
  return snapshotFromFiles(await Promise.all(paths.map(async (path) => [path, await text(`developer-samples/battery-pilot-v2/${path}`)])), id);
}
