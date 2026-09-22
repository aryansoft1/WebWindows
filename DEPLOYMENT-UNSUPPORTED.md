# ⛔ 本分支不可作为部署源 / DEPLOYMENT UNSUPPORTED

> 状态：**禁止部署（DO NOT DEPLOY）** · 记录日期：2026-09-23
> 本文件由生产事故复盘加入，用于阻止本分支被当作发布源使用。

## 结论

`codex/wendao-release-20260920` **不得用于部署到 https://www.y0.hk**，也不建议与当前主线合并。
它是一条**分叉线**，不是主线的子集或超集。

## 证据（对比主线 HEAD `276f5a0`）

- 主线 973 个文件，本分支 764 个文件
- **主线有、本分支没有：268 个**，其中与开发者面 / 后台认证直接相关的有 39 个
- **本分支有、主线没有：59 个**（`assets/js/auth-session.js`、`camera.html`、
  `admin_api/adminGuard.asp`、`api/release-version.asp`、`AGENTS.md` 等）

### 本分支缺失、且部署时会被删除的关键文件

| 文件 | 删除后果 |
|---|---|
| `inc/trust-schema.asp` | `api/function-catalog.asp` 依赖该 SSI，缺失即 **503 `trust-schema-required`，整个功能仓库前端不可用** |
| `admin_api/adminAuth.asp` | 后台登录接口 404，后台无法登录 |
| `admin_api/functionCatalog.asp` | 功能仓库后台读写接口 404 |
| `admin_api/developerPlatform.asp` | 开发者平台后台 404 |
| `admin_api/developerPackage.asp` | 功能包下载接口 404 |
| `developer_api/v1.asp` | 开发者 API 404 |
| `inc/admin-security.asp` | 后台请求来源校验缺失 |
| `developer.html` | 开发者中心页面 404 |
| `SystemManager/functions.html` | 功能仓库管理页 404 |
| `SystemManager/developer-platform.html` | 开发者平台管理页 404 |
| `data/sdk/*`（21 个合约文件） | Studio 确定性构建与校验器失去输入 |
| `SystemManager/assets/js/{admin-security,admin-shell,function-catalog-admin,developer-platform-admin}.js` 及对应 CSS | 后台页面脚本/样式 404 |

本分支的 `admin_api/` 只有 `adminGuard.asp` 与若干旧 CRUD 脚本，`inc/` 只有 `conn.asp`、`sysinfo.asp`，
且**没有 `developer_api/`** —— 即本分支使用的是**另一套后台认证实现**，直接回填主线文件会产生冲突。

### 已经造成过的生产事故

2026-09-23 发现生产环境的症状，正是本分支**子集部署**的结果：

1. `data/apps/system-apps.json` 被替换为本分支版本（`catalogVersion 2026.09.20.3`，16 项），
   丢失 `webwindows.system.developer-studio`
2. `SystemManager/index.html` 被替换为本分支版本，丢失「🧩 功能仓库」「🛠️ 开发者平台」两个导航链接
3. `assets/data/guide-content.json` 停留在 `registryVersion 2026.09.14.2`

## 正确做法

- 需要恢复开发者面：使用主线，或按 `deploy/developer-recovery-20260923/README.md` 操作
- 需要本分支的独有功能（相机、网络测速、会话真值等）：**单独开分支把功能摘出来**，
  不要整分支发布，也不要整分支合并
- 若本分支已废弃：删除远程分支或重命名加 `-superseded` 后缀

## 维护

如需解除本限制，请先完成：

1. 将上述 39 个开发者 / 后台文件回填到本分支，或明确接受删除后果
2. 解决 `adminGuard.asp`（本分支）与 `adminAuth.asp` + `admin-security`（主线）两套认证的取舍
3. 让本分支通过主线的完整测试套件（81 个 smoke）
