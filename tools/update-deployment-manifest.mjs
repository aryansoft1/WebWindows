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
const observedIndex = args.indexOf("--observed-production");
const filesIndex = args.indexOf("--files");
const scopeIndex = args.indexOf("--scope");
const excludeIndex = args.indexOf("--exclude");
const prunePrefixIndex = args.indexOf("--prune-prefix");
const reconcileIndex = args.indexOf("--reconcile-directory");
const preserveCatalogVersion = args.includes("--preserve-catalog-version");
const productionSource = productionIndex >= 0 ? args[productionIndex + 1] : "";
const observedSource = observedIndex >= 0 ? args[observedIndex + 1] : "";
const excludedFiles = excludeIndex >= 0
  ? String(args[excludeIndex + 1] || "").split(",").map((value) => value.trim()).filter(Boolean)
  : [];
const reconcileDirectory = reconcileIndex >= 0 ? args[reconcileIndex + 1] : "";
const selectedFiles = filesIndex >= 0
  ? String(args[filesIndex + 1] || "").split(",").map((value) => value.trim()).filter(Boolean)
  : [];
const releaseScope = scopeIndex >= 0 ? String(args[scopeIndex + 1] || "").trim() : "";
const prunePrefixes = prunePrefixIndex >= 0
  ? String(args[prunePrefixIndex + 1] || "").split(",").map((value) => value.trim()).filter(Boolean)
  : [];

if (prunePrefixes.some((prefix) => prefix.startsWith("/") || prefix.includes("..") || prefix.includes("\\"))) {
  throw new Error("Prune prefixes must be safe repository-relative paths.");
}

function isPruned(relative) {
  return prunePrefixes.some((prefix) => relative.startsWith(prefix));
}

if (releaseScope) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(releaseScope)) throw new Error("Release scope must use lowercase kebab-case.");
  manifest.releaseScope = releaseScope;
}

/*
 * --exclude：把文件移出本次发布范围。
 * 只允许排除「线上不存在且线上运行时也不需要」的文件
 * （例如仅被本分支 include 指令引用、线上并不存在的 inc 文件）。
 * 完整性哈希由工具同步删除，禁止手工改 manifest。
 */
if (excludedFiles.length) {
  if (excludedFiles.some((file) => file.startsWith("/") || file.includes("..") || file.includes("\\"))) {
    throw new Error("Excluded files must be safe repository-relative paths.");
  }
  manifest.requiredFiles = manifest.requiredFiles.filter((relative) => !excludedFiles.includes(relative));
  for (const relative of excludedFiles) {
    if (manifest.integrity) delete manifest.integrity[relative];
  }
}

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
    manifest.catalogVersion = (reconcileDirectory || preserveCatalogVersion) ? priorCatalogVersion : releaseVersion;
  }
  if (!reconcileDirectory && !preserveCatalogVersion) manifest.catalogVersion = releaseVersion;
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
  /*
   * --preserve-catalog-version：本次发布不改编排（未上传 data/apps/system-apps.json），
   * 目录版本必须取线上真相，否则会把线上 .26.1 记回本分支的陈值。
   * 本地 system-apps.json 需已反向同步到线上字节，
   * 否则 deployment-manifest-smoke 的 catalogVersion 断言会失败。
   */
  if (preserveCatalogVersion && production.catalogVersion) {
    manifest.catalogVersion = production.catalogVersion;
  }
  manifest.requiredFiles = [...new Set([
    ...(production.requiredFiles || []).filter((relative) => !isPruned(relative)),
    ...(manifest.requiredFiles || []).filter((relative) => !isPruned(relative)),
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
} else if (observedSource) {
  /*
   * 本地增量 + 线上真相（--observed-production）：
   *   上传切片按本地字节重算；未上传文件沿用线上 manifest 记录的哈希
   *   （含义是「线上保持原字节，本次不动它」），
   *   previousReleaseVersion 直接取线上 releaseVersion。
   * 若未上传文件在线上 manifest 里没有记录则报错，
   * 必须要么纳入 --files 上传、要么用 --exclude 明确排除，
   * 不允许在 manifest 里写一个无法验证的哈希。
   * 线上真相来源可由实测探针补齐（部署 preflight 用 -ProductionManifestPath 指向同一文件）。
   */
  if (!releaseVersion || !selectedFiles.length) {
    throw new Error("Observed-production slice generation requires a release version and --files.");
  }
  const observed = await readJsonSource(observedSource);
  if (observed.schemaVersion !== manifest.schemaVersion || !observed.releaseVersion || !observed.integrity) {
    throw new Error("Observed production manifest is invalid or lacks integrity data.");
  }
  manifest.previousReleaseVersion = observed.releaseVersion;
  delete manifest.reconciledFiles;
  manifest.requiredFiles = [...new Set([
    ...manifest.requiredFiles,
    ...selectedFiles,
    "deploy/ftp-manifest.json"
  ])];
  manifest.uploadFiles = [...new Set([
    ...selectedFiles.filter((relative) => relative !== "deploy/ftp-manifest.json"),
    "deploy/ftp-manifest.json"
  ])];
  integrity = {};
  const unverified = [];
  for (const relative of manifest.requiredFiles) {
    if (relative === "deploy/ftp-manifest.json") continue;
    if (manifest.uploadFiles.includes(relative)) {
      const bytes = await readFile(resolve(root, relative));
      integrity[relative] = {
        sha256: createHash("sha256").update(bytes).digest("hex"),
        size: bytes.length
      };
      continue;
    }
    const entry = observed.integrity[relative];
    if (!entry?.sha256) {
      unverified.push(relative);
      continue;
    }
    integrity[relative] = { sha256: entry.sha256, size: entry.size };
  }
  if (unverified.length) {
    throw new Error(`Observed production integrity is missing for unchanged files: ${unverified.join(", ")}`);
  }
} else {
  delete manifest.reconciledFiles;

  /*
   * 只给 --files（不带 --production）时是“本地增量发布”：
   * 仍然只上传本次改动的切片，但完整性哈希一律按本地文件重算，
   * 因为发布仓库必须是被 git 跟踪的当前源码。
   */
  if (selectedFiles.length) {
    manifest.requiredFiles = [...new Set([
      ...manifest.requiredFiles,
      ...selectedFiles,
      "deploy/ftp-manifest.json"
    ])];
    manifest.uploadFiles = [...new Set([
      ...selectedFiles.filter((relative) => relative !== "deploy/ftp-manifest.json"),
      "deploy/ftp-manifest.json"
    ])];
  } else {
    delete manifest.uploadFiles;
  }

  integrity = {};
  for (const relative of manifest.requiredFiles) {
    if (relative === "deploy/ftp-manifest.json") continue;
    const bytes = await readFile(resolve(root, relative));
    integrity[relative] = {
      sha256: createHash("sha256").update(bytes).digest("hex"),
      size: bytes.length
    };
  }
}
for (const relative of Object.keys(integrity)) {
  if (!manifest.requiredFiles.includes(relative)) delete integrity[relative];
}
manifest.integrity = integrity;
manifest.generatedAt = new Date().toISOString();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`updated deployment manifest ${manifest.releaseVersion}: ${Object.keys(integrity).length} integrity entries, ${manifest.uploadFiles?.length || manifest.requiredFiles.length} upload files`);
