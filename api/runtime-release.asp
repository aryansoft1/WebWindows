<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/trust-schema.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-store"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Function JsonText(ByVal value)
  Dim text
  If IsNull(value) Then text = "" Else text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(Replace(text, vbCr, "\n"), vbLf, "\n")
  JsonText = text
End Function

Function JsonNullable(ByVal value)
  If IsNull(value) Or Len(CStr(value)) = 0 Then
    JsonNullable = "null"
  Else
    JsonNullable = """" & JsonText(value) & """"
  End If
End Function

Function Base64DecodeUtf8(ByVal value)
  Dim xml, node, bytes, stream
  Set xml = Server.CreateObject("Msxml2.DOMDocument.3.0")
  Set node = xml.createElement("base64")
  node.dataType = "bin.base64"
  node.text = CStr(value)
  bytes = node.nodeTypedValue
  Set node = Nothing
  Set xml = Nothing
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.Write bytes
  stream.Position = 0
  stream.Type = 2
  stream.Charset = "utf-8"
  Base64DecodeUtf8 = stream.ReadText
  stream.Close
  Set stream = Nothing
End Function

Sub Fail(ByVal statusText, ByVal code, ByVal message)
  Response.Clear
  Response.Status = statusText
  Response.ContentType = "application/json"
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  If conn.State <> 0 Then conn.Close
  Response.End
End Sub

If Not WebWindowsTrustSchemaReady() Then
  Fail "500 Internal Server Error", "trust-schema-required", "WebWindows 信任数据库结构尚未完成部署迁移。"
End If

Dim releaseId, appIdHint, versionHint, releaseRegex, releaseCmd, releaseRs, effectiveStatus
releaseId = Trim(CStr(Request.QueryString("release")))
appIdHint = LCase(Trim(CStr(Request.QueryString("appId"))))
versionHint = Trim(CStr(Request.QueryString("version")))
Set releaseRegex = New RegExp
releaseRegex.Pattern = "^rel_[a-f0-9]{32}$"
If Not releaseRegex.Test(releaseId) Then Fail "400 Bad Request", "release-not-found", "发布版本标识无效。"

Set releaseCmd = Server.CreateObject("ADODB.Command")
With releaseCmd
  .ActiveConnection = conn
  .CommandType = 1
  .CommandText = "SELECT pr.published_release_id,pr.publisher_id,pr.app_id,pr.app_version," & _
    "pr.package_sha256,pr.source_manifest_sha256,pr.source_manifest_integrity_version,pr.manifest_version,pr.sdk_version," & _
    "pr.review_policy_version,r.review_decision_id,pr.approved_permissions_base64," & _
    "b.catalog_revision_id,b.package_download_url,b.release_binding_state,b.release_status," & _
    "COALESCE((SELECT e.release_status FROM webwindows_published_release_events e " & _
    "WHERE e.published_release_id=pr.id ORDER BY e.id DESC LIMIT 1),pr.release_status) AS effective_status " & _
    "FROM webwindows_published_releases pr " & _
    "JOIN webwindows_review_decisions r ON r.id=pr.review_decision_id " & _
    "JOIN webwindows_function_catalog_versions cv ON cv.is_active=1 " & _
    "JOIN webwindows_catalog_release_bindings b ON b.catalog_revision_id=cv.id " & _
    "AND b.published_release_id=pr.id AND b.published_release_identity=pr.published_release_id " & _
    "WHERE pr.published_release_id=? AND b.catalog_entry_id=pr.app_id " & _
    "AND b.release_binding_state='verified' AND b.package_sha256=pr.package_sha256 " & _
    "AND b.source_manifest_sha256=pr.source_manifest_sha256 AND b.manifest_version=pr.manifest_version " & _
    "AND b.source_manifest_integrity_version=pr.source_manifest_integrity_version " & _
    "AND r.source_manifest_integrity_version=pr.source_manifest_integrity_version " & _
    "AND (b.sdk_version=pr.sdk_version OR (b.sdk_version IS NULL AND pr.sdk_version IS NULL)) " & _
    "AND b.review_decision_identity=r.review_decision_id " & _
    "AND b.approved_permissions_base64=pr.approved_permissions_base64 " & _
    "AND b.review_policy_version=pr.review_policy_version ORDER BY cv.id DESC LIMIT 1"
  .Parameters.Append .CreateParameter(, 200, 1, 64, releaseId)
  Set releaseRs = .Execute
End With
If releaseRs.EOF Then
  releaseRs.Close
  Fail "404 Not Found", "release-not-found", "没有找到可验证的发布版本。"
End If
If CLng(releaseRs("source_manifest_integrity_version")) <> 1 Then
  releaseRs.Close
  Fail "409 Conflict", "runtime-release-verification-failed", "发布版本完整性算法版本无法确认。"
End If
If appIdHint <> "" And appIdHint <> LCase(CStr(releaseRs("app_id"))) Then
  releaseRs.Close
  Fail "409 Conflict", "release-binding-mismatch", "发布版本与功能标识不一致。"
End If
If versionHint <> "" And versionHint <> CStr(releaseRs("app_version")) Then
  releaseRs.Close
  Fail "409 Conflict", "release-binding-mismatch", "发布版本与版本号不一致。"
End If
effectiveStatus = LCase(CStr(releaseRs("effective_status")))
If effectiveStatus = "revoked" Or effectiveStatus = "security-blocked" Then
  releaseRs.Close
  Fail "409 Conflict", "release-not-active", "该发布版本当前不允许运行。"
End If
If effectiveStatus <> "active" And effectiveStatus <> "delisted" Then
  releaseRs.Close
  Fail "409 Conflict", "release-not-active", "该发布版本状态无法确认。"
End If

Response.Write "{""ok"":true,""identity"":{""publishedReleaseId"":""" & JsonText(releaseRs("published_release_id")) & _
  """,""appId"":""" & JsonText(releaseRs("app_id")) & """,""publisherId"":""" & CStr(releaseRs("publisher_id")) & _
  """,""version"":""" & JsonText(releaseRs("app_version")) & """,""packageSha256"":""" & LCase(CStr(releaseRs("package_sha256"))) & _
  """,""sourceManifestSha256"":""" & LCase(CStr(releaseRs("source_manifest_sha256"))) & _
  """,""sourceManifestIntegrityVersion"":" & CLng(releaseRs("source_manifest_integrity_version")) & _
  """,""manifestVersion"":" & CLng(releaseRs("manifest_version")) & ",""sdkVersion"":" & JsonNullable(releaseRs("sdk_version")) & _
  ",""reviewDecisionId"":""" & JsonText(releaseRs("review_decision_id")) & """,""approvedPermissions"":" & _
  Base64DecodeUtf8(CStr(releaseRs("approved_permissions_base64"))) & ",""reviewPolicyVersion"":" & _
  CLng(releaseRs("review_policy_version")) & ",""releaseStatus"":""" & JsonText(effectiveStatus) & _
  """,""catalogRevisionId"":" & CLng(releaseRs("catalog_revision_id")) & _
  ",""packageDownloadIdentity"":{""publishedReleaseId"":""" & JsonText(releaseRs("published_release_id")) & _
  """,""downloadUrl"":""/api/function-package.asp?release=" & Server.URLEncode(releaseRs("published_release_id")) & """}}}"
releaseRs.Close
If conn.State <> 0 Then conn.Close
Set releaseRs = Nothing
Set releaseCmd = Nothing
Set conn = Nothing
%>
