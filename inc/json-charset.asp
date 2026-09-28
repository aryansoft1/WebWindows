<%
' Connector/ODBC configures encoding when opening the connection and rejects
' SET NAMES. Verify the write session instead of changing it behind the driver.
Dim jsonCharsetError, jsonCharsetApplied, jsonCharsetRs
jsonCharsetError = ""
jsonCharsetApplied = False
On Error Resume Next
Err.Clear
If IsObject(conn) Then
  If conn.State <> 0 Then
    Set jsonCharsetRs = conn.Execute("SELECT @@character_set_client AS cs_client," & _
      "@@character_set_connection AS cs_conn")
    If Err.Number <> 0 Then
      jsonCharsetError = CStr(Err.Number) & ": " & CStr(Err.Description)
      Err.Clear
    ElseIf Not jsonCharsetRs.EOF Then
      jsonCharsetApplied = JsonCharsetIsUtf8(jsonCharsetRs("cs_client")) And _
        JsonCharsetIsUtf8(jsonCharsetRs("cs_conn"))
      If Not jsonCharsetApplied Then jsonCharsetError = "session is not UTF-8"
    Else
      jsonCharsetError = "no session charset row"
    End If
    If IsObject(jsonCharsetRs) Then jsonCharsetRs.Close
    Set jsonCharsetRs = Nothing
  Else
    jsonCharsetError = "connection is closed"
  End If
Else
  jsonCharsetError = "no connection object"
End If
Err.Clear
On Error GoTo 0
Response.ContentType = "application/json; charset=utf-8"
Response.Charset = "utf-8"

Function JsonCharsetIsUtf8(ByVal value)
  Dim charset
  charset = LCase(Trim(CStr(value)))
  JsonCharsetIsUtf8 = (charset = "utf8" Or charset = "utf8mb3" Or charset = "utf8mb4")
End Function
%>
