<%
' Database credentials are deployment secrets inherited by the IIS worker process.
' No HTTP header, query, form, cookie, or checked-in fallback can override this value.
Dim conn, connStr, connShell, connEnvironment, connError
connStr = ""
On Error Resume Next
Set connShell = Server.CreateObject("WScript.Shell")
Set connEnvironment = connShell.Environment("PROCESS")
connStr = Trim(CStr(connEnvironment("WEBWINDOWS_DB_CONNECTION_STRING")))
Set connEnvironment = Nothing
Set connShell = Nothing
If Err.Number <> 0 Then
  Err.Clear
  connStr = ""
End If
On Error GoTo 0

If connStr = "" Then
  Response.Status = "503 Service Unavailable"
  Response.ContentType = "application/json"
  Response.Write "{""ok"":false,""code"":""DATABASE_CONFIG_REQUIRED"",""message"":""WebWindows 数据库部署配置不可用。""}"
  Response.End
End If

Set conn = Server.CreateObject("ADODB.Connection")
conn.ConnectionTimeout = 15
conn.CommandTimeout = 30
On Error Resume Next
conn.Open connStr
If Err.Number <> 0 Then
  connError = Err.Number
  Err.Clear
  On Error GoTo 0
  Set conn = Nothing
  Response.Status = "503 Service Unavailable"
  Response.ContentType = "application/json"
  Response.Write "{""ok"":false,""code"":""DATABASE_UNAVAILABLE"",""message"":""WebWindows 数据库暂不可用。""}"
  Response.AppendToLog "&wdb=connection-failed&we=" & Server.URLEncode(CStr(connError))
  Response.End
End If
On Error GoTo 0
%>
