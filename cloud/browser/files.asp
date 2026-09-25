<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.CodePage = 65001
Response.Charset = "UTF-8"

Function NormalizePickerAccept(ByVal value, ByRef normalized)
  Dim raw, parts, index, item, extension, result, expression
  normalized = ""
  raw = LCase(Trim(CStr(value)))
  If raw = "application/zip" Then raw = ".zip"
  If raw = "" Then NormalizePickerAccept = False: Exit Function
  parts = Split(raw, ",")
  If UBound(parts) > 15 Then NormalizePickerAccept = False: Exit Function
  Set expression = New RegExp
  expression.Pattern = "^[a-z0-9]{1,12}$"
  expression.IgnoreCase = True
  result = ""
  For index = 0 To UBound(parts)
    item = Trim(CStr(parts(index)))
    If Left(item, 2) = "*." Then item = Mid(item, 3)
    If Left(item, 1) = "." Then item = Mid(item, 2)
    If Not expression.Test(item) Then Set expression = Nothing: NormalizePickerAccept = False: Exit Function
    extension = "." & LCase(item)
    If InStr(1, "," & result & ",", "," & extension & ",", vbTextCompare) = 0 Then
      If result <> "" Then result = result & ","
      result = result & extension
    End If
  Next
  Set expression = Nothing
  normalized = result
  NormalizePickerAccept = (normalized <> "")
End Function

Function PickerAccepts(ByVal extension, ByVal acceptList)
  PickerAccepts = (InStr(1, "," & acceptList & ",", ",." & LCase(CStr(extension)) & ",", vbTextCompare) > 0)
End Function

Function ValidPickerToken(ByVal value)
  Dim expression
  Set expression = New RegExp
  expression.Pattern = "^[A-Za-z0-9][A-Za-z0-9:_-]{0,79}$"
  expression.IgnoreCase = True
  ValidPickerToken = expression.Test(CStr(value))
  Set expression = Nothing
End Function

Dim relativePath, physicalPath, fso, folder, files, subfolders, sortBy, viewMode, language
Dim pickerMode, pickerAccept, pickerPurpose, pickerTitle, pickerMultiple, pickerRequestId, pickerAction
If Not CloudTryNormalizePath(Request.QueryString("path"), relativePath) Then
  Response.Status = "400 Bad Request"
  Response.Write "<!doctype html><meta charset=""utf-8""><p>资料位置无效。</p>"
  Response.End
End If
language = CloudRequestLanguage()
pickerMode = (LCase(Trim(CStr(Request.QueryString("mode")))) = "picker")
pickerPurpose = Trim(CStr(Request.QueryString("purpose")))
pickerTitle = Trim(CStr(Request.QueryString("title")))
pickerRequestId = Trim(CStr(Request.QueryString("requestId")))
If pickerRequestId = "" Then pickerRequestId = "legacy-picker"
pickerMultiple = (Trim(CStr(Request.QueryString("multiple"))) = "1")
pickerAction = LCase(Trim(CStr(Request.QueryString("action"))))
If pickerAction <> "save" Then pickerAction = "open"
If pickerMode Then
  If Not NormalizePickerAccept(Request.QueryString("accept"), pickerAccept) Then
    Response.Status = "400 Bad Request"
    Response.Write "<!doctype html><meta charset=""utf-8""><p>文件类型筛选无效。</p>"
    Response.End
  End If
  If Not IsValidPickerPurpose(pickerPurpose) Then
    Response.Status = "400 Bad Request"
    Response.Write "<!doctype html><meta charset=""utf-8""><p>选择用途无效。</p>"
    Response.End
  End If
  If Not ValidPickerToken(pickerRequestId) Then
    Response.Status = "400 Bad Request"
    Response.Write "<!doctype html><meta charset=""utf-8""><p>文件对话框请求编号无效。</p>"
    Response.End
  End If
  If pickerTitle = "" Then pickerTitle = "从云资料打开"
  If Len(pickerTitle) > 80 Then pickerTitle = Left(pickerTitle, 80)
End If

sortBy = LCase(Trim(CStr(Request.QueryString("sort"))))
If sortBy <> "date" And sortBy <> "size" Then sortBy = "name"
viewMode = LCase(Trim(CStr(Request.QueryString("view"))))
If viewMode <> "small" And viewMode <> "detail" Then viewMode = "large"

Set fso = Server.CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists(CloudPublicRoot()) Then
  Response.Status = "503 Service Unavailable"
  Response.Write "<!doctype html><meta charset=""utf-8""><p>公共区域尚未部署。</p>"
  Set fso = Nothing
  Response.End
End If

physicalPath = CloudPhysicalPath(relativePath)
If Not fso.FolderExists(physicalPath) Then
  Response.Status = "404 Not Found"
  Response.Write "<!doctype html><meta charset=""utf-8""><p>资料夹不存在。</p>"
  Set fso = Nothing
  Response.End
End If

Set folder = fso.GetFolder(physicalPath)
Set files = folder.Files
Set subfolders = folder.SubFolders

Dim visibleFileCount, currentFile
visibleFileCount = 0
For Each currentFile In files
  If LCase(currentFile.Name) <> ".gitkeep" Then visibleFileCount = visibleFileCount + 1
Next

Dim fileArr(), fileIndex
If visibleFileCount > 0 Then
  ReDim fileArr(visibleFileCount - 1)
  fileIndex = 0
  For Each currentFile In files
    If LCase(currentFile.Name) <> ".gitkeep" Then
      Set fileArr(fileIndex) = currentFile
      fileIndex = fileIndex + 1
    End If
  Next

  If visibleFileCount > 1 Then
    Dim leftIndex, rightIndex, leftFile, rightFile, shouldSwap, swapFile
    For leftIndex = 0 To visibleFileCount - 2
      For rightIndex = leftIndex + 1 To visibleFileCount - 1
        Set leftFile = fileArr(leftIndex)
        Set rightFile = fileArr(rightIndex)
        shouldSwap = False
        Select Case sortBy
          Case "date": shouldSwap = (leftFile.DateLastModified < rightFile.DateLastModified)
          Case "size": shouldSwap = (leftFile.Size < rightFile.Size)
          Case Else: shouldSwap = (LCase(leftFile.Name) > LCase(rightFile.Name))
        End Select
        If shouldSwap Then
          Set swapFile = fileArr(leftIndex)
          Set fileArr(leftIndex) = fileArr(rightIndex)
          Set fileArr(rightIndex) = swapFile
        End If
      Next
    Next
  End If
End If

Dim itemCount
itemCount = subfolders.Count + visibleFileCount
%>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>WebWindows <%=CloudHtml(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language))%></title>
  <link rel="stylesheet" href="styles.css?v=20260926-folder-tree-1">
  <link rel="stylesheet" href="file-search.css?v=20260809-search-1">
  <script src="../../assets/js/locale-region.js?v=20260802-1"></script>
  <script defer src="../../assets/js/tw.js?v=20260802-device-experience-3"></script>
  <script defer src="../../assets/js/device-storage-provider.js?v=20260809-storage-2"></script>
  <script defer src="../../assets/js/device-api.js?v=20260809-storage-2"></script>
  <script defer src="../../assets/js/file-search.js?v=20260809-search-1"></script>
  <script defer src="search-ui.js?v=20260809-search-1"></script>
  <script>
    // window.WebWindowsCloudI18n is optional everywhere else in the cloud browser
    // (search-ui.js and device-locations.js both fall back when it is missing), but
    // toolbar.js calls cloudI18n.apply() unconditionally. The resulting TypeError
    // aborted the last statements of toolbar.js, so the breadcrumb trail and the
    // sidebar folder tree were never rendered. Publish the facade before toolbar.js
    // runs. Language resolution mirrors what those two scripts already do, and
    // toolbar.js translates its own [data-cloud-i18n] labels one line earlier, so
    // apply() has nothing left to do.
    (function () {
      if (window.WebWindowsCloudI18n) return;
      window.WebWindowsCloudI18n = {
        labels: {},
        language: function () {
          var desktop = window.WebWindowsI18n;
          var value = (desktop && desktop.getLanguage && desktop.getLanguage()) ||
            window.localStorage.getItem("lang") || document.body.dataset.language || "zh";
          value = String(value).toLowerCase();
          if (value === "jp" || value.indexOf("ja") === 0) return "jp";
          return value.indexOf("en") === 0 ? "en" : "zh";
        },
        apply: function () {}
      };
    })();
  </script>
</head>
<body<% If pickerMode Then Response.Write " class=""picker-mode""" %>
      data-current-path="<%=CloudHtml(relativePath)%>" data-node-name="<%=CloudHtml(CLOUD_NODE_NAME)%>"
      data-node-id="<%=CloudHtml(CLOUD_NODE_ID)%>" data-language="<%=CloudHtml(language)%>"
      data-mode="<% If pickerMode Then Response.Write "picker" %>"
      data-picker-accept="<%=CloudHtml(pickerAccept)%>"
      data-picker-purpose="<%=CloudHtml(pickerPurpose)%>"
      data-picker-title="<%=CloudHtml(pickerTitle)%>"
      data-picker-request-id="<%=CloudHtml(pickerRequestId)%>"
      data-picker-multiple="<% If pickerMultiple Then Response.Write "1" Else Response.Write "0" %>"
      data-picker-action="<%=CloudHtml(pickerAction)%>">
  <div class="wrapper">
    <header class="resource-header">
      <div>
        <div class="resource-eyebrow" data-cloud-i18n="nodeName"><%=CloudHtml(CLOUD_NODE_NAME)%></div>
        <h1><img src="assets/cloud.svg" alt=""><span data-directory-name="Public"><%=CloudHtml(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language))%></span></h1>
      </div>
      <div class="resource-header-actions">
        <% If Not pickerMode Then %><a class="private-resource-link" href="private-files.asp" data-cloud-i18n="privateFiles">我的私人文件</a><% End If %>
        <% If pickerMode Then %>
          <a class="private-resource-link" href="private-files.asp?mode=picker&amp;action=<%=Server.URLEncode(pickerAction)%>&amp;accept=<%=Server.URLEncode(pickerAccept)%>&amp;multiple=<% If pickerMultiple Then Response.Write "1" Else Response.Write "0" %>&amp;purpose=<%=Server.URLEncode(pickerPurpose)%>&amp;requestId=<%=Server.URLEncode(pickerRequestId)%>&amp;title=<%=Server.URLEncode(pickerTitle)%>" data-cloud-i18n="privateFiles">我的私人文件</a>
          <span class="picker-type-badge"<% If pickerAction = "save" Then Response.Write " data-cloud-i18n=""publicAreaReadOnly""" %>><% If pickerAction = "save" Then Response.Write "公共区域只读" Else Response.Write CloudHtml(pickerAccept) %></span>
        <% End If %>
        <span class="read-only-badge"><img src="assets/eye.svg" alt=""><span data-cloud-i18n="publicReadOnly">所有人可查看</span></span>
      </div>
    </header>

    <nav class="toolbar" aria-label="<%=CloudHtml(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language))%>工具栏">
      <div class="toolbar-left">
        <button type="button" class="icon-btn" data-action="back" title="返回" aria-label="返回" data-cloud-i18n-title="back"><img src="assets/back.svg" alt=""></button>
        <button type="button" class="icon-btn" data-action="forward" title="前进" aria-label="前进" data-cloud-i18n-title="forward"><img src="assets/forward.svg" alt=""></button>
        <button type="button" class="icon-btn" data-action="up" title="上一级" aria-label="上一级" data-cloud-i18n-title="up"><img src="assets/up.svg" alt=""></button>
        <div id="breadcrumbs" class="breadcrumbs" aria-label="资料位置"></div>
      </div>
      <div class="toolbar-right">
        <label class="sort-control">
          <span class="sr-only">排序方式</span>
          <img src="assets/sort.svg" alt="">
          <select id="sort-select">
            <option value="name" data-cloud-i18n="sortName"<% If sortBy = "name" Then Response.Write " selected" %>>按名称</option>
            <option value="date" data-cloud-i18n="sortDate"<% If sortBy = "date" Then Response.Write " selected" %>>按更新时间</option>
            <option value="size" data-cloud-i18n="sortSize"<% If sortBy = "size" Then Response.Write " selected" %>>按大小</option>
          </select>
        </label>
        <button type="button" class="view-btn<% If viewMode = "detail" Then Response.Write " active" %>" data-view="detail"><img src="assets/list.svg" alt=""><span data-cloud-i18n="listView">列表</span></button>
        <button type="button" class="view-btn<% If viewMode = "small" Then Response.Write " active" %>" data-view="small"><img src="assets/compact.svg" alt=""><span data-cloud-i18n="compactView">紧凑</span></button>
        <button type="button" class="view-btn<% If viewMode = "large" Then Response.Write " active" %>" data-view="large"><img src="assets/grid.svg" alt=""><span data-cloud-i18n="iconView">图标</span></button>
      </div>
    </nav>

    <main class="main">
      <aside id="sidebar" aria-label="公共资料夹">
        <div class="sidebar-title" data-cloud-i18n="locations">资料位置</div>
        <% If relativePath = "" Then %>
        <button type="button" id="public-root-button" class="root-node selected" aria-current="page"><img src="assets/home.svg" alt=""><span data-directory-name="Public"><%=CloudHtml(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language))%></span></button>
        <% Else %>
        <button type="button" id="public-root-button" class="root-node"><img src="assets/home.svg" alt=""><span data-directory-name="Public"><%=CloudHtml(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language))%></span></button>
        <% End If %>
        <% If Not pickerMode Then %><button type="button" id="device-root-button" class="root-node device-root-node" hidden><span class="device-root-icon" aria-hidden="true">▣</span><span>此设备</span></button><% End If %>
        <ul id="folder-tree"></ul>
      </aside>

      <section class="file-list <%=viewMode%>" aria-label="资料内容">
        <%
        Dim childFolder, childPath, folderUrl
        For Each childFolder In subfolders
          childPath = CloudJoinPath(relativePath, childFolder.Name)
          folderUrl = "files.asp?path=" & Server.URLEncode(childPath) & _
            "&amp;view=" & Server.URLEncode(viewMode) & "&amp;sort=" & Server.URLEncode(sortBy) & _
            "&amp;lang=" & Server.URLEncode(language)
          If pickerMode Then
            folderUrl = folderUrl & "&amp;mode=picker&amp;action=" & Server.URLEncode(pickerAction) & _
              "&amp;accept=" & Server.URLEncode(pickerAccept) & _
              "&amp;multiple=" & CStr(Abs(CInt(pickerMultiple))) & _
              "&amp;purpose=" & Server.URLEncode(pickerPurpose) & _
              "&amp;requestId=" & Server.URLEncode(pickerRequestId) & _
              "&amp;title=" & Server.URLEncode(pickerTitle)
          End If
        %>
          <a class="file-item folder" href="<%=folderUrl%>" data-kind="folder"
             data-path="<%=CloudHtml(childPath)%>" data-name="<%=CloudHtml(childFolder.Name)%>">
            <img src="assets/folder.svg" alt="">
            <span class="file-name" data-physical-name="<%=CloudHtml(childFolder.Name)%>"><%=CloudHtml(CloudDisplayName(childFolder.Name, language))%></span>
            <% If viewMode = "detail" Then %>
              <span class="file-meta">资料夹</span>
              <span class="file-meta"><%=CloudHtml(CStr(childFolder.DateLastModified))%></span>
            <% End If %>
          </a>
        <%
        Next

        If visibleFileCount > 0 Then
          Dim renderIndex, fileItem, extension, iconPath, openMode, filePath, resourceUrl
          Dim mimeType, pickerEligible
          For renderIndex = 0 To visibleFileCount - 1
            Set fileItem = fileArr(renderIndex)
            extension = LCase(fso.GetExtensionName(fileItem.Name))
            iconPath = "assets/file.svg"
            openMode = ""
            mimeType = "application/octet-stream"
            pickerEligible = "false"
            Select Case extension
              Case "jpg", "jpeg", "png", "gif", "webp"
                iconPath = "assets/image.svg": openMode = "preview"
                If extension = "png" Then mimeType = "image/png"
                If extension = "jpg" Or extension = "jpeg" Then mimeType = "image/jpeg"
                If extension = "gif" Then mimeType = "image/gif"
                If extension = "webp" Then mimeType = "image/webp"
              Case "pdf"
                iconPath = "assets/pdf.svg": openMode = "preview": mimeType = "application/pdf"
              Case "txt", "log"
                iconPath = "assets/file.svg": openMode = "preview": mimeType = "text/plain"
              Case "md"
                iconPath = "assets/markdown.svg": openMode = "preview": mimeType = "text/markdown"
              Case "json"
                iconPath = "assets/json.svg": openMode = "preview": mimeType = "application/json"
              Case "csv"
                iconPath = "assets/sheet.svg": openMode = "app": mimeType = "text/csv"
              Case "xls"
                iconPath = "assets/sheet.svg": openMode = "app": mimeType = "application/vnd.ms-excel"
              Case "xlsx"
                iconPath = "assets/sheet.svg": openMode = "app": mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              Case "doc", "docx"
                iconPath = "assets/word.svg": openMode = "app"
                If extension = "doc" Then mimeType = "application/msword"
                If extension = "docx" Then mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              Case "ppt", "pptx"
                iconPath = "assets/presentation.svg": openMode = "app"
                If extension = "ppt" Then mimeType = "application/vnd.ms-powerpoint"
                If extension = "pptx" Then mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
              Case "zip"
                iconPath = "assets/archive.svg": mimeType = "application/zip"
            End Select
            If pickerMode And pickerAction = "open" And PickerAccepts(extension, pickerAccept) Then pickerEligible = "true"
            filePath = CloudJoinPath(relativePath, fileItem.Name)
            resourceUrl = "openResource.asp?path=" & Server.URLEncode(filePath)
        %>
          <button type="button" class="file-item file" data-kind="file"
                  data-path="<%=CloudHtml(filePath)%>" data-name="<%=CloudHtml(fileItem.Name)%>"
                  data-open-mode="<%=openMode%>" data-scope="public"
                  data-size="<%=fileItem.Size%>" data-mime-type="<%=CloudHtml(mimeType)%>"
                  data-picker-eligible="<%=pickerEligible%>"
                  data-resource-url="<%=CloudHtml(resourceUrl)%>"<%
                    If pickerMode And pickerEligible <> "true" Then
                      Response.Write " disabled aria-disabled=""true"""
                    End If
                  %>>
            <img src="<%=iconPath%>" alt="">
            <span class="file-name" data-file-physical-name="<%=CloudHtml(fileItem.Name)%>"><%=CloudHtml(CloudDisplayFileName(fileItem.Name, language))%></span>
            <% If viewMode = "detail" Then %>
              <span class="file-meta"><%=FormatFileSize(fileItem.Size)%></span>
              <span class="file-meta"><%=CloudHtml(CStr(fileItem.DateLastModified))%></span>
            <% End If %>
          </button>
        <%
          Next
        End If
        %>

        <% If itemCount = 0 Then %>
          <div class="empty-state">
            <img src="assets/folder.svg" alt="">
            <h2 data-cloud-i18n="emptyTitle">此资料夹暂时没有资料</h2>
            <p data-cloud-i18n="emptyDescription">公共资料由维护人员在后台统一管理。</p>
          </div>
        <% End If %>
      </section>
      <% If Not pickerMode Then %>
      <section id="device-panel" class="device-panel" aria-label="此设备" hidden>
        <div class="device-panel-heading">
          <div><h2>此设备</h2><p>仅显示你主动授权给 WebWindows 的本地位置。</p></div>
          <button type="button" id="device-add-location" class="device-primary-action">添加本地位置</button>
        </div>
        <div id="device-breadcrumbs" class="device-breadcrumbs"></div>
        <div id="device-status" class="device-status" role="status" aria-live="polite">正在检查本地存储能力…</div>
        <div id="device-content" class="device-content"></div>
      </section>
      <% End If %>
    </main>
    <% If pickerMode Then %>
      <footer class="picker-bar" aria-label="云资料选择操作">
        <div class="picker-selection">
          <strong id="picker-title"><%=CloudHtml(pickerTitle)%></strong>
          <span id="picker-selection-text" data-cloud-i18n="nothingSelected">尚未选择资料</span>
        </div>
        <div class="picker-actions">
          <button type="button" id="picker-cancel" class="picker-button secondary" data-cloud-i18n="cancel">取消</button>
          <button type="button" id="picker-confirm" class="picker-button primary" data-cloud-i18n="confirmSelection" disabled>确认选择</button>
        </div>
      </footer>
    <% End If %>
  </div>

  <div id="resource-context-menu" class="context-menu" role="menu" aria-label="云资料操作" hidden>
    <button type="button" role="menuitem" data-context-action="open">
      <img src="assets/open.svg" alt=""><span data-cloud-i18n="open">打开</span>
    </button>
    <button type="button" role="menuitem" data-context-action="copy-path">
      <img src="assets/copy.svg" alt=""><span data-cloud-i18n="copyPath">复制资料位置</span>
    </button>
    <button type="button" role="menuitem" data-context-action="download">
      <img src="assets/download.svg" alt=""><span data-cloud-i18n="saveCopy">保存副本到私人云资料</span>
    </button>
    <button type="button" role="menuitem" data-context-action="set-wallpaper" hidden>
      <img src="assets/image.svg" alt=""><span data-cloud-i18n="setWallpaper">设置为桌面壁纸</span>
    </button>
    <button type="button" role="menuitem" data-context-action="save-wallpaper" hidden>
      <img src="assets/image.svg" alt=""><span data-cloud-i18n="saveWallpaper">保存到壁纸库</span>
    </button>
    <button type="button" role="menuitem" data-context-action="info">
      <img src="assets/info.svg" alt=""><span data-cloud-i18n="info">资料信息</span>
    </button>
    <div class="context-separator" role="separator"></div>
    <button type="button" role="menuitem" data-context-action="root">
      <img src="assets/home.svg" alt=""><span data-directory-name="Public"><%=CloudHtml(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language))%></span>
    </button>
    <button type="button" role="menuitem" data-context-action="detail-view">
      <img src="assets/list.svg" alt=""><span data-cloud-i18n="listView">列表视图</span>
    </button>
    <button type="button" role="menuitem" data-context-action="large-view">
      <img src="assets/grid.svg" alt=""><span data-cloud-i18n="iconView">图标视图</span>
    </button>
    <button type="button" role="menuitem" data-context-action="refresh">
      <img src="assets/refresh.svg" alt=""><span data-cloud-i18n="refresh">刷新</span>
    </button>
  </div>

  <div id="message-box" class="message-overlay" hidden>
    <div class="message-card" role="alertdialog" aria-modal="true" aria-labelledby="message-text">
      <p id="message-text"></p>
      <button type="button" id="message-close" data-cloud-i18n="confirm">确定</button>
    </div>
  </div>

  <script src="toolbar.js?v=20260730-1"></script>
  <script>
    // Highlight the folder the user is currently in.
    //
    // toolbar.js owns the tree but cannot mark the active node: getFolders.asp takes no
    // path parameter, so every navigation re-renders the same full tree and the rendered
    // nodes carry no idea of where the user is. Doing it here instead means matching by
    // something both sides agree on. Matching on the visible label does not work: the tree
    // labels come from getFolders.asp (CloudDisplayName in node-config.asp) while
    // toolbar.js resolves names from its own directoryNames table, and those two tables
    // can disagree for the same folder, which silently leaves nothing highlighted.
    //
    // The page's own body dataset does carry the answer, so ask the server for the tree the
    // same way toolbar.js does and match on the physical path. Reusing toolbar.js's request
    // is safe because it caches nothing and the folder tree only changes when the page
    // reloads, which re-runs this script anyway. The response is memoized, so the repeated
    // rebuilds (every language change triggers one) share a single request.
    (function () {
      const tree = document.getElementById("folder-tree");
      if (!tree) return;

      const currentPath = document.body.dataset.currentPath || "";
      const language = document.body.dataset.language || "zh";
      let scheduled = false;
      // One request per page load, shared by every rebuild of the tree.
      let treePromise = null;

      function clearHighlight() {
        tree.querySelectorAll(".folder-label.selected").forEach((label) => {
          label.classList.remove("selected");
          label.removeAttribute("aria-current");
        });
      }

      // Depth-first order matches the order toolbar.js appends nodes in, so the index of
      // the current folder in the flattened payload is the index of its rendered button.
      function flattenAll(nodes, flat) {
        for (const node of nodes || []) {
          flat.push(node);
          flattenAll(node.children, flat);
        }
        return flat;
      }

      async function loadTree() {
        if (!treePromise) {
          treePromise = fetch(`getFolders.asp?lang=${encodeURIComponent(language)}`, { cache: "no-store" })
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null);
        }
        return treePromise;
      }

      async function highlightCurrentFolder() {
        clearHighlight();
        if (!currentPath) return;
        const payload = await loadTree();
        if (!Array.isArray(payload)) return;

        const flat = flattenAll(payload, []);
        const index = flat.findIndex((node) => node && node.path === currentPath);
        // -1 means the folder is gone or was renamed; the tree is simply left unmarked
        // rather than highlighting a neighbour.
        if (index < 0) return;

        const labels = tree.querySelectorAll(".folder-label");
        if (index >= labels.length) return;
        const label = labels[index];
        label.classList.add("selected");
        label.setAttribute("aria-current", "page");
        label.scrollIntoView({ block: "nearest" });
      }

      function schedule() {
        if (scheduled) return;
        scheduled = true;
        window.setTimeout(() => {
          scheduled = false;
          highlightCurrentFolder();
        }, 0);
      }

      // The tree is filled asynchronously and rebuilt again on every language change, so
      // re-run whenever it changes rather than once at load.
      new MutationObserver(schedule).observe(tree, { childList: true, subtree: true });
      schedule();
    })();
  </script>
  <% If Not pickerMode Then %><script src="device-locations.js?v=20260809-device-1"></script><% End If %>
</body>
</html>
<%
Set subfolders = Nothing
Set files = Nothing
Set folder = Nothing
Set fso = Nothing

Function FormatFileSize(bytes)
  If bytes < 1024 Then
    FormatFileSize = bytes & " B"
  ElseIf bytes < 1024 * 1024 Then
    FormatFileSize = FormatNumber(bytes / 1024, 2) & " KB"
  ElseIf bytes < 1024 * 1024 * 1024 Then
    FormatFileSize = FormatNumber(bytes / 1024 / 1024, 2) & " MB"
  Else
    FormatFileSize = FormatNumber(bytes / 1024 / 1024 / 1024, 2) & " GB"
  End If
End Function

Function IsValidPickerPurpose(ByVal value)
  Dim expression
  Set expression = New RegExp
  expression.Pattern = "^[A-Za-z0-9][A-Za-z0-9:_-]{0,63}$"
  expression.Global = False
  IsValidPickerPurpose = expression.Test(CStr(value))
  Set expression = Nothing
End Function
%>
