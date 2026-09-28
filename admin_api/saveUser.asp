<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireMutation "system-manager", "save-user"

Dim idText, userId, username, password, nickname, email, avatar, centerText, centerId
Dim cmd, existing, affected
idText = Trim(CStr(Request.Form("id")))
userId = 0
If idText <> "" Then
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "valid", "same-origin"
  On Error Resume Next
  userId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If userId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "用户编号无效。", "valid", "same-origin"
End If
username = Trim(CStr(Request.Form("username")))
password = CStr(Request.Form("password"))
nickname = Trim(CStr(Request.Form("nickname")))
email = Trim(CStr(Request.Form("email")))
avatar = Trim(CStr(Request.Form("avatar")))
centerText = Trim(CStr(Request.Form("data_center_id")))
centerId = Null
If centerText <> "" Then
  If Not IsNumeric(centerText) Then AdminSecurityFail 400, "INVALID_DATACENTER", "数据中心编号无效。", "valid", "same-origin"
  On Error Resume Next
  centerId = CLng(centerText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_DATACENTER", "数据中心编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If centerId <= 0 Then AdminSecurityFail 400, "INVALID_DATACENTER", "数据中心编号无效。", "valid", "same-origin"
End If
If username = "" Or nickname = "" Or Len(username) > 50 Or Len(nickname) > 100 Or _
   Len(email) > 255 Or Len(avatar) > 500 Then
  AdminSecurityFail 400, "INVALID_USER", "请检查用户信息和字段长度。", "valid", "same-origin"
End If
If userId = 0 And password = "" Then
  AdminSecurityFail 400, "PASSWORD_REQUIRED", "新用户必须设置密码。", "valid", "same-origin"
End If
If password <> "" And (Len(password) < 8 Or Len(password) > 128) Then
  AdminSecurityFail 400, "INVALID_PASSWORD", "密码长度须为 8 至 128 字符。", "valid", "same-origin"
End If
If avatar <> "" And Left(LCase(avatar), 8) <> "https://" And Left(avatar, 1) <> "/" Then
  AdminSecurityFail 400, "INVALID_AVATAR", "头像地址须为 HTTPS 或站内路径。", "valid", "same-origin"
End If
If userId > 0 Then
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT username FROM webwindows_users WHERE id=? LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , userId)
  Set existing = cmd.Execute
  If existing.EOF Then AdminSecurityFail 400, "USER_NOT_FOUND", "用户不存在。", "valid", "same-origin"
  If LCase(CStr(existing("username"))) = "admin" Then
    AdminSecurityFail 403, "ADMIN_ACCOUNT_PROTECTED", "请在系统设置中管理管理员账号。", "valid", "same-origin"
  End If
  existing.Close
  Set existing = Nothing
  Set cmd = Nothing
End If
If LCase(username) = "admin" Then
  AdminSecurityFail 403, "ADMIN_ACCOUNT_PROTECTED", "管理员账号只能在系统设置中管理。", "valid", "same-origin"
End If

Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
If userId = 0 Then
  cmd.CommandText = "INSERT INTO webwindows_users " & _
    "(username,password,nickname,avatar,email,data_center_id,expired_at) " & _
    "VALUES (?,MD5(?),?,?,?,?,NULL)"
  cmd.Parameters.Append cmd.CreateParameter("username", 200, 1, 50, username)
  cmd.Parameters.Append cmd.CreateParameter("password", 200, 1, 128, password)
ElseIf password <> "" Then
  cmd.CommandText = "UPDATE webwindows_users SET username=?,password=MD5(?)," & _
    "nickname=?,avatar=?,email=?,data_center_id=?,expired_at=NULL WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("username", 200, 1, 50, username)
  cmd.Parameters.Append cmd.CreateParameter("password", 200, 1, 128, password)
Else
  cmd.CommandText = "UPDATE webwindows_users SET username=?,nickname=?,avatar=?," & _
    "email=?,data_center_id=?,expired_at=NULL WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("username", 200, 1, 50, username)
End If
cmd.Parameters.Append cmd.CreateParameter("nickname", 200, 1, 100, nickname)
cmd.Parameters.Append cmd.CreateParameter("avatar", 200, 1, 500, avatar)
cmd.Parameters.Append cmd.CreateParameter("email", 200, 1, 255, email)
cmd.Parameters.Append cmd.CreateParameter("center", 3, 1, , centerId)
If userId > 0 Then cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , userId)
On Error Resume Next
cmd.Execute affected
If Err.Number <> 0 Then
  Err.Clear
  On Error GoTo 0
  AdminSecurityFail 500, "USER_SAVE_FAILED", "保存用户失败，请检查用户名是否重复及数据中心是否有效。", "valid", "same-origin"
End If
On Error GoTo 0
AdminSecurityAudit "save-user", "success", "valid", AdminSecurityOriginCategory()
Response.Write "{""success"":true}"
%>
