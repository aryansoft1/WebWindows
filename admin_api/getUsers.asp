<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireRead "system-manager", "get-users"
Dim rs, json, centerId
Set rs = conn.Execute("SELECT u.id,u.username,u.nickname,u.avatar,u.email,u.data_center_id," & _
  "d.name AS data_center_name FROM webwindows_users u " & _
  "LEFT JOIN webwindows_datacenters d ON u.data_center_id=d.id ORDER BY u.id DESC LIMIT 1000")
json = "["
Do Until rs.EOF
  centerId = 0
  If Not IsNull(rs("data_center_id")) Then centerId = CLng(rs("data_center_id"))
  If Len(json) > 1 Then json = json & ","
  json = json & "{""id"":" & CLng(rs("id")) & _
    ",""username"":""" & AdminSecurityJson(rs("username")) & _
    """,""nickname"":""" & AdminSecurityJson(rs("nickname")) & _
    """,""avatar"":""" & AdminSecurityJson(rs("avatar")) & _
    """,""email"":""" & AdminSecurityJson(rs("email")) & _
    """,""data_center_id"":" & centerId & _
    ",""data_center_name"":""" & AdminSecurityJson(rs("data_center_name")) & """}"
  rs.MoveNext
Loop
rs.Close
Response.Write json & "]"
%>
