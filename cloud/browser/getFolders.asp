<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"

' 获取参数
Dim path, recursive, fs, folder, item, json
path = Request("path")
recursive = LCase(Request("recursive")) = "true"

' 默认路径（未传参数时）
If path = "" Then path = "/cloud/file/admin"

Dim rootPath
rootPath = Server.MapPath("/cloud/file/admin")
Dim fullPath
fullPath = Server.MapPath(path)

' 防止越权访问
If InStr(fullPath, rootPath) <> 1 Then
    Response.Status = "403 Forbidden"
    Response.Write "[]"
    Response.End
End If

Set fs = Server.CreateObject("Scripting.FileSystemObject")
If Not fs.FolderExists(fullPath) Then
    Response.Write "[]"
    Response.End
End If

Set folder = fs.GetFolder(fullPath)

Function EscapeJSON(str)
    str = Replace(str, "\", "\\")
    str = Replace(str, """", "\""")
    EscapeJSON = str
End Function

Function BuildFolderTreeSafe(f, depth, currentPath)
    If depth > 10 Then
        BuildFolderTreeSafe = "[]"
        Exit Function
    End If

    Dim result, subFolder, fullPath
    result = "["

    For Each subFolder In f.SubFolders
        fullPath = currentPath & "\" & subFolder.Name

        ' 避免死循环
        If LCase(fullPath) <> LCase(currentPath) Then
            result = result & "{""name"":""" & EscapeJSON(subFolder.Name) & """,""isFolder"":true"

            If recursive Then
                result = result & ",""children"":" & BuildFolderTreeSafe(subFolder, depth + 1, fullPath)
            End If

            Dim subPath
            If currentPath = "" Then
                subPath = subFolder.Name
            Else
                subPath = currentPath & "/" & subFolder.Name
            End If
            result = result &  ",""path"":""" & subPath & """"

            result = result & "},"
        End If
    Next

    If Right(result, 1) = "," Then result = Left(result, Len(result) - 1)
    result = result & "]"
    BuildFolderTreeSafe = result
End Function



' 替代 Response.Write，用 UTF-8 流输出
Function WriteUtf8(s)
  Dim stm
  Set stm = Server.CreateObject("ADODB.Stream")
  stm.Type = 2 ' text
  stm.Mode = 3
  stm.Charset = "utf-8"
  stm.Open
  stm.WriteText s
  stm.Position = 0
  stm.Type = 1 ' binary
  Response.BinaryWrite stm.Read()
  stm.Close
  Set stm = Nothing
End Function




json = BuildFolderTreeSafe(folder, 0, "")

Call WriteUtf8(json)

Set folder = Nothing
Set fs = Nothing
%>
