<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"

' 获取参数
Dim path, recursive, fs, folder, item, json, username
path = Request("path")
recursive = LCase(Request("recursive")) = "true"

' 获取当前用户名（从 Cookie，并 URL 解码）
username = URLDecode(Request.Cookies("webwindows_user"))
If IsEmpty(username) Or username = "" Then
  Response.Write("{""error"":""未登录或会话超时""}")
  Response.End
End If

' 安全路径构造
Dim baseDir, fullPath
baseDir = Server.MapPath("/cloud/file/" & username & "/")

' 如果 path 不为空，则拼接子路径
If path <> "" Then
    fullPath = Server.MapPath("/cloud/file/" & username & "/" & path)
Else
    fullPath = baseDir
End If

' 防止越权：确保 fullPath 在 baseDir 内部
If InStr(LCase(fullPath), LCase(baseDir)) <> 1 Then
    Response.Status = "403 Forbidden"
    Response.Write "[]"
    Response.End
End If

' 检查文件夹是否存在
Set fs = Server.CreateObject("Scripting.FileSystemObject")

If Not fs.FolderExists(fullPath) Then
    Response.Write "[]"
    Response.End
End If

Set folder = fs.GetFolder(fullPath)

' JSON 字符转义
Function EscapeJSON(str)
    str = Replace(str, "\", "\\")
    str = Replace(str, """", "\""")
    EscapeJSON = str
End Function
Function URLDecode(ByVal str)
    Dim i, result, code
    result = ""
    i = 1
    Do While i <= Len(str)
        If Mid(str, i, 1) = "+" Then
            result = result & " "
            i = i + 1
        ElseIf Mid(str, i, 1) = "%" Then
            If i + 2 <= Len(str) Then
                code = Mid(str, i + 1, 2)
                result = result & Chr(CInt("&H" & code))
                i = i + 3
            Else
                result = result & Mid(str, i)
                Exit Do
            End If
        Else
            result = result & Mid(str, i, 1)
            i = i + 1
        End If
    Loop
    URLDecode = result
End Function

' 构建文件夹树
Function BuildFolderTreeSafe(f, depth, currentPath)
    If depth > 10 Then
        BuildFolderTreeSafe = "[]"
        Exit Function
    End If

    Dim result, subFolder, serverPath, webPath
    result = "["

    For Each subFolder In f.SubFolders
        serverPath = f.Path & "\" & subFolder.Name

        result = result & "{""name"":""" & EscapeJSON(subFolder.Name) & """,""isFolder"":true"

        If currentPath = "" Then
            webPath = subFolder.Name
        Else
            webPath = currentPath & "/" & subFolder.Name
        End If

        result = result & ",""path"":""" & EscapeJSON(webPath) & """"

        If recursive Then
            result = result & ",""children"":" & BuildFolderTreeSafe(subFolder, depth + 1, webPath)
        End If

        result = result & "},"
    Next

    If Right(result, 1) = "," Then result = Left(result, Len(result) - 1)
    result = result & "]"
    BuildFolderTreeSafe = result
End Function

' 输出 UTF-8 内容
Function WriteUtf8(s)
  Dim stm
  Set stm = Server.CreateObject("ADODB.Stream")
  stm.Type = 2
  stm.Mode = 3
  stm.Charset = "utf-8"
  stm.Open
  stm.WriteText s
  stm.Position = 0
  stm.Type = 1
  Response.BinaryWrite stm.Read()
  stm.Close
  Set stm = Nothing
End Function

' 生成并输出 JSON
json = BuildFolderTreeSafe(folder, 0, "")
Call WriteUtf8(json)

Set folder = Nothing
Set fs = Nothing
%>
