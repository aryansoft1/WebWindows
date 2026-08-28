import assert from "node:assert/strict";
import fs from "node:fs/promises";

const read = async (relative) => fs.readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const permissions = JSON.parse(await read("data/sdk/permissions-v1.json"));
const broker = await read("docs/WEBWINDOWS_CAPABILITY_BROKER_PROTOCOL_V1.md");
const lifecycle = await read("docs/WEBWINDOWS_FUNCTION_LIFECYCLE_V1.md");
const facade = await read("docs/WEBWINDOWS_SDK_SANDBOX_FACADE_V1.md");
const preview = await read("docs/WEBWINDOWS_PREVIEW_SESSION_PROTOCOL_V1.md");

assert.equal(permissions.status, "draft-not-enforced");
assert.equal(permissions.defaultDecision, "deny");
assert.equal(permissions.denyUnknownPermissions, true);
assert.equal(permissions.wildcardsAllowed, false);
assert.deepEqual(permissions.baselineFacadeMethods, [
  "device.ready", "device.getCapabilities", "device.on"
]);

const ids = new Set();
const targets = new Set();
for (const permission of permissions.permissions) {
  assert.equal(ids.has(permission.id), false, `duplicate permission: ${permission.id}`);
  ids.add(permission.id);
  assert.doesNotMatch(permission.id, /\*/);
  assert.notEqual(permission.id, "native");
  assert.notEqual(permission.id, "system");
  assert.notEqual(permission.id, "device.*");
  assert.ok(["low", "medium", "high"].includes(permission.risk));
  assert.equal(typeof permission.userGesture, "boolean");
  assert.ok(permission.publicApiTargets.length > 0);
  for (const target of permission.publicApiTargets) {
    assert.match(target, /^(device\.(system|runtime|network|battery|display|audio|storage|power)\.|fileDialog\.)/);
    assert.doesNotMatch(target, /\*/);
    assert.equal(targets.has(target), false, `target mapped by multiple permissions: ${target}`);
    targets.add(target);
  }
}

for (const required of [
  "device.network.getState",
  "device.display.setBrightness",
  "device.audio.setVolume",
  "device.storage.pickDirectory",
  "device.storage.openFile",
  "fileDialog.open",
  "fileDialog.write"
]) {
  assert.equal(targets.has(required), true, `missing permission mapping: ${required}`);
}

assert.match(broker, /权限决定“应用是否被允许”，Runtime capability 决定“当前宿主是否实现”/);
assert.match(broker, /默认拒绝/);
assert.match(broker, /只映射 `data\/sdk\/webwindows-public-api-v1\.d\.ts`/);
assert.match(broker, /Preview 与未来 Production Package Runtime 使用相同协议/);
assert.match(broker, /Host-owned user action/);
assert.match(broker, /Native Bridge v1 的 envelope、method、capability transport 和生命周期保持完全冻结/);

assert.match(lifecycle, /属于 WebWindows Function SDK/);
assert.match(lifecycle, /不属于 Native Bridge/);
for (const event of ["launch", "activate", "visibilitychange", "beforeclose", "dispose"]) {
  assert.match(lifecycle, new RegExp(`\\b${event}\\b`));
}

assert.match(facade, /不是 `parent\.WebWindows`/);
assert.match(facade, /不包含 `apps`/);
assert.match(facade, /handshake snapshot/);
assert.match(facade, /禁止回退到 `parent\.WebWindows`/);

assert.match(preview, /不写入 catalog 或安装关联/);
assert.match(preview, /不进入安装 IndexedDB\/localStorage\/server sync/);
assert.match(preview, /Preview 与 Production 最终共享/);
assert.match(preview, /不得为了“开发方便”给 Preview 更宽的 Shell\/Native 权限/);

console.log("developer platform Phase 0B contract smoke test passed");
