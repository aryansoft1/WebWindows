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
  assert.match(source, /AI_MODEL\s*=\s*['"]openai\/gpt-oss-120b['"]/);
  assert.match(source, /AI_API_URL\s*=\s*['"](?:\/cloud\/desktalk\/)?chatproxy\.asp['"]/);
  assert.doesNotMatch(source, /BIGMODEL_API_KEY|GROQ_API_KEY|Authorization\s*:/i);
  assert.doesNotMatch(source, /hunyuan|tencent/i);
}

assert.match(proxy, /https:\/\/api\.groq\.com\/openai\/v1\/chat\/completions/);
assert.match(proxy, /Const API_MODEL = "openai\/gpt-oss-120b"/);
assert.match(proxy, /Const API_KEY_ENV = "GROQ_API_KEY"/);
assert.match(proxy, /GetServerSecret\(API_KEY_ENV\)/);
assert.match(proxy, /http\.setRequestHeader "Authorization", "Bearer " & apiKey/);
assert.match(proxy, /requestBody = StripUnsupportedParams\(requestBody\)/);
assert.match(proxy, /requestBody = ForceModel\(requestBody, API_MODEL\)/);
assert.match(proxy, /http\.setTimeouts 10000, 10000, 30000, 120000/);
assert.match(proxy, /Server\.ScriptTimeout = 180/);
assert.doesNotMatch(proxy, /open\.bigmodel\.cn|glm-4\.7-flash|hunyuan|tencent/i);
assert.doesNotMatch(proxy, /If Len\(apiKey\)\s*=\s*0 Then apiKey\s*=/i);

assert.match(client, /max_completion_tokens:\s*1200/);
assert.match(client, /reasoning_effort:\s*['"]low['"]/);
assert.doesNotMatch(client, /thinking\s*:\s*\{/);
assert.match(client, /status === 413/);

function forceModel(json, model) {
  if (/"model"\s*:\s*"[^"]*"/i.test(json)) {
    return json.replace(/("model"\s*:\s*")[^"]*(")/i, `$1${model}$2`);
  }
  const trimmed = json.trim();
  return trimmed.startsWith("{") ? `{"model":"${model}",${trimmed.slice(1)}` : json;
}

assert.equal(
  forceModel('{"model":"hunyuan-lite","messages":[]}', "openai/gpt-oss-120b"),
  '{"model":"openai/gpt-oss-120b","messages":[]}'
);
assert.equal(
  forceModel('{"messages":[]}', "openai/gpt-oss-120b"),
  '{"model":"openai/gpt-oss-120b","messages":[]}'
);

console.log("DeskTalk Groq server smoke test passed");
