<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireRead "system-manager", "get-datacenters"
Dim rs, json, enabledValue, checkTime, quotaValue
Set rs = conn.Execute("SELECT id,name,api_url,api_key,enabled,description,status," & _
  "last_check_time,last_check_detail,user_quota_mb FROM webwindows_datacenters ORDER BY id ASC")
json = "["
Do Until rs.EOF
  If Len(json) > 1 Then json = json & ","
  enabledValue = "false"
  If CBool(rs("enabled")) Then enabledValue = "true"
  checkTime = ""
  If Not IsNull(rs("last_check_time")) Then checkTime = CStr(rs("last_check_time"))
  quotaValue = 1024
  If Not IsNull(rs("user_quota_mb")) Then quotaValue = CLng(rs("user_quota_mb"))
  json = json & "{""id"":" & CLng(rs("id")) & _
    ",""name"":""" & AdminSecurityJson(rs("name")) & _
    """,""api_url"":""" & AdminSecurityJson(rs("api_url")) & _
    """,""api_key_configured"":" & LCase(CStr(Len(CStr(rs("api_key") & "")) > 0)) & _
    ",""enabled"":" & enabledValue & _
    ",""description"":""" & AdminSecurityJson(rs("description")) & _
    """,""user_quota_mb"":" & quotaValue & _
    ",""last_check_time"":""" & AdminSecurityJson(checkTime) & _
    """,""last_check_detail"":""" & AdminSecurityJson(rs("last_check_detail")) & _
    """,""status"":""" & AdminSecurityJson(rs("status")) & """}"
  rs.MoveNext
Loop
rs.Close
Response.Write json & "]"
%>
