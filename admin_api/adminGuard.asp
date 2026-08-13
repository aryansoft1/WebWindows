<%
Sub RequireAdminMutation(ByVal requestScope)
  Response.CacheControl = "no-store"
  If Not (Session("webwindows_admin") = True) Then
    Response.Status = "403 Forbidden"
    Response.ContentType = "application/json"
    Response.Write "{""success"":false,""error"":{ " & _
      """code"":""ADMIN_REQUIRED"",""message"":""需要管理员登录会话""}}"
    Response.End
  End If
  If UCase(Trim(CStr(Request.ServerVariables("REQUEST_METHOD")))) <> "POST" Then
    Response.Status = "405 Method Not Allowed"
    Response.ContentType = "application/json"
    Response.Write "{""success"":false,""error"":{ " & _
      """code"":""METHOD_NOT_ALLOWED"",""message"":""只允许 POST 请求""}}"
    Response.End
  End If
  If StrComp(Trim(CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST"))), _
     CStr(requestScope), vbBinaryCompare) <> 0 Then
    Response.Status = "403 Forbidden"
    Response.ContentType = "application/json"
    Response.Write "{""success"":false,""error"":{ " & _
      """code"":""ADMIN_REQUEST_REQUIRED"",""message"":""管理员请求验证失败""}}"
    Response.End
  End If
End Sub
%>
