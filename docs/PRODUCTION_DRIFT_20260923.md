# 生产环境漂移分析报告 · 2026-09-23

对照对象：`https://www.y0.hk`（生产） vs 主线 HEAD `276f5a0`。
方法：逐文件拉取线上原始字节，计算 SHA-256 与行数，再用 `git diff --no-index` 取内容差异
（换行符统一归一化后再判断，避免把 CRLF/LF 差异误报为内容差异）。

---

## 1. 结论摘要

| 项 | 结论 |
|---|---|
| 生产的部署源 | `codex/wendao-release-20260920` 的**子集**（部分文件被覆盖，删除未生效） |
| 该分支性质 | 与主线**分叉**：缺 268 个文件、多 59 个文件，不可部署、不建议合并 |
| 开发者面症状根因 | 3 个文件被覆盖：`SystemManager/index.html`、`data/apps/system-apps.json`、`assets/data/guide-content.json` |
| 修复方式 | 见 `deploy/developer-recovery-20260923/README.md`（3 个文件 + 重新发布目录） |
| 顺带发现 | 主线自身有 **2 个"直接部署会打坏线上"的缺陷**（见第 5 节） |
| 根 `index.html` | 线上是**分叉线派生版**，引用 3 个主线不存在的文件，**不可直接上传**（见第 6 节） |

---

## 2. 根因

`origin/codex/wendao-release-20260920` 相比主线：

- 主线 973 个文件 / 本分支 764 个文件
- 主线有、本分支没有：**268 个**（开发者面与后台认证相关 39 个）
- 本分支有、主线没有：**59 个**

该分支的 `admin_api/` 只有 `adminGuard.asp` 与旧 CRUD 脚本，`inc/` 只有 `conn.asp`、`sysinfo.asp`，
没有 `developer_api/` —— 它使用的是**另一套后台认证实现**，因此既不能整分支发布，也不能整分支合并。

2026-09-23 的生产症状来自一次**子集部署**（只覆盖了部分文件，没有执行删除）：

1. `data/apps/system-apps.json` → 分支版本 `catalogVersion 2026.09.20.3`（16 项），丢失 `webwindows.system.developer-studio`
2. `SystemManager/index.html` → 分支版本，丢失「🧩 功能仓库」「🛠️ 开发者平台」两个导航链接
3. `assets/data/guide-content.json` → 停留在 `registryVersion 2026.09.14.2`

证据：该分支的 `SystemManager/index.html` 与线上**逐字节一致**；分支的 `system-apps.json`
与线上一致（16 项、同版本号）；分支不含 `ce1f243`、`6381297` 两个安全加固提交，
也不含 `SystemManager/assets/js/admin-security.js`。

---

## 3. 逐文件对照

### 3.1 SystemManager

| 文件 | 本地 | 线上 | 差异 |
|---|---:|---:|---|
| `index.html` | 2587 | 2175 | 线上缺 2 个导航链接 + 管理员会话/退出区块；样式与脚本基线不同（见下） |
| `users.html` | 3376 | 3418 | 同上：本地引 stub + `admin-security.js`；线上引 CDN Tailwind + lucide |
| `datacenter.html` | — | — | 与 `users.html` 同模式（本地引用 stub） |
| `dashboard.html` | 3421 | 3421 | **SAME** |
| `functions.html` | 6234 | 6125 | 本地多一行 `admin-security.js`；本地 `function-catalog-admin.js?v=20260830-1` vs 线上 `?v=20260729-1`；标题下描述文案不同 |
| `developer-platform.html` | 2526 | 2453 | 本地多一行 `admin-security.js`；本地 `css?v=20260830-1`/`js?v=20260830-2` vs 线上 `?v=20260729-2`/`?v=20260729-3` |
| `login.html` | 1626 | 1510 | 仅差 md5 CDN 的 `integrity`/`crossorigin`（本地加固、线上无） |
| `assets/js/admin-security.js` | 1422 | **404** | 线上不存在 |
| `assets/js/admin-shell.js` | 837 | 1025 | 本地依赖 `WebWindowsAdminSecurity`；线上是独立版本（自含 fetch + `adminLogout`） |
| `assets/js/function-catalog-admin.js` | 19031 | 17676 | 本地更新 |
| `assets/js/developer-platform-admin.js` | 16994 | 12382 | 本地更新 |
| `assets/css/function-catalog-admin.css` | 5893 | 5893 | **SAME** |
| `assets/css/developer-platform-admin.css` | 2717 | 2717 | **SAME** |

**统一模式**：线上是 `ce1f243`（2026-08-31 强制后台请求来源）与 `6381297`（2026-08-31 后台变更
要求 CSRF 证明）**之前**的后台栈；主线 HEAD 是这两个提交**之后**的栈。

验证：线上 `admin_api/adminAuth.asp?action=status`（带 `X-WebWindows-Admin-Request`）
返回 `{"ok":true,"authenticated":false,"username":""}` —— **没有 `csrfToken` 字段**，
而主线的 `admin-security.js` 强制校验 `/^[a-f0-9]{64}$/` 的 csrfToken。

### 3.2 功能目录与使用向导

| 文件 | 本地 | 线上 | 说明 |
|---|---:|---:|---|
| `data/apps/system-apps.json` | 14028（17 项 / `2026.09.23.1`） | 13659（16 项 / `2026.09.20.3`） | 本地是**纯超集**：共有 16 项逐字节相同，仅多 `developer-studio`，无任何项消失 |
| `assets/data/guide-content.json` | 84517（`2026.09.23.1`） | 85648（`2026.09.14.2`） | 线上停留在旧注册表，覆盖了未注册的 camera 章节 |

⚠️ **只上传文件无效**：`api/function-catalog.asp` 优先读 DB
`webwindows_function_catalog_versions` 中 `is_active=1` 的行，只有 DB 无有效活动行时才回落到文件。
线上当前活动行是 `2026.09.21.4`（16 项，**比磁盘文件还新**），响应头 `X-WebWindows-Catalog-Source: database`。

### 3.3 问道（已同步，无需上传）

以下 12 个文件线上与本地 **SHA-256 完全相同**：

```
road.html  assets/css/navigation.css  assets/icons/navigation.svg
assets/js/navigation-{app,providers,enhancements}.js
assets/js/flight-{app,position,providers,track}.js
assets/js/transit-{app,position,providers}.js
```

其余：

- `assets/js/desktalk.js`：归一化后 98310 vs 98309 字节，2183 行 vs 2183 行 —— **仅 1 处行尾空白差异，视为已同步**
- `assets/js/tw.js`：本地 636 行 vs 线上 565 行，差异全部是**本地新增**（Developer Studio 翻译块 + Monaco
  `i18n-ignore` 保护），线上没有本地缺少的内容 → 本地是超集，上传安全
- `function-center.html`、`developer-studio.html`：归一化后**完全相同**（仅换行符不同）

开发者面在线上实际存在性（非 404）：

```
developer.html                    200  SAME   12252
developer-studio.html             200  内容相同（仅换行符）
assets/js/developer-center.js     200  SAME   15201
SystemManager/functions.html      200  见 3.1
SystemManager/developer-platform  200  见 3.1
admin_api/functionCatalog.asp     401  端点存在（需后台请求头）
admin_api/developerPlatform.asp   403  端点存在
admin_api/developerPackage.asp    403  端点存在
developer_api/v1.asp              403  端点存在
```

即：**页面与接口都在，只丢了目录条目和两个导航链接。**

---

## 4. `assets/css/tailwind.min.css`：主线的第一个部署缺陷

该文件自 `8ff2211`（2025-07-14 initial commit）起就是 **195 字节的兜底 stub**：

```css
/* TailwindCSS fallback (basic utility classes) */
body { margin: 0; font-family: sans-serif; }
.text-xs { font-size: 0.75rem; }
.text-4xl { font-size: 2.25rem; }
.mt-1 { margin-top: 1.25rem; }
```

主线有 3 个页面引用它：`SystemManager/index.html`、`SystemManager/users.html`、`SystemManager/datacenter.html`。
线上这 3 个页面用的都是 CDN Tailwind。

**后果**：把主线版本直接上传，会让这 3 个后台页面**完全失去样式**
（`index.html` 的 `body.flex.h-screen`、侧边栏 `bg-gray-800` 等全部失效）。

---

## 5. 主线的第二个部署缺陷：`admin-security` 依赖链

主线 `SystemManager/index.html` 引入：

```html
<script defer src="assets/js/admin-security.js?v=20260831-1"></script>
<script defer src="assets/js/admin-shell.js?v=20260729-1"></script>
```

而主线的 `admin-shell.js` 第一句是 `window.WebWindowsAdminSecurity.ready.then(...)`。

要让它在线上跑起来，必须**同时**部署：`admin-security.js`、`admin-shell.js`、
`admin_api/adminAuth.asp`、`inc/admin-security.asp`、`SystemManager/login.html`、
`assets/js/admin-login.js`、`assets/css/admin-login.css` —— 因为线上 `adminAuth.asp`
目前不返回 `csrfToken`。

**只上传 `index.html` 的后果**：`admin-security.js` 404 → `WebWindowsAdminSecurity` 未定义 →
`admin-shell.js` 抛 TypeError → 页面停在 `visibility:hidden` 并被 `.catch` 重定向到 `login.html`
→ **后台首页无限跳转登录页**。

---

## 6. 根 `index.html`（仅分析，本次不改动）

| | 本地 | 线上 |
|---|---:|---:|
| 行数 | 653 | 658 |
| 字节 | 32802 | 33161 |
| 静态引用数 | 36 | 40 |

线上引用了 **3 个主线不存在的文件**（均为分叉线独有）：

```
assets/js/auth-session.js        ?v=20260810-session-truth-1
assets/js/file-query-parser.js   ?v=20260811-query-v2-3
assets/js/ai-file-tools.js       ?v=20260811-file-tool-1
```

（线上 `assets/js/auth-session.js` 实测 200 / 4654 字节；主线完全没有该文件。）

另有 **16 个同名资源的 `?v=` 版本号不同**，线上普遍更新，例如：

| 资源 | 本地 | 线上 |
|---|---|---|
| `assets/js/main.js` | `20260809-device-state-1` | `20260820-boot-language-1` |
| `assets/js/tw.js` | `20260808-device-api-1` | `20260823-mobile-parity-1` |
| `assets/js/desktalk.js` | `20260809-ai-knowledge-1` | `20260819-discovery-privacy-1` |
| `assets/js/app-registry.js` | `20260729-6` | `20260810-catalog-2` |
| `dist-window/window-manager-widget.js` | `20260809-device-storage-1` | `20260826-window-fit-1` |

首个差异行即 `<html lang="zh">` vs `<html lang="zh" class="ww-boot-pending">`。

**结论**：线上的首页来自**另一条工作线**（仓库里有 15 个并存的 worktree），不是主线的演进。
直接上传主线 `index.html` 会去掉 `auth-session.js`、`file-query-parser.js`、`ai-file-tools.js`
的引用并把版本号全部回退，属于**独立的一次对齐工作**，不在本次恢复范围内。

> 注意：本地 `index.html` 当前还带着未提交的 `visitor-analytics.js?v=20260920-1` 改动，
> 线上同样有这一行，说明该功能已另行部署。

---

## 7. 建议

| 优先级 | 动作 | 状态 |
|---|---|---|
| P0 | 把问道最新文件同步进主线 | ✅ 已完成（`276f5a0`） |
| P0 | 修掉两个历史失败测试 | ✅ 已完成（见第 8 节） |
| P1 | 按 `deploy/developer-recovery-20260923/README.md` 上传 3 个文件并**重新发布功能目录** | ✅ 已完成（2026-09-23，实际上传 4 个含可选 `tw.js`；HTTP 回读 SHA-256 全通过；目录接口 `source=database` / 17 项 / `2026.09.23.1`，线上 `json-upgrade` 自动落库，**SQL 未执行**；旧文件备份为 `<path>.__previous_20260923-developer-recovery`） |
| P2 | 标记 `codex/wendao-release-20260920` 为不可部署 | ✅ 分支上已加 `DEPLOYMENT-UNSUPPORTED.md`（仅本地提交） |
| P3 | 决定后台安全加固（`ce1f243`/`6381297`）何时整体上线 | ⏳ 需要单独一次发布 |
| P3 | 修掉主线 3 个页面引用 195 字节 stub 的问题 | ⏳ 未修 |
| P4 | 对齐根 `index.html` 与线上分叉线 | ⏳ 仅分析，见第 6 节 |

---

## 8. 两个历史失败测试的根因（已修复）

两个失败是**同一个根因**：`976d940 feat(studio): expose WebWindows dialog API`（2026-09-14）
同时改动了 `data/sdk/webwindows-public-api-v1.d.ts`（8849 → 9307 字节）
和 `webwindows-vue/src/developer-studio/project/hello-template.js`，但**没有同步更新**：

1. `tests/developer-studio-deterministic-build-smoke.mjs` 里固定的 ZIP SHA-256（2026-08-29 固定）
2. `data/deploy/production-rehearsal-manifest-v1.json`（2026-08-31 生成）

反证：用 `b2644cb` 版本的旧 `.d.ts` 构建，结果是 `sha256=null`（校验不通过）——
说明 09-14 的改动是被更新的校验规则**要求**的，旧固定值已作废。修复后 **81/81 全部通过**。

> 顺带说明：`studio-validator-rules-v1.json` 在 2026-08-30（`6da93ab`）也变过一次，
> 而固定哈希自 2026-08-29 起未再更新 —— 该测试很可能已经红了三周多。
