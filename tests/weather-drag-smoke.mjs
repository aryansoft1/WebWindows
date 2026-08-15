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
assert.match(source, /enableHighAccuracy:\s*true/,
  "weather location must request the device's high-accuracy provider when available");
assert.match(source, /watchPosition\(onPos/,
  "weather location must briefly refine the initial coordinate fix");
assert.match(source, /toFixed\(4\)/,
  "weather lookup must retain neighborhood-level coordinates instead of rounding to kilometers");
assert.doesNotMatch(source, /offsetLat|offsetLon/,
  "weather location must not apply a fixed correction belonging to another device");
assert.match(source, /return MAP\[code\]/,
  "Open-Meteo weather-code fallback must use the declared map");
assert.match(source, /return M\[c\]/,
  "wttr weather-code fallback must use its own declared map");
assert.match(source, /weatherLocation === '定位中\.\.\.'\) this\.weatherLocation = '当前位置'/,
  "a successful coordinate fix must finish the locating state even when reverse geocoding is unavailable");

console.log("Weather drag coordinate smoke tests passed");
