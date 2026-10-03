import JSZip from "jszip";
import { getSnapshotFile, sha256Hex } from "../snapshot/project-snapshot.js";
import { validateProjectSnapshot } from "../validation/project-validator.js";

export const BUILD_RESULT_CONTRACT = "webwindows-studio-build-result-v1";
export const CANONICAL_ZIP_TIMESTAMP = "1980-01-01T00:00:00.000Z";

export async function buildProjectPackage(snapshot, options = {}) {
  const validationReport = await validateProjectSnapshot(snapshot, { contracts: options.contracts });
  const blockedResult = {
    contract: BUILD_RESULT_CONTRACT,
    schemaVersion: 1,
    snapshotId: snapshot.snapshotId,
    manifestIdentity: validationReport.manifestIdentity,
    validationReport,
    artifactReady: false,
    readyForSubmission: false,
    zipBytes: null,
    zipSize: 0,
    sha256: null,
    fileCount: snapshot.fileCount,
    canonicalTimestamp: CANONICAL_ZIP_TIMESTAMP
  };
  if (!validationReport.passed) return blockedResult;
  if (!getSnapshotFile(snapshot, "manifest.json")) return blockedResult;

  const archive = new JSZip();
  const canonicalDate = new Date(CANONICAL_ZIP_TIMESTAMP);
  for (const file of snapshot.files) {
    archive.file(file.path, file.content, {
      binary: false,
      createFolders: false,
      date: canonicalDate,
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
      unixPermissions: 0o100644,
      dosPermissions: 0
    });
  }
  const zipBytes = await archive.generateAsync({
    type: "uint8array",
    platform: "UNIX",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
    streamFiles: false,
    comment: "",
    mimeType: "application/zip"
  });
  const sha256 = await sha256Hex(zipBytes);
  return {
    ...blockedResult,
    artifactReady: true,
    readyForSubmission: true,
    zipBytes,
    zipSize: zipBytes.byteLength,
    sha256
  };
}
