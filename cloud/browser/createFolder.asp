<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"

Dim basePath, path, name, fso, fullPath, rootPath

basePath = Server.MapPath("/cloud/file/admin")
path = Request("path")
name = Request("name")

Set fso = Server.CreateObject("Scripting.FileSystemObject")

' 构造完整路径
path = Replace(path, "\", "/")  ' 统一使用正斜杠，避免 MapPath 报错

rootPath = Server.MapPath("/cloud/file/admin")
fullPath = Server.MapPath("/cloud/file/admin" & path)

' 防止越权访问，只允许访问 /cloud/file/admin 下的子目录
If InStr(fullPath, rootPath) <> 1 Then
    Response.Write "{""success"":false,""message"":""路径非法""}"
    Response.End
End If

' 创建文件夹
If fso.FolderExists(fullPath) Then
    Response.Write "{""success"":false,""message"":""文件夹已存在""}"
Else
    On Error Resume Next
    fso.CreateFolder(fullPath)
    If Err.Number = 0 Then
        Response.Write "{""success"":true}"
    Else
        Response.Write "{""success"":false,""message"":""创建失败: " & Err.Description & """}"
    End If
    On Error GoTo 0
End If

Set fso = Nothing
%>
