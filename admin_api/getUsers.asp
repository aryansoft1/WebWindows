<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001

Dim rs, sql, json
sql = "SELECT u.*, d.name AS data_center_name " & _
      "FROM webwindows_users u LEFT JOIN webwindows_datacenters d ON u.data_center_id = d.id " & _
      "ORDER BY u.id DESC"

Set rs = conn.Execute(sql)

json = "["
Do Until rs.EOF
  json = json & "{" & _
         """id"":" & rs("id") & "," & _
         """username"":""" & Replace(rs("username") & "", """", "\""") & """," & _
         """nickname"":""" & Replace(rs("nickname") & "", """", "\""") & """," & _
         """avatar"":""" & Replace(rs("avatar") & "", """", "\""") & """," & _
         """email"":""" & Replace(rs("email") & "", """", "\""") & """," & _
         """data_center_id"":" & (rs("data_center_id") & 0) & "," & _
         """data_center_name"":""" & Replace(rs("data_center_name") & "", """", "\""") & """," & _
         """expired_at"":""" & Replace(rs("expired_at") & "", """", "\""") & """" & _
         "},"
  rs.MoveNext
Loop

If Right(json, 1) = "," Then json = Left(json, Len(json) - 1)
json = json & "]"

Response.Write json
%>
