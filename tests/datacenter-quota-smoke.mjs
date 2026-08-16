import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [migration, quotaApi, getDatacenters, saveDatacenter, deleteDatacenter, managerHtml, managerJs, privateResource] = await Promise.all([
  read("database/migrations/20260814_add_datacenter_user_quota.sql"),
  read("api/storage-quota.asp"),
  read("admin_api/getDatacenters.asp"),
  read("admin_api/saveDatacenter.asp"),
  read("admin_api/deleteDatacenter.asp"),
  read("SystemManager/datacenter.html"),
  read("SystemManager/assets/js/datacenter.js"),
  read("cloud/browser/private-resource.asp"),
]);

assert.match(migration, /user_quota_mb INT UNSIGNED NOT NULL DEFAULT 1024/i);
assert.match(quotaApi, /Session\("webwindows_user_id"\)/i);
assert.match(quotaApi, /u\.data_center_id\s*=\s*d\.id/i);
assert.match(quotaApi, /WHERE u\.id=\? LIMIT 1/i);
assert.doesNotMatch(quotaApi, /WHERE u\.id=\? AND u\.username=\?/i,
  "the authenticated session id is authoritative and must survive legacy username session differences");
assert.match(quotaApi, /1024 AS user_quota_mb/i);
assert.match(quotaApi, /storageStatus"":""unauthenticated/i);
assert.match(quotaApi, /quota-lookup-failed/i);
assert.match(quotaApi, /stats-failed/i);
assert.match(quotaApi, /InStr\(raw, """"\) > 0/i,
  "the Classic ASP path guard must encode a literal quote with four quotes");
assert.match(getDatacenters, /SHOW COLUMNS FROM webwindows_datacenters LIKE 'user_quota_mb'/i);
assert.match(getDatacenters, /1024 AS user_quota_mb/i);
assert.match(saveDatacenter, /RequireAdminMutation "datacenter-quota"/i);
assert.match(deleteDatacenter, /RequireAdminMutation "datacenter-quota"/i);
assert.match(saveDatacenter, /CDbl\(quotaRaw\) < 1024/i);
assert.match(saveDatacenter, /MIGRATION_REQUIRED/i);
assert.match(managerHtml, /id="centerQuotaGB"/i);
assert.match(managerJs, /user_quota_mb/i);
assert.match(managerJs, /X-WebWindows-Admin-Request/i);
assert.match(privateResource, /QUOTA_EXCEEDED/i);
assert.match(privateResource, /CurrentUserQuotaMB/i);

console.log("Data center quota smoke tests passed");
