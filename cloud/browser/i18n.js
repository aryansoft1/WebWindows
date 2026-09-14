(function installCloudI18n(global) {
  "use strict";

  const labels = {
    zh: {
      privateTitle: "我的私人文件", privateEyebrow: "WebWindows 私人云资料", publicArea: "公共区域",
      privateAccess: "仅当前账号可读写", loginTitle: "请先登录",
      loginDescription: "私人文件使用 WebWindows 登录会话保护。登录后重新打开此页面即可使用。",
      loginAction: "前往登录", locations: "资料位置", myFiles: "我的文件", privateToolbar: "私人云资料工具栏",
      privateFolders: "私人资料夹", privateDocuments: "文档", privateSpreadsheets: "表格", back: "返回", forward: "前进", up: "上一级", sortLabel: "排序方式",
      publicToolbar: "公共区域工具栏", publicFolders: "公共资料夹", resourceContent: "资料内容", breadcrumbs: "资料位置", cloudActions: "云资料操作",
      sortName: "按名称", sortDate: "按更新时间", sortSize: "按大小", listView: "列表", compactView: "紧凑", iconView: "图标",
      folder: "资料夹", emptyPrivateTitle: "此文件夹为空", emptyPrivateDescription: "可以使用右键菜单在云资料中建立文件夹。",
      nothingSelected: "尚未选择资料", saveLocationPrompt: "请选择保存位置并输入文件名", fileName: "文件名",
      cancel: "取消", save: "保存", confirmSelection: "确认选择", open: "打开", rename: "重命名", deleteFolder: "删除文件夹",
      newFolder: "新建文件夹", refresh: "刷新", privateActions: "私人文件操作", folderName: "文件夹名称", confirm: "确定",
      renameFolder: "重命名文件夹", creatingFolder: "正在建立文件夹…", renamingFolder: "正在重命名文件夹…",
      saveTo: "保存到：我的文件", selectedCount: "已选择 {count} 项", invalidFileName: "请输入有效的文件名。",
      allowedFileTypes: "文件类型必须为：{types}", replaceFile: "“{name}”已经存在，是否替换？",
      deleteFolderConfirm: "删除空文件夹“{name}”？", requestFailed: "请求失败（{status}）",
      operationFailed: "操作未完成", folderListUnavailable: "资料夹列表不可用", folderListFailed: "资料夹列表加载失败",
      previewUnavailable: "此类资料暂时没有可用的预览方式，可使用右键菜单保存副本到私人云资料。",
      fileDialogUnavailable: "通用云文件对话框尚未加载。", savePublicCopy: "保存公共资料副本", cloudFiles: "云资料",
      copySaved: "资料副本已保存到私人云资料。", copySaveFailed: "保存资料副本失败。",
      openUnavailable: "此类资料暂时没有可用的打开方式", copied: "资料位置已复制。",
      wallpaperApplied: "已保存到壁纸库并设置为桌面壁纸。", wallpaperSaved: "已保存到设置中的壁纸库。",
      infoFolder: "资料夹", infoFile: "资料", infoTemplate: "名称：{name}\n显示名称：{displayName}\n类型：{kind}\n位置：{path}",
      device: "此设备", deviceDescription: "仅显示你主动授权给 WebWindows 的本地位置。", addLocation: "添加本地位置",
      noAuthorizedLocation: "尚未授权本地位置", chooseFolderHint: "选择一个文件夹后，WebWindows 才能读取其中的文件。",
      chooseFolder: "选择文件夹", checkingDevice: "正在检查本地存储能力…", devicePanel: "此设备", pickerActions: "云资料选择操作",
      dialogOpenTitle: "从云资料打开", dialogSaveTitle: "保存到云资料", closeDialog: "关闭云文件对话框",
      purposeInvalid: "purpose 只能包含字母、数字、冒号、下划线和连字符。", fileTypeRequired: "至少需要提供一种可选择的文件类型。",
      tooManyFileTypes: "文件类型筛选不能超过 16 项。", cloudRequestFailed: "云资料请求失败（{status}）",
      invalidWriteTarget: "保存目标不是可写的私人云资料。", invalidWriteUrl: "云资料写入地址无效。",
      invalidContentSize: "保存内容必须在 1 字节到 15 MB 之间。", missingReadUrl: "云资料缺少读取地址。",
      invalidReadUrl: "云资料读取地址无效。", cloudReadFailed: "云资料读取失败（{status}）"
    },
    jp: {
      privateTitle: "プライベートファイル", privateEyebrow: "WebWindows プライベートクラウド", publicArea: "パブリックエリア",
      privateAccess: "現在のアカウントのみ読み書き可能", loginTitle: "ログインしてください",
      loginDescription: "プライベートファイルは WebWindows のログインセッションで保護されています。ログイン後、このページを開き直してください。",
      loginAction: "ログインへ", locations: "場所", myFiles: "マイファイル", privateToolbar: "プライベートクラウド ツールバー",
      privateFolders: "プライベートフォルダー", privateDocuments: "ドキュメント", privateSpreadsheets: "スプレッドシート", back: "戻る", forward: "進む", up: "上の階層", sortLabel: "並べ替え",
      publicToolbar: "パブリックエリア ツールバー", publicFolders: "公開フォルダー", resourceContent: "ファイル一覧", breadcrumbs: "場所", cloudActions: "クラウドファイル操作",
      sortName: "名前順", sortDate: "更新日時順", sortSize: "サイズ順", listView: "リスト", compactView: "コンパクト", iconView: "アイコン",
      folder: "フォルダー", emptyPrivateTitle: "このフォルダーは空です", emptyPrivateDescription: "右クリックメニューからフォルダーを作成できます。",
      nothingSelected: "ファイルが選択されていません", saveLocationPrompt: "保存先とファイル名を指定してください", fileName: "ファイル名",
      cancel: "キャンセル", save: "保存", confirmSelection: "選択を確定", open: "開く", rename: "名前を変更", deleteFolder: "フォルダーを削除",
      newFolder: "新しいフォルダー", refresh: "更新", privateActions: "プライベートファイル操作", folderName: "フォルダー名", confirm: "確認",
      renameFolder: "フォルダー名を変更", creatingFolder: "フォルダーを作成中…", renamingFolder: "フォルダー名を変更中…",
      saveTo: "保存先：マイファイル", selectedCount: "{count} 件選択", invalidFileName: "有効なファイル名を入力してください。",
      allowedFileTypes: "使用できるファイル形式：{types}", replaceFile: "「{name}」は既に存在します。置き換えますか？",
      deleteFolderConfirm: "空のフォルダー「{name}」を削除しますか？", requestFailed: "リクエストに失敗しました（{status}）",
      operationFailed: "操作を完了できませんでした", folderListUnavailable: "フォルダー一覧を利用できません", folderListFailed: "フォルダー一覧を読み込めませんでした",
      previewUnavailable: "この種類のファイルはプレビューできません。右クリックメニューからプライベートクラウドへコピーできます。",
      fileDialogUnavailable: "共通クラウドファイルダイアログが読み込まれていません。", savePublicCopy: "公開ファイルのコピーを保存", cloudFiles: "クラウドファイル",
      copySaved: "プライベートクラウドにコピーを保存しました。", copySaveFailed: "コピーを保存できませんでした。",
      openUnavailable: "この種類のファイルを開く方法がありません", copied: "ファイルの場所をコピーしました。",
      wallpaperApplied: "壁紙ライブラリに保存し、デスクトップの壁紙に設定しました。", wallpaperSaved: "設定の壁紙ライブラリに保存しました。",
      infoFolder: "フォルダー", infoFile: "ファイル", infoTemplate: "名前：{name}\n表示名：{displayName}\n種類：{kind}\n場所：{path}",
      device: "このデバイス", deviceDescription: "WebWindows に許可したローカルの場所だけを表示します。", addLocation: "ローカルの場所を追加",
      noAuthorizedLocation: "許可されたローカルの場所はありません", chooseFolderHint: "フォルダーを選択すると、WebWindows が中のファイルを読み取れるようになります。",
      chooseFolder: "フォルダーを選択", checkingDevice: "ローカルストレージ機能を確認中…", devicePanel: "このデバイス", pickerActions: "クラウドファイル選択操作",
      dialogOpenTitle: "クラウドから開く", dialogSaveTitle: "クラウドに保存", closeDialog: "クラウドファイルダイアログを閉じる",
      purposeInvalid: "purpose には英数字、コロン、アンダースコア、ハイフンのみ使用できます。", fileTypeRequired: "選択可能なファイル形式を1つ以上指定してください。",
      tooManyFileTypes: "ファイル形式は16件まで指定できます。", cloudRequestFailed: "クラウドファイルのリクエストに失敗しました（{status}）",
      invalidWriteTarget: "保存先は書き込み可能なプライベートクラウドではありません。", invalidWriteUrl: "クラウドファイルの書き込み先が無効です。",
      invalidContentSize: "保存内容は1バイト以上15 MB以下である必要があります。", missingReadUrl: "クラウドファイルの読み取り先がありません。",
      invalidReadUrl: "クラウドファイルの読み取り先が無効です。", cloudReadFailed: "クラウドファイルを読み取れませんでした（{status}）"
    },
    en: {
      privateTitle: "My Private Files", privateEyebrow: "WebWindows Private Cloud", publicArea: "Public area",
      privateAccess: "Read and write for this account only", loginTitle: "Please sign in",
      loginDescription: "Private files are protected by your WebWindows sign-in session. Sign in, then reopen this page.",
      loginAction: "Go to sign in", locations: "Locations", myFiles: "My files", privateToolbar: "Private cloud toolbar",
      privateFolders: "Private folders", privateDocuments: "Documents", privateSpreadsheets: "Spreadsheets", back: "Back", forward: "Forward", up: "Up", sortLabel: "Sort order",
      publicToolbar: "Public area toolbar", publicFolders: "Public folders", resourceContent: "File contents", breadcrumbs: "Location", cloudActions: "Cloud file actions",
      sortName: "By name", sortDate: "By modified date", sortSize: "By size", listView: "List", compactView: "Compact", iconView: "Icons",
      folder: "Folder", emptyPrivateTitle: "This folder is empty", emptyPrivateDescription: "Use the context menu to create a folder in cloud files.",
      nothingSelected: "No file selected", saveLocationPrompt: "Choose a save location and enter a file name", fileName: "File name",
      cancel: "Cancel", save: "Save", confirmSelection: "Confirm selection", open: "Open", rename: "Rename", deleteFolder: "Delete folder",
      newFolder: "New folder", refresh: "Refresh", privateActions: "Private file actions", folderName: "Folder name", confirm: "OK",
      renameFolder: "Rename folder", creatingFolder: "Creating folder…", renamingFolder: "Renaming folder…",
      saveTo: "Save to: My files", selectedCount: "{count} selected", invalidFileName: "Enter a valid file name.",
      allowedFileTypes: "File type must be: {types}", replaceFile: "“{name}” already exists. Replace it?",
      deleteFolderConfirm: "Delete the empty folder “{name}”?", requestFailed: "Request failed ({status})",
      operationFailed: "The operation could not be completed", folderListUnavailable: "Folder list unavailable", folderListFailed: "Could not load the folder list",
      previewUnavailable: "This file type cannot be previewed. Use the context menu to save a copy to your private cloud.",
      fileDialogUnavailable: "The shared cloud file dialog is not loaded.", savePublicCopy: "Save a copy of the public file", cloudFiles: "Cloud files",
      copySaved: "The copy was saved to your private cloud.", copySaveFailed: "Could not save the copy.",
      openUnavailable: "No app is available to open this file type", copied: "File location copied.",
      wallpaperApplied: "Saved to the wallpaper library and set as the desktop wallpaper.", wallpaperSaved: "Saved to the wallpaper library in Settings.",
      infoFolder: "Folder", infoFile: "File", infoTemplate: "Name: {name}\nDisplay name: {displayName}\nType: {kind}\nLocation: {path}",
      device: "This device", deviceDescription: "Only local locations you granted to WebWindows are shown.", addLocation: "Add local location",
      noAuthorizedLocation: "No local location authorized", chooseFolderHint: "Choose a folder to let WebWindows read its files.",
      chooseFolder: "Choose folder", checkingDevice: "Checking local storage capabilities…", devicePanel: "This device", pickerActions: "Cloud file selection actions",
      dialogOpenTitle: "Open from cloud", dialogSaveTitle: "Save to cloud", closeDialog: "Close cloud file dialog",
      purposeInvalid: "purpose may contain only letters, numbers, colons, underscores, and hyphens.", fileTypeRequired: "Provide at least one selectable file type.",
      tooManyFileTypes: "File type filters cannot exceed 16 entries.", cloudRequestFailed: "Cloud file request failed ({status})",
      invalidWriteTarget: "The save target is not writable private cloud storage.", invalidWriteUrl: "The cloud file write address is invalid.",
      invalidContentSize: "Content must be between 1 byte and 15 MB.", missingReadUrl: "The cloud file read address is missing.",
      invalidReadUrl: "The cloud file read address is invalid.", cloudReadFailed: "Cloud file read failed ({status})"
    }
  };

  function normalize(value) {
    const language = String(value || "").toLowerCase();
    if (language === "jp" || language.startsWith("ja")) return "jp";
    if (language.startsWith("en")) return "en";
    return "zh";
  }

  function language(value) {
    return normalize(value || global.localStorage?.getItem("lang") || document.body?.dataset.language || global.navigator?.language);
  }

  function format(template, values) {
    return String(template).replace(/\{(\w+)\}/g, (_, key) => values?.[key] ?? `{${key}}`);
  }

  function text(key, values, languageOverride) {
    const active = language(languageOverride);
    return format(labels[active]?.[key] || labels.zh[key] || key, values);
  }

  function apply(root, languageOverride) {
    const active = language(languageOverride);
    const scope = root || document;
    document.documentElement.lang = active === "jp" ? "ja-JP" : (active === "en" ? "en" : "zh-CN");
    if (document.body) document.body.dataset.language = active;
    scope.querySelectorAll?.("[data-cloud-i18n]").forEach((element) => {
      const key = element.dataset.cloudI18n;
      if (labels[active]?.[key] || labels.zh[key]) element.textContent = text(key, null, active);
    });
    [["data-cloud-i18n-title", "title"], ["data-cloud-i18n-aria-label", "aria-label"], ["data-cloud-i18n-placeholder", "placeholder"]]
      .forEach(([dataName, attribute]) => scope.querySelectorAll?.(`[${dataName}]`).forEach((element) => {
        const key = element.getAttribute(dataName);
        if (labels[active]?.[key] || labels.zh[key]) element.setAttribute(attribute, text(key, null, active));
      }));
    scope.querySelectorAll?.('a[href^="files.asp"],a[href^="private-files.asp"]').forEach((anchor) => {
      const url = new URL(anchor.href, global.location.href);
      url.searchParams.set("lang", active);
      anchor.href = url.toString();
    });
    return active;
  }

  const api = Object.freeze({ labels, normalize, language, text, apply });
  global.WebWindowsCloudI18n = api;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => apply(document), { once: true });
  else apply(document);
  global.addEventListener("storage", (event) => { if (event.key === "lang") apply(document); });
  global.addEventListener("message", (event) => { if (event.data?.type === "change-language") apply(document, event.data.lang); });
})(window);
