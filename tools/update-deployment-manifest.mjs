import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "deploy/ftp-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const args = process.argv.slice(2);
const releaseVersion = args.find((value) => !value.startsWith("--"));
const productionIndex = args.indexOf("--production");
const filesIndex = args.indexOf("--files");
const reconcileIndex = args.indexOf("--reconcile-directory");
const productionSource = productionIndex >= 0 ? args[productionIndex + 1] : "";
const reconcileDirectory = reconcileIndex >= 0 ? args[reconcileIndex + 1] : "";
const selectedFiles = filesIndex >= 0
  ? String(args[filesIndex + 1] || "").split(",").map((value) => value.trim()).filter(Boolean)
  : [];

async function readJsonSource(source) {
  if (/^https:\/\//i.test(source)) {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to read production manifest (${response.status}).`);
    return response.json();
  }
  return JSON.parse(await readFile(resolve(root, source), "utf8"));
}

const priorCatalogVersion = manifest.catalogVersion;
if (releaseVersion) {
  if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(releaseVersion)) {
    throw new Error("Release version must use YYYY.MM.DD.N format.");
  }
  if (manifest.releaseVersion !== releaseVersion) {
    manifest.previousReleaseVersion = manifest.releaseVersion;
    manifest.releaseVersion = releaseVersion;
    manifest.catalogVersion = reconcileDirectory ? priorCatalogVersion : releaseVersion;
  }
}

let integrity = {};
if (reconcileDirectory) {
  if (!releaseVersion) throw new Error("Reconciliation requires a release version.");
  const priorIntegrity = manifest.integrity || {};
  const snapshotRoot = resolve(root, reconcileDirectory);
  manifest.uploadFiles = ["deploy/ftp-manifest.json"];
  manifest.reconciledFiles = [];
  for (const relative of manifest.requiredFiles) {
    if (relative === "deploy/ftp-manifest.json") continue;
    const bytes = await readFile(resolve(snapshotRoot, relative));
    integrity[relative] = {
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length
    };
    if (priorIntegrity[relative]?.sha256 !== integrity[relative].sha256) {
      manifest.reconciledFiles.push(relative);
    }
  }
} else if (productionSource) {
  if (!releaseVersion || !selectedFiles.length) {
    throw new Error("Incremental manifest generation requires a release version and --files.");
  }
  const production = await readJsonSource(productionSource);
  if (production.schemaVersion !== manifest.schemaVersion || !production.releaseVersion || !production.integrity) {
    throw new Error("Production manifest is invalid or lacks integrity data.");
  }
  manifest.previousReleaseVersion = production.releaseVersion;
  manifest.root = production.root || manifest.root;
  manifest.requiredFiles = [...new Set([
    ...(production.requiredFiles || []),
    ...(manifest.requiredFiles || []),
    "deploy/ftp-manifest.json",
    ...selectedFiles
  ])];
  manifest.uploadFiles = [...new Set([
    ...selectedFiles.filter((relative) => relative !== "deploy/ftp-manifest.json"),
    "deploy/ftp-manifest.json"
  ])];
  integrity = { ...production.integrity };
  for (const relative of manifest.requiredFiles) {
    if (relative === "deploy/ftp-manifest.json" || manifest.uploadFiles.includes(relative)) continue;
    if (!integrity[relative]) throw new Error(`Production integrity is missing for unchanged file: ${relative}`);
  }
  for (const relative of manifest.uploadFiles) {
    if (relative === "deploy/ftp-manifest.json") continue;
    const bytes = await readFile(resolve(root, relative));
    integrity[relative] = {
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length
    };
  }
} else {
  delete manifest.uploadFiles;
  delete manifest.reconciledFiles;
  for (const relative of manifest.requiredFiles) {
    if (relative === "deploy/ftp-manifest.json") continue;
    const bytes = await readFile(resolve(root, relative));
    integrity[relative] = {
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length
    };
  }
}
manifest.integrity = integrity;
manifest.generatedAt = new Date().toISOString();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`updated deployment manifest ${manifest.releaseVersion}: ${Object.keys(integrity).length} integrity entries, ${manifest.uploadFiles?.length || manifest.requiredFiles.length} upload files`);
