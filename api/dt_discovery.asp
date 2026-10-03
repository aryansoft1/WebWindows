<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Option Explicit
%>
<!--#include file="../inc/conn.asp"-->
<%
On Error GoTo 0
Response.ContentType = "application/json"
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.CacheControl = "no-store"
Response.AddHeader "Pragma", "no-cache"

Function JsonText(ByVal value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

Sub WriteError(ByVal statusText, ByVal code, ByVal message)
  Response.Status = statusText
  Response.Write "{""ok"":false,""error"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  Response.End
End Sub

Function EnsurePreferenceTable()
  On Error Resume Next
  Err.Clear
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_desktalk_preferences (" & _
    "user_id BIGINT UNSIGNED NOT NULL," & _
    "undiscoverable TINYINT(1) NOT NULL DEFAULT 0," & _
    "updated_at DATETIME NOT NULL," & _
    "PRIMARY KEY (user_id)," & _
    "KEY idx_desktalk_undiscoverable (undiscoverable)" & _
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  EnsurePreferenceTable = (Err.Number = 0)
  Err.Clear
  On Error GoTo 0
End Function

Sub RemovePresence(ByVal accountId)
  Dim raw, records, output(), count, i, fields, recordId
  raw = CStr(Application("dtp_s"))
  records = Split(raw, "^")
  ReDim output(-1)
  count = -1
  For i = 0 To UBound(records)
    If Len(records(i)) > 0 Then
      fields = Split(records(i), "|")
      recordId = ""
      If UBound(fields) >= 0 Then recordId = fields(0)
      If StrComp(recordId, CStr(accountId), vbBinaryCompare) <> 0 Then
        count = count + 1
        ReDim Preserve output(count)
        output(count) = records(i)
      End If
    End If
  Next
  Application.Lock
  If count >= 0 Then
    Application("dtp_s") = Join(output, "^")
  Else
    Application("dtp_s") = ""
  End If
  Application.UnLock
End Sub

Dim userId
userId = Trim(CStr(Session("webwindows_user_id")))
If userId = "" Or Not IsNumeric(userId) Then
  Call WriteError("401 Unauthorized", "login_required", "请先登录 WebWindows。")
End If
userId = CStr(CLng(userId))

If Not EnsurePreferenceTable() Then
  Call WriteError("503 Service Unavailable", "privacy_store_unavailable", "发现设置暂时无法读取。")
End If

If UCase(Request.ServerVariables("REQUEST_METHOD")) = "POST" Then
  If Request.ServerVariables("HTTP_X_WEBWINDOWS_REQUEST") <> "desktalk-discovery" Then
    Call WriteError("403 Forbidden", "request_header_required", "请求验证失败。")
  End If
  Dim rawValue, undiscoverable, command
  rawValue = LCase(Trim(CStr(Request.Form("undiscoverable"))))
  If rawValue = "1" Or rawValue = "true" Then
    undiscoverable = 1
  ElseIf rawValue = "0" Or rawValue = "false" Then
    undiscoverable = 0
  Else
    Call WriteError("400 Bad Request", "invalid_undiscoverable", "undiscoverable 只能为 0 或 1。")
  End If

  Set command = Server.CreateObject("ADODB.Command")
  With command
    .ActiveConnection = conn
    .CommandType = 1
    .CommandText = "INSERT INTO webwindows_desktalk_preferences " & _
      "(user_id, undiscoverable, updated_at) VALUES (?, ?, NOW()) " & _
      "ON DUPLICATE KEY UPDATE undiscoverable=VALUES(undiscoverable), updated_at=NOW()"
    .Parameters.Append .CreateParameter("user_id", 3, 1, , CLng(userId))
    .Parameters.Append .CreateParameter("undiscoverable", 3, 1, , CInt(undiscoverable))
    .Execute
  End With
  Set command = Nothing
  If undiscoverable = 1 Then Call RemovePresence(userId)
End If

Dim rs, query, currentValue
Set query = Server.CreateObject("ADODB.Command")
With query
  .ActiveConnection = conn
  .CommandType = 1
  .CommandText = "SELECT undiscoverable FROM webwindows_desktalk_preferences WHERE user_id=? LIMIT 1"
  .Parameters.Append .CreateParameter("user_id", 3, 1, , CLng(userId))
  Set rs = .Execute
End With
currentValue = False
If Not rs.EOF Then currentValue = (CLng(0 & rs("undiscoverable")) <> 0)
Response.Write "{""ok"":true,""undiscoverable"":" & LCase(CStr(currentValue)) & "}"
rs.Close
Set rs = Nothing
Set query = Nothing
conn.Close
Set conn = Nothing
%>
