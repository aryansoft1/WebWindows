import assert from "node:assert/strict";
import fs from "node:fs/promises";

const indexSource = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
const settingsSource = await fs.readFile(new URL("../settings.html", import.meta.url), "utf8");
const settingsScript = await fs.readFile(
  new URL("../assets/js/settings.js", import.meta.url),
  "utf8"
);
const desktopScript = await fs.readFile(
  new URL("../assets/js/desktop-functions.js", import.meta.url),
  "utf8"
);

assert.match(indexSource, /desktop-functions\.js/);
for (const appId of [
  "com.aryansoft.webwindows.news",
  "com.aryansoft.webwindows.sheet",
  "com.aryansoft.webwindows.write",
  "com.aryansoft.webwindows.slide"
]) {
  assert.match(indexSource, new RegExp(`data-function-id="${appId.replace(/\./g, "\\.")}"`));
}

assert.match(settingsSource, />功能管理</);
assert.match(settingsSource, /不会删除服务器程序文件或云资料/);
assert.match(settingsSource, /id="functionRemoveDialog"/);
assert.match(settingsScript, /\.uninstall\(app\.id, \{ retainData: true \}\)/);
assert.match(settingsScript, /\.setDesktopVisible\(app\.id, checkbox\.checked\)/);
assert.match(settingsScript, /程序文件和个人数据均已保留/);
assert.match(desktopScript, /webwindows:installation-changed/);
assert.match(desktopScript, /isDesktopVisible/);

console.log("function-management smoke test passed");
