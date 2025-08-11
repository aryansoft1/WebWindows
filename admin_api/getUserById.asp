<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001

Dim id, sql, rs, json
id = CLng(Request("id"))

sql = "SELECT u.*, d.name AS data_center_name FROM webwindows_users u " & _
      "LEFT JOIN webwindows_datacenters d ON u.data_center_id = d.id " & _
      "WHERE u.id=" & id

Set rs = conn.Execute(sql)

If Not rs.EOF Then
  json = "{"
  json = json & """id"":" & rs("id") & ","
  json = json & """username"":""" & Replace(rs("username"), """", "\""") & ""","
  json = json & """nickname"":""" & Replace(rs("nickname"), """", "\""") & ""","
  json = json & """email"":""" & Replace(rs("email"), """", "\""") & ""","
  json = json & """avatar"":""" & Replace(rs("avatar"), """", "\""") & ""","
  json = json & """data_center_id"":" & (rs("data_center_id") & 0) & ","
  json = json & """data_center_name"":""" & Replace(rs("data_center_name") & "", """", "\""") & """"
  json = json & "}"
Else
  json = "{}"
End If

Response.Write json
%>
