<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"

Dim fs, baseDir, fullPath, path, name, username
Set fs = Server.CreateObject("Scripting.FileSystemObject")

' 获取登录用户
username = Server.URLDecode(Request.Cookies("webwindows_user"))
If IsEmpty(username) Then
  Response.Write "{""success"":false,""message"":""未登录或会话超时""}"
  Response.End
End If

path = Request("path")
If path = "" Then path = ""
path = Replace(path, "\", "/")
If Left(path, 1) = "/" Then path = Mid(path, 2)

name = Trim(Request("name"))
If name = "" Then
  Response.Write "{""success"":false,""message"":""文件夹名称不能为空""}"
  Response.End
End If

baseDir = Server.MapPath("cloud/file/" & username & "/")
fullPath = baseDir
If path <> "" Then
  fullPath = baseDir & path & "\"
End If

' 检查越权访问
If InStr(fullPath, baseDir) <> 1 Then
  Response.Write "{""success"":false,""message"":""非法路径访问""}"
  Response.End
End If

Dim newFolderPath
newFolderPath = fullPath & name

If fs.FolderExists(newFolderPath) Then
  Response.Write "{""success"":false,""message"":""文件夹已存在""}"
  Response.End
End If

fs.CreateFolder(newFolderPath)
Response.Write "{""success"":true}"
%>
