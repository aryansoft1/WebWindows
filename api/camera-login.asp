<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-store"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "Referrer-Policy", "same-origin"

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

Sub CloseConnection()
  If IsObject(conn) Then If conn.State <> 0 Then conn.Close
End Sub

Sub Fail(ByVal statusCode, ByVal code, ByVal message)
  Select Case CLng(statusCode)
    Case 400: Response.Status = "400 Bad Request"
    Case 401: Response.Status = "401 Unauthorized"
    Case 403: Response.Status = "403 Forbidden"
    Case 404: Response.Status = "404 Not Found"
    Case 409: Response.Status = "409 Conflict"
    Case 410: Response.Status = "410 Gone"
    Case 429: Response.Status = "429 Too Many Requests"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & """,""message"":""" & JsonText(message) & """}"
  CloseConnection
  Response.End
End Sub

Function TokenShape(ByVal value, ByVal length)
  Dim regex
  Set regex = New RegExp
  regex.Pattern = "^[a-f0-9]{" & CStr(length) & "}$"
  regex.IgnoreCase = False
  TokenShape = regex.Test(LCase(Trim(CStr(value))))
  Set regex = Nothing
End Function

Function RandomHex(ByVal byteCount)
  Dim rs, value
  value = ""
  On Error Resume Next
  Set rs = conn.Execute("SELECT LOWER(HEX(RANDOM_BYTES(" & CStr(byteCount) & "))) AS token_value")
  If Err.Number = 0 Then If Not rs.EOF Then value = CStr(rs("token_value"))
  Err.Clear
  If IsObject(rs) Then rs.Close
  Set rs = Nothing
  On Error GoTo 0
  RandomHex = LCase(value)
End Function

Function BindingSecret()
  Dim value
  value = LCase(Trim(CStr(Session("camera_login_binding"))))
  If Not TokenShape(value, 64) Then
    value = RandomHex(32)
    If Not TokenShape(value, 64) Then Fail 500, "RANDOM_UNAVAILABLE", "无法安全创建登录挑战。"
    Session("camera_login_binding") = value
  End If
  BindingSecret = value
End Function

Sub Audit(ByVal challenge, ByVal actionName, ByVal resultName, ByVal actorUserId)
  Dim cmd
  On Error Resume Next
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_camera_login_audit " & _
      "(challenge_prefix,action_name,result_name,actor_user_id) VALUES (?,?,?,?)"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 12, Left(CStr(challenge), 12))
    .Parameters.Append .CreateParameter(, 200, 1, 20, Left(CStr(actionName), 20))
    .Parameters.Append .CreateParameter(, 200, 1, 24, Left(CStr(resultName), 24))
    If IsNull(actorUserId) Then .Parameters.Append .CreateParameter(, 3, 1, , Null) Else .Parameters.Append .CreateParameter(, 3, 1, , CLng(actorUserId))
    .Execute
  End With
  Err.Clear
  Set cmd = Nothing
  On Error GoTo 0
End Sub

If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "POST" Then Fail 400, "POST_REQUIRED", "仅接受 POST 请求。"
If CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_REQUEST")) <> "camera-login-v1" Then Fail 403, "REQUEST_PROOF_REQUIRED", "缺少同源登录请求标识。"

Dim action, challenge, binding, device, cmd, rs, affected, userId, nickname, username, exchangeToken
action = LCase(Trim(CStr(Request.QueryString("action"))))
challenge = LCase(Trim(CStr(Request.Form("challenge"))))

If action = "create" Then
  If IsDate(Session("camera_login_last_create")) Then
    If DateDiff("s", CDate(Session("camera_login_last_create")), Now()) < 3 Then Fail 429, "CREATE_RATE_LIMIT", "请稍候再创建新的登录二维码。"
  End If
  Session("camera_login_last_create") = Now()
  binding = BindingSecret()
  challenge = RandomHex(24)
  If Not TokenShape(challenge, 48) Then Fail 500, "RANDOM_UNAVAILABLE", "无法安全创建登录挑战。"
  device = Trim(CStr(Request.Form("device")))
  device = Replace(Replace(Replace(device, vbCr, " "), vbLf, " "), Chr(0), "")
  If device = "" Then device = "Web 浏览器"
  device = Left(device, 160)
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_camera_login_challenges " & _
      "(challenge,initiator_binding_hash,initiator_device,status,expires_at) " & _
      "VALUES (?,LOWER(SHA2(?,256)),?,'pending',DATE_ADD(NOW(),INTERVAL 2 MINUTE))"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    .Parameters.Append .CreateParameter(, 200, 1, 64, binding)
    .Parameters.Append .CreateParameter(, 200, 1, 160, device)
    .Execute
  End With
  Set cmd = Nothing
  On Error Resume Next
  conn.Execute "DELETE FROM webwindows_camera_login_challenges WHERE expires_at<DATE_SUB(NOW(),INTERVAL 1 DAY) LIMIT 100"
  Err.Clear
  On Error GoTo 0
  Audit challenge, "create", "pending", Null
  Response.Write "{""ok"":true,""challenge"":""" & challenge & """,""expiresInSeconds"":120}"

ElseIf action = "inspect" Then
  If Len(CStr(Session("webwindows_user_id"))) = 0 Then Fail 401, "LOGIN_REQUIRED", "请先在确认设备登录 WebWindows。"
  If Not TokenShape(challenge, 48) Then Fail 400, "CHALLENGE_INVALID", "挑战码格式无效。"
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "SELECT initiator_device,created_at FROM webwindows_camera_login_challenges " & _
      "WHERE challenge=? AND status='pending' AND expires_at>NOW()"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    Set rs = .Execute
  End With
  If rs.EOF Then rs.Close: Set rs = Nothing: Set cmd = Nothing: Fail 410, "CHALLENGE_UNAVAILABLE", "挑战不存在、已处理或已过期。"
  Response.Write "{""ok"":true,""device"":""" & JsonText(rs("initiator_device")) & """,""createdAt"":""" & JsonText(rs("created_at")) & """}"
  rs.Close: Set rs = Nothing: Set cmd = Nothing

ElseIf action = "approve" Then
  If Len(CStr(Session("webwindows_user_id"))) = 0 Then Fail 401, "LOGIN_REQUIRED", "请先在确认设备登录 WebWindows。"
  If CStr(Request.Form("confirm")) <> "1" Then Fail 400, "CONFIRM_REQUIRED", "需要明确确认发起设备。"
  If Not TokenShape(challenge, 48) Then Fail 400, "CHALLENGE_INVALID", "挑战码格式无效。"
  userId = CLng(Session("webwindows_user_id"))
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "UPDATE webwindows_camera_login_challenges SET status='approved',approved_user_id=?,approved_at=NOW() " & _
      "WHERE challenge=? AND status='pending' AND expires_at>NOW()"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , userId)
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    .Execute affected
  End With
  Set cmd = Nothing
  If CLng(affected) <> 1 Then Audit challenge, "approve", "rejected", userId: Fail 409, "CHALLENGE_STATE_CHANGED", "挑战已处理或已过期。"
  Audit challenge, "approve", "approved", userId
  Response.Write "{""ok"":true,""status"":""approved""}"

ElseIf action = "consume" Then
  If Not TokenShape(challenge, 48) Then Fail 400, "CHALLENGE_INVALID", "挑战码格式无效。"
  binding = BindingSecret()
  exchangeToken = RandomHex(32)
  If Not TokenShape(exchangeToken, 64) Then Fail 500, "RANDOM_UNAVAILABLE", "无法安全完成会话轮换。"
  conn.BeginTrans
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "SELECT approved_user_id FROM webwindows_camera_login_challenges " & _
      "WHERE challenge=? AND initiator_binding_hash=LOWER(SHA2(?,256)) AND status='approved' AND expires_at>NOW() FOR UPDATE"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    .Parameters.Append .CreateParameter(, 200, 1, 64, binding)
    Set rs = .Execute
  End With
  If rs.EOF Then rs.Close: Set rs = Nothing: Set cmd = Nothing: conn.RollbackTrans: Audit challenge, "consume", "unavailable", Null: Fail 409, "NOT_APPROVED", "仍在等待确认，或挑战已过期/消费。"
  userId = CLng(rs("approved_user_id"))
  rs.Close: Set rs = Nothing: Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "UPDATE webwindows_camera_login_challenges SET status='consumed',consumed_at=NOW()," & _
      "exchange_token_hash=LOWER(SHA2(?,256)),exchange_expires_at=DATE_ADD(NOW(),INTERVAL 30 SECOND) " & _
      "WHERE challenge=? AND status='approved'"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 64, exchangeToken)
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    .Execute affected
  End With
  If CLng(affected) <> 1 Then Set cmd = Nothing: conn.RollbackTrans: Fail 409, "REPLAY_REJECTED", "一次性挑战已被消费。"
  Set cmd = Nothing
  conn.CommitTrans
  Audit challenge, "consume", "consumed", userId
  Session.Abandon
  Response.AddHeader "Set-Cookie", "webwindows_login_exchange=" & exchangeToken & "; Path=/api/camera-login.asp; Max-Age=30; Secure; HttpOnly; SameSite=Strict"
  Response.Write "{""ok"":true,""finalizeRequired"":true}"

ElseIf action = "finalize" Then
  exchangeToken = LCase(Trim(CStr(Request.Cookies("webwindows_login_exchange"))))
  If Not TokenShape(exchangeToken, 64) Then Fail 401, "EXCHANGE_REQUIRED", "登录交换票据不存在或已失效。"
  conn.BeginTrans
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "SELECT challenge,approved_user_id FROM webwindows_camera_login_challenges " & _
      "WHERE exchange_token_hash=LOWER(SHA2(?,256)) AND status='consumed' AND finalized_at IS NULL " & _
      "AND exchange_expires_at>NOW() FOR UPDATE"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 64, exchangeToken)
    Set rs = .Execute
  End With
  If rs.EOF Then rs.Close: Set rs = Nothing: Set cmd = Nothing: conn.RollbackTrans: Fail 409, "EXCHANGE_REPLAY_REJECTED", "登录交换票据已使用或过期。"
  challenge = CStr(rs("challenge")): userId = CLng(rs("approved_user_id"))
  rs.Close: Set rs = Nothing: Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "UPDATE webwindows_camera_login_challenges SET finalized_at=NOW(),exchange_token_hash=NULL " & _
      "WHERE challenge=? AND finalized_at IS NULL"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    .Execute affected
  End With
  If CLng(affected) <> 1 Then Set cmd = Nothing: conn.RollbackTrans: Fail 409, "EXCHANGE_REPLAY_REJECTED", "登录交换票据已使用。"
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "SELECT username,nickname FROM webwindows_users WHERE id=?"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , userId)
    Set rs = .Execute
  End With
  If rs.EOF Then rs.Close: Set rs = Nothing: Set cmd = Nothing: conn.RollbackTrans: Fail 409, "USER_UNAVAILABLE", "确认账户已不可用。"
  username = CStr(rs("username")): nickname = CStr(rs("nickname"))
  If nickname = "" Then nickname = username
  rs.Close: Set rs = Nothing: Set cmd = Nothing
  conn.CommitTrans
  Session("user_id") = userId: Session("username") = username: Session("nickname") = nickname
  Session("webwindows_user_id") = userId: Session("webwindows_username") = username: Session("webwindows_nickname") = nickname
  Session.Timeout = 120
  Response.AddHeader "Set-Cookie", "webwindows_login_exchange=; Path=/api/camera-login.asp; Max-Age=0; Secure; HttpOnly; SameSite=Strict"
  Audit challenge, "finalize", "authenticated", userId
  Response.Write "{""ok"":true,""user"":{""id"":" & userId & ",""username"":""" & JsonText(username) & """,""nickname"":""" & JsonText(nickname) & """}}"

ElseIf action = "revoke" Then
  If Not TokenShape(challenge, 48) Then Fail 400, "CHALLENGE_INVALID", "挑战码格式无效。"
  binding = BindingSecret()
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandText = "UPDATE webwindows_camera_login_challenges SET status='revoked',revoked_at=NOW() " & _
      "WHERE challenge=? AND initiator_binding_hash=LOWER(SHA2(?,256)) AND status IN ('pending','approved')"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 48, challenge)
    .Parameters.Append .CreateParameter(, 200, 1, 64, binding)
    .Execute affected
  End With
  Set cmd = Nothing
  If CLng(affected) <> 1 Then Fail 409, "CHALLENGE_STATE_CHANGED", "挑战已过期、消费或撤销。"
  Audit challenge, "revoke", "revoked", Null
  Response.Write "{""ok"":true,""status"":""revoked""}"
Else
  Fail 400, "ACTION_INVALID", "不支持的登录操作。"
End If
CloseConnection
%>
