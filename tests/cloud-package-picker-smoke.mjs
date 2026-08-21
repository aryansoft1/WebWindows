import assert from "node:assert/strict";
import fs from "node:fs/promises";

const page = await fs.readFile(
  new URL("../cloud/browser/files.asp", import.meta.url), "utf8"
);
const script = await fs.readFile(
  new URL("../cloud/browser/toolbar.js", import.meta.url), "utf8"
);
const style = await fs.readFile(
  new URL("../cloud/browser/styles.css", import.meta.url), "utf8"
);
const resourceApi = await fs.readFile(
  new URL("../cloud/browser/openResource.asp", import.meta.url), "utf8"
);
const privatePage = await fs.readFile(
  new URL("../cloud/browser/private-files.asp", import.meta.url), "utf8"
);
const privateApi = await fs.readFile(
  new URL("../cloud/browser/private-resource.asp", import.meta.url), "utf8"
);
const developerScript = await fs.readFile(
  new URL("../assets/js/developer-center.js", import.meta.url), "utf8"
);
const dialogApi = await fs.readFile(
  new URL("../assets/js/cloud-file-dialog.js", import.meta.url), "utf8"
);

assert.match(page, /mode.*picker/i);
assert.match(page, /NormalizePickerAccept/);
assert.match(page, /IsValidPickerPurpose/);
assert.match(page, /data-picker-eligible/);
assert.match(page, /data-node-id/);
assert.match(page, /picker-confirm/);
assert.match(page, /picker-cancel/);
assert.match(script, /webwindows:cloud-resource-selected/);
assert.match(script, /webwindows:cloud-resource-picker-cancelled/);
assert.match(script, /readUrl\.searchParams\.set\("raw", "1"\)/);
assert.match(script, /readUrl\.origin !== window\.location\.origin/);
assert.match(script, /window\.parent\.postMessage\(message, window\.location\.origin\)/);
assert.match(style, /\.picker-bar/);
assert.match(style, /\.picker-mode \.file-item\.file\[disabled\]/);
assert.match(resourceApi, /rawRequested/);
assert.doesNotMatch(resourceApi, /PICKER_TYPE_NOT_ALLOWED/);
assert.match(resourceApi, /Cache-Control.*private, no-store/);
assert.match(privatePage, /PickerAccepts/);
assert.match(privatePage, /webwindows:cloud-resource-selected/);
assert.match(privatePage, /webwindows:cloud-resource-picker-cancelled/);
assert.match(privatePage, /parent\.postMessage\(message, location\.origin\)/);
assert.match(privatePage, /extension = "zip"/);
assert.match(privateApi, /ElseIf extension = "zip"/);
assert.match(privateApi, /Session\("user_id"\)/);
assert.match(developerScript, /readUrl\.pathname\.startsWith\("\/cloud\/"\)/);
assert.match(developerScript, /WebWindows\.fileDialog\.open/);
assert.match(developerScript, /extensions: \["zip"\]/);
assert.match(dialogApi, /requestId/);
assert.match(dialogApi, /event\.origin !== ORIGIN/);

console.log("cloud package picker smoke test passed");
