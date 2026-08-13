<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="adminGuard.asp"-->
<%
RequireAdminMutation "datacenter-quota"
%>
<!--#include file="../inc/conn.asp"-->
<%
Response.CodePage = 65001
Response.CharSet = "UTF-8"
Response.ContentType = "application/json"
Server.ScriptTimeout = 30
conn.Execute("SET NAMES 'utf8'")

' 获取并转义输入参数（防止注入）
Function SafeStr(s)
  SafeStr = Replace(s, "'", "''") ' 将单引号替换为两个单引号
End Function

Dim id, name, api_url, api_key, enabled, description, status, quotaRaw, quotaMB
id = Trim(Request.Form("id"))
name = SafeStr(Request.Form("name"))
api_url = SafeStr(Request.Form("api_url"))
api_key = SafeStr(Request.Form("api_key"))
enabled = Request.Form("enabled")
description = SafeStr(Request.Form("description"))
status = Request.Form("status")
quotaRaw = Trim(Request.Form("user_quota_mb"))

If status = "" Then status = "未知"

If name = "" Or api_url = "" Then
  Response.Write "{""success"":false,""error"":""名称和接口地址不能为空""}"
  Response.End
End If

If Len(name) > 100 Or Len(api_url) > 500 Then
  Response.Status = "400 Bad Request"
  Response.Write "{""success"":false,""error"":""名称或接口地址过长""}"
  Response.End
End If

If LCase(Left(api_url, 7)) <> "http://" And LCase(Left(api_url, 8)) <> "https://" Then
  Response.Status = "400 Bad Request"
  Response.Write "{""success"":false,""error"":""接口地址必须使用 http 或 https""}"
  Response.End
End If

If id <> "" Then
  Dim invalidId
  invalidId = False
  If Not IsNumeric(id) Then
    invalidId = True
  ElseIf CDbl(id) <> Fix(CDbl(id)) Or CDbl(id) < 1 Or CDbl(id) > 2147483647 Then
    invalidId = True
  End If
  If invalidId Then
    Response.Status = "400 Bad Request"
    Response.Write "{""success"":false,""error"":""数据中心 ID 无效""}"
    Response.End
  End If
  id = CLng(id)
End If

If quotaRaw = "" Then quotaRaw = "1024"
If Not IsNumeric(quotaRaw) Then
  Response.Status = "400 Bad Request"
  Response.Write "{""success"":false,""error"":""用户配额必须是整数 MiB""}"
  Response.End
End If
If CDbl(quotaRaw) <> Fix(CDbl(quotaRaw)) Or CDbl(quotaRaw) < 1024 Or CDbl(quotaRaw) > 1048576 Then
  Response.Status = "400 Bad Request"
  Response.Write "{""success"":false,""error"":""用户配额范围为 1024 至 1048576 MiB""}"
  Response.End
End If
quotaMB = CLng(quotaRaw)

If enabled = "" Then enabled = "1"
If enabled <> "0" And enabled <> "1" Then
  Response.Status = "400 Bad Request"
  Response.Write "{""success"":false,""error"":""启用状态无效""}"
  Response.End
End If
If status <> "已启用" And status <> "维护中" And status <> "未知" Then
  Response.Status = "400 Bad Request"
  Response.Write "{""success"":false,""error"":""数据中心状态无效""}"
  Response.End
End If

On Error Resume Next

Dim schemaRs, hasQuotaColumn
hasQuotaColumn = False
Set schemaRs = Nothing
Set schemaRs = conn.Execute("SHOW COLUMNS FROM webwindows_datacenters LIKE 'user_quota_mb'")
If Err.Number = 0 Then
  If Not schemaRs.EOF Then hasQuotaColumn = True
End If
If Not schemaRs Is Nothing Then schemaRs.Close
Set schemaRs = Nothing
Err.Clear
If Not hasQuotaColumn Then
  Response.Status = "503 Service Unavailable"
  Response.Write "{""success"":false,""error"":{ " & _
    """code"":""MIGRATION_REQUIRED"",""message"":""请先执行数据中心配额数据库迁移""}}"
  Response.End
End If


If id = "" Then
  ' 新增
  sql = "INSERT INTO webwindows_datacenters " & _
        "(name, api_url, api_key, enabled, description, status, last_check_time, user_quota_mb) VALUES (" & _
        "'" & name & "', '" & api_url & "', '" & api_key & "', " & enabled & ", '" & description & "', '" & status & "', NULL, " & quotaMB & ")"
Else
  ' 更新
  sql = "UPDATE webwindows_datacenters SET " & _
        "name='" & name & "', " & _
        "api_url='" & api_url & "', " & _
        "enabled=" & enabled & ", " & _
        "status='" & status & "', " & _
        "user_quota_mb=" & quotaMB & " " & _
        "WHERE id=" & CLng(id)
End If
 conn.Execute(sql)

If Err.Number <> 0 Then
  Response.Write "{""success"":false,""error"":""" & Replace(Err.Description, """", "'") & """}"
Else
  Response.Write "{""success"":true}"
End If
%>
