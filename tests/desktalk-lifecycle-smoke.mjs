import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../assets/js/desktalk.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../assets/css/desktalk.css", import.meta.url), "utf8");

assert.match(source, /runDirectFileCommand\(v\)/);
assert.match(source, /referencedResultIndex/);
assert.match(source, /registry\.invoke\('searchFiles'/);
assert.match(source, /userConfirmed:true/);
assert.match(source, /Promise\.resolve\(inboxTick\(\)\)\.finally\(function\(\)\{ scheduleInbox\(\); \}\)/);
assert.match(source, /currentPeer\.id === pid && chat && chat\.classList\.contains\('show'\)/);
assert.match(source, /notifyIncomingMessage\(pid,m\)/);
assert.match(source, /CONV_ID = await resolveConvIdFor\(currentPeer\)/,
  "foreground chat and background notifications must resolve the same conversation bucket");
assert.match(source, /var convId = await resolveConvIdFor\(peer\)/,
  "background inbox polling must use the shared conversation resolver");
assert.match(source, /hasOwnProperty\.call\(CONV_TS, convId\)/,
  "presence refreshes must not reset an existing inbox baseline and swallow messages");
assert.doesNotMatch(source, /ids\.slice\(0,10\)\.map\(pollOne\)/,
  "contacts after the first ten must still receive notifications");
assert.match(source, /INBOX_FAST\s*=\s*3000/);
assert.match(source, /INBOX_SLOW\s*=\s*6000/);
assert.match(source, /发送失败，消息未送达；内容已放回输入框/);
assert.match(source, /\.filter\(function\(p\)\{ return !isFriend\(p\.id\) \}\)/);
assert.match(index, /pref-undiscoverable[^>]+disabled/);
assert.match(source, /（占位）开始语音/);
assert.match(source, /（占位）开始视频/);
assert.match(source, /webwindows:logout[^\n]+syncDeskTalkIdentity\(true\)/,
  "logout must replace the signed-in DeskTalk profile with a guest profile");
assert.match(source, /String\(me\.id\|\|''\)\.indexOf\('guest_'\)!==0/,
  "anonymous mode must never retain the previous signed-in identity");
assert.match(source, /\(t==='ai'\) \? 'flex' : 'none'/,
  "the AI tab must participate in the remaining-height flex layout");
assert.match(index, /id="ai-composer"/);
assert.match(css, /#ai-body\{[^}]*flex:1 1 auto[^}]*min-height:0[^}]*max-height:none!important/s,
  "AI history must stretch to the composer instead of staying at the top");
assert.match(css, /#ai-composer\{[^}]*flex:0 0 auto/s,
  "AI composer must remain pinned below the stretching history");
assert.match(css, /#tab-ai \.bubble img\{[^}]*max-width:100%/s,
  "sanitized Markdown image output must fit the DeskTalk panel");
console.log("DeskTalk lifecycle smoke tests passed");
