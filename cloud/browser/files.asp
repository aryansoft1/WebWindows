<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Response.CodePage = 65001
Response.Charset = "UTF-8"
Dim fso, basePath, relativePath, fullPath, folder, files, subfolders
Dim sortBy, viewMode
Set fso = Server.CreateObject("Scripting.FileSystemObject")

' 默认路径（未传参数时）
' 获取当前用户名
username = Request.Cookies("webwindows_user")
If IsEmpty(username) Or username = "" Then
%><html>
  <body>
<script LANGUAGE="javascript">
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0, 0, 0, 0.6)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const messageBox = document.createElement("div");
  messageBox.style.background = "#fff";
  messageBox.style.padding = "24px 36px";
  messageBox.style.borderRadius = "12px";
  messageBox.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
  messageBox.style.fontSize = "16px";
  messageBox.style.fontWeight = "bold";
  messageBox.textContent = "请先登录";

  overlay.appendChild(messageBox);
  document.body.appendChild(overlay);

  setTimeout(() => {
    const win = window.frameElement?.closest('.window');
    console.log(win)
    if (win) {
      const winId = 'win-explorer';
            // ✅ 在移除之前，通知父页面先删除任务栏图标
          if (window.parent && typeof window.parent.removeTaskbarIcon === 'function') {
            window.parent.removeTaskbarIcon(winId);
          }
      win.remove();
    }
  }, 1200);
  </script>
  </body>
  </html>
<%
  Response.End
End If

basePath = Server.MapPath("../file/" & username)
relativePath = Request.QueryString("path")
relativePath = Replace(relativePath, "/", "\") ' 转换为 Windows 路径

fullPath = basePath
If relativePath <> "" Then fullPath = basePath & "\" & relativePath

If Not fso.FolderExists(fullPath) Then
    Response.Write "<h3>目录不存在</h3>"
    Response.End
End If

Set folder = fso.GetFolder(fullPath)
Set files = folder.Files
Set subfolders = folder.SubFolders

sortBy = LCase(Request.QueryString("sort"))
If sortBy = "" Then sortBy = "name"

viewMode = LCase(Request.QueryString("view"))
If viewMode = "" Then viewMode = "large"
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WebWindows 云资料</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="contextmenu.css">
    <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js"></script>
</head>
<body onload="initFileManager()">
<div class="wrapper" style="display: flex;">
    <h2>📁 WebWindows 云资料</h2>
<div class="toolbar">
  <div class="toolbar-left">
    <!-- 返回、前进、向上、视图切换等按钮 -->
    <button class="icon-btn" onclick="goBack()"><i data-lucide="arrow-left">后退</i></button>
    <button class="icon-btn" onclick="goForward()"><i data-lucide="arrow-right">前进</i></button>
    <button class="icon-btn" onclick="goUp()"><i data-lucide="arrow-up">向上</i></button>
    <button class="icon-btn" onclick="setView('detail')"><i data-lucide="list">列表</i></button>
    <button class="icon-btn" onclick="setView('small')"><i data-lucide="grid-2x2">小图标</i></button>
    <button class="icon-btn" onclick="setView('large')"><i data-lucide="layout-grid">大图标</i></button>
  </div>
    <div class="toolbar-right">
    <div id="disk-info" style="margin: 10px 0 5px 12px; font-size: 13px; color: #444;">
    <span id="disk-text">已用 13.91 GB / 总共 1229.00 GB (1.1%)</span>
    <div style="background: #bdb9b9; height: 12px; width: 240px; border-radius: 3px; margin-top: 4px;">
        <div id="disk-bar" style="background: #4f9cfa; height: 12px; width: 1.1%; border-radius: 3px;"></div>
    </div>
    </div>
    </div>
</div>
<!-- toolbar -->

  <div class="main">
  <div id="sidebar">
    <ul id="folder-tree"></ul>
  </div>
  <div class="file-list <%=viewMode%>">
        <%
        Dim sf
        For Each sf in subfolders
            Dim folderPath
            folderPath = relativePath & "\" & sf.Name

            Response.Write "<div onclick=""location.href='files.asp?path=" & folderPath & "'"" title='" & sf.Name & "' class='file-item folder' data-path='" & folderPath & "' data-is-folder='true'>"
            Response.Write "    <img src='https://cdn-icons-png.flaticon.com/128/716/716784.png'>"
            Response.Write "    <div class='file-name'>" & sf.Name & "</div>"
            Response.Write "</div>"
        Next


        Dim fileArr(), i, f
        ReDim fileArr(files.Count-1)
        i = 0
        For Each f in files
            Set fileArr(i) = f
            i = i + 1
        Next

        For i = 0 To UBound(fileArr)-1
            Dim j
            For j = i+1 To UBound(fileArr)
                Dim a, b, swap
                Set a = fileArr(i)
                Set b = fileArr(j)
                swap = False
                Select Case sortBy
                    Case "name": If LCase(a.Name) > LCase(b.Name) Then swap = True
                    Case "date": If a.DateLastModified < b.DateLastModified Then swap = True
                    Case "size": If a.Size < b.Size Then swap = True
                End Select
                If swap Then
                    Set fileArr(i) = b
                    Set fileArr(j) = a
                End If
            Next
        Next

      For i = 0 To UBound(fileArr)
        Dim fname, ext, imgSrc, cssClass
        Set f = fileArr(i)
        fname = f.Name
        ext = LCase(fso.GetExtensionName(fname))
        imgSrc = "https://cdn-icons-png.flaticon.com/128/2991/2991108.png"
        cssClass = "default"

        ' 图片 & Excel & 其他格式判断
        If (viewMode = "small" Or viewMode = "large") Then
            If ext = "jpg" Or ext = "jpeg" Or ext = "png" Or ext = "gif" Then
                imgSrc = "../file/admin"
                If relativePath <> "" Then imgSrc = imgSrc & "/" & relativePath
                imgSrc = imgSrc & "/" & fname
                cssClass = "image"
            ElseIf ext = "xls" Or ext = "xlsx" Then
                imgSrc = "/assets/icons/sheeteditor.png"
                cssClass = "excel"
            ElseIf ext = "doc" Or ext = "docx" Then
                imgSrc = "/assets/icons/word.png"
                cssClass = "word"
            ElseIf ext = "pdf" Then
                imgSrc = "/assets/icons/pdf.png"
                cssClass = "pdf"
            End If
        Else
            If ext = "xls" Or ext = "xlsx" Then
                imgSrc = "/assets/icons/sheeteditor.png"
                cssClass = "excel"
            ElseIf ext = "doc" Or ext = "docx" Then
                imgSrc = "/assets/icons/word.png"
                cssClass = "word"
            ElseIf ext = "pdf" Then
                imgSrc = "/assets/icons/pdf.png"
                cssClass = "pdf"
            End If
        End If

        Dim filePath
        filePath = relativePath & "\" & fname
        Response.Write "<div class='file-item file " & cssClass & "' data-path='" & filePath & "' data-is-folder='false'>"
        Response.Write "<img src='" & imgSrc & "'>"
        Response.Write "<div class='file-name' title='" & fname & "'>" & fname & "</div>"
        '详细模式显示文件具体信息
        If viewMode = "detail" Then
            Response.Write "<div class='file-size'>" & FormatFileSize(f.Size) & "</div>"
            Response.Write "<div class='file-created'>" & f.DateCreated & "</div>"
            Response.Write "<div class='file-modified'>" & f.DateLastModified & "</div>"
        End If
        Response.Write "</div>"
      Next

        %>
    </div>
    </div>
    </div>
<!-- 文件右键菜单 -->
<!-- 文件右键菜单 -->
<div class="context-menu" id="fileContextMenu">
  <ul>
    <li onclick="openSelected()">📂 打开</li>
    <li onclick="alert('复制')">📄 复制</li>
    <li onclick="alert('剪切')">✂️ 剪切</li>
    <li onclick="alert('删除')">🗑️ 删除</li>
  </ul>
</div>

<!-- 空白区域菜单 -->
<div class="context-menu" id="blankContextMenu">
  <ul>
    <li onclick="window.location.href='files.asp?view=detail'">📃 详细显示</li>
    <li onclick="window.location.href='files.asp?view=small'">🔲 小图标</li>
    <li onclick="window.location.href='files.asp?view=large'">🔳 大图标</li>
    <hr>
    <li onclick="window.location.href='files.asp?sort=name'">🔠 按名称排序</li>
    <li onclick="window.location.href='files.asp?sort=date'">📅 按时间排序</li>
    <li onclick="window.location.href='files.asp?sort=size'">💾 按大小排序</li>
    <hr>
    <li onclick="createNewFolder()">📁 新建文件夹</li>
  </ul>
</div>



<!-- 新建文件夹弹出层 -->
<div id="newFolderModal" class="modal">
  <div class="modal-content">
    <h3>🗂️ 新建文件夹</h3>
    <input type="text" id="newFolderName" placeholder="请输入文件夹名称">
    <div class="modal-buttons">
      <button onclick="submitNewFolder()">创建</button>
      <button onclick="closeNewFolderModal()">取消</button>
    </div>
  </div>
</div>

<script src="contextmenu.js"></script>
<script src="toolbar.js"></script>
</body>
</html>
<%
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
%>
