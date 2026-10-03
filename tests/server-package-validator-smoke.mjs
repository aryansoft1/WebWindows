import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import JSZip from "jszip";

const root = path.resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1)));
const executable = path.join(root, "server-tools/developer-package-validator/runtime/WebWindows.DeveloperPackageValidator.exe");
await fs.access(executable);
const temp = await fs.mkdtemp(path.join(os.tmpdir(), "ww-server-validator-"));
const baseV1 = JSON.parse(await fs.readFile(path.join(root, "developer-samples/hello-webwindows/manifest.json"), "utf8"));
const baseV2 = JSON.parse(await fs.readFile(path.join(root, "developer-samples/battery-pilot-v2/manifest.json"), "utf8"));

try {
  const validV1 = await validate(await zipFor(baseV1), baseV1);
  assert.equal(validV1.report.passed, true, JSON.stringify(validV1.report.diagnostics));
  assert.equal(validV1.report.manifestVersion, 1);
  assert.deepEqual(validV1.report.requestedPermissions, []);
  assert.equal(validV1.report.publisherId, "publisher-17");
  assert.equal(JSON.stringify(validV1.report).includes("wwdev_"), false);
  assert.equal(JSON.stringify(validV1.report).includes(temp), false);

  const validV2 = await validate(await zipFor(baseV2), reorder(baseV2));
  assert.equal(validV2.report.passed, true, JSON.stringify(validV2.report.diagnostics));
  assert.equal(validV2.report.manifestVersion, 2);
  assert.deepEqual(validV2.report.requestedPermissions, ["device.battery-status.read"]);
  assert.equal(validV2.report.sdkVersion, "1");
  assert.equal(validV2.report.packageSha256, sha(validV2.bytes));
  assert.match(validV2.report.sourceManifestSha256, /^[a-f0-9]{64}$/);
  assert.equal(validV2.report.sourceManifestIntegrityVersion, 1);

  const canonicalVectorManifest = {
    ...baseV2,
    canonicalVector: {
      z: 1e-7, a: 0.000001, large: 1e20, escaped: "line\n雪",
      numbers: [333333333.33333329, 1e30, 4.5, 0.002, 1e-27, 5e-324, 1.7976931348623157e308, 9007199254740992]
    }
  };
  const canonicalVector = await validate(await zipFor(canonicalVectorManifest), reorder(canonicalVectorManifest));
  assert.equal(canonicalVector.report.passed, true, JSON.stringify(canonicalVector.report.diagnostics));
  assert.equal(canonicalVector.report.sourceManifestSha256, sha(Buffer.from(canonicalize(canonicalVectorManifest))),
    "Server and browser must use the same RFC 8785/JCS UTF-8 manifest digest definition");

  const numericBase = JSON.stringify({ ...baseV2, canonicalNumericVector: 1 });
  const numericHashes = [];
  for (const literal of ["1", "1.0", "1e0"]) {
    const raw = numericBase.replace('"canonicalNumericVector":1', `"canonicalNumericVector":${literal}`);
    const result = await validate(await zipFor(baseV2, { rawManifest:raw }), baseV2, { outerText:raw });
    assert.equal(result.report.passed, true, JSON.stringify(result.report.diagnostics));
    numericHashes.push(result.report.sourceManifestSha256);
  }
  assert.equal(new Set(numericHashes).size, 1, "1, 1.0 and 1e0 must have one JCS identity");
  const reorderedRaw = `${JSON.stringify(reorder(baseV2), null, 2)}\r\n`;
  const reorderedRawResult = await validate(await zipFor(baseV2, { rawManifest:reorderedRaw }), baseV2, { outerText:reorderedRaw });
  assert.equal(reorderedRawResult.report.sourceManifestSha256, validV2.report.sourceManifestSha256);

  const duplicateId = JSON.stringify(baseV2).replace(`"id":"${baseV2.id}"`, `"id":"${baseV2.id}","id":"com.attacker.substitute"`);
  await rejected(await zipFor(baseV2, { rawManifest:duplicateId }), baseV2, "WWM001", { outerText:duplicateId });
  const escapedDuplicate = JSON.stringify(baseV2).replace(`"id":"${baseV2.id}"`, `"id":"${baseV2.id}","\\u0069d":"com.attacker.escape"`);
  await rejected(await zipFor(baseV2, { rawManifest:escapedDuplicate }), baseV2, "WWM001", { outerText:escapedDuplicate });
  const bomManifest = `\ufeff${JSON.stringify(baseV2)}`;
  await rejected(await zipFor(baseV2, { rawManifest:bomManifest }), baseV2, "WWM001", { outerText:bomManifest });
  const loneSurrogate = JSON.stringify(baseV2).replace(`"name":"${baseV2.name}"`, `"name":"\\ud800"`);
  await rejected(await zipFor(baseV2, { rawManifest:loneSurrogate }), baseV2, "WWM001", { outerText:loneSurrogate });
  const overflowNumber = JSON.stringify({ ...baseV2, canonicalNumericVector:1 }).replace('"canonicalNumericVector":1', '"canonicalNumericVector":1e400');
  await rejected(await zipFor(baseV2, { rawManifest:overflowNumber }), baseV2, "WWM001", { outerText:overflowNumber });

  const validV2Again = await validate(validV2.bytes, reorder(baseV2));
  for (const field of ["reportId", "validatorVersion", "packageSha256", "packageSize", "sourceManifestSha256", "sourceManifestIntegrityVersion", "manifestVersion", "appId", "version", "publisherId", "sdkVersion", "requestedPermissions", "schemaResult", "packagePolicyResult", "diagnostics", "passed"])
    assert.deepEqual(validV2Again.report[field], validV2.report[field], `stable report field ${field}`);

  await rejected(await zipFor({ ...baseV1, manifestVersion: 3 }), { ...baseV1, manifestVersion: 3 }, "WWM005");
  await rejected(await zipFor({ ...baseV1, manifestVersion: 1 }), { ...baseV1, manifestVersion: 1 }, "WWM005");
  await rejected(await zipFor({ ...baseV1, window: "not-an-object" }), { ...baseV1, window: "not-an-object" }, "WWM002");
  await rejected(await zipFor(baseV2), { ...baseV2, description: "outer override" }, "WWT001");
  await rejected(await zipFor(baseV1), baseV1, "WWT002", { expectedId: "com.example.other" });
  await rejected(await zipFor(baseV1), baseV1, "WWT003", { expectedVersion: "9.9.9" });
  await rejected(await zipFor({ ...baseV2, permissions: ["device.unknown.read"] }), { ...baseV2, permissions: ["device.unknown.read"] }, "WWM006");
  await rejected(await zipFor({ ...baseV2, permissions: ["device.*"] }), { ...baseV2, permissions: ["device.*"] }, "WWM008");

  await rejected(await zipFor(baseV1, { omitManifest: true }), baseV1, "WWP001");
  await rejected(await zipFor(baseV1, { extra: { "nested/manifest.json": JSON.stringify(baseV1) } }), baseV1, "WWP001");
  await rejected(await zipFor(baseV1, { extra: { "../escape.js": "x" } }), baseV1, "WWP002");
  await rejected(await zipFor(baseV1, { extra: { "/absolute.js": "x" } }), baseV1, "WWP002");
  await rejected(await zipFor(baseV1, { extra: { "bad.exe": "x" } }), baseV1, "WWP005");
  await rejected(await zipFor({ ...baseV1, entry: "missing.html" }), { ...baseV1, entry: "missing.html" }, "WWP006");

  const many = {}; for (let i = 0; i < 501; i++) many[`assets/f${i}.txt`] = "x";
  await rejected(await zipFor(baseV1, { extra: many }), baseV1, "WWP003");
  await rejected(await zipFor(baseV1, { extra: { "assets/bomb.txt": "x".repeat(31 * 1024 * 1024) } }), baseV1, "WWP004");

  const encrypted = patchFlags(await zipFor(baseV1), 1);
  await rejected(encrypted, baseV1, "WWT006");
  const badCrc = patchCentralCrc(await zipFor(baseV1));
  await rejected(badCrc, baseV1, "WWT007");
  const malformed = Buffer.from(await zipFor(baseV1)); malformed.fill(0, malformed.length - 22, malformed.length - 18);
  await rejected(malformed, baseV1, "WWT007");
  const cleanArchive = Buffer.from(await zipFor(baseV1));
  await rejected(Buffer.concat([cleanArchive, Buffer.from("appended-payload")]), baseV1, "WWT007");
  await rejected(Buffer.concat([cleanArchive, cleanArchive]), baseV1, "WWT007");
  await rejected(patchCompression(await zipFor(baseV1), 99), baseV1, "WWT008");
  await rejected(patchOverlappingOffset(await zipFor(baseV1)), baseV1, "WWT009");

  const duplicate = await duplicateSameLengthPathZip(baseV1);
  await rejected(duplicate, baseV1, "WWT005");
  const symlink = await zipFor(baseV1, { symlink: true });
  await rejected(symlink, baseV1, "WWP002");
  console.log("trusted server package validator smoke test passed");
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}

async function validate(bytes, outer, options = {}) {
  const id = options.expectedId || outer.id;
  const version = options.expectedVersion || outer.version;
  const marker = crypto.randomUUID();
  const zipPath = path.join(temp, `${marker}.zip`), outerPath = path.join(temp, `${marker}.json`), reportPath = path.join(temp, `${marker}.report.json`);
  await fs.writeFile(zipPath, bytes);
  await fs.writeFile(outerPath, options.outerText ?? JSON.stringify(outer));
  const process = spawnSync(executable, [zipPath, outerPath, id, version, "publisher-17", reportPath, root, "submission-9"], { encoding: "utf8" });
  try { await fs.access(reportPath); } catch { throw new Error(`validator failed: status=${process.status} error=${process.error?.message || "none"} stderr=${process.stderr}`); }
  const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
  return { process, report, bytes: Buffer.from(bytes) };
}

async function rejected(bytes, outer, ruleId, options) {
  const result = await validate(bytes, outer, options);
  assert.equal(result.report.passed, false, `${ruleId} fixture unexpectedly passed`);
  assert.equal(result.report.diagnostics.some((item) => item.ruleId === ruleId), true, JSON.stringify(result.report.diagnostics));
  return result;
}

async function zipFor(manifest, options = {}) {
  const zip = new JSZip();
  if (!options.omitManifest) zip.file("manifest.json", options.rawManifest ?? JSON.stringify(manifest));
  zip.file("index.html", "<!doctype html><link rel=\"stylesheet\" href=\"styles/app.css\"><script src=\"scripts/app.js\"></script>");
  zip.file("styles/app.css", "body{color:#123}");
  zip.file("scripts/app.js", "console.log('ok')");
  zip.file("icon.svg", "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>");
  for (const [name, content] of Object.entries(options.extra || {})) zip.file(name, content);
  if (options.symlink) zip.file("assets/link.js", "target", { unixPermissions: 0o120777, platform: "UNIX" });
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", platform: options.symlink ? "UNIX" : "DOS" });
}

function reorder(value) {
  return Object.fromEntries(Object.entries(value).reverse());
}

function sha(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }

function canonicalize(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}

function patchFlags(input, flag) {
  const data = Buffer.from(input);
  for (let i = 0; i + 4 < data.length; i++) {
    const sig = data.readUInt32LE(i);
    if (sig === 0x04034b50) data.writeUInt16LE(data.readUInt16LE(i + 6) | flag, i + 6);
    if (sig === 0x02014b50) data.writeUInt16LE(data.readUInt16LE(i + 8) | flag, i + 8);
  }
  return data;
}

function patchCentralCrc(input) {
  const data = Buffer.from(input);
  for (let i = 0; i + 20 < data.length; i++) {
    if (data.readUInt32LE(i) === 0x02014b50) { data.writeUInt32LE((data.readUInt32LE(i + 16) ^ 0xffffffff) >>> 0, i + 16); break; }
  }
  return data;
}

function patchCompression(input, method) {
  const data = Buffer.from(input);
  for (let i = 0; i + 12 < data.length; i++) {
    const sig = data.readUInt32LE(i);
    if (sig === 0x04034b50) data.writeUInt16LE(method, i + 8);
    if (sig === 0x02014b50) data.writeUInt16LE(method, i + 10);
  }
  return data;
}

function patchOverlappingOffset(input) {
  const data = Buffer.from(input); const central = [];
  for (let i = 0; i + 46 < data.length; i++) if (data.readUInt32LE(i) === 0x02014b50) central.push(i);
  assert.equal(central.length > 1, true);
  data.writeUInt32LE(data.readUInt32LE(central[0] + 42), central[1] + 42);
  return data;
}

async function duplicateSameLengthPathZip(manifest) {
  const zip = new JSZip();
  zip.file("manifest.json", JSON.stringify(manifest));
  zip.file("index.html", "ok");
  zip.file("assets/a.txt", "a");
  zip.file("assets/b.txt", "b");
  const data = Buffer.from(await zip.generateAsync({ type: "nodebuffer", compression: "STORE" }));
  const from = Buffer.from("assets/b.txt"), to = Buffer.from("assets/a.txt");
  for (let i = 0; i <= data.length - from.length; i++) if (data.subarray(i, i + from.length).equals(from)) to.copy(data, i);
  return data;
}
