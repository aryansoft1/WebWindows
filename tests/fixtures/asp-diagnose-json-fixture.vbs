' Fixture for tests/asp-diagnose-json-runnable-smoke.ps1.
'
' It exists as a plain .vbs file rather than inside a PowerShell here-string
' because VBScript doubles quotes inside string literals, and interleaving that
' with PowerShell's own escaping produced harnesses that did not compile. Read
' verbatim, this file behaves.
'
' It stands in for the two queries news.asp runs. The values below are what
' production is expected to report, and the page asserts against these exact
' names, so a rename in either place shows up here.

Function Esc(ByVal v)
  Esc = Chr(34) & Replace(CStr(v), Chr(34), "\") & Chr(34)
End Function

' The readings the @@character_set query would have returned. The connection is
' healthy here -- results really is utf8mb4 -- and that is the case the probe has
' to get right, because a healthy connection with broken output is the situation
' that was misdiagnosed twice.
Function ConnectionReadings(alias)
  Select Case alias
    Case "cs_client":  ConnectionReadings = "utf8mb4"
    Case "cs_conn":    ConnectionReadings = "utf8mb4"
    Case "cs_results": ConnectionReadings = "utf8mb4"
    Case "cs_db":      ConnectionReadings = "utf8mb4"
    Case "version":    ConnectionReadings = "5.7.44-log"
    Case "cs_default": ConnectionReadings = "latin1"
    Case Else
      Err.Raise 5, "fixture", "no reading for connection alias " & alias
  End Select
End Function

Function ColumnReadings(alias)
  Select Case alias
    Case "t": ColumnReadings = "webwindows_news_categories"
    Case "c": ColumnReadings = "name"
    Case "cs": ColumnReadings = "utf8mb4"
    Case "co": ColumnReadings = "utf8mb4_unicode_ci"
    Case "dt": ColumnReadings = "varchar"
    Case Else
      Err.Raise 5, "fixture", "no reading for column alias " & alias
  End Select
End Function

' Close the connection object the way news.asp does: append the readings gathered
' separately, then the brace. A branch that forgets this step emits an unterminated
' object, which is exactly the defect this fixture exists to be able to reproduce.
Sub FinishConnection()
  csJson = csJson & csRead & "}"
End Sub

Sub EmitConnectionOnly()
  WScript.Echo "{""connection"":" & csJson & ",""columns"": [" & colRead & "]}"
End Sub
