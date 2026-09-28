<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireRead "system-manager", "get-user"
Dim idText, userId, cmd, rs, centerId
idText = Trim(CStr(Request.QueryString("id")))
If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "not-needed", "same-origin"
On Error Resume Next
userId = CLng(idText)
If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "not-needed", "same-origin"
On Error GoTo 0
If userId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "not-needed", "same-origin"
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "SELECT u.id,u.username,u.nickname,u.email,u.avatar,u.data_center_id," & _
  "d.name AS data_center_name FROM webwindows_users u " & _
  "LEFT JOIN webwindows_datacenters d ON u.data_center_id=d.id WHERE u.id=? LIMIT 1"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , userId)
Set rs = cmd.Execute
If rs.EOF Then AdminSecurityFail 400, "USER_NOT_FOUND", "用户不存在。", "not-needed", "same-origin"
centerId = 0
If Not IsNull(rs("data_center_id")) Then centerId = CLng(rs("data_center_id"))
Response.Write "{""id"":" & CLng(rs("id")) & _
  ",""username"":""" & AdminSecurityJson(rs("username")) & _
  """,""nickname"":""" & AdminSecurityJson(rs("nickname")) & _
  """,""email"":""" & AdminSecurityJson(rs("email")) & _
  """,""avatar"":""" & AdminSecurityJson(rs("avatar")) & _
  """,""data_center_id"":" & centerId & _
  ",""data_center_name"":""" & AdminSecurityJson(rs("data_center_name")) & """}"
rs.Close
%>
