# 讯址中心部署

1. 在 `aryansoft1` 数据库执行 `mail-center-net47/schema.sql`。
2. 将 `upload` 内的 `Api.ashx` 上传至网站 `/mail-center/`。
3. 将 `upload/bin` 内**全部** DLL 上传至网站根目录 `/bin/`。
4. 在根目录 `web.config` 的 `appSettings` 填入：
   - `MailCenterConnectionString`：MySQL 连接字符串。
   - `MailCenterEncryptionKeyBase64`：32 字节随机密钥的 Base64 文本。

生成密钥（仅在自己的管理员 PowerShell 中执行一次）：

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

不要将密钥、数据库密码或邮箱授权码发送到聊天或提交到仓库。

验证：`https://y0.hk/mail-center/Api.ashx?action=health`。只有响应中的 `configured` 为 `true`、`configurationStatus` 为 `ready` 时，讯址中心才真正可用于保存讯址和收发邮件。讯筒通过 SMTP 发信、IMAP 收信；QQ 邮箱需在设置中开启 IMAP/SMTP 服务并使用授权码，Gmail 使用应用专用密码。
