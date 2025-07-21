<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
On Error Resume Next

id = CLng(Request("id"))
dir = LCase(Request("dir"))

If dir = "prev" Then
  sql = "SELECT id, title FROM webwindows_news WHERE id < " & id & " ORDER BY id DESC limit 1"
Else
  sql = "SELECT id, title FROM webwindows_news WHERE id > " & id & " ORDER BY id ASC  limit 1"
End If

Set rs = conn.Execute(sql)

If rs.EOF Then
  Response.Write "{""error"":""无相关新闻""}"
Else
  Response.Write "{""id"":" & rs("id") & ",""title"":""" & rs("title") & """}"
End If

rs.Close
conn.Close
%>
