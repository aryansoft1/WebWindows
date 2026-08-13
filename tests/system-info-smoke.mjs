import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../sysinfo.html", import.meta.url), "utf8");
const client = await readFile(new URL("../assets/js/sysinfo.js", import.meta.url), "utf8");
const server = await readFile(new URL("../inc/sysinfo.asp", import.meta.url), "utf8");

assert.doesNotMatch(html, /WebWindows V2/);
assert.match(html, /服务节点/);
assert.match(html, /userStorageRemaining/);
assert.match(html, /userStorageBar/);
assert.match(html, /用户空间按账号所属数据中心分配/);
assert.match(client, /deploy\/ftp-manifest\.json/);
assert.match(client, /getCapabilities/);
assert.match(client, /function activateTab/);
assert.match(client, /aria-selected/);
assert.match(html, /sysinfo\.js\?v=20260814-quota-1/);
assert.match(html, /sysinfo\.css\?v=20260814-quota-1/);
assert.match(client, /setInterval\(\(\) => \{ refreshHost\(\); refreshStorage\(\); \}, 30000\)/);
assert.match(client, /api\/storage-quota\.asp/);
assert.match(client, /refreshStorage/);
assert.match(client, /data\.remainingMB/);
assert.doesNotMatch(client, /setInterval\(refreshData,\s*1000\)/);
assert.doesNotMatch(server, /diskTotal\s*=\s*1229/i);
assert.doesNotMatch(server, /username\s*=\s*"admin"/i);
assert.match(server, /"""scope"":""service-node""/);
console.log("System info smoke tests passed");
