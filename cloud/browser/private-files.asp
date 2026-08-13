<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Option Explicit
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.AddHeader "X-WebWindows-Private-Files-Version", "2026.08.10.4"

Dim webWindowsUserId, webWindowsUsername, webWindowsCookieUsername, loggedIn
webWindowsUserId = Trim(CStr(Session("webwindows_user_id")))
webWindowsUsername = Trim(CStr(Session("webwindows_username")))
webWindowsCookieUsername = Trim(CStr(Request.Cookies("webwindows_user")))

' 兼容升级前的普通前台会话；后台管理员会话不得迁移为私人云身份。
If (webWindowsUserId = "" Or webWindowsUsername = "") And _
   Not (Session("webwindows_admin") = True) And webWindowsCookieUsername <> "" And _
   StrComp(webWindowsCookieUsername, Trim(CStr(Session("username"))), vbBinaryCompare) = 0 Then
  webWindowsUserId = Trim(CStr(Session("user_id")))
  webWindowsUsername = Trim(CStr(Session("username")))
  If webWindowsUserId <> "" And webWindowsUsername <> "" Then
    Session("webwindows_user_id") = webWindowsUserId
    Session("webwindows_username") = webWindowsUsername
    Session("webwindows_nickname") = Trim(CStr(Session("nickname")))
  End If
End If
loggedIn = (webWindowsUserId <> "" And webWindowsUsername <> "")

Function Html(ByVal value)
  Html = Server.HTMLEncode(CStr(value))
End Function

Function PrivateFolderDisplayName(ByVal value)
  Select Case LCase(CStr(value))
    Case "documents"
      PrivateFolderDisplayName = "文档"
    Case "spreadsheets"
      PrivateFolderDisplayName = "表格"
    Case Else
      PrivateFolderDisplayName = CStr(value)
  End Select
End Function

Function TryPath(ByVal value, ByRef normalized)
  Dim raw, parts, index, segment, result
  normalized = ""
  raw = Replace(Trim(CStr(value)), "\", "/")
  If InStr(raw, Chr(0)) > 0 Or Left(raw, 1) = "/" Then TryPath = False: Exit Function
  If Right(raw, 1) = "/" Then raw = Left(raw, Len(raw) - 1)
  If raw = "" Then TryPath = True: Exit Function
  parts = Split(raw, "/")
  result = ""
  For index = 0 To UBound(parts)
    segment = Trim(CStr(parts(index)))
    If segment = "" Or segment = "." Or segment = ".." Or LCase(segment) = "_system" Then TryPath = False: Exit Function
    If InStr(segment, ":") > 0 Or InStr(segment, "*") > 0 Or InStr(segment, "?") > 0 Or _
       InStr(segment, """") > 0 Or InStr(segment, "<") > 0 Or InStr(segment, ">") > 0 Or InStr(segment, "|") > 0 Then
      TryPath = False: Exit Function
    End If
    If result <> "" Then result = result & "/"
    result = result & segment
  Next
  normalized = result
  TryPath = True
End Function

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

Function SupportedPrivateFile(ByVal extension)
  Dim value
  value = LCase(CStr(extension))
  SupportedPrivateFile = (InStr(1, ",xlsx,xls,csv,docx,doc,pptx,ppt,pdf,png,jpg,jpeg,gif,webp,json,md,txt,zip,mp3,wav,ogg,oga,m4a,aac,flac,opus,mp4,webm,mov,m4v,ogv,mkv,", _
    "," & value & ",", vbTextCompare) > 0)
End Function

Function FileMime(ByVal extension)
  Select Case LCase(CStr(extension))
    Case "zip": FileMime = "application/zip"
    Case "xlsx": FileMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    Case "xls": FileMime = "application/vnd.ms-excel"
    Case "csv": FileMime = "text/csv"
    Case "docx": FileMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    Case "doc": FileMime = "application/msword"
    Case "pptx": FileMime = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    Case "ppt": FileMime = "application/vnd.ms-powerpoint"
    Case "pdf": FileMime = "application/pdf"
    Case "png": FileMime = "image/png"
    Case "jpg", "jpeg": FileMime = "image/jpeg"
    Case "gif": FileMime = "image/gif"
    Case "webp": FileMime = "image/webp"
    Case "json": FileMime = "application/json"
    Case "md": FileMime = "text/markdown"
    Case "txt": FileMime = "text/plain"
    Case "mp3": FileMime = "audio/mpeg"
    Case "wav": FileMime = "audio/wav"
    Case "ogg", "oga": FileMime = "audio/ogg"
    Case "m4a": FileMime = "audio/mp4"
    Case "aac": FileMime = "audio/aac"
    Case "flac": FileMime = "audio/flac"
    Case "opus": FileMime = "audio/opus"
    Case "mp4", "m4v": FileMime = "video/mp4"
    Case "webm": FileMime = "video/webm"
    Case "mov": FileMime = "video/quicktime"
    Case "ogv": FileMime = "video/ogg"
    Case "mkv": FileMime = "video/x-matroska"
    Case Else: FileMime = "application/octet-stream"
  End Select
End Function

Dim relativePath, privateRoot, physicalPath, fso, folder, usernameFolder, normalizedUsername
Dim pickerMode, pickerAccept, pickerPurpose, pickerTitle, pickerRequestId
Dim pickerMultiple, pickerAction, pickerSuggestedName, viewMode, sortBy
relativePath = ""
viewMode = LCase(Trim(CStr(Request.QueryString("view"))))
If viewMode <> "detail" And viewMode <> "small" Then viewMode = "large"
sortBy = LCase(Trim(CStr(Request.QueryString("sort"))))
If sortBy <> "date" And sortBy <> "size" Then sortBy = "name"
pickerMode = (LCase(Trim(CStr(Request.QueryString("mode")))) = "picker")
pickerPurpose = Trim(CStr(Request.QueryString("purpose")))
pickerTitle = Trim(CStr(Request.QueryString("title")))
pickerRequestId = Trim(CStr(Request.QueryString("requestId")))
If pickerRequestId = "" Then pickerRequestId = "legacy-picker"
pickerMultiple = (Trim(CStr(Request.QueryString("multiple"))) = "1")
pickerAction = LCase(Trim(CStr(Request.QueryString("action"))))
If pickerAction <> "save" Then pickerAction = "open"
pickerSuggestedName = Trim(CStr(Request.QueryString("suggestedName")))
If pickerMode Then
  If Not NormalizePickerAccept(Request.QueryString("accept"), pickerAccept) Then
    Response.Status = "400 Bad Request"
    Response.Write "文件类型筛选无效。"
    Response.End
  End If
  If Not ValidPickerPurpose(pickerPurpose) Then
    Response.Status = "400 Bad Request"
    Response.Write "选择用途无效。"
    Response.End
  End If
  If Not ValidPickerRequestId(pickerRequestId) Then
    Response.Status = "400 Bad Request"
    Response.Write "文件对话框请求编号无效。"
    Response.End
  End If
  If pickerTitle = "" Then
    If pickerAction = "save" Then pickerTitle = "保存到云资料" Else pickerTitle = "从云资料打开"
  End If
  If Len(pickerTitle) > 80 Then pickerTitle = Left(pickerTitle, 80)
  If Len(pickerSuggestedName) > 120 Then pickerSuggestedName = Left(pickerSuggestedName, 120)
End If
If loggedIn Then
  usernameFolder = webWindowsUsername
  If Not TryPath(usernameFolder, normalizedUsername) Or normalizedUsername = "" Or _
     normalizedUsername <> usernameFolder Or InStr(normalizedUsername, "/") > 0 Then
    Response.Status = "403 Forbidden"
    Response.Write "登录用户名无法映射到云资料目录。"
    Response.End
  End If
  If Not TryPath(Request.QueryString("path"), relativePath) Then
    Response.Status = "400 Bad Request"
    relativePath = ""
  End If
  privateRoot = Server.MapPath("../file/" & normalizedUsername)
  physicalPath = privateRoot
  If relativePath <> "" Then physicalPath = physicalPath & "\" & Replace(relativePath, "/", "\")
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Not fso.FolderExists(privateRoot) Then fso.CreateFolder privateRoot
  If Not fso.FolderExists(physicalPath) Then
    Response.Status = "404 Not Found"
    physicalPath = privateRoot
    relativePath = ""
  End If
  Set folder = fso.GetFolder(physicalPath)
End If
%>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>我的私人文件</title>
  <script src="../../assets/js/locale-region.js?v=20260802-1"></script>
  <script defer src="../../assets/js/tw.js?v=20260802-device-experience-3"></script>
  <script defer src="../../assets/js/device-api.js?v=20260809-storage-2"></script>
  <script defer src="../../assets/js/file-query-parser.js?v=20260811-query-v2-3"></script>
  <script defer src="../../assets/js/file-search.js?v=20260811-query-v2-3"></script>
  <script defer src="search-ui.js?v=20260814-language-1"></script>
  <link rel="stylesheet" href="file-search.css?v=20260814-toolbar-1">
  <link rel="stylesheet" href="private-files.css?v=20260814-toolbar-1">
  <style>
    :root{font-family:"Segoe UI","Microsoft YaHei",system-ui,sans-serif;color:#1f2937;background:#f5f7fb}
    *{box-sizing:border-box}body{margin:0}.top{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;background:#fff;border-bottom:1px solid #dbe3ec}
    h1{margin:0;font-size:21px}.sub{margin-top:4px;color:#64748b;font-size:12px}.actions{display:flex;gap:8px;align-items:center}
    button,.link{padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#334155;font:inherit;text-decoration:none;cursor:pointer}
    .primary{border-color:#2563eb;background:#2563eb;color:#fff}.bar{display:flex;align-items:center;gap:8px;padding:10px 22px;background:#f8fafc;border-bottom:1px solid #e2e8f0}
    .bar a{color:#2563eb;text-decoration:none}.files{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;padding:22px}
    .item{display:flex;align-items:center;gap:10px;min-height:62px;padding:10px;border:1px solid #dbe3ec;border-radius:11px;background:#fff;text-align:left;cursor:pointer}
    .item:hover,.item:focus,.item.selected{border-color:#60a5fa;background:#eff6ff}.icon{display:grid;place-items:center;width:40px;height:40px;border-radius:9px;background:#e8f5ee;color:#107c41;font-weight:800}
    .folder .icon{background:#fff4ce;color:#8a5a00}.document .icon{background:#e8f1ff;color:#1d4ed8}.presentation .icon{background:#fff0e6;color:#c2410c}
    .archive .icon{background:#f3e8ff;color:#7e22ce}.image .icon{background:#ecfdf5;color:#047857}.text .icon{background:#f1f5f9;color:#334155}.name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .empty,.login{margin:60px auto;padding:30px;max-width:520px;text-align:center;color:#64748b;background:#fff;border:1px solid #e2e8f0;border-radius:14px}
    #status{padding:0 22px 16px;color:#475569;font-size:13px}.error{color:#b91c1c}
    .context-menu{position:fixed;z-index:50;display:none;min-width:168px;padding:6px;background:rgba(255,255,255,.98);border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 12px 32px rgba(15,23,42,.18)}
    .context-menu.open{display:block}.context-menu button{display:block;width:100%;padding:8px 10px;border:0;border-radius:6px;text-align:left}.context-menu button:hover,.context-menu button:focus{background:#eff6ff}
    .context-menu .danger{color:#b91c1c}.context-menu hr{margin:5px 2px;border:0;border-top:1px solid #e2e8f0}
    dialog{width:min(360px,calc(100% - 32px));padding:0;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 18px 55px rgba(15,23,42,.25)}
    dialog::backdrop{background:rgba(15,23,42,.28)}.dialog-body{padding:20px}.dialog-body h2{margin:0 0 14px;font-size:18px}
    .dialog-body input{width:100%;padding:9px 10px;border:1px solid #94a3b8;border-radius:7px;font:inherit}.dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
    .picker-note{padding:6px 10px;border-radius:999px;background:#fff4d8;color:#9a5b00;font-size:12px;font-weight:650}
    .picker-mode{padding-bottom:78px}.picker-mode .context-menu{display:none!important}
    .picker-bar{position:fixed;left:0;right:0;bottom:0;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:68px;padding:10px 18px;border-top:1px solid #dbe3ec;background:rgba(255,255,255,.97);box-shadow:0 -8px 24px rgba(15,23,42,.08)}
    .picker-selection strong,.picker-selection span{display:block}.picker-selection span{margin-top:4px;color:#64748b;font-size:12px}.picker-actions{display:flex;gap:8px;align-items:center}.picker-actions button:disabled{opacity:.48;cursor:not-allowed}
    .picker-name{width:min(320px,36vw);padding:8px 10px;border:1px solid #94a3b8;border-radius:7px;font:inherit}
  </style>
</head>
<body<% If pickerMode Then Response.Write " class=""picker-mode""" %>
      data-private-files-version="2026.08.10.4"
      data-path="<%=Html(relativePath)%>" data-mode="<% If pickerMode Then Response.Write "picker" %>"
      data-picker-purpose="<%=Html(pickerPurpose)%>"
      data-picker-title="<%=Html(pickerTitle)%>"
      data-picker-request-id="<%=Html(pickerRequestId)%>"
      data-picker-multiple="<% If pickerMultiple Then Response.Write "1" Else Response.Write "0" %>"
      data-picker-action="<%=Html(pickerAction)%>"
      data-picker-accept="<%=Html(pickerAccept)%>"
      data-picker-suggested-name="<%=Html(pickerSuggestedName)%>">
<% If Not loggedIn Then %>
  <div class="login">
    <h1>请先登录</h1>
    <p>私人文件使用 WebWindows 登录会话保护。登录后重新打开此页面即可使用。</p>
    <a class="link primary" href="../../login.html?return=<%=Server.URLEncode("cloud/browser/private-files.asp?" & CStr(Request.ServerVariables("QUERY_STRING")))%>">前往登录</a>
    <a class="link" href="<%=Html(PublicFolderUrl(""))%>">返回公共区域</a>
  </div>
<% Else %>
  <div class="private-wrapper">
  <header class="private-resource-header">
    <div><div class="private-eyebrow">WebWindows 私人云资料</div><h1><img src="assets/cloud.svg" alt=""><span>我的私人文件</span></h1></div>
    <div class="private-header-actions">
      <% If pickerMode Then %>
        <% If pickerAction = "open" Then %><a class="private-header-link" href="<%=Html(PublicFolderUrl(""))%>">公共区域</a><% End If %>
        <span class="picker-note"><%=Html(pickerAccept)%></span>
      <% Else %>
      <a class="private-header-link" href="files.asp">公共区域</a><span class="private-badge"><img src="assets/eye.svg" alt="">仅当前账号可读写</span><% End If %>
    </div>
  </header>
  <nav class="private-toolbar" aria-label="私人云资料工具栏">
    <div class="private-toolbar-left">
      <button type="button" class="private-icon-btn" data-private-action="back" title="返回" aria-label="返回"><img src="assets/back.svg" alt=""></button>
      <button type="button" class="private-icon-btn" data-private-action="forward" title="前进" aria-label="前进"><img src="assets/forward.svg" alt=""></button>
      <button type="button" class="private-icon-btn" data-private-action="up" title="上一级" aria-label="上一级"<% If relativePath = "" Then Response.Write " disabled" %>><img src="assets/up.svg" alt=""></button>
      <div class="private-breadcrumbs"><a href="<%=Html(PrivateFolderUrl(""))%>">我的文件</a>
    <%
      Dim crumbs, crumbIndex, crumbPath
      crumbs = Split(relativePath, "/")
      crumbPath = ""
      If relativePath <> "" Then
        For crumbIndex = 0 To UBound(crumbs)
          crumbPath = crumbs(crumbIndex)
          If crumbIndex > 0 Then crumbPath = JoinPrefix(crumbs, crumbIndex)
          Response.Write " <span>›</span> <a href=""" & Html(PrivateFolderUrl(crumbPath)) & """>" & Html(PrivateFolderDisplayName(crumbs(crumbIndex))) & "</a>"
        Next
      End If
    %>
      </div>
    </div>
    <div class="private-toolbar-right" data-search-host>
      <label class="private-sort"><img src="assets/sort.svg" alt=""><select id="private-sort" aria-label="排序方式"><option value="name"<% If sortBy = "name" Then Response.Write " selected" %>>按名称</option><option value="date"<% If sortBy = "date" Then Response.Write " selected" %>>按更新时间</option><option value="size"<% If sortBy = "size" Then Response.Write " selected" %>>按大小</option></select></label>
      <button type="button" class="private-view-btn<% If viewMode = "detail" Then Response.Write " active" %>" data-private-view="detail"><img src="assets/list.svg" alt=""><span>列表</span></button>
      <button type="button" class="private-view-btn<% If viewMode = "small" Then Response.Write " active" %>" data-private-view="small"><img src="assets/compact.svg" alt=""><span>紧凑</span></button>
      <button type="button" class="private-view-btn<% If viewMode = "large" Then Response.Write " active" %>" data-private-view="large"><img src="assets/grid.svg" alt=""><span>图标</span></button>
    </div>
  </nav>
  <main class="private-main">
    <aside class="private-sidebar" aria-label="私人资料夹"><div class="private-sidebar-title">资料位置</div><a class="private-root-node selected" href="<%=Html(PrivateFolderUrl(""))%>"><img src="assets/home.svg" alt=""><span>我的文件</span></a><ul class="private-folder-tree">
    <% For Each childFolder In folder.SubFolders
         If LCase(childFolder.Name) <> "_system" Then
           childPath = childFolder.Name
           If relativePath <> "" Then childPath = relativePath & "/" & childFolder.Name %>
      <li><a class="private-tree-node" href="<%=Html(PrivateFolderUrl(childPath))%>"><%=Html(PrivateFolderDisplayName(childFolder.Name))%></a></li>
    <%   End If
       Next %>
    </ul></aside>
  <section class="files private-file-list <%=viewMode%>" data-directory-content>
    <%
      Dim childFolder, childPath, fileItem, extension, filePath, visibleCount, fileClass, fileGlyph
      visibleCount = 0
      For Each childFolder In folder.SubFolders
        If LCase(childFolder.Name) <> "_system" Then
          visibleCount = visibleCount + 1
          childPath = childFolder.Name
          If relativePath <> "" Then childPath = relativePath & "/" & childFolder.Name
    %>
      <button class="item folder" type="button" data-folder="<%=Html(childPath)%>" data-name="<%=Html(childFolder.Name)%>" data-modified="<%=Html(CStr(childFolder.DateLastModified))%>"><img class="icon-image" src="assets/folder.svg" alt=""><span class="name"><%=Html(PrivateFolderDisplayName(childFolder.Name))%></span><% If viewMode = "detail" Then %><span class="file-meta">资料夹</span><span class="file-meta"><%=Html(CStr(childFolder.DateLastModified))%></span><% End If %></button>
    <%
        End If
      Next
      For Each fileItem In folder.Files
        extension = LCase(fso.GetExtensionName(fileItem.Name))
        If (pickerMode And PickerAccepts(extension, pickerAccept)) Or _
           (Not pickerMode And SupportedPrivateFile(extension)) Then
          visibleCount = visibleCount + 1
          filePath = fileItem.Name
          If relativePath <> "" Then filePath = relativePath & "/" & fileItem.Name
          fileClass = "spreadsheet"
          fileGlyph = "X"
          If extension = "docx" Or extension = "doc" Then
            fileClass = "document"
            fileGlyph = "W"
          ElseIf extension = "pptx" Or extension = "ppt" Then
            fileClass = "presentation"
            fileGlyph = "P"
          ElseIf extension = "zip" Then
            fileClass = "archive"
            fileGlyph = "ZIP"
          ElseIf extension = "png" Or extension = "jpg" Or extension = "jpeg" Or _
                 extension = "gif" Or extension = "webp" Then
            fileClass = "image"
            fileGlyph = "IMG"
          ElseIf extension = "pdf" Then
            fileClass = "document"
            fileGlyph = "PDF"
          ElseIf extension = "json" Or extension = "md" Or extension = "txt" Then
            fileClass = "text"
            fileGlyph = UCase(extension)
          End If
    %>
      <button class="item <%=fileClass%>" type="button" data-file="<%=Html(filePath)%>"
              data-name="<%=Html(fileItem.Name)%>" data-size="<%=fileItem.Size%>"
              data-modified="<%=Html(CStr(fileItem.DateLastModified))%>" data-mime-type="<%=Html(FileMime(extension))%>"><img class="icon-image" src="assets/<% Select Case extension: Case "xlsx", "xls", "csv": Response.Write "sheet.svg": Case "docx", "doc": Response.Write "word.svg": Case "pptx", "ppt": Response.Write "presentation.svg": Case "zip": Response.Write "archive.svg": Case "png", "jpg", "jpeg", "gif", "webp": Response.Write "image.svg": Case "pdf": Response.Write "pdf.svg": Case "md": Response.Write "markdown.svg": Case "json": Response.Write "json.svg": Case Else: Response.Write "file.svg": End Select %>" alt=""><span class="name"><%=Html(fileItem.Name)%></span><% If viewMode = "detail" Then %><span class="file-meta"><%=fileItem.Size%> B</span><span class="file-meta"><%=Html(CStr(fileItem.DateLastModified))%></span><% End If %></button>
    <%
        End If
      Next
      If visibleCount = 0 Then
    %>
      <div class="empty"><img src="assets/folder.svg" alt=""><h2>此文件夹为空</h2><p>可以使用右键菜单在云资料中建立文件夹。</p></div>
    <% End If %>
  </section></main>
  <div id="status" aria-live="polite"></div>
  <% If pickerMode Then %>
  <footer class="picker-bar">
    <div class="picker-selection"><strong><%=Html(pickerTitle)%></strong><span id="private-picker-selection"><% If pickerAction = "save" Then Response.Write "请选择保存位置并输入文件名" Else Response.Write "尚未选择资料" %></span></div>
    <div class="picker-actions">
      <% If pickerAction = "save" Then %><input id="private-picker-name" class="picker-name" value="<%=Html(pickerSuggestedName)%>" maxlength="120" aria-label="文件名"><% End If %>
      <button type="button" id="private-picker-cancel">取消</button>
      <button type="button" id="private-picker-confirm" class="primary"<% If pickerAction <> "save" Then Response.Write " disabled" %>><% If pickerAction = "save" Then Response.Write "保存" Else Response.Write "确认选择" %></button>
    </div>
  </footer>
  <% End If %>
  <div id="private-context-menu" class="context-menu" role="menu" aria-label="私人文件操作">
    <button type="button" data-action="open" role="menuitem">打开</button>
    <button type="button" data-action="rename" role="menuitem">重命名</button>
    <button type="button" data-action="delete" class="danger" role="menuitem">删除文件夹</button>
    <hr data-folder-only>
    <button type="button" data-action="new-folder" role="menuitem">新建文件夹</button>
    <button type="button" data-action="refresh" role="menuitem">刷新</button>
  </div>
  <dialog id="folder-dialog">
    <form id="folder-form" class="dialog-body" method="dialog">
      <h2 id="folder-dialog-title">新建文件夹</h2>
      <input id="folder-name" name="folder-name" maxlength="80" autocomplete="off" required aria-label="文件夹名称">
      <div class="dialog-actions">
        <button value="cancel" type="button" data-dialog-cancel>取消</button>
        <button class="primary" value="confirm" type="submit">确定</button>
      </div>
    </form>
  </dialog>
  <script>
    (function(){
      "use strict";
      const currentPath = document.body.dataset.path || "";
      const pickerMode = document.body.dataset.mode === "picker";
      const pickerPurpose = document.body.dataset.pickerPurpose || "";
      const pickerRequestId = document.body.dataset.pickerRequestId || "";
      const pickerMultiple = document.body.dataset.pickerMultiple === "1";
      const pickerAction = document.body.dataset.pickerAction || "open";
      const pickerAccept = new Set((document.body.dataset.pickerAccept || "")
        .split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
      const status = document.getElementById("status");
      const requestHeaders = { "X-WebWindows-Request": "private-resource" };
      const api = "private-resource.asp";
      const menu = document.getElementById("private-context-menu");
      const dialog = document.getElementById("folder-dialog");
      const folderForm = document.getElementById("folder-form");
      const folderName = document.getElementById("folder-name");
      const dialogTitle = document.getElementById("folder-dialog-title");
      let selectedFolder = null;
      let dialogMode = "create";
      const pickerSelections = new Set();

      function navigateOptions(changes) {
        const url = new URL(location.href);
        Object.entries(changes).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
        location.href = url.toString();
      }

      document.querySelector('[data-private-action="back"]').addEventListener("click", () => history.back());
      document.querySelector('[data-private-action="forward"]').addEventListener("click", () => history.forward());
      document.querySelector('[data-private-action="up"]').addEventListener("click", () => {
        const parts = currentPath.split("/").filter(Boolean); parts.pop(); location.href = privateUrl(parts.join("/"));
      });
      document.getElementById("private-sort").addEventListener("change", event => {
        const list = document.querySelector(".files");
        const items = Array.from(list.querySelectorAll(":scope > .item"));
        const mode = event.target.value;
        items.sort((a, b) => {
          if (mode === "size") return Number(b.dataset.size || 0) - Number(a.dataset.size || 0);
          if (mode === "date") return new Date(b.dataset.modified || 0) - new Date(a.dataset.modified || 0);
          return String(a.dataset.name || "").localeCompare(String(b.dataset.name || ""), undefined, { numeric: true, sensitivity: "base" });
        }).forEach(item => list.appendChild(item));
        const url = new URL(location.href); url.searchParams.set("sort", mode); history.replaceState(null, "", url);
      });
      document.querySelectorAll("[data-private-view]").forEach(button => button.addEventListener("click", () => navigateOptions({ view: button.dataset.privateView })));

      function privateUrl(path) {
        const url = new URL("private-files.asp", location.href);
        if (path) url.searchParams.set("path", path);
        else url.searchParams.delete("path");
        if (pickerMode) {
          url.searchParams.set("mode", "picker");
          url.searchParams.set("action", pickerAction);
          url.searchParams.set("accept", document.body.dataset.pickerAccept || "");
          url.searchParams.set("multiple", pickerMultiple ? "1" : "0");
          url.searchParams.set("purpose", pickerPurpose);
          url.searchParams.set("requestId", pickerRequestId);
          url.searchParams.set("title", document.body.dataset.pickerTitle || "");
          if (pickerAction === "save") {
            url.searchParams.set("suggestedName", document.getElementById("private-picker-name")?.value || "");
          }
        }
        return url.toString();
      }

      function sendPicker(type, resources) {
        const message = {
          type,
          purpose: pickerPurpose,
          requestId: pickerRequestId,
          action: pickerAction,
          multiple: pickerMultiple
        };
        if (resources?.length) {
          message.resource = resources[0];
          message.resources = resources;
        }
        if (parent && parent !== window) parent.postMessage(message, location.origin);
      }

      function selectPicker(item) {
        if (pickerAction === "save") {
          document.querySelectorAll("[data-file].selected").forEach(node => node.classList.remove("selected"));
          pickerSelections.clear();
          pickerSelections.add(item);
          item.classList.add("selected");
          document.getElementById("private-picker-name").value = item.dataset.name;
        } else if (!pickerMultiple) {
          document.querySelectorAll("[data-file].selected").forEach(node => node.classList.remove("selected"));
          pickerSelections.clear();
          pickerSelections.add(item);
          item.classList.add("selected");
        } else if (pickerSelections.has(item)) {
          pickerSelections.delete(item);
          item.classList.remove("selected");
        } else {
          pickerSelections.add(item);
          item.classList.add("selected");
        }
        const selections = Array.from(pickerSelections);
        document.getElementById("private-picker-selection").textContent = pickerAction === "save"
          ? `保存到：我的文件${currentPath ? ` / ${currentPath}` : ""}`
          : (selections.length
            ? (pickerMultiple ? `已选择 ${selections.length} 项` :
              `${selections[0].dataset.name} · ${Math.ceil(Number(selections[0].dataset.size || 0) / 1024)} KB`)
            : "尚未选择资料");
        document.getElementById("private-picker-confirm").disabled =
          pickerAction === "open" && selections.length === 0;
      }

      function confirmPicker() {
        if (pickerAction === "save") {
          const input = document.getElementById("private-picker-name");
          const name = String(input.value || "").trim();
          if (!name || /[\\/:*?"<>|\u0000-\u001f]/.test(name) || name === "." || name === "..") {
            status.className = "error";
            status.textContent = "请输入有效的文件名。";
            input.focus();
            return;
          }
          const dot = name.lastIndexOf(".");
          const extension = dot >= 0 ? name.slice(dot).toLowerCase() : "";
          if (!pickerAccept.has(extension)) {
            status.className = "error";
            status.textContent = `文件类型必须为：${Array.from(pickerAccept).join("、")}`;
            input.focus();
            return;
          }
          const existing = Array.from(document.querySelectorAll("[data-file]"))
            .find(item => item.dataset.name.toLowerCase() === name.toLowerCase());
          if (existing && !confirm(`“${name}”已经存在，是否替换？`)) return;
          const path = currentPath ? `${currentPath}/${name}` : name;
          const writeUrl = new URL(api, location.href);
          sendPicker("webwindows:cloud-resource-selected", [{
            name,
            path,
            nodeId: "local-main",
            scope: "private",
            size: existing ? Number(existing.dataset.size || 0) : 0,
            mimeType: existing?.dataset.mimeType || "application/octet-stream",
            writeUrl: writeUrl.href,
            overwrite: Boolean(existing)
          }]);
          return;
        }
        const resources = Array.from(pickerSelections).map((selection) => {
          const readUrl = new URL(api, location.href);
          readUrl.searchParams.set("op", "content");
          readUrl.searchParams.set("path", selection.dataset.file);
          const editorDataUrl = new URL(api, location.href);
          editorDataUrl.searchParams.set("op", "editor-data");
          editorDataUrl.searchParams.set("path", selection.dataset.file);
          return {
            name: selection.dataset.name,
            path: selection.dataset.file,
            nodeId: "local-main",
            scope: "private",
            size: Number(selection.dataset.size || 0),
            mimeType: selection.dataset.mimeType || "application/octet-stream",
            readUrl: readUrl.href,
            editorDataUrl: editorDataUrl.href,
            saveEndpoint: new URL(api, location.href).href
          };
        });
        if (resources.length) sendPicker("webwindows:cloud-resource-selected", resources);
      }

      async function json(response) {
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.ok) throw new Error(payload?.error?.message || `请求失败（${response.status}）`);
        return payload;
      }

      async function postOperation(operation, values) {
        return json(await fetch(`${api}?op=${encodeURIComponent(operation)}`, {
          method: "POST",
          headers: { ...requestHeaders, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
          body: new URLSearchParams(values)
        }));
      }

      function hideMenu() {
        menu.classList.remove("open");
        selectedFolder = null;
      }

      function showMenu(event, folderItem) {
        event.preventDefault();
        event.stopPropagation();
        selectedFolder = folderItem || null;
        menu.querySelectorAll("[data-action='open'],[data-action='rename'],[data-action='delete'],[data-folder-only]").forEach(element => {
          element.hidden = !selectedFolder;
        });
        menu.classList.add("open");
        const menuWidth = menu.offsetWidth;
        const menuHeight = menu.offsetHeight;
        menu.style.left = `${Math.max(6, Math.min(event.clientX, innerWidth - menuWidth - 6))}px`;
        menu.style.top = `${Math.max(6, Math.min(event.clientY, innerHeight - menuHeight - 6))}px`;
        menu.querySelector("button:not([hidden])")?.focus();
      }

      function openFolderDialog(mode) {
        dialogMode = mode;
        dialogTitle.textContent = mode === "rename" ? "重命名文件夹" : "新建文件夹";
        folderName.value = mode === "rename" && selectedFolder ? selectedFolder.dataset.name : "";
        dialog.showModal();
        setTimeout(() => {
          folderName.focus();
          folderName.select();
        }, 0);
      }

      document.querySelectorAll("[data-folder]").forEach(item => item.addEventListener("dblclick", () => {
        location.href = privateUrl(item.dataset.folder);
      }));
      document.querySelectorAll("[data-folder]").forEach(item => item.addEventListener("contextmenu", event => showMenu(event, item)));
      document.querySelectorAll("[data-file]").forEach(item => item.addEventListener("dblclick", () => {
        if (pickerMode) {
          if (!pickerMultiple) {
            selectPicker(item);
            confirmPicker();
          }
          return;
        }
        const path = item.dataset.file;
        const base = new URL(api, location.href);
        const content = new URL(base);
        content.searchParams.set("op", "content");
        content.searchParams.set("path", path);
        const editorData = new URL(base);
        editorData.searchParams.set("op", "editor-data");
        editorData.searchParams.set("path", path);
        const resource = {
          protocol: "webwindows-cloud-resource",
          version: "1.1",
          nodeId: "local-main",
          scope: "private",
          path,
          name: item.dataset.name,
          url: content.toString(),
          editorDataUrl: editorData.toString(),
          saveEndpoint: base.toString(),
          permissions: { read: true, download: true, edit: true }
        };
        if (window.parent && typeof window.parent.openResource === "function") window.parent.openResource(resource);
        else location.href = content.toString();
      }));
      if (pickerMode) {
        document.querySelectorAll("[data-file]").forEach(item => item.addEventListener("click", event => {
          if (pickerMultiple && event.detail > 1) return;
          selectPicker(item);
        }));
        document.getElementById("private-picker-cancel").addEventListener("click", () => {
          sendPicker("webwindows:cloud-resource-picker-cancelled");
        });
        document.getElementById("private-picker-confirm").addEventListener("click", confirmPicker);
        document.getElementById("private-picker-name")?.addEventListener("keydown", event => {
          if (event.key === "Enter") {
            event.preventDefault();
            confirmPicker();
          }
        });
      }
      document.querySelectorAll("[data-file]").forEach(item => item.addEventListener("contextmenu", event => showMenu(event, null)));
      document.querySelector(".files").addEventListener("contextmenu", event => {
        if (!event.target.closest("[data-folder],[data-file]")) showMenu(event, null);
      });
      menu.addEventListener("click", async event => {
        const action = event.target.closest("[data-action]")?.dataset.action;
        if (!action) return;
        const targetFolder = selectedFolder;
        hideMenu();
        if (action === "refresh") {
          location.reload();
          return;
        }
        if (action === "new-folder") {
          openFolderDialog("create");
          return;
        }
        if (!targetFolder) return;
        selectedFolder = targetFolder;
        if (action === "open") {
          location.href = `private-files.asp?path=${encodeURIComponent(targetFolder.dataset.folder)}`;
          return;
        }
        if (action === "rename") {
          openFolderDialog("rename");
          return;
        }
        if (action === "delete") {
          if (!confirm(`删除空文件夹“${targetFolder.querySelector(".name").textContent}”？`)) return;
          try {
            await postOperation("delete-folder", { path: targetFolder.dataset.folder });
            location.reload();
          } catch (error) {
            status.className = "error";
            status.textContent = error.message;
          }
        }
      });
      folderForm.addEventListener("submit", async event => {
        event.preventDefault();
        const name = folderName.value.trim();
        if (!name) return;
        status.className = "";
        status.textContent = dialogMode === "rename" ? "正在重命名文件夹…" : "正在建立文件夹…";
        try {
          if (dialogMode === "rename" && selectedFolder) {
            await postOperation("rename-folder", { path: selectedFolder.dataset.folder, name });
          } else {
            await postOperation("create-folder", { path: currentPath, name });
          }
          dialog.close();
          location.reload();
        } catch (error) {
          status.className = "error";
          status.textContent = error.message;
        }
      });
      document.querySelector("[data-dialog-cancel]").addEventListener("click", () => dialog.close());
      document.addEventListener("click", event => {
        if (!event.target.closest("#private-context-menu")) hideMenu();
      });
      document.addEventListener("keydown", event => {
        if (event.key === "Escape") hideMenu();
      });
      window.addEventListener("blur", hideMenu);
      document.addEventListener("contextmenu", event => event.preventDefault());
    })();
  </script>
  </div>
<%
Set folder = Nothing
Set fso = Nothing
End If

Function JoinPrefix(ByVal values, ByVal lastIndex)
  Dim index, result
  result = ""
  For index = 0 To lastIndex
    If result <> "" Then result = result & "/"
    result = result & CStr(values(index))
  Next
  JoinPrefix = result
End Function

Function ValidPickerPurpose(ByVal value)
  Dim expression
  Set expression = New RegExp
  expression.Pattern = "^[A-Za-z0-9][A-Za-z0-9:_-]{0,63}$"
  expression.Global = False
  ValidPickerPurpose = expression.Test(CStr(value))
  Set expression = Nothing
End Function

Function ValidPickerRequestId(ByVal value)
  Dim expression
  Set expression = New RegExp
  expression.Pattern = "^[A-Za-z0-9][A-Za-z0-9:_-]{0,79}$"
  expression.Global = False
  ValidPickerRequestId = expression.Test(CStr(value))
  Set expression = Nothing
End Function

Function PickerQuery()
  Dim value
  value = "mode=picker&action=" & Server.URLEncode(pickerAction) & _
    "&accept=" & Server.URLEncode(pickerAccept) & _
    "&multiple=" & CStr(Abs(CInt(pickerMultiple))) & _
    "&purpose=" & Server.URLEncode(pickerPurpose) & _
    "&requestId=" & Server.URLEncode(pickerRequestId) & _
    "&title=" & Server.URLEncode(pickerTitle)
  If pickerAction = "save" Then value = value & "&suggestedName=" & Server.URLEncode(pickerSuggestedName)
  PickerQuery = value
End Function

Function PrivateFolderUrl(ByVal value)
  Dim url
  url = "private-files.asp"
  If CStr(value) <> "" Then url = url & "?path=" & Server.URLEncode(CStr(value))
  If pickerMode Then
    If InStr(url, "?") > 0 Then url = url & "&" Else url = url & "?"
    url = url & PickerQuery()
  End If
  PrivateFolderUrl = url
End Function

Function PublicFolderUrl(ByVal value)
  Dim url
  url = "files.asp"
  If CStr(value) <> "" Then url = url & "?path=" & Server.URLEncode(CStr(value))
  If pickerMode Then
    If InStr(url, "?") > 0 Then url = url & "&" Else url = url & "?"
    url = url & PickerQuery()
  End If
  PublicFolderUrl = url
End Function
%>
</body>
</html>
