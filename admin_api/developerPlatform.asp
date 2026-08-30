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
    "package_sha256 VARCHAR(64) NOT NULL,source_manifest_sha256 VARCHAR(64) NULL," & _
    "validator_version VARCHAR(20) NOT NULL,passed TINYINT(1) NOT NULL," & _
    "report_base64 LONGTEXT NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),KEY idx_submission_validation_submission(submission_id,id)," & _
    "KEY idx_submission_validation_package(package_sha256)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
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
  Set submissionRs = conn.Execute("SELECT s.id,s.developer_id,s.app_id,s.app_version,s.manifest_base64," & _
    "s.integrity_sha256,s.package_size,s.package_sha256,s.package_uploaded_at," & _
    "s.validation_status,s.status,s.review_note,s.created_at,s.updated_at,d.display_name,u.username," & _
    "v.report_base64,v.passed AS validation_passed " & _
    "FROM webwindows_function_submissions s " & _
    "LEFT JOIN webwindows_submission_validations v ON v.id=s.active_validation_id " & _
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
  Dim submissionId, targetStatus, reviewNote, currentRs, currentStatus, allowed
  submissionId = FormPositiveLong("submissionId")
  targetStatus = LCase(Trim(CStr(Request.Form("status"))))
  reviewNote = Left(Trim(CStr(Request.Form("note"))), 255)
  If submissionId <= 0 Then Fail 400, "SUBMISSION_ID_INVALID", "提交 ID 无效。"
  If targetStatus <> "approved" And targetStatus <> "rejected" And _
     targetStatus <> "published" And targetStatus <> "revoked" Then
    Fail 400, "SUBMISSION_STATUS_INVALID", "审核状态无效。"
  End If
  Set currentRs = conn.Execute("SELECT s.status,s.package_size,s.package_sha256,s.integrity_sha256," & _
    "s.app_id,s.developer_id,s.validation_status,v.passed AS validation_passed," & _
    "v.package_sha256 AS validated_package_sha256 FROM webwindows_function_submissions s " & _
    "LEFT JOIN webwindows_submission_validations v ON v.id=s.active_validation_id WHERE s.id=" & submissionId)
  If currentRs.EOF Then
    currentRs.Close
    Fail 404, "SUBMISSION_NOT_FOUND", "没有找到功能提交。"
  End If
  currentStatus = LCase(CStr(currentRs("status")))
  If targetStatus = "approved" Then
    If CLng(currentRs("package_size")) <= 0 Or _
       LCase(CStr(currentRs("package_sha256"))) <> LCase(CStr(currentRs("integrity_sha256"))) Then
      currentRs.Close
      Fail 409, "PACKAGE_REQUIRED", "必须先上传并通过 SHA-256 校验的 ZIP 功能包。"
    End If
    If LCase(CStr(currentRs("validation_status"))) <> "validated" Or _
       IsNull(currentRs("validation_passed")) Or IsNull(currentRs("validated_package_sha256")) Then
      currentRs.Close
      Fail 409, "SERVER_VALIDATION_REQUIRED", "功能包必须先通过与当前 SHA-256 绑定的服务器验证。"
    End If
    If Not CBool(currentRs("validation_passed")) Or _
       LCase(CStr(currentRs("package_sha256"))) <> LCase(CStr(currentRs("validated_package_sha256"))) Then
      currentRs.Close
      Fail 409, "SERVER_VALIDATION_REQUIRED", "服务器验证报告未通过或与当前功能包不匹配。"
    End If
    Dim ownershipRs
    Set ownershipRs = conn.Execute("SELECT developer_id FROM webwindows_function_ownership " & _
      "WHERE app_id='" & Replace(CStr(currentRs("app_id")), "'", "''") & "' LIMIT 1")
    If Not ownershipRs.EOF Then
      If CLng(ownershipRs("developer_id")) <> CLng(currentRs("developer_id")) Then
        ownershipRs.Close
        currentRs.Close
        Fail 409, "APP_ID_OWNED", "该功能 ID 已属于其他开发者。"
      End If
    Else
      conn.Execute "INSERT INTO webwindows_function_ownership(app_id,developer_id) VALUES ('" & _
        Replace(CStr(currentRs("app_id")), "'", "''") & "'," & CLng(currentRs("developer_id")) & ")"
    End If
    ownershipRs.Close
    Set ownershipRs = Nothing
  End If
  If targetStatus = "published" Then
    If LCase(CStr(currentRs("validation_status"))) <> "validated" Or _
       IsNull(currentRs("validation_passed")) Or IsNull(currentRs("validated_package_sha256")) Then
      currentRs.Close
      Fail 409, "SERVER_VALIDATION_REQUIRED", "未通过服务器验证的功能包不能发布。"
    End If
    If Not CBool(currentRs("validation_passed")) Or _
       LCase(CStr(currentRs("package_sha256"))) <> LCase(CStr(currentRs("validated_package_sha256"))) Then
      currentRs.Close
      Fail 409, "SERVER_VALIDATION_REQUIRED", "服务器验证报告未通过或与当前功能包不匹配。"
    End If
  End If
  currentRs.Close
  Set currentRs = Nothing
  allowed = False
  If targetStatus = "approved" And (currentStatus = "submitted" Or currentStatus = "rejected") Then allowed = True
  If targetStatus = "rejected" And (currentStatus = "submitted" Or currentStatus = "approved") Then allowed = True
  If targetStatus = "published" And currentStatus = "approved" Then allowed = True
  If targetStatus = "revoked" And currentStatus = "published" Then allowed = True
  If Not allowed Then
    Fail 409, "SUBMISSION_TRANSITION_INVALID", "当前审核状态不允许执行此操作。"
  End If
  Dim statusCmd
  Set statusCmd = Server.CreateObject("ADODB.Command")
  With statusCmd
    .ActiveConnection = conn
    .CommandText = "UPDATE webwindows_function_submissions SET status=?,review_note=?," & _
      "reviewed_by=?,reviewed_at=NOW() WHERE id=?"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 20, targetStatus)
    .Parameters.Append .CreateParameter(, 200, 1, 255, reviewNote)
    .Parameters.Append .CreateParameter(, 3, 1, , CLng(Session("user_id")))
    .Parameters.Append .CreateParameter(, 3, 1, , submissionId)
    .Execute
  End With
  Set statusCmd = Nothing
  Response.Write "{""ok"":true,""status"":""" & JsonText(targetStatus) & """}"

Else
  Fail 404, "ACTION_NOT_FOUND", "没有找到开发者平台管理操作。"
End If

If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
