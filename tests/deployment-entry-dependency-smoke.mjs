import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, "deploy/ftp-manifest.json"), "utf8"));
const catalog = JSON.parse(await readFile(resolve(root, "data/apps/system-apps.json"), "utf8"));
const index = await readFile(resolve(root, "index.html"), "utf8");
const mainCss = await readFile(resolve(root, "assets/css/main.css"), "utf8");
const required = new Set(manifest.requiredFiles);
const dependencies = new Set();

function addReference(value) {
  const clean = String(value || "").split(/[?#]/)[0].replace(/^\/+/, "");
  if (!clean || /^(?:https?:|data:|about:|javascript:)/i.test(clean)) return;
  dependencies.add(posix.normalize(clean));
}

for (const match of index.matchAll(/(?:src|href)=[\"']([^\"']+)[\"']/gi)) addReference(match[1]);
for (const match of index.matchAll(/[\"']((?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:js|css|png|jpe?g|svg|html?|asp)(?:\?[^\"']*)?)[\"']/gi)) addReference(match[1]);
for (const match of mainCss.matchAll(/url\([\"']?([^\"')]+)/gi)) addReference(match[1]);
for (const app of catalog.apps) {
  addReference(app.entry);
  addReference(app.icon);
}

for (const relative of [...dependencies].sort()) {
  await access(resolve(root, relative));
  assert.ok(required.has(relative), `entry dependency must be recorded in deployment manifest: ${relative}`);
}

console.log(`deployment entry dependency smoke test passed: ${dependencies.size} dependencies`);
