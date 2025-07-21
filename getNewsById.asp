<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
On Error Resume Next

id = Request.QueryString("id")
If id = "" Then
  Response.Write "{""error"":""缺少ID""}"
  Response.End
End If

sql = "SELECT id, title, category, created_at, content FROM webwindows_news WHERE id=" & id
Set rs = conn.Execute(sql)

If rs.EOF Then
  Response.Write "{""error"":""新闻不存在""}"
  Response.End
End If

json = "{"
json = json & """id"":" & rs("id") & ","
json = json & """title"":""" & rs("title") & ""","
json = json & """category"":""" & rs("category") & ""","
json = json & """created_at"":""" & rs("created_at") & ""","
json = json & """content"":""" & Replace(rs("content"), """", "\""") & """"
json = json & "}"

Response.Write json

rs.Close
conn.Close
%>
