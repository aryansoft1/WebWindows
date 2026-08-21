import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (relative) =>
  fs.readFile(new URL(`../${relative}`, import.meta.url), "utf8");

const [
  index,
  settings,
  settingsScript,
  deviceApi,
  connectivity,
  main,
  sheet,
  cloudPage,
  cloudToolbar,
  cloudConfig,
  wallpaper
] = await Promise.all([
  read("index.html"),
  read("settings.html"),
  read("assets/js/settings.js"),
  read("assets/js/device-api.js"),
  read("assets/js/connectivity.js"),
  read("assets/js/main.js"),
  read("worker_SheetCreater.html"),
  read("cloud/browser/files.asp"),
  read("cloud/browser/toolbar.js"),
  read("cloud/browser/node-config.asp"),
  read("assets/js/wallpaper.js")
]);

assert.match(settings, /data-settings-tab="networkTab"/);
assert.match(settings, /<img class="settings-nav-icon"/);
assert.doesNotMatch(settings, /<span class="settings-nav-icon">/);
assert.doesNotMatch(settings, /浏览器能力边界/);
assert.doesNotMatch(settings, /id="bluetoothTab"/);
assert.doesNotMatch(settingsScript, /navigator\.bluetooth/);
assert.match(settingsScript, /webwindows:region-changed/);
assert.match(settingsScript, /Asia\/Tokyo/);

assert.match(index, /id="ww-wifi-indicator"/);
assert.match(index, /id="ww-cellular-indicator"/);
assert.match(index, /id="ww-ethernet-indicator"/);
assert.match(index, /assets\/js\/connectivity\.js/);
assert.match(deviceApi, /navigator\.connection/);
assert.match(connectivity, /device\?\.network\.getState/);
assert.match(connectivity, /connectionKind/);
assert.match(connectivity, /isMobileDevice/);
assert.match(connectivity, /indicator\.hidden/);

assert.match(main, /getElementById\('calendar-popup'\)/);
assert.doesNotMatch(main, /getElementById\('calendar'\)/);
assert.match(main, /timeZone: region\.timeZone/);
assert.match(main, /webwindows:region-changed/);

assert.match(sheet, /showinfobar:\s*false/);

assert.match(cloudToolbar, /window\.parent\?\.WebWindows\?\.fileDialog/);
assert.match(cloudPage, /data-context-action="set-wallpaper"/);
assert.match(cloudPage, /data-context-action="save-wallpaper"/);
assert.match(cloudToolbar, /webwindows\.wallpaper\.library\.v1/);
assert.match(wallpaper, /renderWallpaperLibrary/);
assert.match(cloudConfig, /Function CloudDisplayFileName/);
assert.match(cloudPage, /CloudDisplayFileName\(fileItem\.Name, language\)/);
assert.match(cloudToolbar, /welcome_to_webwindows\.docx/);
assert.match(cloudToolbar, /フィードバックとコミュニティ/);

console.log("settings, cloud and connectivity smoke test passed");
