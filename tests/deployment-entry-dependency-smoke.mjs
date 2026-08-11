import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, "deploy/ftp-manifest.json"), "utf8"));
const catalog = JSON.parse(await readFile(resolve(root, "data/apps/system-apps.json"), "utf8"));
const required = new Set(manifest.requiredFiles);
const dependencies = new Set();

function addReference(value, owner = "index.html") {
  const original = String(value || "").split(/[?#]/)[0];
  if (!original || /<%|\$\{/.test(original) || /^(?:https?:|data:|about:|javascript:)/i.test(original)) return;
  const clean = original.startsWith("/")
    ? original.replace(/^\/+/, "")
    : posix.join(posix.dirname(owner), original);
  const relative = posix.normalize(clean);
  if (!relative.startsWith("../")) dependencies.add(relative);
}

for (const owner of manifest.requiredFiles.filter((file) => /\.(?:asp|html?)$/i.test(file))) {
  const source = await readFile(resolve(root, owner), "utf8");
  for (const match of source.matchAll(/(?:src|href)=[\"']([^\"']+)[\"']/gi)) addReference(match[1], owner);
  if (owner === "index.html") {
    for (const match of source.matchAll(/[\"']((?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:js|css|png|jpe?g|svg|html?|asp)(?:\?[^\"']*)?)[\"']/gi)) addReference(match[1], owner);
  }
}
for (const owner of manifest.requiredFiles.filter((file) => /\.css$/i.test(file))) {
  const source = await readFile(resolve(root, owner), "utf8");
  for (const match of source.matchAll(/url\([\"']?([^\"')]+)/gi)) addReference(match[1], owner);
}
for (const app of catalog.apps) {
  addReference(app.entry);
  addReference(app.icon);
}

const sorted = [...dependencies].sort();
const absent = [];
for (const relative of sorted) {
  try { await access(resolve(root, relative)); } catch { absent.push(relative); }
}
assert.deepEqual(absent, [], `entry dependencies must exist: ${absent.join(", ")}`);
const unrecorded = sorted.filter((relative) => !required.has(relative));
assert.deepEqual(unrecorded, [], `entry dependencies must be recorded in deployment manifest: ${unrecorded.join(", ")}`);

console.log(`deployment entry dependency smoke test passed: ${dependencies.size} dependencies`);
