import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [sysinfo, page, endpoint] = await Promise.all([
  readFile(new URL("../assets/js/sysinfo.js", import.meta.url), "utf8"),
  readFile(new URL("../sysinfo.html", import.meta.url), "utf8"),
  readFile(new URL("../api/release-version.asp", import.meta.url), "utf8"),
]);

assert.match(sysinfo, /ONLINE_RELEASE_URL = "https:\/\/www\.y0\.hk\/api\/release-version\.asp"/);
assert.match(sysinfo, /sources = \["deploy\/ftp-manifest\.json", ONLINE_RELEASE_URL \+ "\?v=" \+ Date\.now\(\)\]/,
  "system information must try its current origin before the official online fallback");
assert.match(sysinfo, /credentials: sameOrigin \? "same-origin" : "omit"/,
  "the public version fallback must never transmit Android Host credentials");
assert.match(sysinfo, /AbortController[\s\S]*10000/,
  "an unavailable local manifest must not block the online fallback indefinitely");
assert.match(page, /sysinfo\.js\?v=20260823-online-release-1/);
assert.match(endpoint, /Access-Control-Allow-Origin"\s*,\s*"\*"/,
  "the read-only release endpoint must be accessible to local Android/appassets origins");
assert.match(endpoint, /deploy\/ftp-manifest\.json/);
assert.doesNotMatch(endpoint, /Session\(|Request\.(Form|Cookies)|Authorization/i,
  "the public endpoint must expose only release metadata and require no user state");

console.log("System information online release smoke tests passed");
