<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
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

Dim id, name, api_url, api_key, enabled, description, status
id = Request.Form("id")
name = SafeStr(Request.Form("name"))
api_url = SafeStr(Request.Form("api_url"))
api_key = SafeStr(Request.Form("api_key"))
enabled = Request.Form("enabled")
description = SafeStr(Request.Form("description"))
status = Request.Form("status")

If status = "" Then status = "未知"

If name = "" Or api_url = "" Then
  Response.Write "{""success"":false,""error"":""名称和接口地址不能为空""}"
  Response.End
End If

If enabled = "" Then enabled = 1

On Error Resume Next


If id = "" Then
  ' 新增
  sql = "INSERT INTO webwindows_datacenters " & _
        "(name, api_url, api_key, enabled, description, status, last_check_time) VALUES (" & _
        "'" & name & "', '" & api_url & "', '" & api_key & "', " & enabled & ", '" & description & "', '" & status & "', NULL)"
Else
  ' 更新
  sql = "UPDATE webwindows_datacenters SET " & _
        "name='" & name & "', " & _
        "api_url='" & api_url & "', " & _
        "api_key='" & api_key & "', " & _
        "enabled=" & enabled & ", " & _
        "description='" & description & "', " & _
        "status='" & status & "' " & _
        "WHERE id=" & CLng(id)
End If
 conn.Execute(sql)

If Err.Number <> 0 Then
  Response.Write "{""success"":false,""error"":""" & Replace(Err.Description, """", "'") & """}"
Else
  Response.Write "{""success"":true}"
End If
%>
