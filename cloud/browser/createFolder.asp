<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001

If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "POST" Then
  CloudJsonError "405 Method Not Allowed", "METHOD_NOT_ALLOWED", "只允许 POST 请求"
End If
If Not CloudIsAdminRequest() Then
  CloudJsonError "401 Unauthorized", "ADMIN_REQUIRED", "需要云资源节点管理权限"
End If
If CloudUsesLegacyPublicRoot() Then
  CloudJsonError "409 Conflict", "LEGACY_PUBLIC_ROOT_READ_ONLY", "旧版公共区域仅兼容读取，请先迁移到 Public"
End If

Dim parentPath, folderName, normalizedName, parentPhysical, newRelativePath
Dim newPhysicalPath, fso
If Not CloudTryNormalizePath(Request.Form("path"), parentPath) Then
  CloudJsonError "400 Bad Request", "INVALID_PATH", "资料位置无效"
End If

folderName = Trim(CStr(Request.Form("name")))
If folderName = "" Or Not CloudTryNormalizePath(folderName, normalizedName) Or _
   normalizedName <> folderName Or InStr(normalizedName, "/") > 0 Then
  CloudJsonError "400 Bad Request", "INVALID_NAME", "资料夹名称无效"
End If

parentPhysical = CloudPhysicalPath(parentPath)
newRelativePath = CloudJoinPath(parentPath, folderName)
newPhysicalPath = CloudPhysicalPath(newRelativePath)

Set fso = Server.CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists(parentPhysical) Then
  Set fso = Nothing
  CloudJsonError "404 Not Found", "PARENT_NOT_FOUND", "上级资料夹不存在"
End If
If fso.FolderExists(newPhysicalPath) Or fso.FileExists(newPhysicalPath) Then
  Set fso = Nothing
  CloudJsonError "409 Conflict", "NAME_CONFLICT", "已存在同名资料"
End If

On Error Resume Next
fso.CreateFolder newPhysicalPath
If Err.Number <> 0 Then
  Dim errorDescription
  errorDescription = Err.Description
  Err.Clear
  On Error GoTo 0
  Set fso = Nothing
  CloudJsonError "500 Internal Server Error", "CREATE_FAILED", "建立资料夹失败：" & errorDescription
End If
On Error GoTo 0
Set fso = Nothing

Response.Write "{""ok"":true,""item"":{""name"":""" & CloudJson(folderName) & _
  """,""displayName"":""" & CloudJson(CloudDisplayName(folderName, CloudRequestLanguage())) & _
  """,""path"":""" & CloudJson(newRelativePath) & """,""kind"":""folder""}}"
%>
