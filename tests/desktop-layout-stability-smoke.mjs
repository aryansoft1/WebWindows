import assert from "node:assert/strict";
import fs from "node:fs/promises";

const manager = await fs.readFile(new URL("../webwindows-vue/src/desktop/WindowManager.vue", import.meta.url), "utf8");
const functions = await fs.readFile(new URL("../assets/js/desktop-functions.js", import.meta.url), "utf8");

assert.match(manager, /normalizeDesktopIconLayout\(forceDomOrder = false, persist = false\)/);
assert.match(manager, /if \(persist\) writeIconPositions\(normalizedPositions\)/);
assert.match(manager, /entries\.sort\([^\n]+Boolean\(b\.saved\)[^\n]+Boolean\(a\.saved\)/);
assert.match(manager, /persistCurrentDesktopLayout\(desktop\)/);
assert.match(manager, /ResizeObserver\(handleDesktopLayoutResize\)/);
assert.match(manager, /requestAnimationFrame\(\(\) => requestAnimationFrame\(resolve\)\)/);
assert.match(manager, /visualViewport\?\.addEventListener\('resize', handleDesktopLayoutResize\)/);
assert.match(manager, /webwindows\.debug\.desktopLayout/);
assert.doesNotMatch(functions, /localStorage\.setItem\([^\n]*iconPositions/);
assert.match(functions, /window\.updateIconPositionState\?\.\(element\.id, x, y\)/);

console.log("desktop layout stability smoke tests passed");
