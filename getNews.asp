<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>

<!--#include file="inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"

If Err.Number <> 0 Then
  Response.Write "连接失败：" & Err.Description
  Response.End
End If

Response.ContentType = "application/json"

sql = "SELECT id, title, category, created_at FROM webwindows_news ORDER BY created_at DESC"
Dim rs
Set rs = conn.Execute(sql)


data = "["
Do Until rs.EOF
  data = data & "{""id"":" & rs("id") & ",""title"":""" & rs("title") & """,""category"":""" & rs("category") & """,""created_at"":""" & rs("created_at") & """},"
  rs.MoveNext
Loop
If Right(data,1)="," Then data = Left(data, Len(data)-1)
data = data & "]"

Response.Write data

rs.Close
conn.Close
%>
