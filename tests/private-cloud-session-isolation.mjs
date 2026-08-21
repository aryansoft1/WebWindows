import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  login: await readFile(new URL("../api/login.asp", import.meta.url), "utf8"),
  picker: await readFile(new URL("../cloud/browser/private-files.asp", import.meta.url), "utf8"),
  resource: await readFile(new URL("../cloud/browser/private-resource.asp", import.meta.url), "utf8"),
  admin: await readFile(new URL("../admin_api/adminAuth.asp", import.meta.url), "utf8")
};

for (const key of ["webwindows_user_id", "webwindows_username", "webwindows_nickname"]) {
  assert.match(files.login, new RegExp(`Session\\("${key}"\\)\\s*=`),
    `WebWindows login must establish ${key}`);
}

for (const source of [files.picker, files.resource]) {
  assert.match(source, /Session\("webwindows_user_id"\)/,
    "private cloud must read the isolated WebWindows user id");
  assert.match(source, /Session\("webwindows_username"\)/,
    "private cloud must read the isolated WebWindows username");
  assert.match(source, /Not \(Session\("webwindows_admin"\) = True\)/,
    "legacy session migration must be disabled during an admin session");
  assert.match(source, /Request\.Cookies\("webwindows_user"\)/,
    "legacy migration must require the WebWindows login cookie");
  assert.match(source, /StrComp\(webWindowsCookieUsername,[\s\S]*Session\("username"\)/,
    "legacy migration must match the signed-in WebWindows username");
}

assert.match(files.admin, /Session\("username"\)\s*=/,
  "test fixture must retain the known legacy admin-session collision");
assert.doesNotMatch(files.admin, /Session\("webwindows_username"\)\s*=/,
  "admin login must not overwrite the isolated WebWindows identity");

console.log("private cloud session isolation test passed");
