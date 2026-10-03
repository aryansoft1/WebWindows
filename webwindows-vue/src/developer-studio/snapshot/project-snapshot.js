import { normalizeProjectPath } from "../project/path-policy.js";

export const PROJECT_SNAPSHOT_CONTRACT = "webwindows-project-snapshot-v1";

export async function createProjectSnapshot(repository, projectUuid, options = {}) {
  if (!repository || typeof repository.readProjectState !== "function") {
    throw new TypeError("ProjectRepository with atomic readProjectState() is required.");
  }
  const source = await repository.readProjectState(projectUuid);
  const files = source.entries
    .filter((entry) => entry.kind === "file")
    .map((entry) => Object.freeze({
      path: normalizeProjectPath(entry.path),
      content: String(entry.content ?? ""),
      byteLength: utf8(entry.content ?? "").byteLength
    }))
    .sort((left, right) => compareUtf8(left.path, right.path));
  const seen = new Set();
  for (const file of files) {
    if (seen.has(file.path)) throw new Error(`Snapshot contains duplicate path: ${file.path}`);
    seen.add(file.path);
  }
  const totalBytes = files.reduce((total, file) => total + file.byteLength, 0);
  const revisionHash = await sha256Hex(snapshotIdentityBytes(source.project.uuid, files));
  const snapshot = {
    contract: PROJECT_SNAPSHOT_CONTRACT,
    schemaVersion: 1,
    projectUuid: source.project.uuid,
    projectDisplayName: source.project.displayName,
    snapshotId: `wws1-${revisionHash}`,
    revisionHash,
    createdAt: options.createdAt || new Date().toISOString(),
    manifestPath: "manifest.json",
    fileCount: files.length,
    totalBytes,
    files: Object.freeze(files)
  };
  return Object.freeze(snapshot);
}

export function getSnapshotFile(snapshot, path) {
  const normalized = normalizeProjectPath(path);
  return snapshot.files.find((file) => file.path === normalized) || null;
}

export function snapshotFileBytes(file) {
  return utf8(file.content);
}

export async function sha256Hex(bytes) {
  const cryptoObject = globalThis.crypto;
  if (!cryptoObject?.subtle) throw new Error("Web Crypto SHA-256 is required.");
  const digest = await cryptoObject.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function snapshotIdentityBytes(projectUuid, files) {
  const chunks = [utf8(`${PROJECT_SNAPSHOT_CONTRACT}\0${projectUuid}\0`)];
  for (const file of files) {
    const path = utf8(file.path);
    const content = utf8(file.content);
    chunks.push(uint32(path.byteLength), path, uint32(content.byteLength), content);
  }
  const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function uint32(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

function utf8(value) {
  return new TextEncoder().encode(String(value));
}

function compareUtf8(left, right) {
  const leftBytes = utf8(left);
  const rightBytes = utf8(right);
  const length = Math.min(leftBytes.length, rightBytes.length);
  for (let index = 0; index < length; index += 1) {
    if (leftBytes[index] !== rightBytes[index]) return leftBytes[index] - rightBytes[index];
  }
  return leftBytes.length - rightBytes.length;
}
