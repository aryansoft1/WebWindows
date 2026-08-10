import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../cloud/browser/private-files.asp", import.meta.url), "utf8");
const resource = await readFile(new URL("../cloud/browser/private-resource.asp", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../deploy/ftp-manifest.json", import.meta.url), "utf8"));

assert.match(page, /X-WebWindows-Private-Files-Version"\s*,\s*"2026\.08\.10\.3"/);
assert.match(page, /data-private-files-version="2026\.08\.10\.3"/);
assert.match(resource, /X-WebWindows-Private-Resource-Version"\s*,\s*"2026\.08\.10\.3"/);
assert.ok(manifest.requiredFiles.includes("cloud/browser/private-files.asp"));
assert.ok(manifest.requiredFiles.includes("cloud/browser/private-resource.asp"));

console.log("Private cloud version smoke tests passed");
