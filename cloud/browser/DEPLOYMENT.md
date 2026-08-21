# WebWindows 云资源节点 V1 部署说明

`cloud/browser` 是一个可复制部署的云资源节点程序。每个节点提供自己的公共区域页面、只读资源接口和后台管理入口。

## 1. 目录结构

将整个 `browser` 文件夹复制到目标站点的 `cloud/browser`，并建立：

```text
cloud/
├─ browser/
│  ├─ files.asp
│  ├─ node-info.asp
│  ├─ list.asp
│  ├─ openResource.asp
│  ├─ createFolder.asp
│  ├─ manage.html
│  ├─ node-config.asp
│  └─ assets/
└─ file/
   ├─ Public/
   │  ├─ Welcome/
   │  ├─ Documents/
   │  ├─ Samples/
   │  ├─ Resources/
   │  ├─ Changelog/
   │  └─ Community/
   ├─ users/
   └─ trash/
```

第一阶段只启用 `file/Public`。服务器物理目录统一使用英文，界面通过
`name + displayName` 显示中文、日文或英文。`users` 和 `trash` 是后续协议预留目录。

IIS 应用程序池账号必须对 `cloud/file/Public` 具有读取权限；需要后台管理时，还必须具有建立子目录的权限。不要给 `cloud/browser` 脚本目录授予不必要的写权限。

兼容升级时，如果 `file/Public` 不存在但 `file/公共区域` 仍存在，节点会只读兼容旧目录。新安装和后续写入统一使用 `Public`。Windows/IIS 对目录大小写不敏感，但部署清单仍应保持 `Public` 的标准写法。

## 2. 节点标识

编辑 `node-config.asp` 中不含秘密的三个值：

```vb
Const CLOUD_NODE_ID = "tokyo-01"
Const CLOUD_NODE_NAME = "东京云资源节点"
Const CLOUD_PROTOCOL_VERSION = "1.0"
```

`CLOUD_NODE_ID` 在所有节点中必须唯一。部署完成后访问：

```text
https://node.example.com/cloud/browser/node-info.asp
```

响应中的 `protocol` 必须为 `webwindows-cloud-resource`，`publicReady` 必须为 `true`。

## 3. 节点管理密钥

后台的“建立资料夹”接口默认拒绝所有写操作。必须在服务器环境中设置：

```text
WEBWINDOWS_CLOUD_ADMIN_KEY=<随机生成的高强度密钥>
```

设置后回收应用程序池。不要把真实密钥写入 Git、`node-config.asp`、HTML 或 JavaScript。

Classic ASP 会按以下顺序读取管理密钥：

1. IIS Application 值 `WebWindowsCloudAdminKey`
2. 服务器环境变量 `WEBWINDOWS_CLOUD_ADMIN_KEY`

管理人员进入 `/cloud/browser/manage.html` 后临时输入密钥。密钥只保存在该页面的内存中，页面刷新后即清除。

## 4. 对外入口

公共区域：

```text
https://node.example.com/cloud/browser/files.asp
```

公共区域不要求登录，并且始终只读。即使管理员已经登录 WebWindows，前台也不会显示管理按钮。

节点后台：

```text
https://node.example.com/cloud/browser/manage.html
```

后台当前支持浏览公共区域、建立资料夹和加入资料。改名、移动和资料回收区在后续协议版本实现。

“加入资料”使用 ASP.NET 4.x 的 `addResource.ashx`，单项上限为 10 MB。节点必须启用 ASP.NET 4.x，并允许 `.ashx` 处理程序。当前允许图片、PDF、纯文本、Markdown、CSV、Office 文档和 ZIP；脚本与可执行网页类型会被拒绝。

## 5. 数据中心登记

在 WebWindows 数据中心后台登记节点时，`api_url` 应填写到 `browser` 层：

```text
https://node.example.com/cloud/browser
```

节点检测地址为：

```text
{api_url}/node-info.asp
```

旧版 `{api_url}/getFolders.asp` 仍保留为目录树兼容接口，但不应再作为节点能力检测依据。

## 6. 部署验收

依次检查：

1. `node-info.asp` 返回协议 1.0 且 `publicReady=true`。
2. `list.asp` 返回 `ok=true`，目录同时包含物理 `name` 与本地化 `displayName`，空库返回 `items:[]`。
3. `files.asp` 未登录也可以打开。
4. 空资料夹显示“此资料夹暂时没有资料”。
5. 前台不存在“建立资料夹”等写操作。
6. 未提供管理密钥时，`createFolder.asp` 返回 401。
7. 提供正确管理密钥后，可在后台建立中文、日文和带空格的资料夹。
8. 提供正确管理密钥后，可加入允许类型且不超过 10 MB 的资料。
9. `..`、绝对路径和 Windows 保留字符会被拒绝。
10. `Public/Documents` 在中文、日文、英文界面分别显示本地化名称，但请求路径始终保持 `Documents`。
11. PNG、JSON、Markdown 可内联预览；DOCX、XLSX、PPTX 使用正确图标并可下载。
12. 前台刷新后可以看到后台建立的资料夹和加入的资料。

## 7. 备份

公共资料的真实数据只位于 `cloud/file/Public`（兼容节点可能仍为 `cloud/file/公共区域`）。升级 `browser` 程序前仍应备份：

- `cloud/file/Public`
- `cloud/file/公共区域`（仅旧节点存在时）
- 节点标识配置
- IIS 环境变量和目录权限记录

不要将真实公共资料、管理密钥或用户资料提交到程序源码仓库。
