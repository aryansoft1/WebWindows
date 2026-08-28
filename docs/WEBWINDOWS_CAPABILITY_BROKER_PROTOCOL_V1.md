# WebWindows Capability Broker Protocol v1

状态：Phase 0B 设计草案，尚未接入 Preview 或 Production Runtime

## 1. 目标与边界

Capability Broker 在唯一来源 sandbox 与可信 WebWindows host 之间代理稳定 Public API。它解决权限、capability、参数校验和结果清洗，不改变现有 Public API 行为，也不属于 Native Bridge。

硬边界：

- Broker 只映射 `data/sdk/webwindows-public-api-v1.d.ts` 中的 `device` 与 `fileDialog`；
- 禁止动态属性遍历、任意方法名、宿主函数引用和 DOM 对象传递；
- 禁止转发任何私有 Native ABI 对象、方法、错误字段或 transport envelope；
- Preview 与未来 Production Package Runtime 使用相同协议版本和 method/permission policy；
- 权限决定“应用是否被允许”，Runtime capability 决定“当前宿主是否实现”，两者独立检查；
- 未知方法、未知权限、未声明权限和缺失 grant 默认拒绝。

## 2. 通道建立

可信 Sandbox Host 创建 `MessageChannel`，把一个 port 通过一次性 bootstrap 消息转移给内层 iframe。bootstrap 必须绑定：

- 当前 iframe 的精确 `WindowProxy`；
- 不可猜测的 `sessionId` 与 `channelId`；
- immutable app identity、manifest hash、policy version；
- 当前 effective permissions 和 capability snapshot；
- Preview 或 Production mode。

转移完成后，业务请求只走绑定的 `MessagePort`。Host 不接受来自全局 `message` 事件的业务 method call。Sandbox 的 unique origin 不能作为身份；身份来自 Host 已绑定的 WindowProxy、port 与 session record。

## 3. Envelope

Request：

```json
{
  "type": "webwindows:sdk:request",
  "protocol": "1.0",
  "sessionId": "opaque",
  "channelId": "opaque",
  "id": "monotonic-request-id",
  "method": "device.network.getState",
  "params": {}
}
```

Response：

```json
{
  "type": "webwindows:sdk:response",
  "protocol": "1.0",
  "sessionId": "opaque",
  "channelId": "opaque",
  "id": "monotonic-request-id",
  "ok": true,
  "result": {}
}
```

Error response：

```json
{
  "type": "webwindows:sdk:response",
  "protocol": "1.0",
  "sessionId": "opaque",
  "channelId": "opaque",
  "id": "monotonic-request-id",
  "ok": false,
  "error": {
    "code": "permission-denied",
    "message": "The function is not allowed to use this API."
  }
}
```

Event：

```json
{
  "type": "webwindows:sdk:event",
  "protocol": "1.0",
  "sessionId": "opaque",
  "channelId": "opaque",
  "event": "webwindows:network-change",
  "detail": {}
}
```

所有 envelope 必须是 plain structured-clone data。禁止函数、DOM、MessagePort（bootstrap port 除外）、SharedArrayBuffer、宿主 handle、循环对象和未受限二进制。

## 4. 请求决策顺序

Broker 对每次请求按固定顺序执行：

1. session/channel 仍有效，port 与 iframe 仍匹配；
2. protocol major version 匹配，请求 ID 未重放；
3. method 位于固定 Public API whitelist；
4. params 满足 method schema、深度、字段、字符串和字节上限；
5. Manifest 声明 method 对应的细粒度 permission；
6. Store/review policy 未撤销该 permission；
7. 用户 grant 有效且仍绑定当前 app、resource 和 session；
8. 当前 Runtime capability 支持此操作；
9. user-action、并发、速率和结果大小约束满足；
10. 调用可信 host 的稳定 Public API；
11. 按公共 result schema 复制和清洗响应。

建议稳定错误码：`session-invalid`、`protocol-unsupported`、`request-replayed`、`method-not-allowed`、`invalid-params`、`permission-not-declared`、`permission-denied`、`capability-unavailable`、`user-action-required`、`rate-limited`、`result-too-large`、`operation-failed`。

Host 不把平台异常、内部 method、路径、URI、provider、stack 或私有 error details 传给 sandbox。

## 5. User action

Sandbox 自报 `userGesture:true` 不可信。需要用户手势的调用采用 Host-owned user action：

1. sandbox 请求对应 method；
2. Broker 返回 `user-action-required` 和 opaque action ID；
3. Host 在受信 UI 中显示功能名、动作和资源范围；
4. 用户点击 Host 按钮；
5. Host 在该可信手势内执行 picker/确认动作；
6. action ID 一次性消费并返回清洗结果。

不得用透明覆盖层、模拟点击或子 frame 的布尔字段证明用户激活。

## 6. 资源授权

目录、文件和云资料必须使用 app-scoped opaque resource handle。Broker 保存真实 Public API resource/volume，sandbox 只获得不可跨 app/session 使用的 ID 和必要元数据。不得把宿主 `readUrl/writeUrl`、Android URI、文件系统路径或已有 volume 列表整体透传。

## 7. 生命周期与撤销

窗口关闭、导航、session 超时、项目 Reload、权限撤销或 app 更新时，Host 关闭 port、拒绝 pending requests 并撤销 action/resource handles。迟到 response 被忽略。Preview Reload 创建新 channel，不复用旧 nonce 或 request sequence。

## 8. 与 Native Bridge v1 的关系

无协议映射关系。Broker 调用的是当前可信页面上的稳定 `window.WebWindows` Public API；该 API 内部如何选择 Browser/Dreama adapter 不可见。Native Bridge v1 的 envelope、method、capability transport 和生命周期保持完全冻结。
