<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001

Function BuildFolderTree(folder, depth, currentPath, language)
  Dim result, child, childPath, first
  result = "["
  first = True

  If depth < 10 Then
    For Each child In folder.SubFolders
      childPath = CloudJoinPath(currentPath, child.Name)
      If Not first Then result = result & ","
      first = False
      result = result & "{""name"":""" & CloudJson(child.Name) & _
        """,""displayName"":""" & CloudJson(CloudDisplayName(child.Name, language)) & _
        """,""path"":""" & CloudJson(childPath) & """,""kind"":""folder""," & _
        """children"":" & BuildFolderTree(child, depth + 1, childPath, language) & "}"
    Next
  End If

  result = result & "]"
  BuildFolderTree = result
End Function

Dim relativePath, physicalPath, fso, folder, language
If Not CloudTryNormalizePath(Request.QueryString("path"), relativePath) Then
  CloudJsonError "400 Bad Request", "INVALID_PATH", "资料位置无效"
End If
language = CloudRequestLanguage()

physicalPath = CloudPhysicalPath(relativePath)
Set fso = Server.CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists(CloudPublicRoot()) Then
  Set fso = Nothing
  CloudJsonError "503 Service Unavailable", "PUBLIC_LIBRARY_NOT_READY", "公共区域尚未部署"
End If
If Not fso.FolderExists(physicalPath) Then
  Set fso = Nothing
  CloudJsonError "404 Not Found", "NOT_FOUND", "资料夹不存在"
End If

Set folder = fso.GetFolder(physicalPath)
Response.Write BuildFolderTree(folder, 0, relativePath, language)
Set folder = Nothing
Set fso = Nothing
%>
