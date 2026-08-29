# WebWindows Developer Platform single-source-of-truth

状态：Phase 0A design rule
日期：2026-08-29

## 目的

Developer Studio、Developer Center、提交校验、审核后台、Package Runtime 和 SDK language service 不得各自复制 Manifest、公共 API、Runtime 与包策略规则。共享规范文件是输入，产品界面只是消费者。

## 规范资产与所有权

| 共享资产 | 规范内容 | 当前权威来源 |
| --- | --- | --- |
| `data/sdk/manifest-v1.schema.json` | Source Manifest 字段、类型、required、路径形状；published 第三方条目的只读元数据形状 | Phase 0A Schema；语义解释见 `docs/WEBWINDOWS_MANIFEST_V1.md` |
| `data/sdk/manifest-v2.schema.json` | 显式 Manifest 版本、SDK API v1 与 requested permissions；其余应用字段继承 v1 语义 | Phase 2A.5 Schema；语义解释见 `docs/WEBWINDOWS_MANIFEST_V2.md` |
| `data/sdk/webwindows-public-api-v1.d.ts` | 当前稳定 `window.WebWindows` 公共 namespace 和类型 | Public API 实现 + 已发布 API 文档的交集 |
| `data/sdk/runtime-compatibility-v1.json` | 已确认 package/host Runtime 与 capability 事实 | Runtime 实现和自动化测试 |
| `assets/js/package-runtime.js` + policy tests | 当前 Package Runtime 的可执行安全策略 | Phase 0A 暂不重构；代码行为由回归测试冻结 |
| `data/sdk/permissions-v1.json` | Manifest v2 可声明的权限 ID、风险、prompt 与 Public API target | Phase 0B registry + Phase 2A.5 declaration vocabulary；声明不等于 grant |
| `data/sdk/capability-broker-v1.schema.json` | Preview/Production 共用 request/response/cancel/event wire schema | Phase 2A 冻结；尚未启用 Runtime |
| `data/sdk/capability-broker-methods-v1.json` | method-level allowlist、permission/capability、参数/结果、timeout、availability | 未登记 method 默认拒绝，禁止 wildcard |
| `data/sdk/capability-broker-errors-v1.json` | 第三方可见的稳定 Broker errors | 禁止透出 Native/adapter/stack/path |
| `data/sdk/capability-broker-policy-v1.json` | authorization 顺序、配额、cancel、consent、audit 和 Preview/Production 同形规则 | Manifest permission declaration 仍是显式 contract gap |
| Broker/lifecycle/Preview protocol 文档 | 新的跨沙箱消息和生命周期契约 | Phase 0B 设计；接入前独立评审 |

未来可以从已冻结 Runtime 行为提取机器可读 `package-runtime-policy-v1.json`，但在提取完成前不得让新 JSON 与现有代码并列成为两个权威实现。

## 消费关系

| 消费者 | 必须消费 | 不应复制/推断 |
| --- | --- | --- |
| Studio validator | 按显式版本选择 Manifest Schema、permission registry、Runtime compatibility；Package Runtime policy 的共享 validator/core | 从 permissions 字段猜版本、手写权限列表、Native 方法、后台表单默认值 |
| Developer Center | Manifest 文档/Schema 渲染、Public API 类型/文档、Runtime compatibility | 独立 Manifest 示例对象和独立版本矩阵 |
| Server-side submission validator | ZIP 根 `manifest.json`、对应版本 Schema、permission registry、Package Runtime policy、提交版本与包哈希规则 | 外层第二份 Manifest authority、仅用字符串搜索判断 Manifest、仅在最终客户端解压检查 |
| Admin review | Schema/包验证报告、permissions 风险说明、Runtime compatibility | 通过 UI 重新实现 validator 或授予系统适配器 |
| Package Runtime | 已冻结 package policy；未来消费同版本 Runtime core 与 Broker policy | Developer Center 文案、Studio 的宽松预览规则 |
| SDK language service | `webwindows-public-api-v1.d.ts`、Manifest Schema、Runtime compatibility、permissions | 从实现源码猜测私有对象或注册整个 Shell `window` |
| Function Center / Store | Published Catalog Manifest、正式目录和安装关联 | Source authoring 字段、Preview session 或开发安装记录 |

## 版本与发布规则

1. 每个共享资产带独立 contract/schema version；版本号变化必须说明兼容性。
2. 事实规范与新平台契约分开发布：0A 记录 current behavior，0B 设计 future behavior。
3. Schema 初次接入 production validator 前必须以 audit 模式运行，先报告现有 drift，不直接拒绝。
4. Public API `.d.ts` 只能滞后或等于稳定实现，不能先于实现声明成员。
5. Runtime compatibility 的 `conditional/unsupported/unspecified` 不得被 UI 转换成“已支持”。
6. Studio Preview 与 Production Runtime 对同一项目必须使用相同版本的 Manifest/Package/Broker policy；允许的差异只有资产来源和开发日志。
7. 自动生成文档时保留源文件链接和版本，不把生成结果反向编辑成新的权威来源。
8. Source Manifest authority 始终是 Snapshot/ZIP 根目录的 `manifest.json`；Inspector、submit envelope 和审核 UI 只能消费或校验它，不能覆盖它。

## 建议流水线

```text
shared contracts
  -> contract smoke tests
  -> Studio/Developer Center language & form models
  -> server audit validator
  -> admin validation report
  -> production enforcement (separate compatibility decision)
```

Phase 0A 只建立资产和测试，不把 Schema 接入现有提交/发布拒绝路径，因此不会改变生产行为。
