import assert from "node:assert/strict";
import fs from "node:fs/promises";

const publicApi = await fs.readFile(
  new URL("../api/function-catalog.asp", import.meta.url),
  "utf8"
);
const adminApi = await fs.readFile(
  new URL("../admin_api/functionCatalog.asp", import.meta.url),
  "utf8"
);
const adminPage = await fs.readFile(
  new URL("../SystemManager/functions.html", import.meta.url),
  "utf8"
);
const adminScript = await fs.readFile(
  new URL("../SystemManager/assets/js/function-catalog-admin.js", import.meta.url),
  "utf8"
);
const adminIndex = await fs.readFile(
  new URL("../SystemManager/index.html", import.meta.url),
  "utf8"
);
const registry = await fs.readFile(
  new URL("../assets/js/app-registry.js", import.meta.url),
  "utf8"
);

assert.match(publicApi, /webwindows_function_catalog_versions/);
assert.match(publicApi, /WHERE is_active=1/);
assert.match(publicApi, /ReadCatalogFile/);
assert.match(publicApi, /SeedCatalog/);
assert.match(publicApi, /ValidCatalog/);
assert.match(publicApi, /Base64EncodeUtf8/);
assert.match(publicApi, /Base64DecodeUtf8/);
assert.match(publicApi, /storage_encoding/);
assert.match(adminApi, /Session\("username"\)/);
assert.match(adminApi, /adminName <> "admin"/);
assert.match(adminApi, /HTTP_X_WEBWINDOWS_ADMIN_REQUEST/);
assert.match(adminApi, /BeginTrans/);
assert.match(adminApi, /CommitTrans/);
assert.match(adminApi, /RollbackTrans/);
assert.match(adminPage, /功能仓库管理/);
assert.match(adminPage, /系统功能/);
assert.match(adminPage, /默认预装/);
assert.match(adminPage, /普通可添加/);
assert.match(adminPage, /高级定义 JSON/);
assert.match(adminScript, /X-WebWindows-Admin-Request/);
assert.match(adminScript, /catalogJson/);
assert.match(adminScript, /程序文件不会被删除/);
assert.match(adminIndex, /functions\.html/);
assert.match(registry, /catalog\?\.status !== "disabled"/);
assert.match(registry, /reloadRegistry/);

console.log("function-catalog admin smoke test passed");
