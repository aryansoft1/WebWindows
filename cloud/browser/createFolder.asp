<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"

Dim basePath, path, name, fso, fullPath, rootPath
basePath = Server.MapPath("/cloud/file/admin")
path = Request("path")
name = Request("name")

Set fso = Server.CreateObject("Scripting.FileSystemObject")

' 确保 path 使用正斜杠
path = Replace(path, "\", "/")

' 自动补斜杠，拼接完整路径
If path = "" Then
    fullPath = basePath
Else
    If Left(path, 1) <> "/" Then path = "/" & path
    fullPath = Server.MapPath("/cloud/file/admin" & path)
End If

' 防止越权访问
rootPath = Server.MapPath("/cloud/file/admin")
If InStr(fullPath, rootPath) <> 1 Then
    Response.Write "{""success"":false,""message"":""路径非法""}"
    Response.End
End If

' 创建文件夹
If fso.FolderExists(fullPath & "\" & name) Then
    Response.Write "{""success"":false,""message"":""文件夹已存在""}"
Else
    On Error Resume Next
    fso.CreateFolder(fullPath & "\" & name)
    If Err.Number = 0 Then
        Response.Write "{""success"":true}"
    Else
        Response.Write "{""success"":false,""message"":""创建失败: " & Err.Description & """}"
    End If
    On Error GoTo 0
End If

Set fso = Nothing
%>
