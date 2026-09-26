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
Dim idText, newsId, cmd, rs
idText = Trim(CStr(Request.QueryString("id")))
If Not IsNumeric(idText) Then
  Response.Status = "400 Bad Request"
  Response.Write "{""error"":""新闻编号无效""}"
  Response.End
End If
On Error Resume Next
newsId = CLng(idText)
If Err.Number <> 0 Then
  Response.Status = "400 Bad Request"
  Response.Write "{""error"":""新闻编号无效""}"
  Response.End
End If
On Error GoTo 0
If newsId <= 0 Then
  Response.Status = "400 Bad Request"
  Response.Write "{""error"":""新闻编号无效""}"
  Response.End
End If
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "SELECT id,title,category,content," & _
  "DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i:%s') AS created_at " & _
  "FROM webwindows_news WHERE id=? AND COALESCE(publish_at,created_at)<=NOW() LIMIT 1"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
Set rs = cmd.Execute
If rs.EOF Then
  Response.Status = "404 Not Found"
  Response.Write "{""error"":""新闻不存在或尚未到发布时间""}"
  Response.End
End If
Response.Write "{""id"":" & CLng(rs("id")) & _
  ",""title"":""" & JsonText(rs("title")) & _
  """,""category"":""" & JsonText(rs("category")) & _
  """,""created_at"":""" & JsonText(rs("created_at")) & _
  """,""content"":""" & JsonText(rs("content")) & """}"
rs.Close
%>
