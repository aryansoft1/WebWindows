<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Function JsonText(ByVal value)
  Dim text
  If IsNull(value) Then text = "" Else text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

Sub Fail(ByVal statusCode, ByVal code, ByVal message)
  Select Case CLng(statusCode)
    Case 400: Response.Status = "400 Bad Request"
    Case 401: Response.Status = "401 Unauthorized"
    Case 403: Response.Status = "403 Forbidden"
    Case 404: Response.Status = "404 Not Found"
    Case 409: Response.Status = "409 Conflict"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  If IsObject(conn) Then
    If conn.State <> 0 Then conn.Close
  End If
  Response.End
End Sub

Function FormPositiveLong(ByVal name)
  Dim value, numberRegex
  value = Trim(CStr(Request.Form(name)))
  Set numberRegex = New RegExp
  numberRegex.Pattern = "^[0-9]+$"
  If numberRegex.Test(value) Then
    FormPositiveLong = CLng(value)
  Else
    FormPositiveLong = 0
  End If
  Set numberRegex = Nothing
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

Function Base64EncodeUtf8(ByVal value)
  Dim stream, bytes, xml, node
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.WriteText CStr(value)
  stream.Position = 0
  stream.Type = 1
  stream.Position = 3
  bytes = stream.Read
  stream.Close
  Set stream = Nothing
  Set xml = Server.CreateObject("Msxml2.DOMDocument.3.0")
  Set node = xml.createElement("base64")
  node.dataType = "bin.base64"
  node.nodeTypedValue = bytes
  Base64EncodeUtf8 = Replace(Replace(node.text, vbCr, ""), vbLf, "")
  Set node = Nothing
  Set xml = Nothing
End Function

Function JsonValueForKey(ByVal json, ByVal key, ByVal stringValue)
  Dim regex, matches
  Set regex = New RegExp
  regex.IgnoreCase = False
  If stringValue Then
    regex.Pattern = """" & key & """\s*:\s*""([^""\\]*(\\.[^""\\]*)*)"""
  Else
    regex.Pattern = """" & key & """\s*:\s*([^,}\r\n]+)"
  End If
  Set matches = regex.Execute(CStr(json))
  If matches.Count = 0 Then
    JsonValueForKey = ""
  Else
    JsonValueForKey = Trim(CStr(matches(0).SubMatches(0)))
  End If
  Set matches = Nothing
  Set regex = Nothing
End Function

Function JsonArrayForKey(ByVal json, ByVal key)
  Dim regex, matches
  Set regex = New RegExp
  regex.IgnoreCase = False
  regex.Pattern = """" & key & """\s*:\s*(\[[^\]]*\])"
  Set matches = regex.Execute(CStr(json))
  If matches.Count = 0 Then JsonArrayForKey = "" Else JsonArrayForKey = CStr(matches(0).SubMatches(0))
  Set matches = Nothing
  Set regex = Nothing
End Function

Function SqlNullableText(ByVal value)
  If IsNull(value) Then
    SqlNullableText = "NULL"
  ElseIf Len(CStr(value)) = 0 Then
    SqlNullableText = "NULL"
  Else
    SqlNullableText = "'" & Replace(CStr(value), "'", "''") & "'"
  End If
End Function

Function JsonNullableText(ByVal value)
  If IsNull(value) Then
    JsonNullableText = "null"
  Else
    JsonNullableText = """" & JsonText(value) & """"
  End If
End Function

Function CanonicalPermissionSelection(ByVal requestedJson, ByVal selectedJson, ByRef deniedJson, ByRef reason)
  Dim shape, token, requested, selected, requestedMatches, selectedMatches, item, key, approved, denied
  Set shape = New RegExp
  shape.Pattern = "^\s*\[\s*(""[a-z0-9]+([._-][a-z0-9]+)*""\s*(,\s*""[a-z0-9]+([._-][a-z0-9]+)*""\s*)*)?\]\s*$"
  shape.IgnoreCase = False
  If Not shape.Test(CStr(requestedJson)) Or Not shape.Test(CStr(selectedJson)) Then
    reason = "权限集合不是有效的 permission ID JSON 数组。"
    CanonicalPermissionSelection = ""
    Exit Function
  End If
  Set token = New RegExp
  token.Pattern = """([a-z0-9]+([._-][a-z0-9]+)*)"""
  token.Global = True
  Set requested = Server.CreateObject("Scripting.Dictionary")
  Set selected = Server.CreateObject("Scripting.Dictionary")
  Set requestedMatches = token.Execute(CStr(requestedJson))
  For Each item In requestedMatches
    key = CStr(item.SubMatches(0))
    If requested.Exists(key) Then
      reason = "验证报告包含重复权限。"
      CanonicalPermissionSelection = ""
      Exit Function
    End If
    requested.Add key, True
  Next
  Set selectedMatches = token.Execute(CStr(selectedJson))
  For Each item In selectedMatches
    key = CStr(item.SubMatches(0))
    If selected.Exists(key) Or Not requested.Exists(key) Then
      reason = "批准权限必须是请求权限的无重复子集。"
      CanonicalPermissionSelection = ""
      Exit Function
    End If
    selected.Add key, True
  Next
  approved = "["
  denied = "["
  For Each key In requested.Keys
    If selected.Exists(key) Then
      If Len(approved) > 1 Then approved = approved & ","
      approved = approved & """" & key & """"
    Else
      If Len(denied) > 1 Then denied = denied & ","
      denied = denied & """" & key & """"
    End If
  Next
  CanonicalPermissionSelection = approved & "]"
  deniedJson = denied & "]"
  reason = ""
End Function

Sub EnsureTables()
  On Error Resume Next
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_developers (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,user_id BIGINT NOT NULL,display_name VARCHAR(120) NOT NULL," & _
    "status VARCHAR(20) NOT NULL DEFAULT 'pending',api_key_hash VARCHAR(64) NULL," & _
    "api_key_prefix VARCHAR(20) NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),UNIQUE KEY uk_webwindows_developer_user(user_id)," & _
    "KEY idx_webwindows_developer_status(status)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    Dim schemaError
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "DEVELOPER_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_function_submissions (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,developer_id BIGINT NOT NULL,app_id VARCHAR(160) NOT NULL," & _
    "app_version VARCHAR(40) NOT NULL,manifest_base64 LONGTEXT NOT NULL," & _
    "integrity_sha256 VARCHAR(64) NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'submitted'," & _
    "review_note VARCHAR(255) NOT NULL DEFAULT '',created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
    "reviewed_by BIGINT NULL,reviewed_at DATETIME NULL,PRIMARY KEY(id)," & _
    "KEY idx_function_submission_developer(developer_id,id)," & _
    "KEY idx_function_submission_status(status,id)," & _
    "KEY idx_function_submission_app(app_id,app_version)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "SUBMISSION_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_function_packages (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,submission_id BIGINT NOT NULL,developer_id BIGINT NOT NULL," & _
    "original_filename VARCHAR(180) NOT NULL,package_blob LONGBLOB NOT NULL," & _
    "package_size BIGINT NOT NULL,package_sha256 VARCHAR(64) NOT NULL DEFAULT ''," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),UNIQUE KEY uk_function_package_submission(submission_id)," & _
    "KEY idx_function_package_developer(developer_id,id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "PACKAGE_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_function_ownership (" & _
    "app_id VARCHAR(160) NOT NULL,developer_id BIGINT NOT NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(app_id),KEY idx_function_ownership_developer(developer_id)) " & _
    "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "OWNERSHIP_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_submission_validations (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,submission_id BIGINT NOT NULL,developer_id BIGINT NOT NULL," & _
    "package_sha256 VARCHAR(64) NOT NULL,source_manifest_sha256 VARCHAR(64) NULL,source_manifest_integrity_version INT NOT NULL," & _
    "validator_version VARCHAR(20) NOT NULL,passed TINYINT(1) NOT NULL," & _
    "report_base64 LONGTEXT NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),KEY idx_submission_validation_submission(submission_id,id)," & _
    "KEY idx_submission_validation_package(package_sha256)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  Err.Clear
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_review_decisions (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,review_decision_id VARCHAR(64) NOT NULL," & _
    "submission_id BIGINT NOT NULL,publisher_id BIGINT NOT NULL,app_id VARCHAR(160) NOT NULL," & _
    "app_version VARCHAR(40) NOT NULL,package_sha256 VARCHAR(64) NOT NULL," & _
    "source_manifest_sha256 VARCHAR(64) NOT NULL,source_manifest_integrity_version INT NOT NULL,validation_record_id BIGINT NOT NULL," & _
    "validation_report_id VARCHAR(80) NOT NULL," & _
    "manifest_version INT NOT NULL,sdk_version VARCHAR(20) NULL," & _
    "requested_permissions_base64 LONGTEXT NOT NULL,approved_permissions_base64 LONGTEXT NOT NULL," & _
    "denied_permissions_base64 LONGTEXT NOT NULL,review_policy_version INT NOT NULL," & _
    "decision VARCHAR(20) NOT NULL,review_note VARCHAR(255) NOT NULL DEFAULT ''," & _
    "reviewer_type VARCHAR(30) NOT NULL,reviewed_by BIGINT NULL,reviewer_identity VARCHAR(160) NOT NULL," & _
    "risk_summary_base64 LONGTEXT NOT NULL,supersedes_id BIGINT NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(id)," & _
    "UNIQUE KEY uk_review_decision_identity(review_decision_id)," & _
    "KEY idx_review_decision_submission(submission_id,id)," & _
    "KEY idx_review_decision_package(package_sha256)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "REVIEW_DECISION_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_published_releases (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,published_release_id VARCHAR(64) NOT NULL," & _
    "submission_id BIGINT NOT NULL,publisher_id BIGINT NOT NULL,app_id VARCHAR(160) NOT NULL," & _
    "app_version VARCHAR(40) NOT NULL,package_sha256 VARCHAR(64) NOT NULL," & _
    "source_manifest_sha256 VARCHAR(64) NOT NULL,source_manifest_integrity_version INT NOT NULL,manifest_version INT NOT NULL," & _
    "sdk_version VARCHAR(20) NULL,validation_record_id BIGINT NOT NULL," & _
    "validation_report_id VARCHAR(80) NOT NULL,review_decision_id BIGINT NOT NULL," & _
    "approved_permissions_base64 LONGTEXT NOT NULL,review_policy_version INT NOT NULL," & _
    "release_status VARCHAR(24) NOT NULL DEFAULT 'active',published_by BIGINT NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(id)," & _
    "UNIQUE KEY uk_published_release_identity(published_release_id)," & _
    "UNIQUE KEY uk_published_release_version(app_id,app_version)," & _
    "UNIQUE KEY uk_published_release_review(review_decision_id)," & _
    "KEY idx_published_release_package(package_sha256)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "PUBLISHED_RELEASE_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_published_release_events (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,published_release_id BIGINT NOT NULL," & _
    "release_status VARCHAR(24) NOT NULL,event_note VARCHAR(255) NOT NULL DEFAULT ''," & _
    "acted_by BIGINT NULL,actor_identity VARCHAR(160) NOT NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(id)," & _
    "KEY idx_release_event_release(published_release_id,id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "RELEASE_EVENT_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_function_catalog_versions (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,catalog_version VARCHAR(40) NOT NULL," & _
    "catalog_json LONGTEXT NOT NULL,storage_encoding VARCHAR(12) NOT NULL DEFAULT 'base64'," & _
    "publish_note VARCHAR(255) NOT NULL DEFAULT '',published_by BIGINT NULL," & _
    "is_active TINYINT(1) NOT NULL DEFAULT 0,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),KEY idx_function_catalog_active(is_active,id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "CATALOG_SCHEMA_FAILED", schemaError
  End If
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_catalog_release_bindings (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,catalog_revision_id BIGINT NOT NULL,catalog_entry_id VARCHAR(160) NOT NULL," & _
    "source_type VARCHAR(30) NOT NULL,release_binding_state VARCHAR(30) NOT NULL," & _
    "published_release_id BIGINT NULL,published_release_identity VARCHAR(64) NULL," & _
    "package_sha256 VARCHAR(64) NULL,source_manifest_sha256 VARCHAR(64) NULL,source_manifest_integrity_version INT NULL," & _
    "manifest_version INT NULL,sdk_version VARCHAR(20) NULL,review_decision_identity VARCHAR(64) NULL," & _
    "approved_permissions_base64 LONGTEXT NULL,review_policy_version INT NULL," & _
    "package_download_url VARCHAR(500) NULL,release_status VARCHAR(24) NOT NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(id)," & _
    "UNIQUE KEY uk_catalog_binding_entry(catalog_revision_id,catalog_entry_id)," & _
    "UNIQUE KEY uk_catalog_binding_release(catalog_revision_id,published_release_identity)," & _
    "KEY idx_catalog_binding_release_identity(published_release_identity)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    schemaError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "CATALOG_BINDING_SCHEMA_FAILED", schemaError
  End If
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN package_size BIGINT NOT NULL DEFAULT 0"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN package_sha256 VARCHAR(64) NOT NULL DEFAULT ''"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN package_uploaded_at DATETIME NULL"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN validation_status VARCHAR(30) NOT NULL DEFAULT 'not-validated'"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN active_validation_id BIGINT NULL"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_submission_validations ADD COLUMN source_manifest_integrity_version INT NOT NULL DEFAULT 0"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_review_decisions ADD COLUMN source_manifest_integrity_version INT NOT NULL DEFAULT 0"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_published_releases ADD COLUMN source_manifest_integrity_version INT NOT NULL DEFAULT 0"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_catalog_release_bindings ADD COLUMN source_manifest_integrity_version INT NULL DEFAULT 0"
  Err.Clear
  conn.Execute "UPDATE webwindows_function_submissions SET validation_status='legacy-unverified' " & _
    "WHERE status='published' AND validation_status='not-validated'"
  Err.Clear
  On Error GoTo 0
End Sub

If Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST") <> "developer-platform" Then
  Fail 403, "ADMIN_REQUEST_REQUIRED", "无效的开发者平台管理请求。"
End If
If Session("webwindows_admin") <> True Or _
   LCase(Trim(CStr(Session("username")))) <> "admin" Then
  Fail 401, "ADMIN_LOGIN_REQUIRED", "请先登录 WebWindows 管理后台。"
End If

EnsureTables
Dim action, method
action = LCase(Trim(CStr(Request("action"))))
method = UCase(Request.ServerVariables("REQUEST_METHOD"))

If action = "developers" And method = "GET" Then
  Dim developerRs, developerJson, firstDeveloper
  Set developerRs = conn.Execute("SELECT d.id,d.user_id,d.display_name,d.status,d.api_key_prefix," & _
    "d.created_at,d.updated_at,u.username FROM webwindows_developers d " & _
    "LEFT JOIN webwindows_users u ON d.user_id=u.id ORDER BY d.id DESC LIMIT 500")
  developerJson = "{""ok"":true,""developers"":["
  firstDeveloper = True
  Do Until developerRs.EOF
    If Not firstDeveloper Then developerJson = developerJson & ","
    firstDeveloper = False
    developerJson = developerJson & "{""id"":" & CLng(developerRs("id")) & _
      ",""userId"":" & CLng(developerRs("user_id")) & _
      ",""username"":""" & JsonText(developerRs("username")) & _
      """,""displayName"":""" & JsonText(developerRs("display_name")) & _
      """,""status"":""" & JsonText(developerRs("status")) & _
      """,""keyPrefix"":""" & JsonText(developerRs("api_key_prefix")) & _
      """,""createdAt"":""" & JsonText(developerRs("created_at")) & _
      """,""updatedAt"":""" & JsonText(developerRs("updated_at")) & """}"
    developerRs.MoveNext
  Loop
  developerJson = developerJson & "]}"
  developerRs.Close
  Set developerRs = Nothing
  Response.Write developerJson

ElseIf action = "submissions" And method = "GET" Then
  Dim submissionRs, submissionJson, firstSubmission, manifestJson, packageReadyJson, serverValidatedJson, validationReportJson
  Dim reviewDecisionJson, publishedReleaseJson, effectiveReleaseStatus
  Set submissionRs = conn.Execute("SELECT s.id,s.developer_id,s.app_id,s.app_version,s.manifest_base64," & _
    "s.integrity_sha256,s.package_size,s.package_sha256,s.package_uploaded_at," & _
    "s.validation_status,s.status,s.review_note,s.created_at,s.updated_at,d.display_name,u.username," & _
    "v.id AS validation_id,v.report_base64,v.passed AS validation_passed," & _
    "r.review_decision_id,r.decision,r.requested_permissions_base64,r.approved_permissions_base64," & _
    "r.denied_permissions_base64,r.review_policy_version,r.reviewer_identity,r.reviewer_type," & _
    "r.validation_report_id,r.manifest_version,r.sdk_version," & _
    "r.package_sha256 AS review_package_sha256,r.source_manifest_sha256 AS review_manifest_sha256,r.source_manifest_integrity_version AS review_manifest_integrity_version,r.created_at AS reviewed_at," & _
    "pr.id AS release_internal_id,pr.published_release_id,pr.package_sha256 AS release_package_sha256," & _
    "pr.release_status,pr.created_at AS published_at,re.release_status AS event_release_status " & _
    "FROM webwindows_function_submissions s " & _
    "LEFT JOIN webwindows_submission_validations v ON v.id=s.active_validation_id " & _
    "LEFT JOIN webwindows_review_decisions r ON r.id=(SELECT MAX(r2.id) FROM webwindows_review_decisions r2 WHERE r2.submission_id=s.id) " & _
    "LEFT JOIN webwindows_published_releases pr ON pr.id=(SELECT MAX(pr2.id) FROM webwindows_published_releases pr2 WHERE pr2.submission_id=s.id) " & _
    "LEFT JOIN webwindows_published_release_events re ON re.id=(SELECT MAX(re2.id) FROM webwindows_published_release_events re2 WHERE re2.published_release_id=pr.id) " & _
    "JOIN webwindows_developers d ON s.developer_id=d.id " & _
    "LEFT JOIN webwindows_users u ON d.user_id=u.id ORDER BY s.id DESC LIMIT 200")
  submissionJson = "{""ok"":true,""submissions"":["
  firstSubmission = True
  Do Until submissionRs.EOF
    If Not firstSubmission Then submissionJson = submissionJson & ","
    firstSubmission = False
    manifestJson = Base64DecodeUtf8(CStr(submissionRs("manifest_base64")))
    If IsNull(submissionRs("report_base64")) Then validationReportJson = "null" Else validationReportJson = Base64DecodeUtf8(CStr(submissionRs("report_base64")))
    packageReadyJson = LCase(CStr(CBool(CLng(submissionRs("package_size")) > 0 And _
      LCase(CStr(submissionRs("package_sha256"))) = LCase(CStr(submissionRs("integrity_sha256"))))))
    serverValidatedJson = "false"
    If LCase(CStr(submissionRs("validation_status"))) = "validated" Then
      If Not IsNull(submissionRs("validation_passed")) Then
        If CBool(submissionRs("validation_passed")) Then serverValidatedJson = "true"
      End If
    End If
    reviewDecisionJson = "null"
    If Not IsNull(submissionRs("review_decision_id")) Then
      reviewDecisionJson = "{""reviewDecisionId"":""" & JsonText(submissionRs("review_decision_id")) & _
        """,""decision"":""" & JsonText(submissionRs("decision")) & _
        """,""requestedPermissions"":" & Base64DecodeUtf8(CStr(submissionRs("requested_permissions_base64"))) & _
        ",""approvedPermissions"":" & Base64DecodeUtf8(CStr(submissionRs("approved_permissions_base64"))) & _
        ",""deniedPermissions"":" & Base64DecodeUtf8(CStr(submissionRs("denied_permissions_base64"))) & _
        ",""reviewPolicyVersion"":" & CLng(submissionRs("review_policy_version")) & _
        ",""validationReportId"":""" & JsonText(submissionRs("validation_report_id")) & _
        """,""manifestVersion"":" & CLng(submissionRs("manifest_version")) & _
        ",""sdkVersion"":" & JsonNullableText(submissionRs("sdk_version")) & _
        ",""reviewerIdentity"":""" & JsonText(submissionRs("reviewer_identity")) & _
        """,""reviewerType"":""" & JsonText(submissionRs("reviewer_type")) & _
        """,""packageSha256"":""" & JsonText(submissionRs("review_package_sha256")) & _
        """,""sourceManifestSha256"":""" & JsonText(submissionRs("review_manifest_sha256")) & _
        """,""sourceManifestIntegrityVersion"":" & CLng(submissionRs("review_manifest_integrity_version")) & _
        """,""reviewedAt"":""" & JsonText(submissionRs("reviewed_at")) & """}"
    End If
    publishedReleaseJson = "null"
    If Not IsNull(submissionRs("published_release_id")) Then
      effectiveReleaseStatus = CStr(submissionRs("release_status"))
      If Not IsNull(submissionRs("event_release_status")) Then effectiveReleaseStatus = CStr(submissionRs("event_release_status"))
      publishedReleaseJson = "{""publishedReleaseId"":""" & JsonText(submissionRs("published_release_id")) & _
        """,""packageSha256"":""" & JsonText(submissionRs("release_package_sha256")) & _
        """,""releaseStatus"":""" & JsonText(effectiveReleaseStatus) & _
        """,""publishedAt"":""" & JsonText(submissionRs("published_at")) & """}"
    End If
    submissionJson = submissionJson & "{""id"":" & CLng(submissionRs("id")) & _
      ",""developerId"":" & CLng(submissionRs("developer_id")) & _
      ",""developerName"":""" & JsonText(submissionRs("display_name")) & _
      """,""username"":""" & JsonText(submissionRs("username")) & _
      """,""appId"":""" & JsonText(submissionRs("app_id")) & _
      """,""version"":""" & JsonText(submissionRs("app_version")) & _
      """,""integritySha256"":""" & JsonText(submissionRs("integrity_sha256")) & _
      """,""packageSize"":" & CLng(submissionRs("package_size")) & _
      ",""packageSha256"":""" & JsonText(submissionRs("package_sha256")) & _
      """,""packageUploadedAt"":""" & JsonText(submissionRs("package_uploaded_at")) & _
      """,""packageReady"":" & packageReadyJson & _
      ",""serverValidated"":" & serverValidatedJson & _
      ",""validationStatus"":""" & JsonText(submissionRs("validation_status")) & _
      """,""validationReport"":" & validationReportJson & _
      ",""reviewDecision"":" & reviewDecisionJson & _
      ",""publishedRelease"":" & publishedReleaseJson & _
      ",""status"":""" & JsonText(submissionRs("status")) & _
      """,""reviewNote"":""" & JsonText(submissionRs("review_note")) & _
      """,""createdAt"":""" & JsonText(submissionRs("created_at")) & _
      """,""updatedAt"":""" & JsonText(submissionRs("updated_at")) & _
      """,""manifest"":" & manifestJson & "}"
    submissionRs.MoveNext
  Loop
  submissionJson = submissionJson & "]}"
  submissionRs.Close
  Set submissionRs = Nothing
  Response.Write submissionJson

ElseIf action = "developer-status" And method = "POST" Then
  Dim developerId, developerStatus, developerStatusCmd
  developerId = FormPositiveLong("developerId")
  developerStatus = LCase(Trim(CStr(Request.Form("status"))))
  If developerId <= 0 Then Fail 400, "DEVELOPER_ID_INVALID", "开发者 ID 无效。"
  If developerStatus <> "approved" And developerStatus <> "pending" And _
     developerStatus <> "suspended" Then
    Fail 400, "DEVELOPER_STATUS_INVALID", "开发者状态无效。"
  End If
  Set developerStatusCmd = Server.CreateObject("ADODB.Command")
  With developerStatusCmd
    .ActiveConnection = conn
    If developerStatus = "suspended" Then
      .CommandText = "UPDATE webwindows_developers SET status=?,api_key_hash=NULL,api_key_prefix=NULL WHERE id=?"
    Else
      .CommandText = "UPDATE webwindows_developers SET status=? WHERE id=?"
    End If
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 20, developerStatus)
    .Parameters.Append .CreateParameter(, 3, 1, , developerId)
    .Execute
  End With
  Set developerStatusCmd = Nothing
  Response.Write "{""ok"":true,""status"":""" & JsonText(developerStatus) & """}"

ElseIf action = "submission-status" And method = "POST" Then
  Dim submissionId, targetStatus, reviewNote, currentRs, currentStatus
  Dim reportText, requestedJson, selectedJson, approvedJson, deniedJson, permissionError
  Dim reportId, reportPackageSha, reportManifestSha, reportManifestIntegrityVersion, manifestVersionText, sdkVersionText
  Dim supersedesId, reviewerIdentity, decisionText, reviewSql, reviewError, newDecisionRs
  submissionId = FormPositiveLong("submissionId")
  targetStatus = LCase(Trim(CStr(Request.Form("status"))))
  reviewNote = Left(Trim(CStr(Request.Form("note"))), 255)
  If submissionId <= 0 Then Fail 400, "SUBMISSION_ID_INVALID", "提交 ID 无效。"
  If targetStatus <> "approved" And targetStatus <> "rejected" Then
    Fail 400, "SUBMISSION_STATUS_INVALID", "审核状态无效。"
  End If
  If targetStatus = "rejected" And Len(reviewNote) = 0 Then Fail 400, "REVIEW_NOTE_REQUIRED", "驳回必须填写审核原因。"
  Set currentRs = conn.Execute("SELECT s.status,s.package_size,s.package_sha256,s.integrity_sha256," & _
    "s.app_id,s.app_version,s.developer_id,s.active_validation_id,s.validation_status," & _
    "v.passed AS validation_passed,v.package_sha256 AS validated_package_sha256," & _
    "v.source_manifest_sha256,v.source_manifest_integrity_version,v.report_base64 FROM webwindows_function_submissions s " & _
    "LEFT JOIN webwindows_submission_validations v ON v.id=s.active_validation_id WHERE s.id=" & submissionId)
  If currentRs.EOF Then
    currentRs.Close
    Fail 404, "SUBMISSION_NOT_FOUND", "没有找到功能提交。"
  End If
  currentStatus = LCase(CStr(currentRs("status")))
  If currentStatus <> "submitted" And currentStatus <> "rejected" And currentStatus <> "approved" Then
    currentRs.Close
    Fail 409, "SUBMISSION_TRANSITION_INVALID", "已发布或撤销的提交不能原地复审；请创建新提交。"
  End If
  If CLng(currentRs("package_size")) <= 0 Or _
     LCase(CStr(currentRs("package_sha256"))) <> LCase(CStr(currentRs("integrity_sha256"))) Then
    currentRs.Close
    Fail 409, "PACKAGE_REQUIRED", "必须先上传并通过 SHA-256 校验的 ZIP 功能包。"
  End If
  If LCase(CStr(currentRs("validation_status"))) <> "validated" Or _
     IsNull(currentRs("validation_passed")) Or IsNull(currentRs("validated_package_sha256")) Or _
     IsNull(currentRs("source_manifest_sha256")) Or IsNull(currentRs("report_base64")) Then
    currentRs.Close
    Fail 409, "SERVER_VALIDATION_REQUIRED", "审核必须绑定当前已通过的服务器验证报告。"
  End If
  If Not CBool(currentRs("validation_passed")) Or _
     LCase(CStr(currentRs("package_sha256"))) <> LCase(CStr(currentRs("validated_package_sha256"))) Then
    currentRs.Close
    Fail 409, "VALIDATION_BINDING_MISMATCH", "验证报告与当前功能包 SHA-256 不匹配。"
  End If
  reportText = Base64DecodeUtf8(CStr(currentRs("report_base64")))
  reportId = JsonValueForKey(reportText, "reportId", True)
  reportPackageSha = LCase(JsonValueForKey(reportText, "packageSha256", True))
  reportManifestSha = LCase(JsonValueForKey(reportText, "sourceManifestSha256", True))
  reportManifestIntegrityVersion = JsonValueForKey(reportText, "sourceManifestIntegrityVersion", False)
  manifestVersionText = JsonValueForKey(reportText, "manifestVersion", False)
  sdkVersionText = JsonValueForKey(reportText, "sdkVersion", True)
  requestedJson = JsonArrayForKey(reportText, "requestedPermissions")
  If Len(reportId) = 0 Or reportPackageSha <> LCase(CStr(currentRs("package_sha256"))) Or _
     reportManifestSha <> LCase(CStr(currentRs("source_manifest_sha256"))) Or _
     reportManifestIntegrityVersion <> "1" Or CLng(currentRs("source_manifest_integrity_version")) <> 1 Or _
     (manifestVersionText <> "1" And manifestVersionText <> "2") Or Len(requestedJson) = 0 Then
    currentRs.Close
    Fail 409, "VALIDATION_REPORT_BINDING_INVALID", "服务器验证报告身份或 Source Manifest 绑定无效。"
  End If
  selectedJson = CStr(Request.Form("approvedPermissionsJson"))
  If targetStatus = "rejected" Then selectedJson = "[]"
  If Len(Trim(selectedJson)) = 0 Then selectedJson = "[]"
  approvedJson = CanonicalPermissionSelection(requestedJson, selectedJson, deniedJson, permissionError)
  If Len(permissionError) > 0 Then
    currentRs.Close
    Fail 400, "PERMISSION_SELECTION_INVALID", permissionError
  End If
  If targetStatus = "approved" Then decisionText = "approved" Else decisionText = "rejected"
  reviewerIdentity = "admin:" & CStr(Session("username"))
  Dim appIdSql, versionSql, sdkSql, riskJson, previousRs, ownershipRs
  appIdSql = Replace(CStr(currentRs("app_id")), "'", "''")
  versionSql = Replace(CStr(currentRs("app_version")), "'", "''")
  sdkSql = Replace(sdkVersionText, "'", "''")
  riskJson = "{""validationReportId"":""" & JsonText(reportId) & """,""summary"":""validation-passed""}"
  supersedesId = "NULL"
  Set previousRs = conn.Execute("SELECT MAX(id) AS latest_id FROM webwindows_review_decisions WHERE submission_id=" & submissionId)
  If Not IsNull(previousRs("latest_id")) Then supersedesId = CStr(CLng(previousRs("latest_id")))
  previousRs.Close
  Set previousRs = Nothing
  Set ownershipRs = conn.Execute("SELECT developer_id FROM webwindows_function_ownership WHERE app_id='" & appIdSql & "' LIMIT 1")
  If targetStatus = "approved" And Not ownershipRs.EOF Then
    If CLng(ownershipRs("developer_id")) <> CLng(currentRs("developer_id")) Then
      ownershipRs.Close
      currentRs.Close
      Fail 409, "APP_ID_OWNED", "该功能 ID 已属于其他开发者。"
    End If
  End If
  ownershipRs.Close
  Set ownershipRs = Nothing
  reviewSql = "INSERT INTO webwindows_review_decisions " & _
    "(review_decision_id,submission_id,publisher_id,app_id,app_version,package_sha256," & _
    "source_manifest_sha256,source_manifest_integrity_version,validation_record_id,validation_report_id,manifest_version,sdk_version," & _
    "requested_permissions_base64,approved_permissions_base64,denied_permissions_base64," & _
    "review_policy_version,decision,review_note,reviewer_type,reviewed_by,reviewer_identity,risk_summary_base64,supersedes_id) VALUES (" & _
    "CONCAT('rvd_',LOWER(REPLACE(UUID(),'-','')))," & submissionId & "," & CLng(currentRs("developer_id")) & _
    ",'" & appIdSql & "','" & versionSql & "','" & LCase(CStr(currentRs("package_sha256"))) & _
    "','" & reportManifestSha & "',1," & CLng(currentRs("active_validation_id")) & ",'" & Replace(reportId, "'", "''") & _
    "'," & CLng(manifestVersionText) & "," & SqlNullableText(sdkVersionText) & _
    ",'" & Base64EncodeUtf8(requestedJson) & "','" & Base64EncodeUtf8(approvedJson) & _
    "','" & Base64EncodeUtf8(deniedJson) & "',1,'" & decisionText & "','" & Replace(reviewNote, "'", "''") & _
    "','authorized-reviewer'," & CLng(Session("user_id")) & ",'" & Replace(reviewerIdentity, "'", "''") & _
    "','" & Base64EncodeUtf8(riskJson) & "'," & supersedesId & ")"
  On Error Resume Next
  reviewError = ""
  conn.BeginTrans
  If Err.Number <> 0 Then reviewError = Err.Description: Err.Clear
  If targetStatus = "approved" Then
    conn.Execute "INSERT IGNORE INTO webwindows_function_ownership(app_id,developer_id) VALUES ('" & _
      appIdSql & "'," & CLng(currentRs("developer_id")) & ")"
    If Err.Number <> 0 Then reviewError = Err.Description: Err.Clear
  End If
  If Len(reviewError) = 0 Then
    conn.Execute reviewSql
    If Err.Number <> 0 Then reviewError = Err.Description: Err.Clear
  End If
  If Len(reviewError) = 0 Then
    conn.Execute "UPDATE webwindows_function_submissions SET status='" & targetStatus & _
      "',review_note='" & Replace(reviewNote, "'", "''") & "',reviewed_by=" & CLng(Session("user_id")) & _
      ",reviewed_at=NOW() WHERE id=" & submissionId
    If Err.Number <> 0 Then reviewError = Err.Description: Err.Clear
  End If
  If Len(reviewError) > 0 Then
    conn.RollbackTrans
    On Error GoTo 0
    currentRs.Close
    Fail 500, "REVIEW_DECISION_CREATE_FAILED", reviewError
  End If
  conn.CommitTrans
  On Error GoTo 0
  currentRs.Close
  Set currentRs = Nothing
  Set newDecisionRs = conn.Execute("SELECT review_decision_id FROM webwindows_review_decisions WHERE submission_id=" & _
    submissionId & " ORDER BY id DESC LIMIT 1")
  Response.Write "{""ok"":true,""status"":""" & JsonText(targetStatus) & _
    """,""reviewDecisionId"":""" & JsonText(newDecisionRs("review_decision_id")) & """}"
  newDecisionRs.Close
  Set newDecisionRs = Nothing

ElseIf action = "publish-release" And method = "POST" Then
  Dim publishSubmissionId, catalogText, catalogVersionText, catalogNote, encodedCatalog
  Dim publishRs, duplicateRs, publishSql, releaseSql, publishError, publishedReleaseRs
  Dim releaseIdentityRs, releaseIdentity, approvedPermissionsJson, packageDownloadUrl
  Dim releaseInternalId, newCatalogRevisionId, previousCatalogRevisionId, identityRs, bindingSql
  publishSubmissionId = FormPositiveLong("submissionId")
  catalogText = CStr(Request.Form("catalogJson"))
  catalogVersionText = Left(Trim(CStr(Request.Form("version"))), 40)
  catalogNote = Left(Trim(CStr(Request.Form("note"))), 255)
  If publishSubmissionId <= 0 Then Fail 400, "SUBMISSION_ID_INVALID", "提交 ID 无效。"
  If Len(catalogText) < 50 Or Len(catalogText) > 524288 Or _
     InStr(1, catalogText, """schemaVersion"":1", vbTextCompare) = 0 Or _
     InStr(1, catalogText, """apps""", vbTextCompare) = 0 Then
    Fail 400, "CATALOG_FORMAT_INVALID", "功能目录内容无效。"
  End If
  If catalogVersionText = "" Then Fail 400, "CATALOG_VERSION_REQUIRED", "目录版本不能为空。"
  Set publishRs = conn.Execute("SELECT s.status,s.developer_id,s.app_id,s.app_version,s.package_sha256," & _
    "s.active_validation_id,r.id AS review_internal_id,r.review_decision_id,r.package_sha256 AS review_package_sha256," & _
    "r.source_manifest_sha256,r.source_manifest_integrity_version,r.validation_record_id,r.validation_report_id,r.manifest_version,r.sdk_version," & _
    "r.approved_permissions_base64,r.review_policy_version,r.decision " & _
    "FROM webwindows_function_submissions s LEFT JOIN webwindows_review_decisions r " & _
    "ON r.id=(SELECT MAX(r2.id) FROM webwindows_review_decisions r2 WHERE r2.submission_id=s.id) " & _
    "WHERE s.id=" & publishSubmissionId)
  If publishRs.EOF Then
    publishRs.Close
    Fail 404, "SUBMISSION_NOT_FOUND", "没有找到功能提交。"
  End If
  If IsNull(publishRs("review_decision_id")) Then
    publishRs.Close
    Fail 409, "APPROVED_REVIEW_REQUIRED", "发布必须由当前包与当前验证绑定的批准 ReviewDecision 授权。"
  End If
  If LCase(CStr(publishRs("decision"))) <> "approved" Or _
     LCase(CStr(publishRs("package_sha256"))) <> LCase(CStr(publishRs("review_package_sha256"))) Or _
     CLng(publishRs("active_validation_id")) <> CLng(publishRs("validation_record_id")) Then
    publishRs.Close
    Fail 409, "APPROVED_REVIEW_REQUIRED", "发布必须由当前包与当前验证绑定的批准 ReviewDecision 授权。"
  End If
  Set duplicateRs = conn.Execute("SELECT package_sha256,published_release_id FROM webwindows_published_releases WHERE app_id='" & _
    Replace(CStr(publishRs("app_id")), "'", "''") & "' AND app_version='" & _
    Replace(CStr(publishRs("app_version")), "'", "''") & "' LIMIT 1")
  If Not duplicateRs.EOF Then
    If LCase(CStr(duplicateRs("package_sha256"))) <> LCase(CStr(publishRs("package_sha256"))) Then
      duplicateRs.Close
      publishRs.Close
      Fail 409, "RELEASE_PACKAGE_REPLACEMENT_FORBIDDEN", "同一 appId/version 已绑定不同功能包；必须创建新版本。"
    End If
    duplicateRs.Close
    publishRs.Close
    Fail 409, "RELEASE_ALREADY_EXISTS", "该功能版本已经具有不可变 PublishedRelease。"
  End If
  duplicateRs.Close
  Set duplicateRs = Nothing
  If InStr(1, catalogText, "__WEBWINDOWS_SERVER_RELEASE_ID__", vbBinaryCompare) = 0 Then
    publishRs.Close
    Fail 409, "CATALOG_RELEASE_PLACEHOLDER_REQUIRED", "Catalog 必须由发布服务绑定服务器生成的 Release ID。"
  End If
  Set releaseIdentityRs = conn.Execute("SELECT CONCAT('rel_',LOWER(REPLACE(UUID(),'-',''))) AS release_identity")
  releaseIdentity = CStr(releaseIdentityRs("release_identity"))
  releaseIdentityRs.Close
  Set releaseIdentityRs = Nothing
  catalogText = Replace(catalogText, "__WEBWINDOWS_SERVER_RELEASE_ID__", releaseIdentity, 1, -1, vbBinaryCompare)
  approvedPermissionsJson = Base64DecodeUtf8(CStr(publishRs("approved_permissions_base64")))
  packageDownloadUrl = "/api/function-package.asp?release=" & releaseIdentity
  If InStr(1, catalogText, """id"":""" & CStr(publishRs("app_id")) & """", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """version"":""" & CStr(publishRs("app_version")) & """", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """sourceType"":""developer-release""", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """releaseBinding"":""verified""", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """publishedReleaseId"":""" & releaseIdentity & """", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """publisherId"":""" & CStr(publishRs("developer_id")) & """", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """packageSha256"":""" & LCase(CStr(publishRs("package_sha256"))) & """", vbTextCompare) = 0 Or _
     InStr(1, catalogText, """sourceManifestSha256"":""" & LCase(CStr(publishRs("source_manifest_sha256"))) & """", vbTextCompare) = 0 Or _
     InStr(1, catalogText, """sourceManifestIntegrityVersion"":1", vbBinaryCompare) = 0 Or _
     CLng(publishRs("source_manifest_integrity_version")) <> 1 Or _
     InStr(1, catalogText, """manifestVersion"":" & CStr(CLng(publishRs("manifest_version"))), vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """reviewDecisionId"":""" & CStr(publishRs("review_decision_id")) & """", vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """approvedPermissions"":" & approvedPermissionsJson, vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """reviewPolicyVersion"":" & CStr(CLng(publishRs("review_policy_version"))), vbBinaryCompare) = 0 Or _
     InStr(1, catalogText, """sha256"":""" & LCase(CStr(publishRs("package_sha256"))) & """", vbTextCompare) = 0 Then
    publishRs.Close
    Fail 409, "CATALOG_RELEASE_MISMATCH", "兼容目录内容未包含当前 ReviewDecision 绑定的 app/version/package。"
  End If
  If IsNull(publishRs("sdk_version")) Then
    If InStr(1, catalogText, """sdkVersion"":null", vbBinaryCompare) = 0 Then
      publishRs.Close
      Fail 409, "CATALOG_RELEASE_MISMATCH", "Catalog SDK projection 与 PublishedRelease 不一致。"
    End If
  ElseIf InStr(1, catalogText, """sdkVersion"":""" & CStr(publishRs("sdk_version")) & """", vbBinaryCompare) = 0 Then
    publishRs.Close
    Fail 409, "CATALOG_RELEASE_MISMATCH", "Catalog SDK projection 与 PublishedRelease 不一致。"
  End If
  encodedCatalog = Base64EncodeUtf8(catalogText)
  releaseSql = "INSERT INTO webwindows_published_releases " & _
    "(published_release_id,submission_id,publisher_id,app_id,app_version,package_sha256,source_manifest_sha256,source_manifest_integrity_version," & _
    "manifest_version,sdk_version,validation_record_id,validation_report_id,review_decision_id," & _
    "approved_permissions_base64,review_policy_version,release_status,published_by) VALUES (" & _
    "'" & releaseIdentity & "'," & publishSubmissionId & "," & CLng(publishRs("developer_id")) & _
    ",'" & Replace(CStr(publishRs("app_id")), "'", "''") & "','" & Replace(CStr(publishRs("app_version")), "'", "''") & _
    "','" & LCase(CStr(publishRs("package_sha256"))) & "','" & LCase(CStr(publishRs("source_manifest_sha256"))) & _
    "',1," & CLng(publishRs("manifest_version")) & "," & SqlNullableText(publishRs("sdk_version")) & _
    "," & CLng(publishRs("validation_record_id")) & ",'" & Replace(CStr(publishRs("validation_report_id")), "'", "''") & _
    "'," & CLng(publishRs("review_internal_id")) & ",'" & CStr(publishRs("approved_permissions_base64")) & _
    "'," & CLng(publishRs("review_policy_version")) & ",'active'," & CLng(Session("user_id")) & ")"
  previousCatalogRevisionId = 0
  Set identityRs = conn.Execute("SELECT id FROM webwindows_function_catalog_versions WHERE is_active=1 ORDER BY id DESC LIMIT 1")
  If Not identityRs.EOF Then previousCatalogRevisionId = CLng(identityRs("id"))
  identityRs.Close
  Set identityRs = Nothing
  On Error Resume Next
  publishError = ""
  conn.BeginTrans
  If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  conn.Execute releaseSql
  If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  releaseInternalId = 0
  If Len(publishError) = 0 Then
    Set identityRs = conn.Execute("SELECT LAST_INSERT_ID() AS identity_id")
    If Err.Number <> 0 Then
      publishError = "无法取得 PublishedRelease identity。"
      Err.Clear
    ElseIf identityRs.EOF Then
      publishError = "无法取得 PublishedRelease identity。"
    Else
      releaseInternalId = CLng(identityRs("identity_id"))
    End If
    If IsObject(identityRs) Then identityRs.Close
    Set identityRs = Nothing
  End If
  If Len(publishError) = 0 Then
    conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1"
    If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  End If
  publishSql = "INSERT INTO webwindows_function_catalog_versions " & _
    "(catalog_version,catalog_json,storage_encoding,publish_note,published_by,is_active) VALUES ('" & _
    Replace(catalogVersionText, "'", "''") & "','" & encodedCatalog & "','base64','" & _
    Replace(catalogNote, "'", "''") & "'," & CLng(Session("user_id")) & ",1)"
  If Len(publishError) = 0 Then
    conn.Execute publishSql
    If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  End If
  newCatalogRevisionId = 0
  If Len(publishError) = 0 Then
    Set identityRs = conn.Execute("SELECT LAST_INSERT_ID() AS identity_id")
    If Err.Number <> 0 Then
      publishError = "无法取得 Catalog revision identity。"
      Err.Clear
    ElseIf identityRs.EOF Then
      publishError = "无法取得 Catalog revision identity。"
    Else
      newCatalogRevisionId = CLng(identityRs("identity_id"))
    End If
    If IsObject(identityRs) Then identityRs.Close
    Set identityRs = Nothing
  End If
  If Len(publishError) = 0 And previousCatalogRevisionId > 0 Then
    conn.Execute "INSERT INTO webwindows_catalog_release_bindings " & _
      "(catalog_revision_id,catalog_entry_id,source_type,release_binding_state,published_release_id," & _
      "published_release_identity,package_sha256,source_manifest_sha256,source_manifest_integrity_version,manifest_version,sdk_version," & _
      "review_decision_identity,approved_permissions_base64,review_policy_version,package_download_url,release_status) " & _
      "SELECT " & newCatalogRevisionId & ",catalog_entry_id,source_type,release_binding_state,published_release_id," & _
      "published_release_identity,package_sha256,source_manifest_sha256,source_manifest_integrity_version,manifest_version,sdk_version," & _
      "review_decision_identity,approved_permissions_base64,review_policy_version,package_download_url,release_status " & _
      "FROM webwindows_catalog_release_bindings WHERE catalog_revision_id=" & previousCatalogRevisionId & _
      " AND catalog_entry_id<>'" & Replace(CStr(publishRs("app_id")), "'", "''") & "'"
    If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  End If
  If Len(publishError) = 0 Then
    bindingSql = "INSERT INTO webwindows_catalog_release_bindings " & _
      "(catalog_revision_id,catalog_entry_id,source_type,release_binding_state,published_release_id," & _
      "published_release_identity,package_sha256,source_manifest_sha256,source_manifest_integrity_version,manifest_version,sdk_version," & _
      "review_decision_identity,approved_permissions_base64,review_policy_version,package_download_url,release_status) VALUES (" & _
      newCatalogRevisionId & ",'" & Replace(CStr(publishRs("app_id")), "'", "''") & _
      "','developer-release','verified'," & releaseInternalId & ",'" & releaseIdentity & _
      "','" & LCase(CStr(publishRs("package_sha256"))) & "','" & LCase(CStr(publishRs("source_manifest_sha256"))) & _
      "',1," & CLng(publishRs("manifest_version")) & "," & SqlNullableText(publishRs("sdk_version")) & _
      ",'" & Replace(CStr(publishRs("review_decision_id")), "'", "''") & "','" & _
      CStr(publishRs("approved_permissions_base64")) & "'," & CLng(publishRs("review_policy_version")) & _
      ",'" & Replace(packageDownloadUrl, "'", "''") & "','active')"
    conn.Execute bindingSql
    If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  End If
  If Len(publishError) = 0 Then
    conn.Execute "UPDATE webwindows_function_submissions SET status='published',review_note='" & _
      Replace(catalogNote, "'", "''") & "',reviewed_by=" & CLng(Session("user_id")) & _
      ",reviewed_at=NOW() WHERE id=" & publishSubmissionId
    If Err.Number <> 0 Then publishError = Err.Description: Err.Clear
  End If
  If Len(publishError) > 0 Then
    conn.RollbackTrans
    On Error GoTo 0
    Fail 500, "PUBLISHED_RELEASE_CREATE_FAILED", publishError
  End If
  conn.CommitTrans
  On Error GoTo 0
  publishRs.Close
  Set publishRs = Nothing
  Set publishedReleaseRs = conn.Execute("SELECT published_release_id FROM webwindows_published_releases WHERE submission_id=" & _
    publishSubmissionId & " ORDER BY id DESC LIMIT 1")
  Response.Write "{""ok"":true,""status"":""published"",""publishedReleaseId"":""" & _
    JsonText(publishedReleaseRs("published_release_id")) & """}"
  publishedReleaseRs.Close
  Set publishedReleaseRs = Nothing

ElseIf action = "release-status" And method = "POST" Then
  Dim releaseSubmissionId, releaseTargetStatus, releaseNote, releaseRs, releaseError
  Dim statusCatalogText, statusCatalogVersion, statusEncodedCatalog, statusOldRevisionId, statusNewRevisionId
  releaseSubmissionId = FormPositiveLong("submissionId")
  releaseTargetStatus = LCase(Trim(CStr(Request.Form("status"))))
  releaseNote = Left(Trim(CStr(Request.Form("note"))), 255)
  statusCatalogText = CStr(Request.Form("catalogJson"))
  statusCatalogVersion = Left(Trim(CStr(Request.Form("version"))), 40)
  If releaseSubmissionId <= 0 Then Fail 400, "SUBMISSION_ID_INVALID", "提交 ID 无效。"
  If releaseTargetStatus <> "delisted" And releaseTargetStatus <> "revoked" Then _
    Fail 400, "RELEASE_STATUS_INVALID", "Release 只允许下架或撤销。"
  If Len(statusCatalogText) < 50 Or Len(statusCatalogText) > 524288 Or statusCatalogVersion = "" Then _
    Fail 400, "CATALOG_PROJECTION_REQUIRED", "Release 状态变更必须携带新的 Catalog projection。"
  Set releaseRs = conn.Execute("SELECT pr.id,pr.published_release_id,pr.app_id,pr.release_status," & _
    "re.release_status AS latest_status FROM webwindows_published_releases pr " & _
    "JOIN webwindows_catalog_release_bindings b ON b.published_release_id=pr.id " & _
    "JOIN webwindows_function_catalog_versions cv ON cv.id=b.catalog_revision_id AND cv.is_active=1 " & _
    "LEFT JOIN webwindows_published_release_events re " & _
    "ON re.id=(SELECT MAX(re2.id) FROM webwindows_published_release_events re2 WHERE re2.published_release_id=pr.id) " & _
    "WHERE pr.submission_id=" & releaseSubmissionId & " ORDER BY pr.id DESC LIMIT 1")
  If releaseRs.EOF Then
    releaseRs.Close
    Fail 409, "PUBLISHED_RELEASE_REQUIRED", "没有可下架或撤销的 PublishedRelease。"
  End If
  effectiveReleaseStatus = CStr(releaseRs("release_status"))
  If Not IsNull(releaseRs("latest_status")) Then effectiveReleaseStatus = CStr(releaseRs("latest_status"))
  If effectiveReleaseStatus = "revoked" Then
    releaseRs.Close
    Fail 409, "REVOKED_RELEASE_IMMUTABLE", "已撤销 Release 不能重写或恢复。"
  End If
  If InStr(1, statusCatalogText, """id"":""" & CStr(releaseRs("published_release_id")) & """", vbBinaryCompare) = 0 Or _
     InStr(1, statusCatalogText, """status"":""" & releaseTargetStatus & """", vbBinaryCompare) = 0 Or _
     InStr(1, statusCatalogText, """status"":""disabled""", vbBinaryCompare) = 0 Then
    releaseRs.Close
    Fail 409, "CATALOG_RELEASE_STATUS_MISMATCH", "Catalog projection 未绑定并隐藏目标 PublishedRelease。"
  End If
  statusEncodedCatalog = Base64EncodeUtf8(statusCatalogText)
  statusOldRevisionId = 0
  Set identityRs = conn.Execute("SELECT id FROM webwindows_function_catalog_versions WHERE is_active=1 ORDER BY id DESC LIMIT 1")
  If Not identityRs.EOF Then statusOldRevisionId = CLng(identityRs("id"))
  identityRs.Close
  Set identityRs = Nothing
  If statusOldRevisionId <= 0 Then
    releaseRs.Close
    Fail 409, "CATALOG_REVISION_REQUIRED", "没有可投影 Release 状态的活动 Catalog revision。"
  End If
  On Error Resume Next
  releaseError = ""
  conn.BeginTrans
  If Err.Number <> 0 Then releaseError = Err.Description: Err.Clear
  conn.Execute "INSERT INTO webwindows_published_release_events " & _
    "(published_release_id,release_status,event_note,acted_by,actor_identity) VALUES (" & _
    CLng(releaseRs("id")) & ",'" & releaseTargetStatus & "','" & Replace(releaseNote, "'", "''") & _
    "'," & CLng(Session("user_id")) & ",'admin:" & Replace(CStr(Session("username")), "'", "''") & "')"
  If Err.Number <> 0 Then releaseError = Err.Description: Err.Clear
  If Len(releaseError) = 0 Then
    conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1"
    If Err.Number <> 0 Then releaseError = Err.Description: Err.Clear
  End If
  If Len(releaseError) = 0 Then
    conn.Execute "INSERT INTO webwindows_function_catalog_versions " & _
      "(catalog_version,catalog_json,storage_encoding,publish_note,published_by,is_active) VALUES ('" & _
      Replace(statusCatalogVersion, "'", "''") & "','" & statusEncodedCatalog & "','base64','" & _
      Replace(releaseNote, "'", "''") & "'," & CLng(Session("user_id")) & ",1)"
    If Err.Number <> 0 Then releaseError = Err.Description: Err.Clear
  End If
  statusNewRevisionId = 0
  If Len(releaseError) = 0 Then
    Set identityRs = conn.Execute("SELECT LAST_INSERT_ID() AS identity_id")
    If Err.Number <> 0 Then
      releaseError = Err.Description
      Err.Clear
    ElseIf identityRs.EOF Then
      releaseError = "无法取得 Catalog revision identity。"
    Else
      statusNewRevisionId = CLng(identityRs("identity_id"))
    End If
    If IsObject(identityRs) Then identityRs.Close
    Set identityRs = Nothing
  End If
  If Len(releaseError) = 0 Then
    conn.Execute "INSERT INTO webwindows_catalog_release_bindings " & _
      "(catalog_revision_id,catalog_entry_id,source_type,release_binding_state,published_release_id," & _
      "published_release_identity,package_sha256,source_manifest_sha256,source_manifest_integrity_version,manifest_version,sdk_version," & _
      "review_decision_identity,approved_permissions_base64,review_policy_version,package_download_url,release_status) " & _
      "SELECT " & statusNewRevisionId & ",catalog_entry_id,source_type,release_binding_state,published_release_id," & _
      "published_release_identity,package_sha256,source_manifest_sha256,source_manifest_integrity_version,manifest_version,sdk_version," & _
      "review_decision_identity,approved_permissions_base64,review_policy_version,package_download_url," & _
      "CASE WHEN published_release_id=" & CLng(releaseRs("id")) & " THEN '" & releaseTargetStatus & _
      "' ELSE release_status END FROM webwindows_catalog_release_bindings WHERE catalog_revision_id=" & statusOldRevisionId
    If Err.Number <> 0 Then releaseError = Err.Description: Err.Clear
  End If
  If releaseTargetStatus = "revoked" And Len(releaseError) = 0 Then
    conn.Execute "UPDATE webwindows_function_submissions SET status='revoked',review_note='" & _
      Replace(releaseNote, "'", "''") & "' WHERE id=" & releaseSubmissionId
    If Err.Number <> 0 Then releaseError = Err.Description: Err.Clear
  End If
  If Len(releaseError) > 0 Then
    conn.RollbackTrans
    On Error GoTo 0
    releaseRs.Close
    Fail 500, "RELEASE_EVENT_CREATE_FAILED", releaseError
  End If
  conn.CommitTrans
  On Error GoTo 0
  releaseRs.Close
  Set releaseRs = Nothing
  Response.Write "{""ok"":true,""releaseStatus"":""" & JsonText(releaseTargetStatus) & """}"

Else
  Fail 404, "ACTION_NOT_FOUND", "没有找到开发者平台管理操作。"
End If

If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
