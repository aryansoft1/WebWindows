# WebWindows Function Lifecycle v1

状态：Phase 0B 设计草案，尚未成为 production behavior

## 1. 所属层级

Function Lifecycle 属于 WebWindows Function SDK 和 Package/Preview host。它不属于 Native Bridge，不添加或修改任何 Native Bridge v1 event、method 或 envelope。

## 2. 状态模型

```text
created -> launching -> active <-> hidden -> closing -> disposed
                       |                    |
                       +------ crash -------+
```

- `created`：Host 已创建 session/iframe，SDK 通道尚未 ready；
- `launching`：SDK handshake 与初始 snapshot 正在建立；
- `active`：功能窗口可交互；
- `hidden`：窗口最小化、被隐藏或 document 不可见；
- `closing`：Host 已决定关闭，不允许新 capability request；
- `disposed`：port、resource grants 和 pending request 已撤销；
- `crash`：加载失败、策略违规、进程/页面终止等异常终态。

## 3. Lifecycle events

| Event | 次数 | Payload | 保证 |
| --- | --- | --- | --- |
| `launch` | 每 channel 一次 | app ID、launch reason、sanitized launch context、mode | SDK ready 后第一个 lifecycle event |
| `activate` | 0..n | sanitized activation context | singleton 功能再次被启动或窗口重新聚焦时发送 |
| `visibilitychange` | 0..n | `visible:boolean`、reason | Host 观察到窗口/页面可见性变化时发送，可能合并重复状态 |
| `beforeclose` | 最多一次 | Host 给出的 `deadlineMs` | best effort；功能可完成短保存，但不能 veto 或延长 deadline |
| `dispose` | 最多一次 | reason | best effort；crash/强制终止时可能收不到 |

事件通过 Capability Broker 的绑定 MessagePort 发送。事件名和 payload 属于 Function SDK，不向 Native transport 透传。

## 4. Delivery 与保存规则

- 同一 channel 内事件按 Host 发送顺序处理；跨 channel 不保证顺序；
- Reload 创建新 channel，新 channel 收到新的 `launch`，旧 channel 进入 `disposed`；
- `launch` 前不允许业务 capability request；
- 进入 `closing` 后新请求返回 `session-closing`；
- `beforeclose`/`dispose` 不保证在浏览器崩溃、设备断电、强制导航或进程回收时到达；
- 关键数据必须增量保存，不能依赖关闭事件；
- v1 不提供无限阻止关闭、后台常驻、定时唤醒或隐式重启能力。

## 5. Preview 与 Production

Preview 和 Production 使用同样的状态、事件名和顺序规则。允许的 mode 差异：

- Preview payload 可附带 `previewRevision` 和开发诊断 ID；
- Production payload 可附带已发布版本与 launch source；
- 两者都不得暴露 Shell DOM、宿主 window 或私有 Runtime transport。

## 6. 与现状的兼容

当前 WebWindows 没有正式 Function Lifecycle。Phase 0B 只是定义未来契约；在 Runtime/SDK 接入前，现有 iframe 的 `load/pagehide/visibilitychange` 仍保持原行为，不由本文改变。
