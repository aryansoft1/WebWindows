import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [catalogSource, desktopSource, menuSource, registrySource, windowSource, indexSource, feature] = await Promise.all([
  read("data/apps/system-apps.json"),
  read("assets/js/desktop-functions.js"),
  read("assets/js/start-menu-functions.js"),
  read("assets/js/app-registry.js"),
  read("webwindows-vue/src/stores/legacyWindow.js"),
  read("index.html"),
  read("data/config/runtime-features-v1.json").then(JSON.parse),
]);

const catalog = JSON.parse(catalogSource);
const studioEntries = catalog.apps.filter((app) => app.id === "webwindows.system.developer-studio");
assert.equal(studioEntries.length, 1, "Developer Studio must have exactly one system catalog entry");

const studio = studioEntries[0];
assert.equal(studio.type, "system");
assert.deepEqual(studio.legacyIds, ["developer-studio"]);
assert.equal(studio.entry, "developer-studio.html?v=20260829-1");
assert.equal(studio.icon, "assets/icons/code.svg");
assert.equal(studio.install.defaultState, "installed");
assert.equal(studio.install.uninstallable, false);
assert.equal(studio.placement.desktop, true);
assert.equal(studio.placement.startMenu, true);
assert.equal(studio.placement.startMenuGroup, "system");
assert.equal(studio.window.singleton, true);

assert.deepEqual(
  catalog.apps.filter((app) => app.placement?.desktop).map((app) => app.id),
  [
    "webwindows.system.developer-studio",
    "com.aryansoft.webwindows.news",
    "com.aryansoft.webwindows.sheet",
    "com.aryansoft.webwindows.write",
    "com.aryansoft.webwindows.slide",
  ],
  "the Studio placement must not change other default desktop entries",
);

assert.match(desktopSource, /const catalog = await api\.listCatalog\(\)/);
assert.match(desktopSource, /const visible = await api\.isDesktopVisible\(app\)/);
assert.match(desktopSource, /image\.src = app\.icon/);
assert.match(desktopSource, /label\.textContent = app\.name/);
assert.match(desktopSource, /await registry\(\)\.launch\(app\.id\)/);
assert.doesNotMatch(desktopSource, /webwindows\.system\.developer-studio|developer-studio\.html/,
  "desktop code must not duplicate Studio catalog metadata");

assert.match(menuSource, /app\.placement\?\.startMenu/);
assert.match(menuSource, /await registry\(\)\.launch\(app\.id\)/);
assert.doesNotMatch(menuSource, /webwindows\.system\.developer-studio|developer-studio\.html/,
  "Start menu code must continue to consume the common catalog");

assert.match(registrySource, /const instanceId = launchContext\.instanceId \|\| legacyIdFor\(app\)/);
assert.match(registrySource, /const title = launchContext\.title \|\| app\.name/);
assert.match(registrySource, /const url = launchContext\.url \|\| app\.entry/);
assert.match(registrySource, /app\.type === "system" \|\| app\.install\?\.uninstallable === false/);
assert.match(registrySource, /throw new Error\(`\$\{app\.name\} 是受保护的系统应用，不能卸载。`\)/);
assert.match(windowSource, /const existing = _winEl\(id\)/);
assert.match(windowSource, /if \(existing\)\{ existing\.style\.display=''; focusTargetWindow\(existing\)/);

assert.match(indexSource, /start-menu-functions\.js/);
assert.match(indexSource, /desktop-functions\.js/);
assert.equal(feature.productionCapabilityBrokerV1, false);

console.log("Developer Studio default desktop and existing Start menu entry smoke test passed (gate false).");
