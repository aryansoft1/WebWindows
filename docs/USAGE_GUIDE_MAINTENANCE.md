# WebWindows 使用向导维护与覆盖清单

最后核对：2026-09-15  
内容版本：2026.09.15.1  
权威内容目录：`docs/guide-v2/`  
生成产物：`assets/data/guide-content.json`

## 维护规则

1. `data/apps/system-apps.json` 是当前检出分支的功能注册事实来源。新增或删除功能时必须同步调整某篇教程的 `covers`。
2. 每篇教程必须包含用途、适用场景、媒体及替代文本、至少两个编号步骤、操作结果、常见问题/权限提示和核对依据。
3. 运行 `npm run build:guide`。构建会拒绝缺失图片、重复文章 ID、未覆盖注册功能、引用不存在功能和不完整教程结构。
4. 运行 `node tests/guide-smoke.mjs`，再按功能运行对应 smoke test，并在桌面和 390px 移动视口检查目录、搜索、图片和键盘焦点。
5. `docs/guide/` 是 2026.07 的旧内容留档，不再参与构建；避免在两个目录同时维护。

## 功能—章节—媒体—步骤—测试覆盖

| 已注册功能 | 向导章节 | 截图/示意图 | 关键步骤 | 自动化依据 |
| --- | --- | --- | --- | --- |
| 认识我、使用向导 | `getting-started` | 真实桌面截图 | 进入、启动、切窗、搜索 | guide / function-menu |
| 云资料 | `cloud-files` | 真实云资料截图 | 公共、私人、设备授权、导航 | device-cloud |
| 文件预览 | `file-preview-edit` | 文件流程图 | 打开、匹配、另存、复核 | app-registry |
| 设置 | `settings-device` | 真实设置截图 | 语言、显示、声音、网络 | device / network |
| 系统信息、新闻中心 | `system-news` | 真实桌面截图 | 记录版本、读新闻、返回 | version / news |
| 功能中心 | `function-center` | 真实功能中心截图 | 搜索、添加、打开、移除 | function-center / management |
| Developer Studio | `developer-studio` | 开发流程图 | 新建、编辑、验证、预览、构建 | studio workbench / security |
| 云秘书 | `cloud-secretary` | 服务入口图 | 打开根窗口、进入已注册服务 | legacyWindow |
| 讯筒与 DeskTalk | `desktalk` | 沟通流程图 | 找人、加好友、文字消息、AI、讯筒 | desktalk-bigmodel |
| APlay | `aplay` | 媒体流程图 | 选来源、播放、控制、失败恢复 | aplay source / remote smoke |
| Dreama | `dreama` | 嵌入边界图 | 输入地址、检查、外部打开 | Dreama source / runtime docs |
| Sheet Editor | `sheet` | Office 流程图 | 打开、编辑、另存、复核 | editor / file dialog |
| Write Editor | `write` | Office 流程图 | 打开、编辑、另存、复核 | editor / file dialog |
| Slide Editor | `slide` | Office 流程图 | 打开、查看、另存、复核 | editor / file dialog |

未直接对应应用 ID 的补充章节：账户与同步、自然语言/AI 文件搜索、文件管理、隐私安全、故障排除。它们覆盖跨应用流程与恢复路径。

## 本次功能审计结论

- 当前检出分支可确认：自然语言文件查询、公共/私人/授权设备来源、私人上传与目录管理、受控文件预览、Office 打开/另存、DeskTalk 联系人/文字聊天/AI、讯筒界面、功能目录、Developer Studio、设备状态和网络测速。
- 远端 2026.09.14 功能分支和 2026-09-15 公开桌面可看到“照相机与扫描”，但当前检出分支的注册表和文件中没有该应用。它不能通过本分支的内部链接与构建校验，因此暂不作为本分支已注册章节。
- DeskTalk 受控 AI 文件工具及 APlay 云媒体已在远端较新分支存在，但当前检出分支缺少对应工具/入口。教程以“版本条件 + 稳定替代入口”表述，不宣称所有部署均可用。
- DeskTalk 语音、视频、发送文件仍是占位；照相机扫码登录后端在远端代码中明确关闭；设备 Storage v1 不提供写入、创建、删除和重命名。这些能力不得改写为已完成。

## 素材来源

- `desktop-overview.png`、`cloud-files.png`、`settings.png`、`function-center.png`：2026-09-15 对公开 `https://www.y0.hk/` 对应页面的只读实拍，不含私人账户数据。
- SVG 流程图：依据本仓库注册表、页面、接口说明和测试绘制；用于无法安全展示私人数据或版本边界的主题。

