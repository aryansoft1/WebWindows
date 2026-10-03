<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/trust-schema.asp"-->
<%
Response.Buffer = True
Response.CodePage = 65001
Response.AddHeader "X-Content-Type-Options", "nosniff"

Sub Fail(ByVal statusText, ByVal message)
  Response.Clear
  Response.Status = statusText
  Response.ContentType = "application/json"
  Response.Charset = "utf-8"
  Response.Write "{""ok"":false,""message"":""" & Replace(message, Chr(34), "\" & Chr(34)) & """}"
  If conn.State <> 0 Then conn.Close
  Response.End
End Sub

If Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST") <> "developer-platform" Then
  Fail "403 Forbidden", "无效的开发者平台管理请求。"
End If
If Session("webwindows_admin") <> True Or _
   LCase(Trim(CStr(Session("username")))) <> "admin" Then
  Fail "401 Unauthorized", "请先登录 WebWindows 管理后台。"
End If
If Not WebWindowsTrustSchemaReady() Then
  Fail "500 Internal Server Error", "WebWindows 信任数据库结构尚未完成部署迁移。"
End If

Dim idText, idRegex, packageId, packageRs
idText = Trim(CStr(Request.QueryString("submissionId")))
Set idRegex = New RegExp
idRegex.Pattern = "^[0-9]+$"
If Not idRegex.Test(idText) Then Fail "400 Bad Request", "提交 ID 无效。"
packageId = CLng(idText)
Set packageRs = conn.Execute("SELECT p.package_blob,p.package_size,p.package_sha256 " & _
  "FROM webwindows_function_packages p " & _
  "JOIN webwindows_function_submissions s ON p.submission_id=s.id " & _
  "WHERE s.id=" & packageId & " LIMIT 1")
If packageRs.EOF Then
  packageRs.Close
  Fail "404 Not Found", "没有找到功能包。"
End If

Response.Clear
Response.ContentType = "application/zip"
Response.AddHeader "Content-Disposition", "attachment; filename=webwindows-package-" & packageId & ".zip"
Response.AddHeader "Content-Length", CStr(packageRs("package_size"))
Response.AddHeader "X-WebWindows-Package-SHA256", CStr(packageRs("package_sha256"))
Response.CacheControl = "private"
Response.BinaryWrite packageRs("package_blob")
packageRs.Close
If conn.State <> 0 Then conn.Close
Set packageRs = Nothing
Set conn = Nothing
%>
