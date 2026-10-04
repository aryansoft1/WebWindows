# WebWindows 使用向导维护与覆盖清单

最后核对：2026-10-04<br>
内容版本：由文章最新核对日期自动生成<br>
权威内容目录：`docs/guide-v2/`<br>
生成产物：`assets/data/guide-content.json`

## 维护规则

1. `data/apps/system-apps.json` 是当前检出分支的功能注册事实来源。新增或删除功能时必须同步调整某篇教程的 `covers`。
2. 每篇教程必须包含用途、适用场景、媒体及替代文本、至少四个可执行的编号步骤、操作结果、常见问题/权限提示和核对依据；步骤要写清界面位置、用户动作与检查点，不能只复述功能简介。
3. 新增界面名称时，在 `keywords` 中加入繁中、English、日本語常用名称，并在步骤或权限提示中说明名称会随当前语言变化；不要把某一种语言下的按钮文字当成唯一入口依据。
4. 运行 `npm run build:guide`。构建会拒绝缺失图片、重复文章 ID、未覆盖注册功能、引用不存在功能和不完整教程结构。
5. 运行 `node tests/guide-smoke.mjs`，再按功能运行对应 smoke test，并在桌面和 390px 移动视口检查目录、搜索、图片和键盘焦点。
6. `docs/guide/` 是 2026.07 的旧内容留档，不再参与构建；避免在两个目录同时维护。

## 功能—章节—媒体—步骤—测试覆盖

| 已注册功能 | 向导章节 | 截图/示意图 | 关键步骤 | 自动化依据 |
| --- | --- | --- | --- | --- |
| 认识我、使用向导 | `getting-started` | 真实桌面截图 | 进入、启动、切窗、搜索 | guide / function-menu |
| 云资料 | `cloud-files` | 真实云资料截图 | 公共、私人、设备授权、导航 | device-cloud |
| 文件预览 | `file-preview-edit` | 文件流程图 | 默认打开、打开方式、设置默认、复核 | app-registry / file-types |
| 设置 | `settings-device` | 真实设置截图 | 语言、壁纸、个性化、指针、启动项、网络 | device / cursor / startup |
| 系统信息、新闻中心 | `system-news` | 真实桌面截图 | 记录版本、读新闻、返回 | version / news |
| 功能中心 | `function-center` | 真实功能中心截图 | 搜索、添加、打开、移除 | function-center / management |
| Developer Studio | `developer-studio` | 开发流程图 | 新建、编辑、验证、预览、构建 | studio workbench / security |
| 云秘书 | `cloud-secretary` | 服务入口图 | 打开根窗口、进入已注册服务 | legacyWindow |
| 讯筒与 DeskTalk | `desktalk` | 沟通流程图 | 找人、文字消息、AI、讯址连接、收发邮件 | desktalk / mailbox-center |
| APlay | `aplay` | 媒体流程图 | 选分类、播放、控制、失败恢复 | aplay source |
| Dreama | `dreama` | 嵌入边界图 | 输入地址、检查、外部打开 | Dreama source / runtime docs |
| Sheet Editor | `sheet` | Office 流程图 | 打开、编辑、另存、复核 | editor / file dialog |
| Write Editor | `write` | Office 流程图 | 打开、编辑、另存、复核 | editor / file dialog |
| Slide Editor | `slide` | Office 流程图 | 打开、查看、另存、复核 | editor / file dialog |
| 问道 | `navigation` | 出行流程图 | 问地规划、问天航班、问乡直达班次 | navigation / flight / transit |

未直接对应应用 ID 的补充章节：账户与同步、自然语言/AI 文件搜索、文件管理、隐私安全、故障排除。它们覆盖跨应用流程与恢复路径。

## 本次功能审计结论

- 当前检出分支可确认：工作空间与任务栏预览、桌面和云资料多选、打开方式与用户默认应用、壁纸库、丰富版 Sheet/Write/Slide、DeskTalk 联系人/文字聊天/AI 文件工具、连接式讯址中心、功能目录、Developer Studio、个性化、指针主题、应用启动项、设备状态和网络测速。
- 问道现包含问地路线与导航、问天航班、问乡 GTFS/12306/全球长途直达查询；没有实时位置时必须显示计划或推定状态，不得绘制虚构线路。
- APlay 当前稳定入口是页面内已配置的音乐、视频、电视和广播；“打开 URL”仍是后续提示，不把云媒体写成现有步骤。
- DeskTalk 语音、视频、发送文件仍是占位；照相机扫码登录后端在远端代码中明确关闭；设备 Storage v1 不提供写入、创建、删除和重命名。这些能力不得改写为已完成。

## 素材来源

- `desktop-overview.png`、`cloud-files.png`、`settings.png`、`function-center.png`：2026-09-15 对公开 `https://www.y0.hk/` 对应页面的只读实拍，不含私人账户数据。
- SVG 流程图：依据本仓库注册表、页面、接口说明和测试绘制；用于无法安全展示私人数据或版本边界的主题。
