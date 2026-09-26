<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Function JsonText(ByVal value)
  Dim result
  If IsNull(value) Then result = "" Else result = CStr(value)
  result = Replace(result, "\", "\\")
  result = Replace(result, Chr(34), "\" & Chr(34))
  result = Replace(result, vbCrLf, "\n")
  result = Replace(result, vbCr, "\n")
  result = Replace(result, vbLf, "\n")
  JsonText = result
End Function
Dim rs, json
Set rs = conn.Execute("SELECT id,title,category," & _
  "DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i:%s') AS created_at " & _
  "FROM webwindows_news WHERE COALESCE(publish_at,created_at)<=NOW() " & _
  "ORDER BY COALESCE(publish_at,created_at) DESC,id DESC LIMIT 500")
json = "["
Do Until rs.EOF
  If Len(json) > 1 Then json = json & ","
  json = json & "{""id"":" & CLng(rs("id")) & _
    ",""title"":""" & JsonText(rs("title")) & _
    """,""category"":""" & JsonText(rs("category")) & _
    """,""created_at"":""" & JsonText(rs("created_at")) & """}"
  rs.MoveNext
Loop
rs.Close
Response.Write json & "]"
%>
