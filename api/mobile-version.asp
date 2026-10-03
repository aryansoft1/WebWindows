<%@ Language=VBScript CodePage=65001 %>
<%
Option Explicit
Response.Buffer = True
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "application/json"
Response.Expires = -1
Response.AddHeader "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"

On Error Resume Next
Dim manifestPath, stream, payload, expression, matches, releaseVersion
manifestPath = Server.MapPath("../deploy/ftp-manifest.json")
Set stream = Server.CreateObject("ADODB.Stream")
stream.Type = 2
stream.Charset = "utf-8"
stream.Open
stream.LoadFromFile manifestPath
payload = stream.ReadText
stream.Close
Set stream = Nothing

releaseVersion = ""
If Err.Number = 0 And Len(Trim(CStr(payload))) > 0 Then
  Set expression = New RegExp
  expression.Pattern = """releaseVersion""\s*:\s*""([A-Za-z0-9._-]{1,128})"""
  expression.IgnoreCase = True
  expression.Global = False
  Set matches = expression.Execute(payload)
  If matches.Count > 0 Then releaseVersion = CStr(matches(0).SubMatches(0))
  Set matches = Nothing
  Set expression = Nothing
End If

If Err.Number <> 0 Or releaseVersion = "" Then
  Err.Clear
  Response.Status = "503 Service Unavailable"
  Response.Write "{""error"":{""message"":""Mobile release information is unavailable.""}}"
Else
  Response.Write "{""version"":""" & releaseVersion & """,""entry"":""/"",""source"":""deploy/ftp-manifest.json""}"
End If
On Error GoTo 0
%>
