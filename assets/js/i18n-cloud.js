// WebWindows 云链路多语言补充包。
// 不修改 tw.js / cloud-file-dialog.js 本体，只向 WebWindowsI18n.catalog 追加词条，
// 由 tw.js 的 DOM 自动翻译与 translate() 复用。WebWindowsI18n 未定义时直接跳过。
(function (global) {
  "use strict";

  var i18n = global.WebWindowsI18n;
  var catalog = i18n && i18n.catalog;
  if (!catalog || !catalog.tw || !catalog.en || !catalog.jp) return;

  // resource-open.js 的 alert / throw 文案（简体原文 -> 三语）。
  Object.assign(catalog.tw, {
    "此文件暂时没有可用的打开方式。": "暫時沒有可用於開啟此檔案的方式。",
    "没有已安装的应用可以打开此文件。": "沒有已安裝的應用程式可以開啟此檔案。",
    "资料打开失败。": "資料開啟失敗。",
    "无效的 WebWindows 云资源描述。": "無效的 WebWindows 雲端資源描述。",
    "缺少可用的云资源启动适配器。": "缺少可用的雲端資源啟動轉接器。"
  });
  Object.assign(catalog.en, {
    "此文件暂时没有可用的打开方式。": "There is currently no available way to open this file.",
    "没有已安装的应用可以打开此文件。": "No installed app can open this file.",
    "资料打开失败。": "Failed to open the resource.",
    "无效的 WebWindows 云资源描述。": "Invalid WebWindows cloud resource descriptor.",
    "缺少可用的云资源启动适配器。": "has no usable cloud resource launch adapter."
  });
  Object.assign(catalog.jp, {
    "此文件暂时没有可用的打开方式。": "このファイルを開ける方法が現在ありません。",
    "没有已安装的应用可以打开此文件。": "このファイルを開けるアプリがインストールされていません。",
    "资料打开失败。": "資料を開けませんでした。",
    "无效的 WebWindows 云资源描述。": "WebWindows クラウドリソースの記述が無効です。",
    "缺少可用的云资源启动适配器。": "に対応するクラウドリソース起動アダプターがありません。"
  });

  // cloud-file-dialog.js 内置 messages 只有 zh/jp/en（tw 会回落到 zh），且本体不可改。
  // 这里补 catalog，使宿主 DOM 自动翻译与 translate() 能覆盖 tw（en/jp 亦可复用）。
  // 注：带 {status} 的报错在抛出时已被插值，catalog 只能翻译其静态前缀。
  Object.assign(catalog.tw, {
    "purpose 只能包含字母、数字、冒号、下划线和连字符。": "purpose 只能包含字母、數字、冒號、底線和連字號。",
    "至少需要提供一种可选择的文件类型。": "至少需要提供一種可選擇的檔案類型。",
    "文件类型筛选不能超过 16 项。": "檔案類型篩選不能超過 16 項。",
    "保存到云资料": "儲存到雲端資料",
    "关闭云文件对话框": "關閉雲端檔案對話方塊",
    "保存目标不是可写的私人云资料。": "儲存目標不是可寫入的私人雲端資料。",
    "云资料写入地址无效。": "雲端資料寫入位址無效。",
    "保存内容必须在 1 字节到 15 MB 之间。": "儲存內容必須介於 1 位元組到 15 MB 之間。",
    "云资料缺少读取地址。": "雲端資料缺少讀取位址。",
    "云资料读取地址无效。": "雲端資料讀取位址無效。",
    "云资料请求失败": "雲端資料請求失敗",
    "云资料读取失败": "雲端資料讀取失敗"
  });
  Object.assign(catalog.en, {
    "purpose 只能包含字母、数字、冒号、下划线和连字符。": "purpose may contain only letters, numbers, colons, underscores, and hyphens.",
    "至少需要提供一种可选择的文件类型。": "Provide at least one selectable file type.",
    "文件类型筛选不能超过 16 项。": "File type filters cannot exceed 16 entries.",
    "保存到云资料": "Save to cloud",
    "关闭云文件对话框": "Close cloud file dialog",
    "保存目标不是可写的私人云资料。": "The save target is not writable private cloud storage.",
    "云资料写入地址无效。": "The cloud file write address is invalid.",
    "保存内容必须在 1 字节到 15 MB 之间。": "Content must be between 1 byte and 15 MB.",
    "云资料缺少读取地址。": "The cloud file read address is missing.",
    "云资料读取地址无效。": "The cloud file read address is invalid.",
    "云资料请求失败": "Cloud file request failed",
    "云资料读取失败": "Cloud file read failed"
  });
  Object.assign(catalog.jp, {
    "purpose 只能包含字母、数字、冒号、下划线和连字符。": "purpose には英数字、コロン、アンダースコア、ハイフンのみ使用できます。",
    "至少需要提供一种可选择的文件类型。": "選択可能なファイル形式を1つ以上指定してください。",
    "文件类型筛选不能超过 16 项。": "ファイル形式は16件まで指定できます。",
    "保存到云资料": "クラウドに保存",
    "关闭云文件对话框": "クラウドファイルダイアログを閉じる",
    "保存目标不是可写的私人云资料。": "保存先は書き込み可能なプライベートクラウドではありません。",
    "云资料写入地址无效。": "クラウドファイルの書き込み先が無効です。",
    "保存内容必须在 1 字节到 15 MB 之间。": "保存内容は1バイト以上15 MB以下である必要があります。",
    "云资料缺少读取地址。": "クラウドファイルの読み取り先がありません。",
    "云资料读取地址无效。": "クラウドファイルの読み取り先が無効です。",
    "云资料请求失败": "クラウドファイルのリクエストに失敗しました",
    "云资料读取失败": "クラウドファイルを読み取れませんでした"
  });
})(window);
