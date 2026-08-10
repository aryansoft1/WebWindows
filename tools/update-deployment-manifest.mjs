import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "deploy/ftp-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const releaseVersion = process.argv[2];

if (releaseVersion) {
  if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(releaseVersion)) {
    throw new Error("Release version must use YYYY.MM.DD.N format.");
  }
  if (manifest.releaseVersion !== releaseVersion) {
    manifest.previousReleaseVersion = manifest.releaseVersion;
    manifest.releaseVersion = releaseVersion;
    manifest.catalogVersion = releaseVersion;
  }
}

const integrity = {};
for (const relative of manifest.requiredFiles) {
  if (relative === "deploy/ftp-manifest.json") continue;
  const bytes = await readFile(resolve(root, relative));
  integrity[relative] = {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    size: bytes.length
  };
}
manifest.integrity = integrity;
manifest.generatedAt = new Date().toISOString();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`updated deployment manifest ${manifest.releaseVersion}: ${Object.keys(integrity).length} integrity entries`);
