# WebWindows Capability Broker Protocol v1

状态：Phase 2A contract freeze；尚未接入 Preview 或 Production Runtime

机器契约：

- `data/sdk/capability-broker-v1.schema.json`
- `data/sdk/capability-broker-methods-v1.json`
- `data/sdk/capability-broker-errors-v1.json`
- `data/sdk/capability-broker-policy-v1.json`

本冻结不修改 Native Bridge v1、现有 Public API、Manifest v1、Package Runtime 或安装/提交行为。

## 1. 边界与默认决定

Broker 只允许逐项登记的稳定 Public API method。它不是对象代理，不遍历宿主 `window.WebWindows`，也不能接受任意 method string 后转发。

```text
unknown method       -> deny
unknown permission   -> deny
wildcard             -> impossible
private host member  -> impossible
```

Broker 可信端只调用 `webwindows-public-api-v1.d.ts` 描述的稳定 Public API。Native transport、adapter、Shell API、安装 API 和宿主对象引用永远不进入 registry 或 wire envelope。

权限决定“应用是否被允许”，Runtime capability 决定“当前宿主是否实现”。两者是独立事实，都满足才允许调用，一个不能推出另一个。Broker 默认拒绝，只映射 `data/sdk/webwindows-public-api-v1.d.ts` 中被 machine registry 逐项登记的稳定 method。

## 2. Phase 2 Pilot

Phase 2A 只冻结 Battery read Pilot，不启用 Runtime：

| Method | Invocation | Permission | Capability | 选择理由 |
| --- | --- | --- | --- | --- |
| `device.battery.getState` | handshake snapshot | `device.battery-status.read` | `battery.status` | 同步、只读、无参数；返回值可严格清洗，不含设备 ID |
| `device.battery.refresh` | request/response | `device.battery-status.read` | `battery.status` | 异步只读，可验证 timeout/cancel；Browser 与 Dreama Android 已有测试证据 |

两者均为 low risk、无需 sandbox user gesture、采用 no-consent policy，但仍必须有 Manifest permission declaration 和可信平台 policy 决定。返回值只允许 `supported/present/level/charging/connected/source`；`level` 限制为 0..1 或 null；`source` 归一化为 `browser/runtime/unsupported`。

暂不选择：

- Network：transport、effective type、downlink、RTT 会暴露网络环境；
- Runtime：platform、engine、version、device class、native/trusted 增加宿主指纹；
- Display：屏幕尺寸与 pixel ratio 是指纹输入；
- Audio：暴露用户/页面音量，且 native/page scope 语义不同；
- Storage/FileDialog：涉及用户资源、opaque handle、手势、持久 grant 和写入语义。

## 3. 通道与身份

Preview 和 Production 都由可信 Host 为每个 app session 创建专用 `MessagePort`。bootstrap 绑定精确 iframe `WindowProxy`、sessionId、snapshotId、channelId、不可猜测 token、app identity 和可信 policy context。业务请求建立后只走这个 port。

Wire envelope 携带 `sessionId/snapshotId/channelId`，但它们不是 sandbox 自证身份。权威身份来自 Host 内存中的 port/session/token binding。Host 不接受 sandbox 自报的 permission、grant、capability、identity 或 user gesture。

Preview 与未来 Production Package Runtime 使用相同协议：

```text
protocol = webwindows-capability-broker-v1
version  = 1
types    = request | response | cancel | event
```

允许的 mode 差异只有 identity、grant persistence、policy context 和 asset source。

## 4. Wire envelopes

Request：

```json
{
  "protocol": "webwindows-capability-broker-v1",
  "version": 1,
  "type": "request",
  "sessionId": "session-opaque-123456",
  "snapshotId": "snapshot-opaque-123456",
  "channelId": "channel-opaque-123456",
  "requestId": "request-1",
  "method": "device.battery.refresh",
  "params": {}
}
```

Success response：

```json
{
  "protocol": "webwindows-capability-broker-v1",
  "version": 1,
  "type": "response",
  "sessionId": "session-opaque-123456",
  "snapshotId": "snapshot-opaque-123456",
  "channelId": "channel-opaque-123456",
  "requestId": "request-1",
  "method": "device.battery.refresh",
  "ok": true,
  "result": {
    "supported": true,
    "present": true,
    "level": 0.72,
    "charging": false,
    "connected": false,
    "source": "runtime"
  }
}
```

Cancel 使用相同 identity/request/method binding，`type:"cancel"`，不接受任意 reason payload。Event 同样绑定 session/snapshot/channel/request/method，当前 schema 只保留 `snapshot.update` 和 `capability.change` 形状；Phase 2A 不启用事件。

所有消息必须满足 JSON Schema、structured-clone safe 和大小/深度限制。Request schema 不存在 `userGesture` 字段。

## 5. Authorization decision

Host 按 `capability-broker-policy-v1.json` 的固定顺序决策：

1. port/session/token binding 有效；
2. session 未过期；
3. protocol version 支持；
4. requestId 在该 session 首次使用；
5. request envelope 未超过 16 KiB；
6. method 在显式 allowlist；
7. Source permission 已声明；
8. platform/store/review policy 允许；
9. 所需 user/session/persistent grant 有效；
10. Runtime capability 支持；
11. params 满足 method schema；
12. 需要时存在 Host-owned gesture；
13. 并发与速率配额允许。

每层失败使用独立稳定错误，不能用一个 `permission-denied` 掩盖 capability、schema、gesture 或 timeout。

## 6. Timeout、cancel 与迟到结果

- Registry 为每个 method 固定 timeout；Battery refresh 为 3000 ms；handshake snapshot 不产生 request timeout；
- Host effective timeout 不得超过 method timeout、全局 10000 ms 上限或 session 剩余寿命；
- timeout 产生一个 terminal `request-timeout`，之后的 host result 被忽略并只记录结果类别；
- cancel 产生 terminal `request-cancelled`；若 Public API 支持 abort，Host 可以尝试 abort，否则只撤销结果交付；
- duplicate requestId 返回 `duplicate-request-id`，不影响原请求；
- unknown/duplicate cancel 静默忽略，不能影响其他请求；
- Stop 取消 pending 后关闭 port；expiry 使用 `session-expired`；Reload 取消旧请求并轮换 session/channel/token；
- 旧 port 或旧 session 的 response 永远不能进入新 session。

## 7. Public errors

完整机器列表来自 `capability-broker-errors-v1.json`。错误只包含 `code/message/retryable`。不得包含 private stack、adapter/provider、Native method/transport、文件路径/URI、cookie、credential 或原始宿主异常。无法安全分类的宿主错误归一化为 `internal-error`。

## 8. Consent 与 gesture

三类 consent：

- no-consent：低风险、已声明 permission，由可信 policy 决定，不产生 runtime prompt；
- session-grant：可信 Host UI 对一个 app/session 临时授权，Preview 只保存在 session memory；
- persistent-user-grant：未来 Production 持久授权，必须绑定 published app identity、permission、policy version 和可选 resource scope。

Sandbox 的点击或 `userGesture:true` 都不是授权证明。需要 gesture 时只能由 Host-owned user action 在可信 UI 交互中生成一次性 action authority。Phase 2A Pilot 不需要 gesture，也不实现 Consent UI。

## 9. Audit

Preview audit 仅保存在 Studio session memory。记录 timestamp、mode、app/project identity、session/snapshot、requestId、method、permission、decision、result category 和 latency。

不记录 params/result payload、API Key、cookie、credential、Native transport、private stack、filesystem path 或 provider URI。Production 是否持久审计留待后续 policy。

## 10. Sandbox facade

开发者最终仍写：

```js
window.WebWindows.device.battery.getState();
await window.WebWindows.device.battery.refresh();
```

不会公开 `broker.call()`。Facade 是 sandbox 本地冻结对象，不是 Host object reference。`getState()` 从 handshake 的清洗 cache 同步返回副本；`refresh()` 通过 Broker request/response 更新 cache。未登记 namespace/member 不生成到 Pilot facade，不能通过枚举发现 Host 内部对象。

## 11. Manifest permission contract gap

Manifest v1 是事实冻结规范，当前没有 `permissions` 字段。Phase 2A 不借未知字段宽松行为暗中赋予 permission，也不修改 Manifest v1。

因此真实项目启用 Broker 前必须单独冻结 Source permission declaration 的版本化承载方式，并让 Studio validator、Developer Center、server validator 和 review policy 共同消费。缺少这一步时，即使 method/capability 可用，授权决策也必须返回 `permission-not-declared`。

这不阻塞 Phase 2B 编写 gated Broker runtime/harness，但阻塞把 Pilot 默认开放给实际第三方项目。

## 12. Native Bridge 与 Production

Broker 只调用稳定 Public API。Public API 内部选择 Browser/Dreama adapter 的方式不可见。Native Bridge v1 的 envelope、method、capability transport 和生命周期保持完全冻结。

Phase 2A 不修改 Production Package Runtime。未来 Preview 与 Production 接入必须使用本文件同一 wire schema、method registry、permission/capability mapping、error model 和 decision order。
