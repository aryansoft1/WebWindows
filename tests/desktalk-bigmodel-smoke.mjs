import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const proxy = read("cloud/desktalk/chatproxy.asp");
const client = read("assets/js/desktalk.js");
const testClient = read("cloud/desktalk/testdesktalk.html");

for (const source of [client, testClient]) {
  assert.match(source, /AI_MODEL\s*=\s*['"]glm-4\.7-flash['"]/);
  assert.match(source, /AI_API_URL\s*=\s*['"](?:\/cloud\/desktalk\/)?chatproxy\.asp['"]/);
  assert.doesNotMatch(source, /BIGMODEL_API_KEY|Authorization\s*:/i);
  assert.doesNotMatch(source, /hunyuan|tencent/i);
}

assert.match(proxy, /https:\/\/open\.bigmodel\.cn\/api\/paas\/v4\/chat\/completions/);
assert.match(proxy, /Const API_MODEL = "glm-4\.7-flash"/);
assert.match(proxy, /Const API_KEY_ENV = "BIGMODEL_API_KEY"/);
assert.match(proxy, /GetServerSecret\(API_KEY_ENV\)/);
assert.match(proxy, /http\.setRequestHeader "Authorization", "Bearer " & apiKey/);
assert.match(proxy, /requestBody = ForceModel\(requestBody, API_MODEL\)/);
assert.doesNotMatch(proxy, /hunyuan|tencent/i);
assert.doesNotMatch(proxy, /If Len\(apiKey\)\s*=\s*0 Then apiKey\s*=/i);

function forceModel(json, model) {
  if (/"model"\s*:\s*"[^"]*"/i.test(json)) {
    return json.replace(/("model"\s*:\s*")[^"]*(")/i, `$1${model}$2`);
  }
  const trimmed = json.trim();
  return trimmed.startsWith("{") ? `{"model":"${model}",${trimmed.slice(1)}` : json;
}

assert.equal(forceModel('{"model":"hunyuan-lite","messages":[]}', "glm-4.7-flash"), '{"model":"glm-4.7-flash","messages":[]}');
assert.equal(forceModel('{"messages":[]}', "glm-4.7-flash"), '{"model":"glm-4.7-flash","messages":[]}');

console.log("DeskTalk BigModel server smoke test passed");
