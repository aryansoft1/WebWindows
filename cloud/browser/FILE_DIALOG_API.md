# WebWindows 云文件对话框

应用应调用 `/assets/js/cloud-file-dialog.js` 提供的 `WebWindows.fileDialog`，不要自行拼接
`files.asp` URL，也不要自行监听选择器的 `postMessage`。

`WebWindowsCloudFiles` 是给现有页面保留的同对象别名。

## 打开文件

```js
const resource = await WebWindowsCloudFiles.open({
  title: "打开工作簿",
  fileTypes: [
    { name: "电子表格", extensions: ["xlsx", "xls", "csv"] }
  ],
  multiple: false,
  purpose: "sheet-editor-open"
});
```

`multiple: false` 返回一个资源或 `null`；`multiple: true` 返回资源数组或 `null`。
登录用户可以在公共区域和私人区域之间切换。未登录用户仍可选择公共资料。

## 保存文件

```js
const target = await WebWindowsCloudFiles.save({
  title: "保存文档",
  fileTypes: [{ name: "Word 文档", extensions: ["docx"] }],
  suggestedName: "新建文档.docx",
  purpose: "write-editor-save"
});

if (target) {
  const saved = await WebWindowsCloudFiles.write(target, docxBlob, {
    overwrite: target.overwrite
  });
}
```

保存对话框只进入当前登录用户的私人区域。公共区域没有写入口。单个文件最大 15 MB；
写入采用 `begin/chunk/commit`，目标在提交前不会被半成品覆盖。同名覆盖会保留 `.bak` 备份。

## 资源对象

```js
{
  name,
  path,          // 节点内相对逻辑路径，不是服务器物理路径
  nodeId,
  scope,         // public | private
  size,
  mimeType,
  readUrl,       // 同源、经过权限检查的读取地址
  editorDataUrl, // 私人 Office 文件可选
  saveEndpoint   // 私人 Office 文件可选
}
```

保存目标还包含 `writeUrl` 和 `overwrite`。任何地址都不得携带 API Key。

## 底层消息兼容

选择：

```js
{
  type: "webwindows:cloud-resource-selected",
  requestId,
  purpose,
  action: "open" | "save",
  multiple,
  resource: resources[0],
  resources
}
```

取消：

```js
{
  type: "webwindows:cloud-resource-picker-cancelled",
  requestId,
  purpose,
  action
}
```

`resource` 为旧版单选调用保留。新应用应使用公共 JavaScript API。
