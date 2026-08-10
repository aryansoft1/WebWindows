import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../webwindows-vue/src/desktop/weather.vue", import.meta.url), "utf8");

assert.match(source, /e\.currentTarget\.getBoundingClientRect\(\)/,
  "weather drag must anchor to the widget rectangle before switching from right to left positioning");
assert.match(source, /e\.clientX - rect\.left/);
assert.match(source, /this\.moveTo\(e\.clientX, e\.clientY, this\.dragOffset\)/);
assert.doesNotMatch(source, /e\.offsetX|e\.offsetY|e\.pageX|e\.pageY/,
  "weather drag must not mix child offsets, page coordinates, and viewport positioning");
assert.match(source, /Math\.min\(window\.innerWidth - width/,
  "weather drag must remain inside the visible desktop");

console.log("Weather drag coordinate smoke tests passed");
