import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../cloud/browser/private-files.asp", import.meta.url), "utf8");
const resource = await readFile(new URL("../cloud/browser/private-resource.asp", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../deploy/ftp-manifest.json", import.meta.url), "utf8"));

assert.match(page, /X-WebWindows-Private-Files-Version"\s*,\s*"2026\.08\.10\.4"/);
assert.match(page, /data-private-files-version="2026\.08\.10\.4"/);
assert.match(resource, /X-WebWindows-Private-Resource-Version"\s*,\s*"2026\.08\.10\.4"/);
assert.ok(manifest.requiredFiles.includes("cloud/browser/private-files.asp"));
assert.ok(manifest.requiredFiles.includes("cloud/browser/private-resource.asp"));
assert.ok(manifest.requiredFiles.includes("cloud/browser/private-files.css"));
assert.match(page, /class="private-resource-header"/);
assert.match(page, /class="private-toolbar"/);
assert.match(page, /class="private-main"/);
assert.match(page, /class="private-sidebar"/);
assert.match(page, /private-file-list <%=viewMode%>/);

console.log("Private cloud version smoke tests passed");
