<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<!--#include file="inc/json-charset.asp"-->
<%
Response.CodePage = 65001
' 同 admin-security.asp 的 AdminSecurityJson：不赌 IsNull，转不成字符串就降级为空串。
Function JsonText(ByVal value)
  Dim result, convertedCode
  result = ""
  If Not IsNull(value) And Not IsEmpty(value) Then
    If VarType(value) <> vbObject Then
      On Error Resume Next
      Err.Clear
      result = CStr(value)
      convertedCode = Err.Number
      Err.Clear
      On Error GoTo 0
      If convertedCode <> 0 Then result = ""
    End If
  End If
  result = Replace(result, "\", "\\")
  result = Replace(result, Chr(34), "\" & Chr(34))
  result = Replace(result, vbCrLf, "\n")
  result = Replace(result, vbCr, "\n")
  result = Replace(result, vbLf, "\n")
  JsonText = result
End Function
Dim rs, json
Set rs = conn.Execute("SELECT id,IFNULL(title,'') AS title,IFNULL(category,'') AS category," & _
  "IFNULL(DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i:%s'),'') AS created_at " & _
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
