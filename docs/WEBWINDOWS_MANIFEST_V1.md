# WebWindows Manifest v1 事实规范

状态：Phase 0A contract freeze
冻结日期：2026-08-29
机器可读 Schema：`/data/sdk/manifest-v1.schema.json`

## 1. 范围与规范来源

本文冻结 WebWindows 当前已经存在的 Manifest v1 语义，不增加产品行为，也不承诺新的权限、生命周期或 Runtime 能力。

事实来源按以下实现交集整理：

- `developer-samples/hello-webwindows/manifest.json`；
- `developer.html` 与 `assets/js/developer-center.js` 的官方示例/提交行为；
- `data/apps/system-apps.json` 的 production catalog 形态；
- `assets/js/app-registry.js` 的目录读取、安装和启动行为；
- `assets/js/package-runtime.js` 的包路径和入口执行行为；
- `SystemManager/assets/js/developer-platform-admin.js` 的第三方包发布转换；
- `SystemManager/assets/js/function-catalog-admin.js` 的目录编辑默认值；
- `developer_api/v1.asp` 的提交字段和格式检查。

本文区分三种文档形态，不能混用：

1. **Source Manifest**：开发者放在 ZIP 根目录并随提交登记的 `manifest.json`。
2. **Published Catalog Manifest**：管理员发布第三方提交时写入全局功能目录的条目。
3. **Built-in Catalog Definition**：历史内置/预装功能的目录定义。它与第三方 Source Manifest 共享大量字段，但包含系统专用适配器和历史例外，不是第三方项目模板。

JSON Schema 的默认入口验证 Source Manifest。`$defs.publishedCatalogManifest` 可用于验证发布后的第三方目录条目。历史 built-in catalog 只作为兼容事实记录，不要求反向满足 Source Manifest 的全部 authoring required 字段。

## 2. Source Manifest

### 2.1 Required 字段

以下 required 集合冻结当前官方第三方样例与 Developer Center 所表达的完整 authoring contract：

| 字段 | 类型 | 当前语义 |
| --- | --- | --- |
| `id` | string | 全局功能 ID；格式为小写分段 ID，例如 `com.example.hello` |
| `type` | string | `application` 或 `system`；第三方只能提交 `application`，`system` 为平台保留值 |
| `name` | string | 用户可见名称 |
| `version` | string | 功能版本；当前 Developer API 接受 `1.0`、`1.0.0` 等数字分段形式 |
| `icon` | string | ZIP 内图标的安全相对路径 |
| `entry` | string | ZIP 内 HTML/HTM 入口的安全相对路径 |
| `install` | object | 默认安装分发语义 |
| `placement` | object | 默认显示位置 |
| `window` | object | 窗口运行参数 |

`install` required 子字段：

| 字段 | 类型 | 枚举/语义 |
| --- | --- | --- |
| `defaultState` | string | `available` 或 `installed` |
| `source` | string | `repository`、`preinstalled` 或 `system`；第三方仓库包使用 `repository` |
| `uninstallable` | boolean | 是否允许移除用户安装关联；第三方通常为 `true` |

`placement` required 子字段：

| 字段 | 类型 | 语义 |
| --- | --- | --- |
| `desktop` | boolean | 默认是否显示桌面图标 |
| `startMenu` | boolean | 是否显示在开始菜单 |
| `allFunctions` | boolean | 是否显示在功能中心/全部功能视图 |
| `taskbar` | boolean | 当前目录保存的任务栏默认标记 |

`window` required 子字段：

| 字段 | 类型 | 枚举/语义 |
| --- | --- | --- |
| `mode` | string | `iframe`、`native` 或 `shell`；第三方包发布时强制改为 `iframe`，后两项为平台保留模式 |
| `singleton` | boolean | 相同 instance ID 是否复用单一窗口 |
| `width` | string | 传给窗口管理器的 CSS 尺寸字符串 |
| `height` | string | 传给窗口管理器的 CSS 尺寸字符串 |

### 2.2 Optional 字段

| 字段 | 类型 | 当前语义/缺省行为 |
| --- | --- | --- |
| `legacyIds` | string[] | 旧 Shell ID 到新 ID 的兼容映射；缺省为空数组 |
| `description` | string | 功能说明；缺省为空/不显示 |
| `category` | string | 目录分类文本；当前未冻结分类枚举 |
| `placement.startMenuGroup` | string | 已观察值为 `user`、`system`；第三方通常 `user` |
| `placement.startMenuOrder` | integer | 开始菜单排序；后台 authoring 默认 100 |
| `window.className` | string | 传给窗口管理器的内部样式类；第三方不应依赖平台私有类名 |
| `fileHandlers` | object[] | 文件关联声明；当前主要用于内置 Office/预览功能 |
| `launch` | object | Shell 启动适配器；平台保留，第三方不应填写 |

`fileHandlers[]` 当前可观察字段：

- `action`：当前观察值为 `open`；
- `adapter`：字符串；production 中观察到 `direct-url`、`cloud-sheet`、`cloud-write`、`cloud-slide`，均属于平台集成适配器；
- `extensions`：带点的小写扩展名数组；
- `mimeTypes`：小写 MIME 字符串数组；
- `priority`：数值，较大值优先。

Schema 记录这些字段形状，但不会把平台适配器声明为第三方能力。当前提交 API 未阻止第三方伪造这些值，这是 implementation drift，不是授权。

### 2.3 缺省语义

当前实现对缺失字段存在容错缺省；这些缺省用于解释历史目录，并不取消 Source Manifest 的 authoring required 要求：

- `type` 缺失时不会自动改写，但非 `system` 会走普通功能路径；
- `install.defaultState` 缺失时，注册表按 `available` 处理；
- `install.source` 缺失时，关联查询按 `repository`，直接 `install()` 的写入回退可能为 `local`；
- `install.uninstallable` 只有显式 `false` 或 `type:system` 才受保护，其他值按可卸载处理；
- `placement.desktop` 只有严格为 `true` 才默认显示；
- `placement.allFunctions` 只有严格为 `false` 才从全部功能视图隐藏；
- `placement.startMenu` 只有 truthy 时进入开始菜单；
- `placement.startMenuOrder` 在开始菜单排序中缺失或为 0 时回退为 999，后台 authoring 默认 100；
- `window.width/height` 在启动时分别回退为 `900px`/`640px`；
- `launch.adapter` 缺失时回退为普通 `window` 启动。

### 2.4 Source package 路径约束

Source Manifest 的 `entry` 和 `icon` 描述 ZIP 内路径，不是 URL：

- 使用 `/`，不使用 `\`；
- 不为空，不以 `/` 开始，不使用 Windows drive 前缀；
- 不包含 NUL、空路径段、`.` 或 `..` 路径段；
- 当前 Package Runtime 对每个 ZIP 文件路径限制为最多 240 个字符；
- `entry` 必须指向 `.html` 或 `.htm`；
- ZIP 最多 500 个非目录文件、解压后最多 30 MiB；
- 允许的文件扩展名由 Package Runtime Policy 冻结，Manifest Schema 不重复枚举包内每个文件。

相对资源引用可以包含 `.`/`..` 并由入口/样式所在目录解析，但解析不能产生包外能力。带 scheme、`//`、fragment-only、`data:` 或 `blob:` 的引用不会从 ZIP 资源映射中解析；脚本/样式必须能解析到包内对应类型，其他外部资源即使保留在 HTML 中也会被当前 CSP 阻止。

## 3. Published Catalog Manifest

管理员发布第三方提交时保留 Source Manifest 字段，并执行以下转换：

| 字段 | 发布后行为 |
| --- | --- |
| `catalog.status` | 由服务端/后台设置为 `published` |
| `package` | 由服务端/后台生成，包含 ZIP 格式、大小、SHA-256、原始包内入口和公共下载 URL |
| `runtime` | 由服务端/后台生成，当前固定为 `browser-zip-sandbox-v1`、`network:none`、`sameOrigin:false` |
| `entry` | 从包内入口改写为 `/package-runtime.html?...` Runtime URL |
| `window.mode` | 强制为 `iframe` |

`catalog`、`package`、`runtime` 是发布/运行元数据，不是 Source Manifest required 字段。Schema 将其标记为 `readOnly`。开发者填写同名字段不会获得对应能力，发布转换会覆盖其中的当前固定值。

当前 server-generated `package` 字段：

| 字段 | 类型 | 生成来源 |
| --- | --- | --- |
| `format` | `"zip"` | 固定值 |
| `size` | non-negative integer | 服务端接收的 ZIP 字节数 |
| `sha256` | 64 位小写十六进制 string | 服务端对 BLOB 重新计算 |
| `entry` | string | Source Manifest 的安全 HTML 相对入口 |
| `downloadUrl` | string | `api/function-package.asp` 的版本化 URL |

当前 server-generated `runtime` 字段：

| 字段 | 类型 | 当前值 |
| --- | --- | --- |
| `model` | string | `browser-zip-sandbox-v1` |
| `network` | string | `none` |
| `sameOrigin` | boolean | `false` |

## 4. Built-in catalog 保留字段

以下字段/值真实存在，但属于 WebWindows 平台和历史目录，不构成第三方 Source Manifest 权利：

- `type:system`；
- `window.mode:native|shell`；
- `launch.adapter` 以及 `desktalk-mailbox`、`about-panel`；
- `install.source:system|preinstalled`；
- `install.uninstallable:false` 的受保护系统项；
- platform-owned `fileHandlers[].adapter`；
- `entry:""`、`entry:"about:blank"` 或站点内 ASP/HTML URL；
- 带查询参数的站点资源 `entry`/`icon`。

这些值由平台目录管理，不允许 Developer Studio 模板生成。Phase 0A 不修改现有后台对它们的处理。

## 5. Additional properties 与保留命名空间

当前目录、提交和发布代码会保留未知属性。因此 Schema 使用 `additionalProperties:true`，以记录当前宽松兼容行为；这不等于未知属性获得稳定语义。

以下顶层名称保留给平台：

- `catalog`、`package`、`runtime`：发布生成元数据；
- `launch`：Shell 启动适配；
- 未来以 `webwindows` 开头的平台字段。

开发者自定义元数据应放在反向域名命名的对象下，且不得依赖 Runtime 保留或解释它。

## 6. Implementation drift 记录

Phase 0A 不选择新行为，以下不一致按原样冻结为 drift：

1. **提交校验弱于 Source Schema**：Developer API 只检查 Manifest 大小、外层 `{}` 和文本中匹配的 `id`，没有完整 JSON parse/Schema 校验。
2. **版本双来源**：提交的 `appId`/`version` 是独立表单字段；服务端不验证 `manifest.version` 与提交版本一致。
3. **ZIP 内 Manifest 未验证**：上传端不确认 ZIP 根目录存在 `manifest.json`，Package Runtime 也从已发布目录参数而不是 ZIP 内 Manifest 启动。
4. **入口缺省漂移**：管理员发布函数在 `manifest.entry` 缺失时使用 `index.html`，但 Source authoring contract 和 app registry 要求显式 `entry`。
5. **校验层级漂移**：app registry 只要求 `id/name/entry/window.mode`；后台目录编辑 UI 还要求 `icon`；Package Runtime 只验证 query 中的 `appId/version/entry` 和 ZIP 内容。
6. **路径规则漂移**：管理员发布检查安全 HTML 相对路径，但没有 Package Runtime 的 240 字符限制；上传端完全不解压路径。
7. **保留值未授权隔离**：Developer API 未阻止 `type:system`、Shell window mode、`launch.adapter` 或内置 file handler adapter；发布只强制 `window.mode:iframe`。
8. **未知字段宽松保留**：目录后台和第三方发布会保留未知属性，没有冲突/命名空间策略执行。
9. **Legacy built-in 不满足 Source required**：部分内置条目缺少 `version/description/category/source`，或使用空入口、Shell/native 模式；它们是平台目录定义，不是可移植 Source Manifest。
10. **CSS 尺寸未统一验证**：`window.width/height` 作为字符串传给窗口管理器，后台有默认值但没有共同格式校验。
11. **排序缺省不一致**：后台 authoring 默认 `startMenuOrder:100`，开始菜单运行时对 falsy 值回退 999。
12. **发布非原子**：目录发布与 submission 状态更新是两个请求；这属于发布流程 drift，不改变 Manifest 字段语义。

以上 drift 应由后续 validator 分层报告。任何收紧都必须作为单独兼容变更评审，不能通过“开始使用 Schema”暗中改变 production 行为。
