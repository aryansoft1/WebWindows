import assert from "node:assert/strict";
import fs from "node:fs/promises";

const indexSource = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
const apiSource = await fs.readFile(
  new URL("../api/function-associations.asp", import.meta.url),
  "utf8"
);
const syncSource = await fs.readFile(
  new URL("../assets/js/function-sync.js", import.meta.url),
  "utf8"
);
const desktopSource = await fs.readFile(
  new URL("../assets/js/desktop-functions.js", import.meta.url),
  "utf8"
);
const settingsSource = await fs.readFile(
  new URL("../assets/js/settings.js", import.meta.url),
  "utf8"
);

assert.match(indexSource, /function-sync\.js\?v=20260808-device-api-1/);
assert.match(apiSource, /Session\("user_id"\)/);
assert.match(apiSource, /HTTP_X_WEBWINDOWS_REQUEST/);
assert.match(apiSource, /webwindows_user_function_associations/);
assert.match(apiSource, /PRIMARY KEY \(user_id, app_id\)/);
assert.match(apiSource, /ON DUPLICATE KEY UPDATE/);
assert.doesNotMatch(apiSource, /Request\.(Form|QueryString)\("user_id"\)/i);

assert.match(syncSource, /webwindows:login/);
assert.match(syncSource, /window\.addEventListener\("online"/);
assert.match(syncSource, /syncPending/);
assert.match(syncSource, /bootstrapRemote/);
assert.match(syncSource, /credentials: "same-origin"/);
assert.match(syncSource, /X-WebWindows-Request/);

assert.match(desktopSource, /placeInFreeDesktopSlot/);
assert.match(desktopSource, /host\.querySelectorAll\("\.icon\[data-function-id\]"\)/);
assert.match(desktopSource, /wwGridSlot/);
assert.match(desktopSource, /updateIconPositionState/);
assert.match(settingsSource, /离线待同步/);
assert.match(settingsSource, /已同步/);

console.log("function-sync integration smoke test passed");
