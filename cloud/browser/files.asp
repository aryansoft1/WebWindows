<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Response.CodePage = 65001
Response.Charset = "UTF-8"
Dim fso, basePath, relativePath, fullPath, folder, files, subfolders
Dim sortBy, viewMode
Set fso = Server.CreateObject("Scripting.FileSystemObject")

basePath = Server.MapPath("../file/admin")
relativePath = Request.QueryString("path")
If relativePath = "" Then relativePath = ""

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
If viewMode = "" Then viewMode = "detail"
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WebWindows 云资料</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="contextmenu.css">
    <link href="https://unpkg.com/lucide-static@latest/font/lucide.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js"></script>
</head>
<body>
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
    <label for="sortSelect">排序：</label>
    <select id="sortSelect" onchange="sortFiles(this.value)">
        <option value="name">名称</option>
        <option value="time">时间</option>
        <option value="size">大小</option>
    </select>
    </div>
</div>




    <div class="wrapper">
    <div class="file-list <%=viewMode%>">
        <%
        Dim sf
        For Each sf in subfolders
            Response.Write "<div class='file-item folder'>"
            Response.Write "  <a class='file-link' title='" & sf.Name & "' href='files.asp?path=" & Server.URLEncode(relativePath & "\" & sf.Name) & "'>"
            Response.Write "    <img src='https://cdn-icons-png.flaticon.com/128/716/716784.png'>"
            Response.Write "    <div class='file-name'>" & sf.Name & "</div>"
            Response.Write "  </a>"
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

        Response.Write "<div class='file-item file " & cssClass & "'>"
        Response.Write "<img src='" & imgSrc & "'>"
        Response.Write "<div class='file-name' title='" & fname & "'>" & fname & "</div>"
        Response.Write "</div>"
      Next

        %>
    </div>
    </div>
<!-- 文件菜单 -->
<div class="context-menu" id="fileContextMenu">
  <ul>
    <li onclick="alert('打开')">打开</li>
    <li onclick="alert('复制')">复制</li>
    <li onclick="alert('剪切')">剪切</li>
    <li onclick="alert('删除')">删除</li>
  </ul>
</div>

<!-- 空白区域菜单 -->
<div class="context-menu" id="blankContextMenu">
  <ul>
    <li onclick="window.location.href='files.asp?view=detail'">详细显示</li>
    <li onclick="window.location.href='files.asp?view=small'">小图标</li>
    <li onclick="window.location.href='files.asp?view=large'">大图标</li>
    <hr>
    <li onclick="window.location.href='files.asp?sort=name'">按名称排序</li>
    <li onclick="window.location.href='files.asp?sort=date'">按时间排序</li>
    <li onclick="window.location.href='files.asp?sort=size'">按大小排序</li>
  </ul>
</div>

<script src="contextmenu.js"></script>
<script src="toolbar.js"></script>
</body>
</html>
