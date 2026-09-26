# SystemManager 上线审计与后续 53 文件范围

## 已完成的生产发布

- 数据库迁移 `003`、`004`、`005`、`006` 已按顺序执行。迁移前在仓库外备份用户、数据中心、新闻和旧反馈表；旧反馈 2 条及正文消息 2 条在迁移后仍存在。
- 生产版本 `2026.09.26.33` 已部署。该次清单实际上传 61 个文件，60 个非清单文件的 FTP 回读校验全部通过；清单经 HTTP 回读与本地字节一致。
- 最小在线检查：管理入口、开发者页、示例 ZIP 均为 HTTP 200；新闻接口返回 2 条；开发者内容接口返回有效空列表；未登录读取用户接口返回 401。
- 这次已经完成的 61 文件发布保持原样。不要为缩减文件数回滚或再次上传 `.33`。

## 后续候选的 53 个上传目标

以下路径相对于仓库根目录。它们是**后续新版本的范围基准**，不是对已上线 `.33` 清单的修改；准备新版本时仍须对照届时生产清单重新生成哈希并运行部署门禁。

```text
admin_api/adminAuth.asp
admin_api/checkDatacenter.asp
admin_api/dashboardStats.asp
admin_api/deleteDatacenter.asp
admin_api/deleteUser.asp
admin_api/developerContent.asp
admin_api/feedback.asp
admin_api/getDatacenters.asp
admin_api/getUserById.asp
admin_api/getUsers.asp
admin_api/news.asp
admin_api/saveDatacenter.asp
admin_api/saveUser.asp
admin_api/settings.asp
api/feedback.asp
assets/css/developer-center.css
assets/js/developer-content.js
assets/js/news_view.js
contact.html
developer_content.asp
developer-samples/hello-webwindows.zip
developer.html
getNews.asp
getNewsById.asp
getPrevNextNews.asp
inc/admin-security.asp
SystemManager/assets/css/admin-utilities.css
SystemManager/assets/css/developer-platform-admin.css
SystemManager/assets/js/admin-login.js
SystemManager/assets/js/admin-security.js
SystemManager/assets/js/dashboard.js
SystemManager/assets/js/datacenter.js
SystemManager/assets/js/developer-content-admin.js
SystemManager/assets/js/feedback.js
SystemManager/assets/js/files.js
SystemManager/assets/js/news.js
SystemManager/assets/js/page-guard.js
SystemManager/assets/js/settings.js
SystemManager/assets/js/users.js
SystemManager/dashboard.html
SystemManager/datacenter.html
SystemManager/developer-platform.html
SystemManager/feedback.html
SystemManager/files.html
SystemManager/functions.html
SystemManager/index.html
SystemManager/layout.html
SystemManager/login.html
SystemManager/news.html
SystemManager/settings.html
SystemManager/users.html
SystemManager/visitor-analytics.html
deploy/ftp-manifest.json
```

计数：直接功能文件 50 个，本地后台样式 1 个，样例 ZIP 1 个，发布清单 1 个，共 53 个。

## 从后续候选上传范围排除的 8 个文件

```text
assets/js/developer-center.js
developer-samples/hello-webwindows/index.html
developer-samples/hello-webwindows/manifest.json
api/mobile-version.asp
api/release-version.asp
assets/js/sysinfo.js
data/apps/system-apps.json
sysinfo.html
```

前三个文件在 `.32` 清单中未记录，但部署前已从生产读取并确认与候选字节相同；其余五个在 `.32` 清单中已有记录，生产哈希与候选文件相同。它们无需仅为本轮 SystemManager 功能重复上传。样例 ZIP 按用户确认保留在 53 文件范围内。
