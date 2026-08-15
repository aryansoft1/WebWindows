import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [index, main, css] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../assets/js/main.js", import.meta.url), "utf8"),
  readFile(new URL("../assets/css/main.css", import.meta.url), "utf8")
]);

assert.match(index, /<html[^>]+class="ww-boot-pending"/,
  "the desktop must be hidden before its first paint");
assert.match(css, /html\.ww-boot-pending body>header\{visibility:hidden\}/);
assert.match(main, /document\.documentElement\.classList\.remove\("ww-boot-pending"\)/);
assert.ok(main.indexOf("daysEl.appendChild(el)") < main.indexOf("await holidayMapFor(year, region.code)"),
  "calendar days must render before remote holiday data is awaited");
assert.match(main, /calendarHolidayCache/);
assert.match(main, /Promise\.all\(/);

console.log("Startup paint and instant calendar smoke tests passed");
