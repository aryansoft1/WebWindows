<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
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
    Case 405: Response.Status = "405 Method Not Allowed"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  If IsObject(conn) Then
    If conn.State <> 0 Then conn.Close
  End If
  Response.End
End Sub

If Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST") <> "admin-auth" Then
  Fail 403, "ADMIN_REQUEST_REQUIRED", "无效的后台认证请求。"
End If

Dim action, method
action = LCase(Trim(CStr(Request.QueryString("action"))))
method = UCase(Request.ServerVariables("REQUEST_METHOD"))

If action = "captcha" And method = "GET" Then
  Randomize Timer
  Dim leftValue, rightValue, operation, answer, swapValue
  leftValue = Int(Rnd() * 8) + 2
  rightValue = Int(Rnd() * 8) + 1
  If Rnd() >= 0.5 Then
    operation = "+"
    answer = leftValue + rightValue
  Else
    If rightValue > leftValue Then
      swapValue = leftValue
      leftValue = rightValue
      rightValue = swapValue
    End If
    operation = "-"
    answer = leftValue - rightValue
  End If
  Session("admin_captcha_answer") = CStr(answer)
  Session("admin_captcha_created") = Now()
  Dim captchaCsrfToken
  captchaCsrfToken = AdminSecurityEnsureToken()
  If captchaCsrfToken = "" Then
    AdminSecurityFail 500, "CSRF_TOKEN_GENERATION_FAILED", _
      "后台安全令牌不可用。", "unavailable", "not-checked"
  End If
  Response.Write "{""ok"":true,""question"":""" & leftValue & " " & operation & _
    " " & rightValue & " = ?"",""csrfToken"":""" & captchaCsrfToken & """}"

ElseIf action = "status" And method = "GET" Then
  Dim authenticated
  authenticated = (Session("webwindows_admin") = True And _
    LCase(Trim(CStr(Session("username")))) = "admin" And _
    AdminSecurityTokenShape(Session("webwindows_admin_authority")))
  Dim statusTokenJson
  statusTokenJson = ""
  If authenticated Then
    statusTokenJson = ",""csrfToken"":""" & AdminSecurityEnsureToken() & """"
  End If
  Response.Write "{""ok"":true,""authenticated"":" & LCase(CStr(authenticated)) & _
    ",""username"":""" & JsonText(Session("username")) & """" & statusTokenJson & "}"

ElseIf action = "login" And method = "POST" Then
  AdminSecurityRequirePreAuthMutation "admin-auth", "login"
  Dim username, passwordHash, captchaValue, expectedCaptcha, captchaCreated
  username = LCase(Trim(CStr(Request.Form("username"))))
  passwordHash = LCase(Trim(CStr(Request.Form("password"))))
  captchaValue = Trim(CStr(Request.Form("captcha")))
  expectedCaptcha = Trim(CStr(Session("admin_captcha_answer")))
  captchaCreated = Session("admin_captcha_created")
  Session("admin_captcha_answer") = Empty
  Session("admin_captcha_created") = Empty

  If username = "" Or passwordHash = "" Or captchaValue = "" Then
    Fail 400, "FIELDS_REQUIRED", "请填写账号、密码和验证码。"
  End If
  If expectedCaptcha = "" Or captchaValue <> expectedCaptcha Then
    Fail 400, "CAPTCHA_INVALID", "验证码错误或已失效，请重新计算。"
  End If
  If Not IsDate(captchaCreated) Then
    Fail 400, "CAPTCHA_EXPIRED", "验证码已过期，请刷新后重试。"
  End If
  If DateDiff("n", CDate(captchaCreated), Now()) > 5 Then
    Fail 400, "CAPTCHA_EXPIRED", "验证码已过期，请刷新后重试。"
  End If
  If username <> "admin" Then
    Fail 401, "ADMIN_CREDENTIALS_INVALID", "管理员账号或密码错误。"
  End If

  Dim hashRegex
  Set hashRegex = New RegExp
  hashRegex.Pattern = "^[a-f0-9]{32}$"
  hashRegex.IgnoreCase = True
  If Not hashRegex.Test(passwordHash) Then
    Set hashRegex = Nothing
    Fail 400, "PASSWORD_FORMAT_INVALID", "密码格式无效。"
  End If
  Set hashRegex = Nothing

  Dim loginCmd, loginRs
  Set loginCmd = Server.CreateObject("ADODB.Command")
  With loginCmd
    .ActiveConnection = conn
    .CommandText = "SELECT id,username,nickname FROM webwindows_users " & _
      "WHERE username=? AND password=? LIMIT 1"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 50, username)
    .Parameters.Append .CreateParameter(, 200, 1, 50, passwordHash)
    Set loginRs = .Execute
  End With
  If loginRs.EOF Then
    loginRs.Close
    Set loginRs = Nothing
    Set loginCmd = Nothing
    Fail 401, "ADMIN_CREDENTIALS_INVALID", "管理员账号或密码错误。"
  End If

  AdminSecurityRotateAuthority
  Session("user_id") = CLng(loginRs("id"))
  Session("username") = CStr(loginRs("username"))
  If IsNull(loginRs("nickname")) Then
    Session("nickname") = "admin"
  Else
    Session("nickname") = CStr(loginRs("nickname"))
  End If
  Session("webwindows_admin") = True
  Session("webwindows_admin_since") = Now()
  Session.Timeout = 120
  loginRs.Close
  Set loginRs = Nothing
  Set loginCmd = Nothing
  AdminSecurityAudit "login", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""ok"":true,""authenticated"":true,""username"":""admin""}"

ElseIf action = "logout" And method = "POST" Then
  AdminSecurityRequireMutation "admin-auth", "logout"
  AdminSecurityAudit "logout", "success", "valid", AdminSecurityOriginCategory()
  Session("webwindows_admin") = Empty
  Session("webwindows_admin_since") = Empty
  Session("user_id") = Empty
  Session("username") = Empty
  Session("nickname") = Empty
  AdminSecurityInvalidate
  Response.Write "{""ok"":true}"
  Session.Abandon

Else
  Fail 405, "METHOD_NOT_ALLOWED", "不支持的后台认证操作。"
End If

If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
