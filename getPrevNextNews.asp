<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Dim idText, newsId, direction, comparison, ordering, cmd, rs, title
idText = Trim(CStr(Request.QueryString("id")))
direction = LCase(Trim(CStr(Request.QueryString("dir"))))
If Not IsNumeric(idText) Or (direction <> "prev" And direction <> "next") Then
  Response.Status = "400 Bad Request"
  Response.Write "{""error"":""参数无效""}"
  Response.End
End If
On Error Resume Next
newsId = CLng(idText)
If Err.Number <> 0 Then
  Response.Status = "400 Bad Request"
  Response.Write "{""error"":""参数无效""}"
  Response.End
End If
On Error GoTo 0
If newsId <= 0 Then
  Response.Status = "400 Bad Request"
  Response.Write "{""error"":""参数无效""}"
  Response.End
End If
comparison = "<"
ordering = "DESC"
If direction = "next" Then
  comparison = ">"
  ordering = "ASC"
End If
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "SELECT id,title FROM webwindows_news WHERE id " & comparison & _
  " ? AND COALESCE(publish_at,created_at)<=NOW() ORDER BY id " & ordering & " LIMIT 1"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
Set rs = cmd.Execute
If rs.EOF Then
  Response.Write "{""error"":""无相关新闻""}"
Else
  title = CStr(rs("title"))
  title = Replace(title, "\", "\\")
  title = Replace(title, Chr(34), "\" & Chr(34))
  title = Replace(title, vbCrLf, "\n")
  title = Replace(title, vbCr, "\n")
  title = Replace(title, vbLf, "\n")
  Response.Write "{""id"":" & CLng(rs("id")) & ",""title"":""" & title & """}"
End If
rs.Close
%>
