<%@ Language=VBScript CodePage=65001 %>
<%
Option Explicit
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "application/json"
Response.AddHeader "Access-Control-Allow-Origin", "*"
Response.AddHeader "Access-Control-Allow-Methods", "GET, OPTIONS"
Response.AddHeader "Cache-Control", "no-store, no-cache, must-revalidate"

If UCase(CStr(Request.ServerVariables("REQUEST_METHOD"))) = "OPTIONS" Then
  Response.Status = "204 No Content"
  Response.End
End If

On Error Resume Next
Dim manifestPath, stream, payload
manifestPath = Server.MapPath("../deploy/ftp-manifest.json")
Set stream = Server.CreateObject("ADODB.Stream")
stream.Type = 2
stream.Charset = "utf-8"
stream.Open
stream.LoadFromFile manifestPath
payload = stream.ReadText
stream.Close
Set stream = Nothing

If Err.Number <> 0 Or Len(Trim(CStr(payload))) = 0 Then
  Err.Clear
  Response.Status = "503 Service Unavailable"
  Response.Write "{""error"":{""message"":""Release information is unavailable.""}}"
Else
  Response.Write payload
End If
On Error GoTo 0
%>
