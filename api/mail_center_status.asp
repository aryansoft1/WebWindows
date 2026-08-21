<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
' 讯址中心自检：只检测服务器能力，不读取或保存任何邮箱凭据。
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.Buffer = True

Function JsonBool(value)
  If value Then JsonBool = "true" Else JsonBool = "false"
End Function

Function HasComObject(progId)
  On Error Resume Next
  Dim obj, available
  available = False
  Err.Clear
  Set obj = Server.CreateObject(progId)
  If Err.Number = 0 Then available = True
  Set obj = Nothing
  Err.Clear
  HasComObject = available
End Function

Dim currentUser, jmailMessage, jmailPop3
currentUser = Trim(CStr(Request.Cookies("webwindows_user")))
jmailMessage = HasComObject("JMail.Message")
jmailPop3 = HasComObject("JMail.POP3")

Response.Write "{""authenticated"":" & JsonBool(Len(currentUser) > 0) & _
  ",""jmail"":{""smtp"":" & JsonBool(jmailMessage) & _
  ",""pop3"":" & JsonBool(jmailPop3) & _
  "},""ready"":" & JsonBool(Len(currentUser) > 0 And jmailMessage And jmailPop3) & "}"
%>
