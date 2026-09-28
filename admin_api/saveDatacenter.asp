<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireMutation "system-manager", "save-datacenter"
Dim idText, centerId, centerName, apiUrl, apiKey, description, enabledText, enabledValue
Dim quotaText, quotaMb, urlRegex, cmd, affected
idText = Trim(CStr(Request.Form("id")))
centerId = 0
If idText <> "" Then
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "数据中心编号无效。", "valid", "same-origin"
  On Error Resume Next
  centerId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "数据中心编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If centerId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "数据中心编号无效。", "valid", "same-origin"
End If
centerName = Trim(CStr(Request.Form("name")))
apiUrl = Trim(CStr(Request.Form("api_url")))
If Right(apiUrl, 1) = "/" Then apiUrl = Left(apiUrl, Len(apiUrl) - 1)
apiKey = Trim(CStr(Request.Form("api_key")))
description = Trim(CStr(Request.Form("description")))
enabledText = Trim(CStr(Request.Form("enabled")))
quotaText = Trim(CStr(Request.Form("user_quota_mb")))
If centerName = "" Or Len(centerName) > 100 Or Len(apiUrl) > 500 Or _
   Len(apiKey) > 255 Or Len(description) > 1000 Then
  AdminSecurityFail 400, "INVALID_DATACENTER", "请检查数据中心信息和字段长度。", "valid", "same-origin"
End If
Set urlRegex = New RegExp
urlRegex.Pattern = "^https://[a-z0-9][a-z0-9.-]+(:[0-9]{1,5})?(/[a-z0-9/_-]*)?$"
urlRegex.IgnoreCase = True
If Not urlRegex.Test(apiUrl) Or InStr(LCase(apiUrl), "localhost") > 0 Or _
   InStr(apiUrl, "..") > 0 Then
  AdminSecurityFail 400, "INVALID_API_URL", "接口地址须为有效的 HTTPS 域名。", "valid", "same-origin"
End If
If enabledText <> "0" And enabledText <> "1" Then
  AdminSecurityFail 400, "INVALID_ENABLED", "启用状态无效。", "valid", "same-origin"
End If
enabledValue = CLng(enabledText)
If Not IsNumeric(quotaText) Then
  AdminSecurityFail 400, "INVALID_QUOTA", "每用户基础容量无效。", "valid", "same-origin"
End If
On Error Resume Next
quotaMb = CLng(quotaText)
If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_QUOTA", "每用户基础容量无效。", "valid", "same-origin"
On Error GoTo 0
If quotaMb < 1 Or quotaMb > 1048576 Then
  AdminSecurityFail 400, "INVALID_QUOTA", "每用户基础容量须为 1 至 1048576 MB。", "valid", "same-origin"
End If

Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
If centerId = 0 Then
  cmd.CommandText = "INSERT INTO webwindows_datacenters " & _
    "(name,api_url,api_key,enabled,description,status,last_check_time,user_quota_mb) " & _
    "VALUES (?,?,?,?,?,'未知',NULL,?)"
ElseIf apiKey <> "" Then
  cmd.CommandText = "UPDATE webwindows_datacenters SET name=?,api_url=?,api_key=?," & _
    "enabled=?,description=?,user_quota_mb=? WHERE id=?"
Else
  cmd.CommandText = "UPDATE webwindows_datacenters SET name=?,api_url=?," & _
    "enabled=?,description=?,user_quota_mb=? WHERE id=?"
End If
cmd.Parameters.Append cmd.CreateParameter("name", 200, 1, 100, centerName)
cmd.Parameters.Append cmd.CreateParameter("url", 200, 1, 500, apiUrl)
If centerId = 0 Or apiKey <> "" Then cmd.Parameters.Append cmd.CreateParameter("key", 200, 1, 255, apiKey)
cmd.Parameters.Append cmd.CreateParameter("enabled", 3, 1, , enabledValue)
cmd.Parameters.Append cmd.CreateParameter("description", 200, 1, 1000, description)
cmd.Parameters.Append cmd.CreateParameter("quota", 3, 1, , quotaMb)
If centerId > 0 Then cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , centerId)
On Error Resume Next
cmd.Execute affected
If Err.Number <> 0 Then
  Err.Clear
  On Error GoTo 0
  AdminSecurityFail 500, "DATACENTER_SAVE_FAILED", "数据中心保存失败。", "valid", "same-origin"
End If
On Error GoTo 0
AdminSecurityAudit "save-datacenter", "success", "valid", AdminSecurityOriginCategory()
Response.Write "{""success"":true}"
%>
