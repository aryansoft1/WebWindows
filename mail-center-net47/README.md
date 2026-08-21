# 讯址中心（.NET Framework 4.7）

构建后，把 `Api.ashx` 上传到虚拟主机的 `/mail-center/`；由于当前站点的 `/mail-center/` 不是独立 ASP.NET 应用，构建产物中的全部 DLL 必须上传到网站根目录的 `/bin/`。

验证地址：`https://你的域名/mail-center/Api.ashx?action=health`

期望结果中应有 `"ok":true` 与 `mailKitVersion`。讯筒采用 SMTP 发信与 IMAP 收信，因此已读状态会同步回邮件服务商；邮箱授权码仅在用户提交时传至讯址中心，服务端以加密形式保存，前端和浏览器本地存储均不保存授权码。
