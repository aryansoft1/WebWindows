import assert from "node:assert/strict";
import fs from "node:fs/promises";

const manifest = JSON.parse(
  await fs.readFile(new URL("../data/apps/system-apps.json", import.meta.url), "utf8")
);
const page = await fs.readFile(new URL("../function-center.html", import.meta.url), "utf8");
const script = await fs.readFile(
  new URL("../assets/js/function-center.js", import.meta.url),
  "utf8"
);
const registry = await fs.readFile(
  new URL("../assets/js/app-registry.js", import.meta.url),
  "utf8"
);
const catalogApi = await fs.readFile(
  new URL("../api/function-catalog.asp", import.meta.url),
  "utf8"
);

const center = manifest.apps.find((app) => app.id === "webwindows.system.function-center");
assert.ok(center);
assert.equal(center.type, "system");
assert.equal(center.install.uninstallable, false);
assert.equal(center.placement.startMenu, true);
assert.match(page, />我的功能</);
assert.match(page, />可添加</);
assert.match(page, />系统功能</);
assert.match(page, />办公与文件</);
assert.match(page, /developerCenterEntry/);
assert.match(script, /openDeveloperCenter/);
assert.match(script, /developer\.html/);
assert.match(script, /\.install\(app\.id, \{ source: "repository" \}\)/);
assert.match(script, /\.uninstall\(app\.id, \{ retainData: true \}\)/);
assert.match(script, /程序文件、云资料和个人数据均已保留/);
assert.match(registry, /api\/function-catalog\.asp/);
assert.match(registry, /data\/apps\/system-apps\.json/);
assert.match(registry, /catalog-cache/);
assert.match(catalogApi, /data\/apps\/system-apps\.json/);

console.log("function-center smoke test passed");
