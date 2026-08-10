<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.CodePage = 65001
Response.CacheControl = "no-store"

Function JsonText(ByVal value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

' 获取表单数据
dim username, password, verifycode
username = trim(Request.Form("username"))
password = trim(Request.Form("password"))

' 简单检查
if username = "" or password = "" then
  Response.Write "{""success"":false,""message"":""请填写所有字段""}"
  Response.End
end if

' 查询数据库
dim rs, cmd, sql
sql = "SELECT * FROM webwindows_users WHERE username=? AND password=?"
set cmd = Server.CreateObject("ADODB.Command")
with cmd
  .ActiveConnection = conn
  .CommandText = sql
  .CommandType = 1 ' adCmdText
  .Parameters.Append .CreateParameter(, 200, 1, 50, username)
  .Parameters.Append .CreateParameter(, 200, 1, 50, password) ' 已是前端 MD5 加密后的密码
  set rs = .Execute
end with

if not rs.EOF then
  dim nickname, userId, userJson
  userId = CLng(rs("id"))
  If IsNull(rs("nickname")) Then
    nickname = ""
  Else
    nickname = Trim(CStr(rs("nickname")))
  End If
  If nickname = "" Then nickname = username

  Session("user_id") = userId
  Session("username") = username
  Session("nickname") = nickname
  Session("webwindows_user_id") = userId
  Session("webwindows_username") = username
  Session("webwindows_nickname") = nickname
  Session.Timeout = 120

  userJson = "{""id"":" & userId & ",""username"":""" & JsonText(username) & _
    """,""nickname"":""" & JsonText(nickname) & """}"
  Response.Cookies("webwindows_user") = username
  Response.Cookies("webwindows_user").Path = "/"
  Response.Cookies("webwindows_user_nickname") = nickname
  Response.Cookies("webwindows_user_nickname").Path = "/"

  Response.Write "{""success"":true,""user"":" & userJson & "}"
else
  Response.Write "{""success"":false,""message"":""用户名或密码错误""}"
end if

rs.Close: set rs = Nothing
set cmd = Nothing
conn.Close: set conn = Nothing
%>
