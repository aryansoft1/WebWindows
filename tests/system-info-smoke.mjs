import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../sysinfo.html", import.meta.url), "utf8");
const client = await readFile(new URL("../assets/js/sysinfo.js", import.meta.url), "utf8");
const i18n = await readFile(new URL("../assets/js/tw.js", import.meta.url), "utf8");
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
assert.match(html, /tw\.js\?v=20260819-sysinfo-i18n-1/);
assert.match(html, /sysinfo\.js\?v=20260819-sysinfo-i18n-1/);
assert.match(html, /sysinfo\.css\?v=20260814-quota-1/);
const catalog = JSON.parse(await readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8"));
const sysinfoApp = catalog.apps.find((app) => app.id === "webwindows.system.info");
assert.match(sysinfoApp?.entry || "", /sysinfo\.html\?v=20260819-i18n-5/,
  "the system information app must reopen with the shared language layer");
assert.match(client, /WebWindowsI18n\?\.getLocale/,
  "dates must use the WebWindows locale instead of the browser default");
assert.match(client, /selectedLanguageLabel\(\)/);
assert.doesNotMatch(client, /setText\("language", navigator\.language/,
  "the displayed language must reflect WebWindows settings");
assert.match(client, /document\.addEventListener\("DOMContentLoaded", start/,
  "system information must wait for the shared language layer before its first render");
assert.match(client, /webwindows:language-changed/,
  "the language field must follow live WebWindows language changes");
for (const expectedTranslation of [
  '"设备与能力": "デバイスと機能"',
  '"服务节点": "サービスノード"',
  '"版本与构建": "バージョンとビルド"',
  '"总配额：": "合計割り当て："',
  '"设备与能力": "Device & Capabilities"',
  '"服务节点": "服務節點"',
]) assert.ok(i18n.includes(expectedTranslation), `missing system-information translation: ${expectedTranslation}`);
assert.match(client, /setInterval\(\(\) => \{ refreshHost\(\); refreshStorage\(\); \}, 30000\)/);
assert.match(client, /api\/storage-quota\.asp/);
assert.match(client, /refreshStorage/);
assert.match(client, /data\.remainingMB/);
assert.doesNotMatch(client, /setInterval\(refreshData,\s*1000\)/);
assert.doesNotMatch(server, /diskTotal\s*=\s*1229/i);
assert.doesNotMatch(server, /username\s*=\s*"admin"/i);
assert.match(server, /"""scope"":""service-node""/);
console.log("System info smoke tests passed");
