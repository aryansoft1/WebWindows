<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
' 讯址中心本地连接测试。仅限 loopback，授权码只用于当前请求，绝不写入文件、数据库或日志。
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "text/html; charset=utf-8"
Response.Buffer = True

Dim remoteAddress
remoteAddress = Request.ServerVariables("REMOTE_ADDR")
If remoteAddress <> "127.0.0.1" And remoteAddress <> "::1" Then
  Response.Status = "403 Forbidden"
  Response.Write "此测试页仅允许本机访问。"
  Response.End
End If

Function H(value)
  Dim result
  result = Server.HTMLEncode(CStr(value))
  H = result
End Function

Function ErrorText()
  ErrorText = H(Err.Description & " (0x" & Hex(Err.Number) & ")")
End Function

Dim action, email, appPassword, popHost, popPort, smtpHost, smtpPort, useSsl, resultHtml
action = LCase(Trim(Request.Form("action")))
email = Trim(Request.Form("email"))
appPassword = Trim(Request.Form("app_password"))
popHost = Trim(Request.Form("pop_host"))
popPort = Trim(Request.Form("pop_port"))
smtpHost = Trim(Request.Form("smtp_host"))
smtpPort = Trim(Request.Form("smtp_port"))
useSsl = (Request.Form("use_ssl") = "1")
resultHtml = ""

If action <> "" Then
  If email = "" Or appPassword = "" Or popHost = "" Or smtpHost = "" Or Not IsNumeric(popPort) Or Not IsNumeric(smtpPort) Then
    resultHtml = "<p class='bad'>请填写完整的讯址、授权码和服务器参数。</p>"
  ElseIf action = "pop3" Then
    On Error Resume Next
    Dim pop3, total
    Set pop3 = Server.CreateObject("JMail.POP3")
    pop3.Logging = True
    pop3.Connect email, appPassword, popHost, CInt(popPort)
    If Err.Number <> 0 Then
      resultHtml = "<p class='bad'>POP3 连接失败：" & ErrorText() & "</p>"
      Err.Clear
    Else
      total = pop3.Count
      resultHtml = "<p class='ok'>POP3 连接成功。邮箱当前共有 " & H(total) & " 封邮件。</p>"
      pop3.Disconnect
    End If
    Set pop3 = Nothing
    On Error GoTo 0
  ElseIf action = "smtp" Then
    On Error Resume Next
    Dim message, sent
    Set message = Server.CreateObject("JMail.Message")
    message.Silent = True
    message.Logging = True
    message.Charset = "utf-8"
    message.From = email
    message.FromName = "WebWindows 讯址中心测试"
    message.AddRecipient email
    message.Subject = "WebWindows 讯址中心 SMTP 测试"
    message.Body = "这是一封由本机讯址中心测试页发送的验证邮件。"
    message.MailServerUserName = email
    message.MailServerPassword = appPassword
    sent = message.Send(smtpHost)
    If Err.Number <> 0 Then
      resultHtml = "<p class='bad'>SMTP 测试失败：" & ErrorText() & "</p>"
      Err.Clear
    ElseIf sent Then
      resultHtml = "<p class='ok'>SMTP 已接受测试邮件，请检查 “" & H(email) & "” 收件箱。</p>"
    Else
      resultHtml = "<p class='bad'>SMTP 未发送成功。JMail 日志：" & H(message.Log) & "</p>"
    End If
    Set message = Nothing
    On Error GoTo 0
  End If
End If

If popHost = "" Then popHost = "pop.qq.com"
If popPort = "" Then popPort = "995"
If smtpHost = "" Then smtpHost = "smtp.qq.com"
If smtpPort = "" Then smtpPort = "465"
%>
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>讯址中心连接测试</title>
  <style>body{font:14px/1.5 system-ui,sans-serif;background:#f5f7fb;color:#172033;margin:0}.card{max-width:560px;margin:36px auto;padding:24px;background:#fff;border:1px solid #dfe4ee;border-radius:12px}label{display:block;margin:12px 0 4px;font-weight:600}input{width:100%;box-sizing:border-box;padding:9px;border:1px solid #b8c1d1;border-radius:6px}fieldset{border:1px solid #dfe4ee;border-radius:8px;margin:16px 0;padding:12px}.row{display:flex;gap:12px}.row label{flex:1}button{padding:9px 14px;border:0;border-radius:6px;background:#1677ff;color:#fff;cursor:pointer;margin-right:8px}.note{font-size:12px;color:#596579}.ok{color:#067647}.bad{color:#b42318;white-space:pre-wrap}</style>
</head>
<body><main class="card">
  <h1>讯址中心连接测试</h1>
  <p class="note">仅限本机访问。授权码只在本次提交中使用，不会被保存或显示。SMTP 测试会向当前讯址发送一封测试信。此页会优先验证 JMail 4.3 的基础对象与认证调用；是否支持指定端口和现代 TLS 由实际结果决定。</p>
  <%=resultHtml%>
  <form method="post" autocomplete="off">
    <label for="email">讯址</label><input id="email" name="email" type="email" required value="<%=H(email)%>" placeholder="name@qq.com">
    <label for="app_password">邮箱授权码</label><input id="app_password" name="app_password" type="password" required autocomplete="new-password">
    <fieldset><legend>收信（POP3）</legend>
      <div class="row"><label>服务器<input name="pop_host" required value="<%=H(popHost)%>"></label><label>端口<input name="pop_port" required value="<%=H(popPort)%>"></label></div>
    </fieldset>
    <fieldset><legend>邮送（SMTP）</legend>
      <div class="row"><label>服务器<input name="smtp_host" required value="<%=H(smtpHost)%>"></label><label>目标端口<input name="smtp_port" required value="<%=H(smtpPort)%>"></label></div>
      <p class="note">JMail 4.3 的已验证接口不支持此页直接设置 SMTP 端口或 SSL；端口字段仅记录目标服务参数，测试会显示实际兼容结果。</p>
    </fieldset>
    <button name="action" value="pop3" type="submit">测试 POP3 收信</button><button name="action" value="smtp" type="submit">测试 SMTP 邮送</button>
  </form>
</main></body></html>
