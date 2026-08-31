<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/trust-schema.asp"-->
<%
Response.Buffer = True
Response.CodePage = 65001
Response.AddHeader "X-Content-Type-Options", "nosniff"

Function JsonText(ByVal value)
  JsonText = Replace(Replace(CStr(value), "\", "\\"), Chr(34), "\" & Chr(34))
End Function

Sub Fail(ByVal statusText, ByVal code, ByVal message)
  Response.Clear
  Response.Status = statusText
  Response.ContentType = "application/json"
  Response.Charset = "utf-8"
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  If conn.State <> 0 Then conn.Close
  Response.End
End Sub

If Not WebWindowsTrustSchemaReady() Then
  Fail "500 Internal Server Error", "trust-schema-required", "WebWindows 信任数据库结构尚未完成部署迁移。"
End If

Dim releaseId, appId, appVersion, idRegex, versionRegex, releaseRegex, packageCmd, packageRs, verifiedRoute
releaseId = Trim(CStr(Request.QueryString("release")))
appId = LCase(Trim(CStr(Request.QueryString("appId"))))
appVersion = Trim(CStr(Request.QueryString("version")))
Set idRegex = New RegExp
idRegex.Pattern = "^[a-z0-9]+([._-][a-z0-9]+)+$"
Set versionRegex = New RegExp
versionRegex.Pattern = "^[0-9]+(\.[0-9]+){1,3}([._-][a-z0-9]+)?$"
Set releaseRegex = New RegExp
releaseRegex.Pattern = "^rel_[a-f0-9]{32}$"
verifiedRoute = (releaseId <> "")
If verifiedRoute Then
  If Not releaseRegex.Test(releaseId) Then Fail "400 Bad Request", "release-not-found", "发布版本标识无效。"
  If appId <> "" And Not idRegex.Test(appId) Then Fail "400 Bad Request", "release-binding-mismatch", "功能标识无效。"
  If appVersion <> "" And Not versionRegex.Test(appVersion) Then Fail "400 Bad Request", "release-binding-mismatch", "版本号无效。"
ElseIf Not idRegex.Test(appId) Or Not versionRegex.Test(appVersion) Then
  Fail "400 Bad Request", "legacy-package-identity-invalid", "功能 ID 或版本号无效。"
End If

Set packageCmd = Server.CreateObject("ADODB.Command")
With packageCmd
  .ActiveConnection = conn
  .CommandType = 1
  If verifiedRoute Then
    .CommandText = "SELECT p.package_blob,p.package_size,p.package_sha256,s.id,pr.published_release_id," & _
      "pr.app_id,pr.app_version,COALESCE((SELECT e.release_status FROM webwindows_published_release_events e " & _
      "WHERE e.published_release_id=pr.id ORDER BY e.id DESC LIMIT 1),pr.release_status) AS effective_status " & _
      "FROM webwindows_published_releases pr " & _
      "JOIN webwindows_function_packages p ON p.submission_id=pr.submission_id AND p.package_sha256=pr.package_sha256 " & _
      "JOIN webwindows_function_submissions s ON s.id=pr.submission_id AND s.app_id=pr.app_id AND s.app_version=pr.app_version " & _
      "JOIN webwindows_function_catalog_versions cv ON cv.is_active=1 " & _
      "JOIN webwindows_catalog_release_bindings b ON b.catalog_revision_id=cv.id AND b.published_release_id=pr.id " & _
      "AND b.published_release_identity=pr.published_release_id AND b.package_sha256=pr.package_sha256 " & _
      "AND b.catalog_entry_id=pr.app_id AND b.release_binding_state='verified' " & _
      "WHERE pr.published_release_id=? ORDER BY cv.id DESC LIMIT 1"
    .Parameters.Append .CreateParameter(, 200, 1, 64, releaseId)
  Else
    .CommandText = "SELECT p.package_blob,p.package_size,p.package_sha256,s.id,NULL AS published_release_id," & _
      "s.app_id,s.app_version,'legacy-unverified' AS effective_status " & _
      "FROM webwindows_function_submissions s " & _
      "JOIN webwindows_function_packages p ON p.submission_id=s.id " & _
      "WHERE s.app_id=? AND s.app_version=? AND s.status='published' " & _
      "ORDER BY s.id DESC LIMIT 1"
    .Parameters.Append .CreateParameter(, 200, 1, 160, appId)
    .Parameters.Append .CreateParameter(, 200, 1, 40, appVersion)
  End If
  Set packageRs = .Execute
End With
If packageRs.EOF Then
  packageRs.Close
  If verifiedRoute Then
    Fail "404 Not Found", "release-not-found", "没有找到该发布版本绑定的功能包。"
  Else
    Fail "404 Not Found", "legacy-package-not-found", "没有找到已发布的功能包。"
  End If
End If
If verifiedRoute Then
  If appId <> "" And appId <> LCase(CStr(packageRs("app_id"))) Then packageRs.Close: Fail "409 Conflict", "release-binding-mismatch", "发布版本与功能标识不一致。"
  If appVersion <> "" And appVersion <> CStr(packageRs("app_version")) Then packageRs.Close: Fail "409 Conflict", "release-binding-mismatch", "发布版本与版本号不一致。"
  If LCase(CStr(packageRs("effective_status"))) <> "active" And LCase(CStr(packageRs("effective_status"))) <> "delisted" Then
    packageRs.Close
    Fail "409 Conflict", "release-not-active", "该发布版本当前不允许运行。"
  End If
End If

Response.Clear
Response.ContentType = "application/zip"
Response.AddHeader "Content-Disposition", "attachment; filename=webwindows-function-" & CLng(packageRs("id")) & ".zip"
Response.AddHeader "Content-Length", CStr(packageRs("package_size"))
Response.AddHeader "ETag", """" & CStr(packageRs("package_sha256")) & """"
Response.AddHeader "X-WebWindows-Package-SHA256", CStr(packageRs("package_sha256"))
If verifiedRoute Then Response.AddHeader "X-WebWindows-Published-Release", CStr(packageRs("published_release_id"))
Response.CacheControl = "public"
Response.Expires = 60
Response.BinaryWrite packageRs("package_blob")
packageRs.Close
If conn.State <> 0 Then conn.Close
Set packageRs = Nothing
Set packageCmd = Nothing
Set conn = Nothing
%>
