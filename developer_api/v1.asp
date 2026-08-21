<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "X-WebWindows-Developer-API", "v1"

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
    Case 429: Response.Status = "429 Too Many Requests"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  If IsObject(conn) Then
    If conn.State <> 0 Then conn.Close
  End If
  Response.End
End Sub

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

Sub EnsureDeveloperTables()
  Dim developerSql, submissionSql, packageSql, ownershipSql
  developerSql = "CREATE TABLE IF NOT EXISTS webwindows_developers (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,user_id BIGINT NOT NULL," & _
    "display_name VARCHAR(120) NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'pending'," & _
    "api_key_hash VARCHAR(64) NULL,api_key_prefix VARCHAR(20) NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),UNIQUE KEY uk_webwindows_developer_user(user_id)," & _
    "KEY idx_webwindows_developer_status(status)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  submissionSql = "CREATE TABLE IF NOT EXISTS webwindows_function_submissions (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,developer_id BIGINT NOT NULL," & _
    "app_id VARCHAR(160) NOT NULL,app_version VARCHAR(40) NOT NULL," & _
    "manifest_base64 LONGTEXT NOT NULL,integrity_sha256 VARCHAR(64) NOT NULL," & _
    "status VARCHAR(20) NOT NULL DEFAULT 'submitted',review_note VARCHAR(255) NOT NULL DEFAULT ''," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
    "reviewed_by BIGINT NULL,reviewed_at DATETIME NULL," & _
    "PRIMARY KEY(id),KEY idx_function_submission_developer(developer_id,id)," & _
    "KEY idx_function_submission_status(status,id)," & _
    "KEY idx_function_submission_app(app_id,app_version)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  packageSql = "CREATE TABLE IF NOT EXISTS webwindows_function_packages (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT,submission_id BIGINT NOT NULL,developer_id BIGINT NOT NULL," & _
    "original_filename VARCHAR(180) NOT NULL,package_blob LONGBLOB NOT NULL," & _
    "package_size BIGINT NOT NULL,package_sha256 VARCHAR(64) NOT NULL DEFAULT ''," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(id),UNIQUE KEY uk_function_package_submission(submission_id)," & _
    "KEY idx_function_package_developer(developer_id,id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  ownershipSql = "CREATE TABLE IF NOT EXISTS webwindows_function_ownership (" & _
    "app_id VARCHAR(160) NOT NULL,developer_id BIGINT NOT NULL," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "PRIMARY KEY(app_id),KEY idx_function_ownership_developer(developer_id)) " & _
    "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  On Error Resume Next
  conn.Execute developerSql
  If Err.Number <> 0 Then
    Dim tableError
    tableError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "DEVELOPER_SCHEMA_FAILED", "开发者数据表初始化失败：" & tableError
  End If
  conn.Execute submissionSql
  If Err.Number <> 0 Then
    tableError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "SUBMISSION_SCHEMA_FAILED", "功能提交数据表初始化失败：" & tableError
  End If
  conn.Execute packageSql
  If Err.Number <> 0 Then
    tableError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "PACKAGE_SCHEMA_FAILED", "功能包数据表初始化失败：" & tableError
  End If
  conn.Execute ownershipSql
  If Err.Number <> 0 Then
    tableError = Err.Description
    Err.Clear
    On Error GoTo 0
    Fail 500, "OWNERSHIP_SCHEMA_FAILED", "功能 ID 所有权表初始化失败：" & tableError
  End If
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN package_size BIGINT NOT NULL DEFAULT 0"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN package_sha256 VARCHAR(64) NOT NULL DEFAULT ''"
  Err.Clear
  conn.Execute "ALTER TABLE webwindows_function_submissions ADD COLUMN package_uploaded_at DATETIME NULL"
  Err.Clear
  On Error GoTo 0
End Sub

Function SessionUserId()
  If Len(CStr(Session("user_id"))) = 0 Then
    SessionUserId = 0
  Else
    SessionUserId = CLng(Session("user_id"))
  End If
End Function

Function DeveloperBySession()
  Dim cmd, rs
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "SELECT id,user_id,display_name,status,api_key_prefix,created_at " & _
      "FROM webwindows_developers WHERE user_id=? LIMIT 1"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , SessionUserId())
    Set rs = .Execute
  End With
  Set DeveloperBySession = rs
  Set cmd = Nothing
End Function

Function DeveloperByKey(ByVal rawKey)
  Dim cmd, rs
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "SELECT id,user_id,display_name,status,api_key_prefix FROM webwindows_developers " & _
      "WHERE api_key_hash=SHA2(?,256) AND status='approved' LIMIT 1"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 100, rawKey)
    Set rs = .Execute
  End With
  Set DeveloperByKey = rs
  Set cmd = Nothing
End Function

If Request.ServerVariables("HTTP_X_WEBWINDOWS_DEVELOPER_REQUEST") <> "v1" Then
  Fail 403, "DEVELOPER_REQUEST_REQUIRED", "缺少开发者 API 请求标识。"
End If

EnsureDeveloperTables

Dim action, method
action = LCase(Trim(CStr(Request.QueryString("action"))))
method = UCase(Request.ServerVariables("REQUEST_METHOD"))

If action = "spec" And method = "GET" Then
  Response.Write "{""ok"":true,""apiVersion"":""v1""," & _
    """manifestSchemaVersion"":1,""authentication"":[""session"",""api-key""]," & _
    """packageUpload"":{""contentType"":""application/zip"",""maxBytes"":10485760," & _
    """transport"":""raw-request-body"",""quarantine"":true}," & _
    """submissionStates"":[""submitted"",""approved"",""rejected"",""published"",""revoked""]}"

ElseIf action = "profile" And method = "GET" Then
  If SessionUserId() = 0 Then Fail 401, "LOGIN_REQUIRED", "请先登录 WebWindows。"
  Dim profileRs
  Set profileRs = DeveloperBySession()
  If profileRs.EOF Then
    Response.Write "{""ok"":true,""developer"":null}"
  Else
    Response.Write "{""ok"":true,""developer"":{""id"":" & CLng(profileRs("id")) & _
      ",""displayName"":""" & JsonText(profileRs("display_name")) & _
      """,""status"":""" & JsonText(profileRs("status")) & _
      """,""keyPrefix"":""" & JsonText(profileRs("api_key_prefix")) & _
      """,""createdAt"":""" & JsonText(profileRs("created_at")) & """}}"
  End If
  profileRs.Close
  Set profileRs = Nothing

ElseIf action = "enroll" And method = "POST" Then
  If SessionUserId() = 0 Then Fail 401, "LOGIN_REQUIRED", "请先登录 WebWindows。"
  Dim displayName, enrollCmd
  displayName = Left(Trim(CStr(Request.Form("displayName"))), 120)
  If displayName = "" Then displayName = Trim(CStr(Session("nickname")))
  If displayName = "" Then displayName = Trim(CStr(Session("username")))
  Set enrollCmd = Server.CreateObject("ADODB.Command")
  With enrollCmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_developers(user_id,display_name,status) VALUES (?,?,'pending') " & _
      "ON DUPLICATE KEY UPDATE display_name=VALUES(display_name)"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , SessionUserId())
    .Parameters.Append .CreateParameter(, 200, 1, 120, displayName)
    .Execute
  End With
  Set enrollCmd = Nothing
  Response.Write "{""ok"":true,""status"":""pending"",""message"":""开发者申请已提交。""}"

ElseIf action = "rotate-key" And method = "POST" Then
  If SessionUserId() = 0 Then Fail 401, "LOGIN_REQUIRED", "请先登录 WebWindows。"
  Dim rotateRs, rawKey, keyPrefix, rotateCmd
  Set profileRs = DeveloperBySession()
  If profileRs.EOF Then
    profileRs.Close
    Fail 404, "DEVELOPER_NOT_FOUND", "尚未申请开发者资格。"
  End If
  If LCase(CStr(profileRs("status"))) <> "approved" Then
    profileRs.Close
    Fail 403, "DEVELOPER_NOT_APPROVED", "开发者资格尚未通过审核。"
  End If
  profileRs.Close
  Set profileRs = Nothing
  Set rotateRs = conn.Execute("SELECT CONCAT(REPLACE(UUID(),'-',''),REPLACE(UUID(),'-','')) AS raw_key")
  rawKey = "wwdev_" & LCase(CStr(rotateRs("raw_key")))
  rotateRs.Close
  Set rotateRs = Nothing
  keyPrefix = Left(rawKey, 18)
  Set rotateCmd = Server.CreateObject("ADODB.Command")
  With rotateCmd
    .ActiveConnection = conn
    .CommandText = "UPDATE webwindows_developers SET api_key_hash=SHA2(?,256),api_key_prefix=? WHERE user_id=?"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 100, rawKey)
    .Parameters.Append .CreateParameter(, 200, 1, 20, keyPrefix)
    .Parameters.Append .CreateParameter(, 3, 1, , SessionUserId())
    .Execute
  End With
  Set rotateCmd = Nothing
  Response.Write "{""ok"":true,""apiKey"":""" & JsonText(rawKey) & _
    """,""keyPrefix"":""" & JsonText(keyPrefix) & _
    """,""message"":""API Key 只显示这一次，请立即安全保存。""}"

ElseIf action = "submit" And method = "POST" Then
  Dim apiKey, developerRs, developerId
  apiKey = Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_DEVELOPER_KEY")))
  If apiKey = "" Then Fail 401, "API_KEY_REQUIRED", "缺少开发者 API Key。"
  Set developerRs = DeveloperByKey(apiKey)
  If developerRs.EOF Then
    developerRs.Close
    Fail 401, "API_KEY_INVALID", "开发者 API Key 无效或已撤销。"
  End If
  developerId = CLng(developerRs("id"))
  developerRs.Close
  Set developerRs = Nothing

  Dim appId, appVersion, manifestJson, integrity, idRegex, versionRegex, hashRegex, compactManifest
  appId = LCase(Trim(CStr(Request.Form("appId"))))
  appVersion = Left(Trim(CStr(Request.Form("version"))), 40)
  manifestJson = CStr(Request.Form("manifestJson"))
  integrity = LCase(Trim(CStr(Request.Form("integritySha256"))))
  If integrity = "" Then integrity = String(64, "0")
  Set idRegex = New RegExp
  idRegex.Pattern = "^[a-z0-9]+([._-][a-z0-9]+)+$"
  Set versionRegex = New RegExp
  versionRegex.Pattern = "^[0-9]+(\.[0-9]+){1,3}([._-][a-z0-9]+)?$"
  Set hashRegex = New RegExp
  hashRegex.Pattern = "^[a-f0-9]{64}$"
  If Not idRegex.Test(appId) Then Fail 400, "APP_ID_INVALID", "功能 ID 格式无效。"
  If Not versionRegex.Test(appVersion) Then Fail 400, "VERSION_INVALID", "版本号格式无效。"
  If Not hashRegex.Test(integrity) Then Fail 400, "INTEGRITY_INVALID", "SHA-256 完整性值无效。"
  If Len(manifestJson) < 50 Or Len(manifestJson) > 262144 Then
    Fail 400, "MANIFEST_SIZE_INVALID", "Manifest 内容大小无效。"
  End If
  compactManifest = Replace(Replace(Replace(Replace(manifestJson, vbCr, ""), vbLf, ""), vbTab, ""), " ", "")
  If Left(Trim(compactManifest), 1) <> "{" Or Right(Trim(compactManifest), 1) <> "}" Or _
     InStr(1, compactManifest, """id"":""" & appId & """", vbTextCompare) = 0 Then
    Fail 400, "MANIFEST_INVALID", "Manifest 格式或功能 ID 不一致。"
  End If

  Dim ownerCmd, ownerRs
  Set ownerCmd = Server.CreateObject("ADODB.Command")
  With ownerCmd
    .ActiveConnection = conn
    .CommandText = "SELECT developer_id FROM webwindows_function_ownership WHERE app_id=? LIMIT 1"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 160, appId)
    Set ownerRs = .Execute
  End With
  If Not ownerRs.EOF Then
    If CLng(ownerRs("developer_id")) <> developerId Then
      ownerRs.Close
      Fail 409, "APP_ID_OWNED", "该功能 ID 已属于其他开发者。"
    End If
  End If
  ownerRs.Close
  Set ownerRs = Nothing
  Set ownerCmd = Nothing

  Dim rateCmd, rateRs
  Set rateCmd = Server.CreateObject("ADODB.Command")
  With rateCmd
    .ActiveConnection = conn
    .CommandText = "SELECT COUNT(*) AS total FROM webwindows_function_submissions " & _
      "WHERE developer_id=? AND created_at>=DATE_SUB(NOW(),INTERVAL 1 HOUR)"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , developerId)
    Set rateRs = .Execute
  End With
  If CLng(rateRs("total")) >= 30 Then
    rateRs.Close
    Set rateRs = Nothing
    Set rateCmd = Nothing
    Fail 429, "SUBMISSION_RATE_LIMIT", "每小时最多提交 30 个版本。"
  End If
  rateRs.Close
  Set rateRs = Nothing
  Set rateCmd = Nothing

  Dim encodedManifest, submitCmd, submitIdRs, newSubmissionId
  encodedManifest = Base64EncodeUtf8(manifestJson)
  Set submitCmd = Server.CreateObject("ADODB.Command")
  With submitCmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_function_submissions " & _
      "(developer_id,app_id,app_version,manifest_base64,integrity_sha256,status) " & _
      "VALUES (?,?,?,?,?,'submitted')"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , developerId)
    .Parameters.Append .CreateParameter(, 200, 1, 160, appId)
    .Parameters.Append .CreateParameter(, 200, 1, 40, appVersion)
    .Parameters.Append .CreateParameter(, 201, 1, Len(encodedManifest), encodedManifest)
    .Parameters.Append .CreateParameter(, 200, 1, 64, integrity)
    .Execute
  End With
  Set submitCmd = Nothing
  Set submitIdRs = conn.Execute("SELECT LAST_INSERT_ID() AS submission_id")
  newSubmissionId = CLng(submitIdRs("submission_id"))
  submitIdRs.Close
  Set submitIdRs = Nothing
  Response.Write "{""ok"":true,""submissionId"":" & newSubmissionId & _
    ",""status"":""submitted"",""message"":""Manifest 已提交，请继续上传 ZIP 功能包。""}"

ElseIf action = "upload-package" And method = "POST" Then
  Dim uploadApiKey, uploadDeveloperRs, uploadDeveloperId, submissionIdText
  Dim submissionId, uploadSubmissionCmd, uploadSubmissionRs, uploadStatus
  Dim expectedIntegrity, totalBytes, packageBytes, byte1, byte2, byte3, byte4
  Dim contentType, originalFilename, packageCmd, packageHashRs, actualIntegrity
  uploadApiKey = Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_DEVELOPER_KEY")))
  If uploadApiKey = "" Then Fail 401, "API_KEY_REQUIRED", "缺少开发者 API Key。"
  Set uploadDeveloperRs = DeveloperByKey(uploadApiKey)
  If uploadDeveloperRs.EOF Then
    uploadDeveloperRs.Close
    Fail 401, "API_KEY_INVALID", "开发者 API Key 无效或已撤销。"
  End If
  uploadDeveloperId = CLng(uploadDeveloperRs("id"))
  uploadDeveloperRs.Close
  Set uploadDeveloperRs = Nothing

  submissionIdText = Trim(CStr(Request.QueryString("submissionId")))
  Set idRegex = New RegExp
  idRegex.Pattern = "^[0-9]+$"
  If Not idRegex.Test(submissionIdText) Then
    Fail 400, "SUBMISSION_ID_INVALID", "提交 ID 无效。"
  End If
  submissionId = CLng(submissionIdText)
  Set uploadSubmissionCmd = Server.CreateObject("ADODB.Command")
  With uploadSubmissionCmd
    .ActiveConnection = conn
    .CommandText = "SELECT status,integrity_sha256 FROM webwindows_function_submissions " & _
      "WHERE id=? AND developer_id=? LIMIT 1"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , submissionId)
    .Parameters.Append .CreateParameter(, 3, 1, , uploadDeveloperId)
    Set uploadSubmissionRs = .Execute
  End With
  If uploadSubmissionRs.EOF Then
    uploadSubmissionRs.Close
    Fail 404, "SUBMISSION_NOT_FOUND", "没有找到属于当前开发者的功能提交。"
  End If
  uploadStatus = LCase(CStr(uploadSubmissionRs("status")))
  expectedIntegrity = LCase(CStr(uploadSubmissionRs("integrity_sha256")))
  uploadSubmissionRs.Close
  Set uploadSubmissionRs = Nothing
  Set uploadSubmissionCmd = Nothing
  If uploadStatus <> "submitted" And uploadStatus <> "rejected" Then
    Fail 409, "PACKAGE_UPLOAD_LOCKED", "当前审核状态不允许更换功能包。"
  End If

  contentType = LCase(Trim(CStr(Request.ServerVariables("CONTENT_TYPE"))))
  If InStr(1, contentType, "application/zip", vbTextCompare) <> 1 And _
     InStr(1, contentType, "application/octet-stream", vbTextCompare) <> 1 Then
    Fail 400, "PACKAGE_CONTENT_TYPE_INVALID", "功能包必须是 ZIP 文件。"
  End If
  totalBytes = CLng(Request.TotalBytes)
  If totalBytes < 22 Or totalBytes > 10485760 Then
    Fail 400, "PACKAGE_SIZE_INVALID", "ZIP 功能包必须在 22 字节到 10 MB 之间。"
  End If
  packageBytes = Request.BinaryRead(totalBytes)
  byte1 = AscB(MidB(packageBytes, 1, 1))
  byte2 = AscB(MidB(packageBytes, 2, 1))
  byte3 = AscB(MidB(packageBytes, 3, 1))
  byte4 = AscB(MidB(packageBytes, 4, 1))
  If byte1 <> 80 Or byte2 <> 75 Or _
     Not ((byte3 = 3 And byte4 = 4) Or (byte3 = 5 And byte4 = 6) Or (byte3 = 7 And byte4 = 8)) Then
    Fail 400, "PACKAGE_SIGNATURE_INVALID", "文件不是有效的 ZIP 数据。"
  End If

  originalFilename = Left(Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_PACKAGE_NAME"))), 180)
  originalFilename = Replace(Replace(originalFilename, "\", "_"), "/", "_")
  If originalFilename = "" Then originalFilename = "package.zip"
  If LCase(Right(originalFilename, 4)) <> ".zip" Then originalFilename = originalFilename & ".zip"

  Set packageCmd = Server.CreateObject("ADODB.Command")
  With packageCmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_function_packages " & _
      "(submission_id,developer_id,original_filename,package_blob,package_size,package_sha256) " & _
      "VALUES (?,?,?,?,?,'') ON DUPLICATE KEY UPDATE original_filename=VALUES(original_filename)," & _
      "package_blob=VALUES(package_blob),package_size=VALUES(package_size),package_sha256=''"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , submissionId)
    .Parameters.Append .CreateParameter(, 3, 1, , uploadDeveloperId)
    .Parameters.Append .CreateParameter(, 200, 1, 180, originalFilename)
    .Parameters.Append .CreateParameter(, 205, 1, totalBytes, packageBytes)
    .Parameters.Append .CreateParameter(, 20, 1, , totalBytes)
    .Execute
  End With
  Set packageCmd = Nothing
  Set packageHashRs = conn.Execute("SELECT LOWER(SHA2(package_blob,256)) AS package_hash " & _
    "FROM webwindows_function_packages WHERE submission_id=" & submissionId)
  actualIntegrity = LCase(CStr(packageHashRs("package_hash")))
  packageHashRs.Close
  Set packageHashRs = Nothing
  If expectedIntegrity <> String(64, "0") And actualIntegrity <> expectedIntegrity Then
    conn.Execute "DELETE FROM webwindows_function_packages WHERE submission_id=" & submissionId
    Fail 400, "PACKAGE_INTEGRITY_MISMATCH", "上传文件的 SHA-256 与 Manifest 提交值不一致。"
  End If
  conn.Execute "UPDATE webwindows_function_packages SET package_sha256='" & actualIntegrity & _
    "' WHERE submission_id=" & submissionId
  conn.Execute "UPDATE webwindows_function_submissions SET package_size=" & totalBytes & _
    ",package_sha256='" & actualIntegrity & "',integrity_sha256='" & actualIntegrity & _
    "',package_uploaded_at=NOW(),status='submitted'," & _
    "review_note='' WHERE id=" & submissionId
  Response.Write "{""ok"":true,""submissionId"":" & submissionId & _
    ",""packageSize"":" & totalBytes & ",""packageSha256"":""" & actualIntegrity & _
    """,""quarantine"":true,""message"":""功能包已校验并进入隔离审核区。""}"

ElseIf action = "submissions" And method = "GET" Then
  apiKey = Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_DEVELOPER_KEY")))
  If apiKey = "" Then Fail 401, "API_KEY_REQUIRED", "缺少开发者 API Key。"
  Set developerRs = DeveloperByKey(apiKey)
  If developerRs.EOF Then
    developerRs.Close
    Fail 401, "API_KEY_INVALID", "开发者 API Key 无效或已撤销。"
  End If
  developerId = CLng(developerRs("id"))
  developerRs.Close
  Set developerRs = Nothing
  Dim listCmd, listRs, listJson, firstItem
  Set listCmd = Server.CreateObject("ADODB.Command")
  With listCmd
    .ActiveConnection = conn
    .CommandText = "SELECT id,app_id,app_version,integrity_sha256,package_size,package_sha256," & _
      "package_uploaded_at,status,review_note,created_at,updated_at " & _
      "FROM webwindows_function_submissions WHERE developer_id=? ORDER BY id DESC LIMIT 100"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , developerId)
    Set listRs = .Execute
  End With
  listJson = "{""ok"":true,""submissions"":["
  firstItem = True
  Do Until listRs.EOF
    If Not firstItem Then listJson = listJson & ","
    firstItem = False
    listJson = listJson & "{""id"":" & CLng(listRs("id")) & _
      ",""appId"":""" & JsonText(listRs("app_id")) & _
      """,""version"":""" & JsonText(listRs("app_version")) & _
      """,""integritySha256"":""" & JsonText(listRs("integrity_sha256")) & _
      """,""packageSize"":" & CLng(listRs("package_size")) & _
      ",""packageSha256"":""" & JsonText(listRs("package_sha256")) & _
      """,""packageUploadedAt"":""" & JsonText(listRs("package_uploaded_at")) & _
      """,""status"":""" & JsonText(listRs("status")) & _
      """,""reviewNote"":""" & JsonText(listRs("review_note")) & _
      """,""createdAt"":""" & JsonText(listRs("created_at")) & _
      """,""updatedAt"":""" & JsonText(listRs("updated_at")) & """}"
    listRs.MoveNext
  Loop
  listJson = listJson & "]}"
  listRs.Close
  Set listRs = Nothing
  Set listCmd = Nothing
  Response.Write listJson

Else
  Fail 404, "ACTION_NOT_FOUND", "未找到开发者 API 操作。"
End If

If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
