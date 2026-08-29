# WebWindows Manifest v2

状态：Phase 2A.5 contract freeze  
日期：2026-08-29  
机器可读 Schema：`/data/sdk/manifest-v2.schema.json`

## 1. 目的与版本选择

Manifest v2 只在 Manifest v1 的稳定 Source Manifest 语义上增加 SDK API 版本和请求权限声明。它不是对安装、窗口、目录或 Package Runtime 的重新设计。

版本选择只能依据顶层字段：

- `manifestVersion` 缺失：legacy Manifest v1；
- `manifestVersion` 严格等于数字 `2`：Manifest v2；
- 其他值：不支持的 Manifest 版本。

实现不得通过 `permissions`、`sdk` 或其他字段猜测版本。`manifest-v1.schema.json` 保持冻结，现有 v1 包不需要迁移，也不会因本契约获得任何权限。

## 2. Source Manifest v2 最小字段

v2 沿用 v1 的 `id`、`legacyIds`、`type`、`name`、`description`、`category`、`version`、`icon`、`entry`、`install`、`placement`、`window`、`fileHandlers` 和平台保留 `launch` 的既有形状与语义。

新增 required 字段：

| 字段 | 类型 | 语义 |
| --- | --- | --- |
| `manifestVersion` | number，常量 `2` | 显式选择 Manifest v2 |
| `sdk` | object | 第三方 WebWindows Function SDK 声明 |
| `sdk.apiVersion` | string，常量 `"1"` | 对应 `webwindows-public-api-v1.d.ts` |
| `permissions` | unique string[] | 从 `permissions-v1.json` 请求的权限；允许空数组 |

最小新增片段：

```json
{
  "manifestVersion": 2,
  "sdk": { "apiVersion": "1" },
  "permissions": []
}
```

`SDK API version != Native Bridge version`。第三方不能声明、选择或探测 Native Bridge 版本；Source Manifest 不定义任何 Native Bridge 字段。

## 3. Permission declaration

`permissions` 中每个 ID 的唯一词汇来源是 `/data/sdk/permissions-v1.json`。当前只有 registry 的 `sourceDeclaration.declarablePermissionIds` 且对应记录标记 `sourceDeclarable:true` 的权限可以写入 Source Manifest；Phase 2A.5 仅开放 Battery Pilot 的 `device.battery-status.read` 声明。Schema 通过该 registry 的 `$defs.permissionId` 引用允许值。unknown、duplicate、wildcard、`native`、`system`、`device.*`、已登记但尚未 source-declarable 的权限及任何 private/internal permission 均无效。

声明仅表示 requested capability authorization，不表示 grant。一次 Broker 调用必须同时满足：

```text
Declared permission
AND platform/store policy allowed
AND effective grant
AND runtime capability available
AND Broker method policy allowed
```

权限和 capability 是不同概念。开发者请求权限不能让 Host 产生不存在的能力；Host 的 capability detection 也不能代替权限声明或 grant。

## 4. Runtime declaration 决策

v2 不新增 Source Runtime declaration。Battery Pilot 只需要 SDK API v1、声明 `device.battery-status.read`、Host 实际 capability detection 和 Broker policy。让开发者声明“battery supported”既无权威性，也会把 capability 与 permission 混淆。

`runtime` 继续是 published-only、server-generated metadata。若未来确有可移植 Runtime target 需求，必须单独版本化评审，不能复用当前发布字段作为开发者自报能力。

## 5. Published-only fields

`catalog`、`package`、`runtime` 仍由平台生成并在 Schema 中标记为 read-only。Source validator 必须阻止开发者把这些字段当作 authoring input。发布端可以保留 v2 的 `manifestVersion`、`sdk` 和 requested `permissions`，但不得把 requested permissions 当作 allowed/granted permissions。

Builder 只打包 Snapshot 根目录中的 `manifest.json`，不增加 published metadata，不接受第二份 manifest 覆盖参数。

## 6. v1 到 v2 migration

迁移必须由开发者显式发起：

1. 原样保留 `id`、`version`、`entry`、`window`、`install`、`placement` 和其他 v1 字段；
2. 增加 `manifestVersion: 2`；
3. 增加 `sdk: { "apiVersion": "1" }`；
4. 增加开发者明确选择的 `permissions`，未选择时为空数组；
5. 重新以 v2 Schema 和项目 validator 验证。

迁移器不得从源码扫描推断、授予或自动勾选权限。静态扫描只能提示“某 API 可能需要声明”，最终权限选择必须由开发者确认。

## 7. Developer Center 与 server authority

后续接入应为：

```text
Developer Studio deterministic ZIP
  -> server extracts ZIP root manifest.json
  -> selects schema by explicit manifestVersion
  -> validates package and source manifest
  -> produces permission review report
  -> applies review/store policy
  -> generates published catalog/package/runtime metadata
```

ZIP 根目录的 `manifest.json` 是 Source Manifest authority。外层 submit manifest 应移除；若兼容旧 API 暂时保留，则必须与 ZIP Manifest 做 byte match 或 canonical semantic match，不能成为第二个权威来源。本阶段不改变现有 Developer API reject 语义。

## 8. Review permission model

Manifest 保存 requested permissions；审核/Store policy 保存 allowed permissions；用户或平台 grant 另行保存。审核报告至少展示：

```text
Requested permissions:
- device.battery-status.read

Risk: low
Consent: no-consent
Broker methods:
- device.battery.getState
- device.battery.refresh
```

风险、consent 和 method 映射分别来自 permission registry 与 Broker method registry，不复制到 Manifest。管理员界面和 Production enforcement 留待后续阶段。

## 9. 当前行为边界

本契约不实现 Broker Runtime、Sandbox SDK facade、Consent UI、permission persistence、server extraction 或 Developer API enforcement；不修改 Production Package Runtime、Native Bridge v1、Public API、安装和 catalog 行为。
