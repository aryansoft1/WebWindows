# WebWindows Preview Session Protocol v1

状态：Phase 0B 设计草案；不写入 catalog 或安装关联

## 1. 目标

Preview Session 让 Developer Studio 的 immutable project snapshot 在当前 WebWindows 中立即运行，同时不进入正式分发状态。

Preview 明确不是：

- catalog entry；
- `WebWindows.apps.install()` 记录；
- function sync association；
- Developer API submission；
- app ID ownership 或已发布版本；
- Store 可发现功能。

## 2. 可信组件

```text
Developer Studio (trusted system function)
  -> Preview Controller (trusted, memory-only session registry)
  -> Preview Sandbox Host (trusted system page)
  -> unique-origin function iframe (untrusted)
  -> Capability Broker port (session-scoped)
```

Project iframe 永远不能访问 Studio DOM、Project Repository、Shell DOM 或其他 Preview session。

## 3. Session record

Controller 为每次 Run 创建：

- cryptographically random `sessionId`；
- one-time `launchSecret`；
- Studio instance ID 与 project UUID；
- app ID、source manifest hash、snapshot hash、preview revision；
- immutable file map/ZIP view；
- validation result 与 policy versions；
- declared/effective permissions（默认全部拒绝，除非显式开发授权）；
- created/last-active/expiry；
- current Sandbox Host WindowProxy/channel/revocation state。

记录仅在可信内存中保存。项目持久数据仍在 Studio project store；Preview session 不进入安装 IndexedDB/localStorage/server sync。

## 4. Launch handshake

1. Studio 对保存后的 immutable snapshot 执行 Manifest/Package validation；
2. Controller 创建 session，返回 `sessionId` 与一次性 secret；
3. Studio 打开固定 Preview Host URL；URL 不携带项目文件、Manifest、API Key 或 launch secret；
4. Preview Host 向 opener 发送 `host-ready`，包含一次性 challenge；
5. Studio 只向刚打开的精确 WindowProxy、可信 origin 发送 challenge response、session ID 和 secret；
6. Host 向 Controller redeem；secret 立即失效并绑定 Host WindowProxy；
7. Controller 返回 immutable snapshot 与 effective policy；
8. Host 构造与 Production 同策略的 unique-origin iframe；
9. Host 建立 Capability Broker MessagePort 和 Function Lifecycle `launch`。

secret 不放 query、fragment、window name、日志或持久存储。重复 redeem、错误 WindowProxy、过期 challenge 或 policy mismatch 均拒绝。

## 5. Reload

Studio 修改文件后创建新 snapshot/revision。Reload：

- 不变更原 snapshot；
- 撤销旧 Broker port、pending requests、resource/action handles；
- 创建新 iframe/channel 并发送新的 lifecycle `launch`；
- Console 按 revision 分段；
- 不沿用旧页面内存或未显式保存的数据；
- 开发授权是否沿用由 permission policy 决定，高风险 resource grant 默认不跨 revision。

## 6. Console 与诊断

SDK 在 sandbox 内包装 `console`、`error`、`unhandledrejection`，通过独立、限额的 diagnostics channel 发送 JSON-safe 副本。Host 为每条记录附加 session/project/revision/time/severity，不接受应用伪造这些字段。

限制：单消息大小、对象深度、数组/属性数量、每秒消息数和循环引用处理。Console 不能读取其他 session，也不能承载 capability response 或 secret。

## 7. 终止与清理

以下事件撤销 session/channel：Studio Stop、Preview window 关闭、Studio instance 结束、TTL/idle timeout、Reload、策略违规、项目删除、用户撤销授权。Controller 清除内存 snapshot 和 handles；不会调用正式 uninstall，因为从未安装。

## 8. Production 对齐

Preview 与 Production 最终共享：Package Runtime policy、Manifest interpretation、SDK facade、Capability Broker envelope、permissions decision order 和 lifecycle shape。

允许差异只有：

- Preview 的资产来自 Studio immutable snapshot，Production 来自已发布 hash-matched ZIP；
- Preview 有 revision/Console/开发诊断，Production 没有 Studio 控制通道；
- Production grant 绑定已发布 app/version，Preview grant 绑定 project/session/revision。

不得为了“开发方便”给 Preview 更宽的 Shell/Native 权限。
