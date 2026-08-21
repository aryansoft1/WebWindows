# WebWindows Unified File Search API v1

WebWindows.files.search() 是云资料、未来桌讯及其他应用共用的文件检索入口。调用方不得自行遍历私人云资料，也不应把推荐或 AI 推测混入确定性搜索结果。

## JavaScript API

    const response = await WebWindows.files.search("上周修改的 PDF");

    const response = await WebWindows.files.search({
      nameContains: "WebWindows",
      extensions: ["xlsx", "xls"],
      mimeTypes: ["application/vnd.ms-excel"],
      folderPath: "Documents",
      sources: ["private", "public", "device"],
      createdFrom: "2026-07-01T00:00:00+09:00",
      createdTo: "2026-08-01T00:00:00+09:00",
      modifiedFrom: "2026-07-01T00:00:00+09:00",
      modifiedTo: "2026-08-01T00:00:00+09:00",
      uploadedFrom: "2026-07-03T00:00:00+09:00",
      uploadedTo: "2026-07-04T00:00:00+09:00",
      sort: "relevance",
      order: "desc",
      limit: 100
    });

返回值包含 query、criteria、total、searchedSources、warnings 和 results。每项结果包含 id、nodeId、source、scope、name、path、folderPath、extension、mimeType、size、createdAt、modifiedAt、uploadedAt、readUrl、relevanceScore 和 matchReasons。

source 为 private、public 或 device。私人结果只在有效 WebWindows 登录会话内返回；readUrl 是同源受控读取地址，不包含服务器物理路径。设备结果使用已经授权的设备存储接口，未授权时不会弹出授权窗口。

## Query Parser

WebWindows.files.parseQuery(text, { now }) 将常见中文、日文和英文条件转换为结构化查询。v1 支持：

- 文件类型别名：Excel、Word、PowerPoint、PDF、ZIP、图片、Markdown、JSON。
- 日期：今天、昨天、本周、上周以及 7月3日、2026年7月3日。
- 日期动作：“保存/上传”映射到 uploadedAt，“修改/更新”映射到 modifiedAt，“创建/建立”映射到 createdAt。
- 来源：我的云资料、公共资料、此设备。
- 名称表达式：“名字里有 WebWindows”映射到 nameContains。

当前服务器没有独立上传时间元数据，因此云端 uploadedAt 在 v1 中等于文件系统 DateCreated。后续建立元数据索引后可替换该字段，调用契约不变。

## 评分与排序

名称精确匹配为 100 分，前缀 88 分，包含 78 分，全部词组 66 分，顺序模糊匹配 48 分。扩展名、MIME、路径及每项日期条件各增加 5 分，最高 100 分。结果默认按相关度降序；同分时优先私人资料、公共资料、此设备，然后按路径稳定排序。

matchReasons 使用稳定代码：fileNameExact、fileNamePrefix、fileNameContains、fileNameTokens、fileNameFuzzy、fileType、mimeType、folderPath、createdAt、modifiedAt、uploadedAt。

## 服务端端点

cloud/browser/search.asp 只扫描公共资料和当前登录用户的私人资料，限制为 10,000 个扫描条目、16 层目录和最多 500 个候选结果。设备资料由 JavaScript API 通过已经授权的存储提供器融合。桌讯接入时应调用 WebWindows.files.search()，而不是直接调用端点或自行遍历目录。
