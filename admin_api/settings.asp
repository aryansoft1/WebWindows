<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Dim action, method, cmd, rs, json, adminId
action = LCase(Trim(CStr(Request("action"))))
method = UCase(CStr(Request.ServerVariables("REQUEST_METHOD")))
If method = "GET" Then
  AdminSecurityRequireRead "system-manager", "settings-" & action
Else
  AdminSecurityRequireMutation "system-manager", "settings-" & action
End If
adminId = CLng(Session("user_id"))

If action = "get" And method = "GET" Then
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT username,nickname FROM webwindows_users WHERE id=? AND username='admin' LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , adminId)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 401, "ADMIN_LOGIN_REQUIRED", "管理员账号不可用。", "not-needed", "same-origin"
  json = "{""username"":""" & AdminSecurityJson(rs("username")) & _
    """,""nickname"":""" & AdminSecurityJson(rs("nickname")) & """"
  rs.Close
  Set rs = conn.Execute("SELECT setting_key,setting_value FROM webwindows_admin_settings " & _
    "WHERE setting_key IN ('system_name','admin_idle_minutes')")
  Do Until rs.EOF
    json = json & ",""" & AdminSecurityJson(rs("setting_key")) & _
      """:""" & AdminSecurityJson(rs("setting_value")) & """"
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "}"
  Response.End
End If

If action = "save" And method = "POST" Then
  Dim nickname, systemName, idleText, idleMinutes
  nickname = Trim(CStr(Request.Form("nickname")))
  systemName = Trim(CStr(Request.Form("system_name")))
  idleText = Trim(CStr(Request.Form("admin_idle_minutes")))
  If nickname = "" Or systemName = "" Or Len(nickname) > 100 Or Len(systemName) > 100 Then
    AdminSecurityFail 400, "INVALID_SETTINGS", "管理员昵称和系统名称不能为空且不得超过 100 字。", "valid", "same-origin"
  End If
  If Not IsNumeric(idleText) Then AdminSecurityFail 400, "INVALID_IDLE", "自动登出时间无效。", "valid", "same-origin"
  On Error Resume Next
  idleMinutes = CLng(idleText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_IDLE", "自动登出时间无效。", "valid", "same-origin"
  On Error GoTo 0
  If idleMinutes < 5 Or idleMinutes > 120 Then
    AdminSecurityFail 400, "INVALID_IDLE", "自动登出时间须为 5 至 120 分钟。", "valid", "same-origin"
  End If
  conn.BeginTrans
  On Error Resume Next
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "UPDATE webwindows_users SET nickname=? WHERE id=? AND username='admin'"
  cmd.Parameters.Append cmd.CreateParameter("nickname", 200, 1, 100, nickname)
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , adminId)
  cmd.Execute
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_admin_settings(setting_key,setting_value) VALUES (?,?) " & _
    "ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)"
  cmd.Parameters.Append cmd.CreateParameter("key", 200, 1, 64, "system_name")
  cmd.Parameters.Append cmd.CreateParameter("value", 200, 1, 1000, systemName)
  cmd.Execute
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_admin_settings(setting_key,setting_value) VALUES (?,?) " & _
    "ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)"
  cmd.Parameters.Append cmd.CreateParameter("key", 200, 1, 64, "admin_idle_minutes")
  cmd.Parameters.Append cmd.CreateParameter("value", 200, 1, 1000, CStr(idleMinutes))
  cmd.Execute
  If Err.Number <> 0 Then
    conn.RollbackTrans
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "SETTINGS_SAVE_FAILED", "系统设置保存失败。", "valid", "same-origin"
  End If
  conn.CommitTrans
  On Error GoTo 0
  Session("nickname") = nickname
  Session.Timeout = idleMinutes
  AdminSecurityAudit "settings-save", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "password" And method = "POST" Then
  Dim oldPassword, newPassword
  oldPassword = CStr(Request.Form("old_password"))
  newPassword = CStr(Request.Form("new_password"))
  If Len(oldPassword) = 0 Or Len(newPassword) < 8 Or Len(newPassword) > 128 Then
    AdminSecurityFail 400, "INVALID_PASSWORD", "请填写旧密码，新密码长度须为 8 至 128 字符。", "valid", "same-origin"
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT id FROM webwindows_users WHERE id=? AND username='admin' AND password=MD5(?) LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , adminId)
  cmd.Parameters.Append cmd.CreateParameter("password", 200, 1, 128, oldPassword)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 400, "OLD_PASSWORD_INVALID", "旧密码不正确。", "valid", "same-origin"
  rs.Close
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "UPDATE webwindows_users SET password=MD5(?) WHERE id=? AND username='admin'"
  cmd.Parameters.Append cmd.CreateParameter("password", 200, 1, 128, newPassword)
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , adminId)
  cmd.Execute
  AdminSecurityAudit "admin-password", "success", "valid", AdminSecurityOriginCategory()
  AdminSecurityInvalidate
  Session("webwindows_admin") = False
  Response.Write "{""success"":true,""relogin"":true}"
  Response.End
End If

If action = "logs" And method = "GET" Then
  Set rs = conn.Execute("SELECT id,actor_id,action_name,result_name," & _
    "DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%s') AS created_at " & _
    "FROM webwindows_admin_audit ORDER BY id DESC LIMIT 100")
  json = "["
  Do Until rs.EOF
    If Len(json) > 1 Then json = json & ","
    Dim actorJson
    actorJson = "null"
    If Not IsNull(rs("actor_id")) Then actorJson = CStr(CLng(rs("actor_id")))
    json = json & "{""id"":" & CLng(rs("id")) & ",""actor_id"":" & actorJson & _
      ",""action"":""" & AdminSecurityJson(rs("action_name")) & _
      """,""result"":""" & AdminSecurityJson(rs("result_name")) & _
      """,""time"":""" & AdminSecurityJson(rs("created_at")) & """}"
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "]"
  Response.End
End If

AdminSecurityFail 400, "INVALID_ACTION", "不支持的设置操作。", "not-checked", "not-checked"
%>
