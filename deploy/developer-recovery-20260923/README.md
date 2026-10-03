# 开发者面恢复包 · 2026-09-23

用于修复 https://www.y0.hk 上「功能仓库 / 开发者平台入口消失、功能目录里没有 Developer Studio」两个症状。

根因：生产环境由 `codex/wendao-release-20260920` 分支部署，该分支删除了开发者面相关内容。
详细分析见 `docs/PRODUCTION_DRIFT_20260923.md`。

---

## 1. 待上传文件（SHA-256）

| # | 上传到服务器的路径 | 本地来源 | 字节数 | SHA-256 |
|---|---|---|---|---|
| 1 | `SystemManager/index.html` | **`payload/SystemManager/index.html`**（本目录） | 2436 | `da7874db647628e79a24b938101d2474f7e0fd8e9349c3d758bc4b2613399d63` |
| 2 | `data/apps/system-apps.json` | `data/apps/system-apps.json` | 14028 | `e42f06e2fc57f14e7202505e84d50a156fefad4efe281a4dd1b02e6f6ed80304` |
| 3 | `assets/data/guide-content.json` | `assets/data/guide-content.json` | 84517 | `b1e902376803a5283b61671a4055e0dad2901b816140ea79a4b1f6c7615c10b2` |
| 4 | `assets/js/tw.js`（可选） | `assets/js/tw.js` | 61435 | `07273e8e2a9898f143872e0728483bf1b54139928490440b705dc211a6a21240` |

机器可读版本见同目录 `manifest.json`。

### ⚠️ 第 1 项必须用 `payload/` 里的版本，不能用仓库里的

仓库当前的 `SystemManager/index.html` **不能直接上传**，两个原因：

1. 它引用 `../assets/css/tailwind.min.css`，而该文件是 **195 字节的兜底 stub**
   （自 2025-07-14 initial commit 起就没变过）。线上所有后台页面用的都是 CDN Tailwind，
   直接上传会让后台首页**完全失去样式**。
2. 它依赖 `SystemManager/assets/js/admin-security.js` 暴露的 `WebWindowsAdminSecurity`，
   而线上该文件 **404**、线上 `admin_api/adminAuth.asp` 返回体里**没有 `csrfToken` 字段**
   （仓库 `admin-security.js` 强制校验 64 位 csrfToken）。直接上传会让后台首页
   **无限跳转到 `login.html`**。

`payload/SystemManager/index.html` 的做法是：**以线上现网版本为基底**（保留 CDN Tailwind、
lucide、旧版 `admin-shell.js` 的调用方式），只补回被删除的两个导航链接：

```html
<a href="functions.html" ...>🧩 功能仓库</a>
<a href="developer-platform.html" ...>🛠️ 开发者平台</a>
```

> 仓库版与 payload 版的差异，本质是仓库里 `ce1f243`（2026-08-31 强制后台请求来源）与
> `6381297`（2026-08-31 后台变更要求 CSRF 证明）这两个安全加固**从未部署到生产**。
> 这属于独立的一次变更，不在本恢复包范围内。

---

## 2. 上传顺序

1. 上传第 1 项 → `SystemManager/index.html`（覆盖）
2. 上传第 2 项 → `data/apps/system-apps.json`（覆盖）
3. 上传第 3 项 → `assets/data/guide-content.json`（覆盖）
4. （可选）上传第 4 项 → `assets/js/tw.js`（覆盖）

本地是线上的**纯超集**，已逐项核对过：

- `system-apps.json`：本地 17 项，线上 16 项，共有 16 项**逐字节相同**，仅多
  `webwindows.system.developer-studio`，**没有任何一项会消失**。
- `tw.js`：本地 636 行 vs 线上 565 行，差异全部是本地新增（Studio 翻译块 + Monaco i18n 保护），
  线上没有本地缺少的内容。

---

## 3. ⚠️ 必须重新发布功能目录（只上传文件无效）

`api/function-catalog.asp` 的读取顺序是：

1. 读 DB `webwindows_function_catalog_versions` 中 `is_active=1` 的行 → 命中就直接返回
2. **只有 DB 没有有效活动行时**，才读 `data/apps/system-apps.json` 并 Seed 进 DB

线上当前活动行是 `catalogVersion 2026.09.21.4`（16 项），**比磁盘上的文件还新**，
所以只上传文件不会有任何变化。

### ✅ 2026-09-23 执行结果：SQL 这步**不需要了**

线上 `api/function-catalog.asp` 与仓库版本**不同**：它多了一条 `json-upgrade` 路径
（仓库版只有 `database` / `json-fallback` / `unavailable`）。上传完成后首次访问接口即返回
`X-WebWindows-Catalog-Source: json-upgrade`，并把新目录**写回 DB**；此后连打三次均为：

```
source=database   apps=17   developerStudio=true   version=2026.09.23.1
```

因此 4 个文件上传完毕后，方式 A/B 都可以跳过。下面两种方式仅在
`source` 长期停留在 `json-upgrade`（即升级未落库）时才需要执行。

### 方式 A（推荐）：先停用活动行，让接口自动种子

```sql
UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1;
```

然后：

1. 访问 `https://www.y0.hk/api/function-catalog.asp` —— 此时会读取新上传的文件并 Seed 进 DB
2. 打开 `https://www.y0.hk/SystemManager/functions.html` → 点「发布」
3. 输入目录版本（例如 `2026.09.23.1`）→ 确认发布

### 方式 B（无数据库权限时）：走后台界面手工补条目

打开 `SystemManager/functions.html` → 「新建功能」→「高级定义」里粘贴
`data/apps/system-apps.json` 中 `webwindows.system.developer-studio` 那一整个对象 → 保存 → 发布。

> 两种方式都必须走到「发布」这一步，否则前端仍然读到旧的 16 项。

---

## 4. 验证

客户端目录缓存键为 `webwindows.functions.catalog-cache.v1`，**请用无痕窗口验证**。

```powershell
# 1) 目录已恢复 Developer Studio（2026-09-23 实测：均通过）
$r = Invoke-WebRequest https://www.y0.hk/api/function-catalog.asp -UseBasicParsing
$r.Content -match 'webwindows.system.developer-studio'   # 应为 True
$r.Headers['X-WebWindows-Catalog-Source']                # 应为 database

# 2) 两个导航链接已恢复
(Invoke-WebRequest https://www.y0.hk/SystemManager/index.html -UseBasicParsing).Content -match 'functions.html'          # True
(Invoke-WebRequest https://www.y0.hk/SystemManager/index.html -UseBasicParsing).Content -match 'developer-platform.html' # True

# 3) 使用向导已更新
(Invoke-WebRequest https://www.y0.hk/assets/data/guide-content.json -UseBasicParsing).Content -match '2026.09.23.1'       # True

# 4) 上传后校验 SHA-256（应与第 1 节表格一致）
(Get-FileHash -Algorithm SHA256 <下载回来的文件>).Hash.ToLower()
```

浏览器里再确认：后台左侧出现「🧩 功能仓库」「🛠️ 开发者平台」，WebWindows 开始菜单/全部功能里
出现 Developer Studio。

---

## 5. 回滚

三个文件都是覆盖式上传，回滚 = 重新上传旧版本即可。DB 活动行可用
`UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1;` 后再发布旧目录回退。
