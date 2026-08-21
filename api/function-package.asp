<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
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

Dim appId, appVersion, idRegex, versionRegex, packageCmd, packageRs
appId = LCase(Trim(CStr(Request.QueryString("appId"))))
appVersion = Trim(CStr(Request.QueryString("version")))
Set idRegex = New RegExp
idRegex.Pattern = "^[a-z0-9]+([._-][a-z0-9]+)+$"
Set versionRegex = New RegExp
versionRegex.Pattern = "^[0-9]+(\.[0-9]+){1,3}([._-][a-z0-9]+)?$"
If Not idRegex.Test(appId) Or Not versionRegex.Test(appVersion) Then
  Fail "400 Bad Request", "功能 ID 或版本号无效。"
End If

Set packageCmd = Server.CreateObject("ADODB.Command")
With packageCmd
  .ActiveConnection = conn
  .CommandText = "SELECT p.package_blob,p.package_size,p.package_sha256,s.id " & _
    "FROM webwindows_function_submissions s " & _
    "JOIN webwindows_function_packages p ON p.submission_id=s.id " & _
    "WHERE s.app_id=? AND s.app_version=? AND s.status='published' " & _
    "ORDER BY s.id DESC LIMIT 1"
  .CommandType = 1
  .Parameters.Append .CreateParameter(, 200, 1, 160, appId)
  .Parameters.Append .CreateParameter(, 200, 1, 40, appVersion)
  Set packageRs = .Execute
End With
If packageRs.EOF Then
  packageRs.Close
  Fail "404 Not Found", "没有找到已发布的功能包。"
End If

Response.Clear
Response.ContentType = "application/zip"
Response.AddHeader "Content-Disposition", "attachment; filename=webwindows-function-" & CLng(packageRs("id")) & ".zip"
Response.AddHeader "Content-Length", CStr(packageRs("package_size"))
Response.AddHeader "ETag", """" & CStr(packageRs("package_sha256")) & """"
Response.AddHeader "X-WebWindows-Package-SHA256", CStr(packageRs("package_sha256"))
Response.CacheControl = "public"
Response.Expires = 60
Response.BinaryWrite packageRs("package_blob")
packageRs.Close
If conn.State <> 0 Then conn.Close
Set packageRs = Nothing
Set packageCmd = Nothing
Set conn = Nothing
%>
