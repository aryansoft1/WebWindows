import assert from "node:assert/strict";
import fs from "node:fs/promises";

const loginPage = await fs.readFile(new URL("../SystemManager/login.html", import.meta.url), "utf8");
const loginScript = await fs.readFile(
  new URL("../SystemManager/assets/js/admin-login.js", import.meta.url), "utf8"
);
const shellScript = await fs.readFile(
  new URL("../SystemManager/assets/js/admin-shell.js", import.meta.url), "utf8"
);
const securityScript = await fs.readFile(
  new URL("../SystemManager/assets/js/admin-security.js", import.meta.url), "utf8"
);
const authApi = await fs.readFile(new URL("../admin_api/adminAuth.asp", import.meta.url), "utf8");
const catalogApi = await fs.readFile(
  new URL("../admin_api/functionCatalog.asp", import.meta.url), "utf8"
);
const adminIndex = await fs.readFile(new URL("../SystemManager/index.html", import.meta.url), "utf8");

assert.doesNotMatch(loginPage, /captcha\.jpg/);
assert.match(loginPage, /id="adminLoginForm"/);
assert.match(loginPage, /id="captchaQuestion"/);
assert.match(loginScript, /request\("captcha"\)/);
assert.match(loginScript, /body\.set\("password", passwordRaw\)/);
assert.doesNotMatch(loginPage, /blueimp-md5|cdn\.jsdelivr\.net/);
assert.match(loginScript, /credentials: "same-origin"/);
assert.match(authApi, /Session\("admin_captcha_answer"\)/);
assert.match(authApi, /DateDiff\("n"/);
assert.match(authApi, /Session\("webwindows_admin"\) = True/);
assert.match(authApi, /username <> "admin"/);
assert.match(authApi, /WHERE username=\? AND password=MD5\(\?\)/);
assert.match(securityScript, /action=status/);
assert.match(securityScript, /X-WebWindows-CSRF/);
assert.match(shellScript, /WebWindowsAdminSecurity\.ready/);
assert.match(shellScript, /adminLogout/);
assert.match(adminIndex, /admin-shell\.js/);
assert.match(catalogApi, /Session\("webwindows_admin"\) <> True/);

console.log("admin auth smoke test passed");
