<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001

Dim relativePath, physicalPath, fso, folder, subFolder, file, json, first, language
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
json = "{""ok"":true,""node"":{""id"":""" & CloudJson(CLOUD_NODE_ID) & _
  """,""name"":""" & CloudJson(CLOUD_NODE_NAME) & """},""scope"":""public""," & _
  """displayName"":""" & CloudJson(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, language)) & """," & _
  """path"":""" & CloudJson(relativePath) & """,""permissions"":{""read"":true," & _
  """preview"":true,""download"":true,""upload"":false,""rename"":false,""delete"":false," & _
  """manage"":false},""items"":["
first = True

For Each subFolder In folder.SubFolders
  If Not first Then json = json & ","
  first = False
  json = json & "{""name"":""" & CloudJson(subFolder.Name) & _
    """,""displayName"":""" & CloudJson(CloudDisplayName(subFolder.Name, language)) & _
    """,""path"":""" & CloudJson(CloudJoinPath(relativePath, subFolder.Name)) & _
    """,""kind"":""folder"",""size"":0,""modifiedAt"":""" & _
    CloudJson(CStr(subFolder.DateLastModified)) & """}"
Next

For Each file In folder.Files
  If LCase(file.Name) <> ".gitkeep" Then
    If Not first Then json = json & ","
    first = False
    json = json & "{""name"":""" & CloudJson(file.Name) & _
      """,""displayName"":""" & CloudJson(file.Name) & _
      """,""path"":""" & CloudJson(CloudJoinPath(relativePath, file.Name)) & _
      """,""kind"":""file"",""size"":" & file.Size & ",""modifiedAt"":""" & _
      CloudJson(CStr(file.DateLastModified)) & """}"
  End If
Next

json = json & "]}"
Set folder = Nothing
Set fso = Nothing
Response.Write json
%>
