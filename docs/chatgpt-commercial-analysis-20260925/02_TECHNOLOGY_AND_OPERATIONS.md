# 2. 技术与运营架构

## 当前技术栈

- 前端：HTML/CSS/JavaScript、Vue 3、Vite、部分历史 Vue CLI 配置。
- 服务端：Classic ASP / ASP.NET handler、IIS、少量 .NET 邮件中心组件。
- 数据：JSON 功能目录、浏览器 LocalStorage/IndexedDB、云文件接口、MySQL 信任与
  分析表迁移。
- 地图/出行：MapLibre/OpenFreeMap、12306 代理、GTFS/Transitland、可插拔导航、
  航班及长途 provider。
- 编辑器：Monaco、JSZip，以及自研 Sheet/Write/Slide 页面。
- 测试：86 个 Node `.mjs` smoke/contract 测试、Playwright 浏览器 E2E、真实浏览器
  验证记录。

## 代码规模快照

- Git 跟踪文件：约 1,021 个。
- 文档：约 68 个跟踪文件。
- JavaScript/TypeScript/Vue：约 274 个文件。
- HTML/ASP/ASHX 页面或端点：约 194 个文件。
- 生产清单必需文件：262 个。
- 正式功能目录：17 项。

上述数字描述仓库复杂度，不代表全部文件都具有同等产品成熟度。仓库同时包含
当前产品、历史页面、实验代码、部署备份、AI 工作目录及开发产物。

## 关键子系统

### 桌面壳与窗口系统

- `index.html`：主入口。
- `assets/js/main.js`：主桌面协调逻辑。
- `webwindows-vue/src/desktop/`：Vue 窗口管理、任务栏和上下文菜单。
- `dist-window/`、`dist-menus/`、`dist-weather/`：生产构建产物。

### 应用、包与开发平台

- `data/apps/system-apps.json`：正式应用目录单一来源之一。
- `assets/js/app-registry.js`、`function-center.js`、`package-runtime.js`：应用发现、
  安装和运行。
- `developer-studio.html`、`webwindows-vue/src/developer-studio/`：IDE 工作台。
- Manifest V1/V2、权限决策、SDK 沙箱、预览协议和能力 Broker 均有冻结文档及测试。

### 文件与存储

- `cloud/browser/`：云文件浏览、搜索、节点信息、资源打开和私有资源访问。
- `assets/js/device-storage-provider.js`：浏览器/Android 等存储能力适配。
- `assets/js/cloud-file-dialog.js`、`resource-open.js`、`file-search.js`：统一文件体验。

### 设备与外壳能力

- `assets/js/device-api.js`：统一 Device API。
- `assets/js/device-controls.js`：声音、亮度、电池等 UI 与状态。
- `assets/js/system-session.js`：WebWindows 会话锁定、重载及能力分级。
- 普通网页只提供会话级替代行为；关机、重启、真实屏幕亮度等必须通过受信任
  Android/Linux/原生外壳，且需最小权限和来源校验。

### 通信与 AI

- DeskTalk/讯筒包含用户发现、会话、邮件入口及 AI 助手界面。
- AI 通过服务端代理调用 BigModel `glm-4.7-flash`；浏览器不得获得服务端 Key。
- AI 是否可用取决于生产环境变量与上游服务状态，不应把未配置状态描述为可用。
- 邮件中心使用独立 .NET/MailKit 路径，需要数据库和加密配置。

### 后台、身份和治理

- `SystemManager/`、`admin_api/`、`developer_api/`：管理员与开发者后台。
- `api/session.asp`、登录/登出及请求信任边界：会话与身份基础。
- 数据库迁移包括 WebWindows 信任模型和访客分析。
- 后台安全加固仍有一组已提交但尚未整体发布的变更，不能拆分上线。

## 部署和生产治理

- 当前生产清单：`deploy/ftp-manifest.json`，版本 `2026.09.25.28`。
- 发布流程包含：远端同步、祖先关系检查、工作树/上游一致性、生产备份、上一版
  manifest 对账、preflight、入口依赖检查、FTP 上传、manifest 和入口页最后上传、
  回读哈希及线上验证。
- 生产 FTP 凭据只能来自环境变量，不进入仓库和资料包。
- 2026-09-25 已为静态响应增加 `Cache-Control: no-cache`，以减少旧壳长期命中
  浏览器启发式缓存的问题。
- 生产 `web.config` 与仓库模板存在结构差异，并包含仅生产环境拥有的配置；未来
  整体安全发布必须合并，不能直接覆盖。

## 质量与安全资产

- 大量 contract/smoke 测试覆盖 Device、Storage、功能目录、部署、Classic ASP、
  Developer Studio、权限、文件、问道和多语言。
- 真实浏览器验证曾发现纯 Node 测试遗漏的表单导航、MapLibre 生命周期、缓存戳、
  iframe/窗口等问题，因此 UI 端到端验证是必要发布门。
- 应用包/预览采用 Manifest、权限、沙箱、可信上下文和 Broker 边界，方向正确；
  仍需持续降低历史页面与新架构并存造成的复杂度。

