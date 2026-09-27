<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="inc/conn.asp"-->
<!--#include file="inc/json-charset.asp"-->
<%
Response.CodePage = 65001

' 这个接口以前整页 500，报「无效使用 Null: 'CStr'」。原因不是普通 NULL：
' 普通 NULL 会被 IsNull 挡住，驱动交给 VBScript 的是 DBNull，而
' IsNull(DBNull) 为 False、CStr(DBNull) 抛错 —— 判空挡不住。
' SQL 层已经用 IFNULL 归一，这里再加一层不依赖 IsNull 的转换兜底：
' 任何转不成字符串的取值都变成空串，并把字段名记进 jsonFault。
' 页面从此不会因为一个空字段整页 500，而且真出问题时能一眼看出是哪个字段。
Dim jsonFault
jsonFault = ""

Function JsonText(ByVal value, ByVal fieldName)
  Dim result, convertedCode, convertedDescription
  result = ""
  If Not IsNull(value) And Not IsEmpty(value) Then
    If VarType(value) = vbObject Then
      ' DBNull 在 VBScript 里是一个对象：IsNull 认不出它，但 CStr 会抛错。
      If jsonFault = "" Then jsonFault = fieldName & "=vbObject"
    Else
      On Error Resume Next
      Err.Clear
      result = CStr(value)
      convertedCode = Err.Number
      convertedDescription = CStr(Err.Description)
      Err.Clear
      On Error GoTo 0
      If convertedCode <> 0 Then
        If jsonFault = "" Then jsonFault = fieldName & "=err" & CStr(convertedCode) & ":" & convertedDescription
        result = ""
      End If
    End If
  End If
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
cmd.CommandText = "SELECT id,IFNULL(title,'') AS title," & _
  "IFNULL(category,'') AS category,IFNULL(content,'') AS content," & _
  "IFNULL(DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i:%s'),'') AS created_at " & _
  "FROM webwindows_news WHERE id=? AND COALESCE(publish_at,created_at)<=NOW() LIMIT 1"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
Set rs = cmd.Execute
If rs.EOF Then
  Response.Status = "404 Not Found"
  Response.Write "{""error"":""新闻不存在或尚未到发布时间""}"
  Response.End
End If
Response.Write "{""id"":" & CLng(rs("id")) & _
  ",""title"":""" & JsonText(rs("title"), "title") & _
  """,""category"":""" & JsonText(rs("category"), "category") & _
  """,""created_at"":""" & JsonText(rs("created_at"), "created_at") & _
  """,""content"":""" & JsonText(rs("content"), "content") & """"
If jsonFault <> "" Then Response.Write ",""fault"":""" & jsonFault & """"
Response.Write "}"
rs.Close
%>
