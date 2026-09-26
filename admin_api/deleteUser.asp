<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireMutation "system-manager", "delete-user"
Dim idText, userId, cmd, rs, affected
idText = Trim(CStr(Request.Form("id")))
If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "valid", "same-origin"
On Error Resume Next
userId = CLng(idText)
If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "valid", "same-origin"
On Error GoTo 0
If userId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "valid", "same-origin"
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "SELECT username FROM webwindows_users WHERE id=? LIMIT 1"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , userId)
Set rs = cmd.Execute
If rs.EOF Then AdminSecurityFail 400, "USER_NOT_FOUND", "用户不存在。", "valid", "same-origin"
If LCase(CStr(rs("username"))) = "admin" Then
  AdminSecurityFail 403, "ADMIN_ACCOUNT_PROTECTED", "不能删除管理员账号。", "valid", "same-origin"
End If
rs.Close
Set rs = Nothing
Set cmd = Nothing
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "DELETE FROM webwindows_users WHERE id=? AND username<>'admin'"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , userId)
On Error Resume Next
cmd.Execute affected
If Err.Number <> 0 Then
  Err.Clear
  On Error GoTo 0
  AdminSecurityFail 500, "USER_DELETE_FAILED", "删除失败，用户可能仍有关联资料。", "valid", "same-origin"
End If
On Error GoTo 0
AdminSecurityAudit "delete-user", "success", "valid", AdminSecurityOriginCategory()
Response.Write "{""success"":true}"
%>
