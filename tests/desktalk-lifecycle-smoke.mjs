import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../assets/js/desktalk.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

assert.match(source, /runDirectFileCommand\(v\)/);
assert.match(source, /referencedResultIndex/);
assert.match(source, /registry\.invoke\('searchFiles'/);
assert.match(source, /userConfirmed:true/);
assert.match(source, /Promise\.resolve\(inboxTick\(\)\)\.finally\(function\(\)\{ scheduleInbox\(\); \}\)/);
assert.match(source, /currentPeer\.id === pid && chat && chat\.classList\.contains\('show'\)/);
assert.match(source, /notifyIncomingMessage\(pid,m\)/);
assert.match(source, /发送失败，消息未送达；内容已放回输入框/);
assert.match(source, /\.filter\(function\(p\)\{ return !isFriend\(p\.id\) \}\)/);
assert.match(index, /pref-undiscoverable[^>]+disabled/);
assert.match(source, /（占位）开始语音/);
assert.match(source, /（占位）开始视频/);
console.log("DeskTalk lifecycle smoke tests passed");
