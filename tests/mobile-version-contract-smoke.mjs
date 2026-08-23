import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [endpoint, manifest] = await Promise.all([
  readFile(new URL("../api/mobile-version.asp", import.meta.url), "utf8"),
  readFile(new URL("../deploy/ftp-manifest.json", import.meta.url), "utf8").then(JSON.parse),
]);

assert.match(endpoint, /ContentType\s*=\s*"application\/json"/i);
assert.match(endpoint, /Cache-Control"\s*,\s*"no-store, no-cache, must-revalidate, max-age=0"/i);
assert.match(endpoint, /deploy\/ftp-manifest\.json/i,
  "mobile updates must follow the complete deployment release, not only index.html");
assert.match(endpoint, /""releaseVersion""/i);
assert.match(endpoint, /""version""/i);
assert.match(endpoint, /""entry"":""\/""/i);
assert.doesNotMatch(endpoint, /Server\.MapPath\("\.\.\/index\.html"\)/i,
  "asset-only releases must also invalidate the Android host cache");
assert.doesNotMatch(endpoint, /password|connectionstring|authorization/i);
assert.match(manifest.releaseVersion, /^[A-Za-z0-9._-]{1,128}$/);

console.log("Mobile production version contract smoke tests passed");
