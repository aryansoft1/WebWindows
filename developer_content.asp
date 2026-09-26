<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Response.CacheControl = "no-cache"
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
Set rs = conn.Execute("SELECT content_type,slug,version_number,title,body,sample_url," & _
  "DATE_FORMAT(published_at,'%Y-%m-%d %H:%i') AS published_at " & _
  "FROM webwindows_developer_content WHERE status='published' " & _
  "ORDER BY content_type,title LIMIT 200")
json = "["
Do Until rs.EOF
  If Len(json) > 1 Then json = json & ","
  json = json & "{""type"":""" & JsonText(rs("content_type")) & _
    """,""slug"":""" & JsonText(rs("slug")) & _
    """,""version"":" & CLng(rs("version_number")) & _
    ",""title"":""" & JsonText(rs("title")) & _
    """,""body"":""" & JsonText(rs("body")) & _
    """,""sampleUrl"":""" & JsonText(rs("sample_url")) & _
    """,""publishedAt"":""" & JsonText(rs("published_at")) & """}"
  rs.MoveNext
Loop
rs.Close
Response.Write json & "]"
%>
