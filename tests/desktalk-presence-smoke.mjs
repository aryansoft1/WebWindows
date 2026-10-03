// Regression guard for the DeskTalk online list.
//
// Production symptom (2026.09.26): 推荐/好友 lists were permanently empty even
// though users were online at the same time.
//
// Root cause: api/dt_presence_mem.asp binds a presence record to
// Session("webwindows_user_id") and, when there is no session, accepts only a
// query id that starts with "guest_". The client was
//   (a) publishing ?u=<nickname>  (a nickname never starts with guest_), and
//   (b) sending credentials:'omit' (so the ASP session cookie never travelled).
// Both together meant no record was ever written, so the list was always empty.
//
// These assertions pin the client side of that contract so it cannot regress.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../assets/js/desktalk.js", import.meta.url), "utf8");
const presenceApi = await readFile(new URL("../api/dt_presence_mem.asp", import.meta.url), "utf8");

// --- 1. heartbeat must publish the stable id, nickname only as display data ---
assert.match(source,
  /dt_presence_mem\.asp\?u=' \+ encodeURIComponent\(pid\)/,
  "presence heartbeat must publish the stable account id, not the nickname");
assert.match(source,
  /\+ '&name=' \+ encodeURIComponent\(me\.name \|\| pid\)/,
  "the nickname may only travel as display metadata");
assert.doesNotMatch(source,
  /dt_presence_mem\.asp\?u=' \+ encodeURIComponent\(me\.name\)/,
  "publishing the nickname as the presence id silently disables the online list");

// --- 2. heartbeat must send the same-origin session cookie -------------------
const heartbeat = source.match(/\/\* === 在线心跳 === \*\/[\s\S]*?\}catch\s*\(\s*e\s*\)\s*\{\s*\}/)?.[0];
assert.ok(heartbeat, "the heartbeat block must be extractable");
assert.match(heartbeat, /credentials: 'include'/,
  "the heartbeat must send the ASP session cookie, otherwise signed-in users are dropped server-side");
assert.doesNotMatch(heartbeat, /credentials: 'omit'/,
  "credentials:'omit' strips the session cookie the presence API authenticates with");

// --- 3. the list poll must use the same identity + cookie -------------------
const listFetch = source.match(/async function fetchPresenceList\(\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(listFetch, "fetchPresenceList must be extractable");
assert.match(listFetch, /list=1&u=' \+ encodeURIComponent\(me\.id \|\| ''\)/,
  "the presence poll must identify the caller so the server can echo it");
assert.doesNotMatch(listFetch, /credentials: 'omit'/,
  "the presence poll must not drop the session cookie either");

// --- 4. server contract the client depends on (guards the reverse merge) -----
assert.match(presenceApi, /Session\("webwindows_user_id"\)/,
  "the presence API must bind signed-in heartbeats to the authenticated account id");
assert.match(presenceApi, /LCase\(Left\(u,6\)\)<>"guest_"/,
  "without a session the presence API must only accept guest_-prefixed ids");

// --- 5. legacy nickname-keyed friends must be re-keyed, not lost ------------
assert.match(source, /function migrateLegacyFriendIds\(\)/);
assert.match(source, /migrateLegacyFriendIds\(\);\s*\n\s*renderAll\(\)/,
  "the friend-id migration must run before the list is rendered");
const migration = source.match(/function migrateLegacyFriendIds\(\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(migration, "migrateLegacyFriendIds must be extractable");
assert.match(migration, /byName\.has\(k\) \? null : p/,
  "an ambiguous display name must block the migration instead of merging two people");

console.log("DeskTalk presence smoke tests passed");
