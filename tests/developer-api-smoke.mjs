import assert from "node:assert/strict";
import fs from "node:fs/promises";

const api = await fs.readFile(new URL("../developer_api/v1.asp", import.meta.url), "utf8");
const adminApi = await fs.readFile(
  new URL("../admin_api/developerPlatform.asp", import.meta.url), "utf8"
);
const developerPage = await fs.readFile(new URL("../developer.html", import.meta.url), "utf8");
const developerScript = await fs.readFile(
  new URL("../assets/js/developer-center.js", import.meta.url), "utf8"
);
const adminPage = await fs.readFile(
  new URL("../SystemManager/developer-platform.html", import.meta.url), "utf8"
);
const adminScript = await fs.readFile(
  new URL("../SystemManager/assets/js/developer-platform-admin.js", import.meta.url), "utf8"
);
const adminIndex = await fs.readFile(new URL("../SystemManager/index.html", import.meta.url), "utf8");
const adminPackageApi = await fs.readFile(
  new URL("../admin_api/developerPackage.asp", import.meta.url), "utf8"
);
const publicPackageApi = await fs.readFile(
  new URL("../api/function-package.asp", import.meta.url), "utf8"
);

assert.match(api, /webwindows_developers/);
assert.match(api, /webwindows_function_submissions/);
assert.match(api, /webwindows_function_packages/);
assert.match(api, /webwindows_function_ownership/);
assert.match(api, /X_WEBWINDOWS_DEVELOPER_REQUEST/);
assert.match(api, /X_WEBWINDOWS_DEVELOPER_KEY/);
assert.match(api, /SHA2\(\?,256\)/);
assert.match(api, /Base64EncodeUtf8/);
assert.match(api, /SUBMISSION_RATE_LIMIT/);
assert.match(api, /MANIFEST_INVALID/);
assert.match(api, /upload-package/);
assert.match(api, /Request\.BinaryRead/);
assert.match(api, /PACKAGE_SIGNATURE_INVALID/);
assert.match(api, /PACKAGE_INTEGRITY_MISMATCH/);
assert.match(api, /API Key 只显示这一次/);
assert.match(adminApi, /webwindows_admin/);
assert.match(adminApi, /SUBMISSION_TRANSITION_INVALID/);
assert.match(adminApi, /PACKAGE_REQUIRED/);
assert.match(adminApi, /APP_ID_OWNED/);
assert.match(adminApi, /Base64DecodeUtf8/);
assert.match(developerPage, /提交功能包/);
assert.match(developerPage, /chooseCloudPackage/);
assert.match(developerPage, /cloud-file-dialog\.js/);
assert.match(developerScript, /rotate-key/);
assert.match(developerScript, /integritySha256/);
assert.match(developerScript, /crypto\.subtle\.digest/);
assert.match(developerScript, /upload-package/);
assert.match(developerScript, /WebWindows\.fileDialog\.open/);
assert.match(developerScript, /extensions: \["zip"\]/);
assert.match(adminPage, /开发者资格/);
assert.match(adminPage, /功能提交/);
assert.match(adminScript, /发布到仓库/);
assert.match(adminScript, /catalogJson/);
assert.match(adminScript, /developerPackage\.asp/);
assert.match(adminScript, /function-package\.asp/);
assert.match(adminScript, /package-runtime\.html/);
assert.match(adminPackageApi, /Response\.BinaryWrite/);
assert.match(adminPackageApi, /webwindows_admin/);
assert.match(publicPackageApi, /s\.status='published'/);
assert.match(publicPackageApi, /Response\.BinaryWrite/);
assert.match(adminIndex, /developer-platform\.html/);

console.log("developer API smoke test passed");
