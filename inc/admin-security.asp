<%
' WebWindows Admin trusted state-change contract v1.
' Production canonical origin is deliberately not inferred from the Host header.
Const WEBWINDOWS_ADMIN_TRUSTED_ORIGIN = "https://www.y0.hk"
Const WEBWINDOWS_ADMIN_CSRF_HEADER = "HTTP_X_WEBWINDOWS_CSRF"

Function AdminSecurityTrustedOrigin()
  Dim trustedOrigin, shell, processEnvironment, deploymentEnvironment, stagingOrigin, regex
  trustedOrigin = WEBWINDOWS_ADMIN_TRUSTED_ORIGIN
  deploymentEnvironment = ""
  stagingOrigin = ""
  On Error Resume Next
  Set shell = Server.CreateObject("WScript.Shell")
  Set processEnvironment = shell.Environment("PROCESS")
  deploymentEnvironment = LCase(Trim(CStr(processEnvironment("WEBWINDOWS_DEPLOYMENT_ENVIRONMENT"))))
  stagingOrigin = LCase(Trim(CStr(processEnvironment("WEBWINDOWS_ADMIN_STAGING_ORIGIN"))))
  Set processEnvironment = Nothing
  Set shell = Nothing
  Err.Clear
  On Error GoTo 0
  If deploymentEnvironment = "staging" And stagingOrigin <> "" Then
    Set regex = New RegExp
    regex.Pattern = "^https://[a-z0-9.-]+(:[0-9]{1,5})?$"
    regex.IgnoreCase = False
    If regex.Test(stagingOrigin) Then trustedOrigin = stagingOrigin
    Set regex = Nothing
  End If
  AdminSecurityTrustedOrigin = LCase(trustedOrigin)
End Function

' 这个助手是所有后台接口拼 JSON 的唯一入口，而 IsNull 在这套宿主上挡不住实际
' 交给 VBScript 的空值：CStr 抛「无效使用 Null」时整个请求 500。
' 生产上已经因此挂掉过两个接口 —— adminAuth.asp?action=status（会话失效时
' Session("username") 为空）和 news.asp?action=list。所以这里不赌判空，
' 改成尝试转换：Null、Empty、对象、以及任何转不成字符串的取值一律降级为空串。
' 宁可少一个字段，也不能让一个空字段把整个后台接口打挂。
Function AdminSecurityJson(ByVal value)
  Dim text, convertedCode
  text = ""
  If Not IsNull(value) And Not IsEmpty(value) Then
    If VarType(value) = vbObject Then
      ' DBNull 在 VBScript 里是对象：IsNull 认不出，CStr 会抛。
    Else
      On Error Resume Next
      Err.Clear
      text = CStr(value)
      convertedCode = Err.Number
      Err.Clear
      On Error GoTo 0
      If convertedCode <> 0 Then text = ""
    End If
  End If
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  ' JSON 规范禁止字符串里出现未转义的 0x00-0x1F 控制字符。原先只处理 CR/LF，
  ' 于是任何带制表符、退格、纵向制表符等内容的行都会让整份 JSON 解析失败 ——
  ' 前端只能看到 "Expected ',' or '}' after array element"，完全指不出是哪个字段。
  text = Replace(text, vbTab, "\t")
  text = Replace(text, Chr(8), "\b")
  text = Replace(text, Chr(11), "\u000b")
  text = Replace(text, Chr(12), "\f")
  text = Replace(text, Chr(127), "")
  Dim index, code
  ' NUL 单独处理：它会截断 VBScript 里的 Replace 匹配，必须换成空格而不是删除，
  ' 否则 "a" + NUL + "b" 变成 "a"，字符数都被改掉了。
  text = Replace(text, Chr(0), " ")
  For index = 1 To 31
    code = index
    If index <> 9 And index <> 10 And index <> 12 And index <> 13 Then
      text = Replace(text, Chr(code), " ")
    End If
  Next
  AdminSecurityJson = text
End Function

Function AdminSecurityTokenShape(ByVal value)
  Dim regex
  Set regex = New RegExp
  regex.Pattern = "^[a-f0-9]{64}$"
  regex.IgnoreCase = False
  AdminSecurityTokenShape = regex.Test(CStr(value))
  Set regex = Nothing
End Function

Function AdminSecurityRandomToken()
  Dim randomRs, token
  token = ""
  On Error Resume Next
  Set randomRs = conn.Execute("SELECT LOWER(HEX(RANDOM_BYTES(32))) AS security_token")
  If Err.Number = 0 Then
    If Not randomRs.EOF Then token = CStr(randomRs("security_token"))
  End If
  Err.Clear
  If IsObject(randomRs) Then randomRs.Close
  Set randomRs = Nothing
  On Error GoTo 0
  If Not AdminSecurityTokenShape(token) Then token = ""
  AdminSecurityRandomToken = token
End Function

Function AdminSecurityEnsureToken()
  Dim token
  token = LCase(Trim(CStr(Session("webwindows_admin_csrf"))))
  If Not AdminSecurityTokenShape(token) Then
    token = AdminSecurityRandomToken()
    If token <> "" Then Session("webwindows_admin_csrf") = token
  End If
  AdminSecurityEnsureToken = token
End Function

Sub AdminSecurityRotateAuthority()
  Dim authorityToken, csrfToken
  authorityToken = AdminSecurityRandomToken()
  csrfToken = AdminSecurityRandomToken()
  If authorityToken = "" Or csrfToken = "" Then
    AdminSecurityFail 500, "CSRF_TOKEN_GENERATION_FAILED", _
      "后台安全会话初始化失败。", "token-generation", "none"
  End If
  Session("webwindows_admin_authority") = authorityToken
  Session("webwindows_admin_csrf") = csrfToken
End Sub

Sub AdminSecurityInvalidate()
  Session("webwindows_admin_csrf") = Empty
  Session("webwindows_admin_authority") = Empty
End Sub

Function AdminSecurityConstantEquals(ByVal leftValue, ByVal rightValue)
  Dim leftText, rightText, mismatch, index
  leftText = CStr(leftValue)
  rightText = CStr(rightValue)
  mismatch = Len(leftText) Xor Len(rightText)
  If Len(leftText) <> Len(rightText) Then
    AdminSecurityConstantEquals = False
    Exit Function
  End If
  For index = 1 To Len(leftText)
    mismatch = mismatch Or (AscW(Mid(leftText, index, 1)) Xor AscW(Mid(rightText, index, 1)))
  Next
  AdminSecurityConstantEquals = (mismatch = 0)
End Function

Function AdminSecurityRefererOrigin(ByVal refererValue)
  Dim regex, matches, schemeValue, authorityValue
  AdminSecurityRefererOrigin = ""
  Set regex = New RegExp
  regex.Pattern = "^(https?)://([^/?#]+)([/?#]|$)"
  regex.IgnoreCase = True
  Set matches = regex.Execute(Trim(CStr(refererValue)))
  If matches.Count = 1 Then
    schemeValue = LCase(CStr(matches(0).SubMatches(0)))
    authorityValue = LCase(CStr(matches(0).SubMatches(1)))
    If InStr(authorityValue, "@") = 0 And InStr(authorityValue, "\") = 0 Then
      AdminSecurityRefererOrigin = schemeValue & "://" & authorityValue
    End If
  End If
  Set matches = Nothing
  Set regex = Nothing
End Function

Function AdminSecurityOriginCategory()
  Dim originValue, refererValue, parsedReferer, trustedOrigin
  trustedOrigin = AdminSecurityTrustedOrigin()
  originValue = LCase(Trim(CStr(Request.ServerVariables("HTTP_ORIGIN"))))
  If originValue <> "" Then
    If originValue = trustedOrigin Then
      AdminSecurityOriginCategory = "origin-exact"
    Else
      AdminSecurityOriginCategory = "origin-mismatch"
    End If
    Exit Function
  End If
  refererValue = Trim(CStr(Request.ServerVariables("HTTP_REFERER")))
  If refererValue = "" Then
    AdminSecurityOriginCategory = "origin-missing"
    Exit Function
  End If
  parsedReferer = AdminSecurityRefererOrigin(refererValue)
  If parsedReferer = trustedOrigin Then
    AdminSecurityOriginCategory = "referer-exact"
  ElseIf parsedReferer = "" Then
    AdminSecurityOriginCategory = "referer-malformed"
  Else
    AdminSecurityOriginCategory = "referer-mismatch"
  End If
End Function

Function AdminSecurityFormContentType()
  Dim contentType, separator
  contentType = LCase(Trim(CStr(Request.ServerVariables("CONTENT_TYPE"))))
  separator = InStr(contentType, ";")
  If separator > 0 Then contentType = Trim(Left(contentType, separator - 1))
  AdminSecurityFormContentType = (contentType = "application/x-www-form-urlencoded")
End Function

Sub AdminSecurityAudit(ByVal actionName, ByVal resultName, ByVal csrfCategory, ByVal originCategory)
  Dim safeAction, safeResult, actorIdentity, csrfCode, originCode, auditCmd, actorId
  safeAction = Replace(Replace(Left(CStr(actionName), 24), "&", "_"), "=", "_")
  safeResult = Replace(Replace(Left(CStr(resultName), 10), "&", "_"), "=", "_")
  actorIdentity = "anon"
  If Session("webwindows_admin") = True Then
    actorIdentity = Left(CStr(Session("user_id")), 10)
  End If
  csrfCode = Left(CStr(csrfCategory), 1)
  originCode = Left(CStr(originCategory), 1)
  If originCategory = "origin-mismatch" Or originCategory = "referer-mismatch" Then originCode = "x"
  If originCategory = "origin-missing" Then originCode = "m"
  If originCategory = "referer-malformed" Then originCode = "f"
  Response.AppendToLog "&wa=" & Server.URLEncode(safeAction) & _
    "&wr=" & Server.URLEncode(safeResult) & _
    "&wu=" & Server.URLEncode(actorIdentity) & _
    "&wc=" & Server.URLEncode(csrfCode) & _
    "&wo=" & Server.URLEncode(originCode)
  If safeResult = "success" And IsObject(conn) Then
    actorId = Null
    If IsNumeric(Session("user_id")) Then actorId = CLng(Session("user_id"))
    On Error Resume Next
    Set auditCmd = Server.CreateObject("ADODB.Command")
    Set auditCmd.ActiveConnection = conn
    auditCmd.CommandType = 1
    auditCmd.CommandText = "INSERT INTO webwindows_admin_audit(actor_id,action_name,result_name) VALUES (?,?,?)"
    auditCmd.Parameters.Append auditCmd.CreateParameter("actor", 3, 1, , actorId)
    auditCmd.Parameters.Append auditCmd.CreateParameter("action", 200, 1, 64, safeAction)
    auditCmd.Parameters.Append auditCmd.CreateParameter("result", 200, 1, 24, safeResult)
    auditCmd.Execute
    Set auditCmd = Nothing
    Err.Clear
    On Error GoTo 0
  End If
End Sub

Sub AdminSecurityFail(ByVal statusCode, ByVal code, ByVal message, ByVal csrfCategory, ByVal originCategory)
  Select Case CLng(statusCode)
    Case 400: Response.Status = "400 Bad Request"
    Case 401: Response.Status = "401 Unauthorized"
    Case 403: Response.Status = "403 Forbidden"
    Case 405: Response.Status = "405 Method Not Allowed"
    Case 415: Response.Status = "415 Unsupported Media Type"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  AdminSecurityAudit "security-gate", LCase(CStr(code)), csrfCategory, originCategory
  Response.ContentType = "application/json"
  Response.Write "{""ok"":false,""success"":false,""code"":""" & _
    AdminSecurityJson(code) & """,""message"":""" & AdminSecurityJson(message) & _
    """,""error"":""" & AdminSecurityJson(message) & """}"
  If IsObject(conn) Then
    If conn.State <> 0 Then conn.Close
  End If
  Response.End
End Sub

Sub AdminSecurityRequireProof(ByVal requireAuthenticated, ByVal expectedRequestHeader, ByVal actionName)
  Dim method, requestHeader, expectedToken, suppliedToken, originCategory, fetchSite
  method = UCase(Trim(CStr(Request.ServerVariables("REQUEST_METHOD"))))
  If method <> "POST" Then
    Response.AddHeader "Allow", "POST"
    AdminSecurityFail 405, "ADMIN_MUTATION_POST_REQUIRED", _
      "后台状态修改只允许 POST。", "not-checked", "not-checked"
  End If
  If requireAuthenticated Then
    If Session("webwindows_admin") <> True Or _
       LCase(Trim(CStr(Session("username")))) <> "admin" Or _
       Not AdminSecurityTokenShape(Session("webwindows_admin_authority")) Then
      AdminSecurityFail 401, "ADMIN_LOGIN_REQUIRED", _
        "请先登录 WebWindows 管理后台。", "not-checked", "not-checked"
    End If
  End If
  requestHeader = LCase(Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST"))))
  If requestHeader <> LCase(CStr(expectedRequestHeader)) Then
    AdminSecurityFail 403, "ADMIN_REQUEST_REQUIRED", _
      "无效的后台管理请求。", "not-checked", "not-checked"
  End If
  If Not AdminSecurityFormContentType() Then
    AdminSecurityFail 415, "ADMIN_CONTENT_TYPE_REQUIRED", _
      "后台状态修改必须使用 application/x-www-form-urlencoded。", "not-checked", "not-checked"
  End If
  originCategory = AdminSecurityOriginCategory()
  If originCategory <> "origin-exact" And originCategory <> "referer-exact" Then
    AdminSecurityFail 403, "ADMIN_ORIGIN_INVALID", _
      "后台请求来源无效。", "not-checked", originCategory
  End If
  fetchSite = LCase(Trim(CStr(Request.ServerVariables("HTTP_SEC_FETCH_SITE"))))
  If fetchSite <> "" And fetchSite <> "same-origin" Then
    AdminSecurityFail 403, "ADMIN_FETCH_CONTEXT_INVALID", _
      "后台请求上下文无效。", "not-checked", originCategory
  End If
  expectedToken = AdminSecurityEnsureToken()
  suppliedToken = LCase(Trim(CStr(Request.ServerVariables(WEBWINDOWS_ADMIN_CSRF_HEADER))))
  If expectedToken = "" Then
    AdminSecurityFail 500, "CSRF_TOKEN_GENERATION_FAILED", _
      "后台安全令牌不可用。", "unavailable", originCategory
  End If
  If suppliedToken = "" Then
    AdminSecurityFail 403, "CSRF_REQUIRED", _
      "后台状态修改需要 CSRF proof。", "missing", originCategory
  End If
  If Not AdminSecurityTokenShape(suppliedToken) Or _
     Not AdminSecurityConstantEquals(expectedToken, suppliedToken) Then
    AdminSecurityFail 403, "CSRF_INVALID", _
      "后台 CSRF proof 无效。", "invalid", originCategory
  End If
  AdminSecurityAudit actionName, "eligible", "valid", originCategory
End Sub

Sub AdminSecurityRequireMutation(ByVal expectedRequestHeader, ByVal actionName)
  AdminSecurityRequireProof True, expectedRequestHeader, actionName
End Sub

Sub AdminSecurityRequireRead(ByVal expectedRequestHeader, ByVal actionName)
  Dim method, requestHeader, fetchSite
  method = UCase(Trim(CStr(Request.ServerVariables("REQUEST_METHOD"))))
  If method <> "GET" Then
    Response.AddHeader "Allow", "GET"
    AdminSecurityFail 405, "ADMIN_READ_GET_REQUIRED", "后台读取只允许 GET。", "not-checked", "not-checked"
  End If
  If Session("webwindows_admin") <> True Or _
     LCase(Trim(CStr(Session("username")))) <> "admin" Or _
     Not AdminSecurityTokenShape(Session("webwindows_admin_authority")) Then
    AdminSecurityFail 401, "ADMIN_LOGIN_REQUIRED", "请先登录 WebWindows 管理后台。", "not-checked", "not-checked"
  End If
  requestHeader = LCase(Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST"))))
  If requestHeader <> LCase(CStr(expectedRequestHeader)) Then
    AdminSecurityFail 403, "ADMIN_REQUEST_REQUIRED", "无效的后台管理请求。", "not-checked", "not-checked"
  End If
  fetchSite = LCase(Trim(CStr(Request.ServerVariables("HTTP_SEC_FETCH_SITE"))))
  If fetchSite <> "" And fetchSite <> "same-origin" Then
    AdminSecurityFail 403, "ADMIN_FETCH_CONTEXT_INVALID", "后台请求上下文无效。", "not-checked", "not-checked"
  End If
  Response.CacheControl = "no-cache"
  Response.AddHeader "Pragma", "no-cache"
  AdminSecurityAudit actionName, "eligible", "not-needed", "same-origin"
End Sub

Sub AdminSecurityRequirePreAuthMutation(ByVal expectedRequestHeader, ByVal actionName)
  AdminSecurityRequireProof False, expectedRequestHeader, actionName
End Sub
%>
