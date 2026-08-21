import assert from "node:assert/strict";
import fs from "node:fs/promises";

const manifest = JSON.parse(
  await fs.readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8")
);
const indexSource = await fs.readFile(
  new URL("../index.html", import.meta.url),
  "utf8"
);
const menuSource = await fs.readFile(
  new URL("../assets/js/start-menu-functions.js", import.meta.url),
  "utf8"
);

const visible = manifest.apps.filter((app) => app.placement?.startMenu);
const systemFunctions = visible.filter(
  (app) => app.type === "system" || app.install?.uninstallable === false
);
const userFunctions = visible.filter(
  (app) => app.type !== "system" && app.install?.uninstallable !== false
);

assert.deepEqual(
  systemFunctions.map((app) => app.name),
  ["云资料", "设置", "系统信息", "功能中心", "云秘书", "讯筒", "认识我", "使用向导", "新闻中心"]
);
assert.deepEqual(
  userFunctions.map((app) => app.name),
  ["傲映(APlay)", "Dreama", "Sheet Editor", "Write Editor", "Slide Editor"]
);
assert.ok(systemFunctions.every((app) => app.install.uninstallable === false));
assert.ok(userFunctions.every((app) => app.install.uninstallable === true));
assert.match(indexSource, /id="start-menu-functions"/);
assert.match(indexSource, /id="start-menu-static-fallback"/);
assert.match(indexSource, /start-menu-functions\.js/);
assert.match(menuSource, /系统功能/);
assert.match(menuSource, /我的功能/);
assert.match(menuSource, /全部功能/);
assert.match(menuSource, /系统组件/);
assert.match(menuSource, /可移除/);

console.log("function-menu smoke test passed");
