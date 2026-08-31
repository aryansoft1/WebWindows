<%
' WebWindows Admin trusted state-change contract v1.
' Production canonical origin is deliberately not inferred from the Host header.
Const WEBWINDOWS_ADMIN_TRUSTED_ORIGIN = "https://www.y0.hk"
Const WEBWINDOWS_ADMIN_CSRF_HEADER = "HTTP_X_WEBWINDOWS_CSRF"

Function AdminSecurityJson(ByVal value)
  Dim text
  If IsNull(value) Then text = "" Else text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
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
  Dim originValue, refererValue, parsedReferer
  originValue = LCase(Trim(CStr(Request.ServerVariables("HTTP_ORIGIN"))))
  If originValue <> "" Then
    If originValue = LCase(WEBWINDOWS_ADMIN_TRUSTED_ORIGIN) Then
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
  If parsedReferer = LCase(WEBWINDOWS_ADMIN_TRUSTED_ORIGIN) Then
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
  Dim safeAction, safeResult, actorIdentity, csrfCode, originCode
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

Sub AdminSecurityRequirePreAuthMutation(ByVal expectedRequestHeader, ByVal actionName)
  AdminSecurityRequireProof False, expectedRequestHeader, actionName
End Sub
%>
