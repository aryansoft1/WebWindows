<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Option Explicit
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"

Const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
Const API_MODEL = "glm-4.7-flash"
Const API_KEY_ENV = "BIGMODEL_API_KEY"
Const MAX_REQUEST_BYTES = 1048576

If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
  Response.Status = "405 Method Not Allowed"
  Response.AddHeader "Allow", "POST"
  Response.Write "{""error"":{""message"":""Only POST is supported.""}}"
  Response.End
End If

Dim apiKey : apiKey = GetServerSecret(API_KEY_ENV)
If Len(apiKey) = 0 Then
  Response.Status = "503 Service Unavailable"
  Response.Write "{""error"":{""message"":""AI service is not configured.""}}"
  Response.End
End If

Dim byteCount : byteCount = Request.TotalBytes
If byteCount <= 0 Or byteCount > MAX_REQUEST_BYTES Then
  Response.Status = "413 Payload Too Large"
  Response.Write "{""error"":{""message"":""Request body is empty or too large.""}}"
  Response.End
End If

Dim requestBody : requestBody = BinaryToUtf8(Request.BinaryRead(byteCount))
requestBody = ForceModel(requestBody, API_MODEL)

On Error Resume Next
Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
If Err.Number <> 0 Then
  Err.Clear
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
End If
If Err.Number <> 0 Then FailProxy

http.setTimeouts 10000, 10000, 30000, 60000
http.open "POST", API_URL, False
http.setRequestHeader "Content-Type", "application/json"
http.setRequestHeader "Authorization", "Bearer " & apiKey
http.send requestBody

If Err.Number <> 0 Then FailProxy

Dim upstreamStatus : upstreamStatus = http.status
If upstreamStatus < 200 Or upstreamStatus >= 300 Then
  Response.Status = CStr(upstreamStatus) & " Upstream Error"
Else
  Response.Status = "200 OK"
End If
Response.Write http.responseText

Function BinaryToUtf8(binaryData)
  Dim stream : Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.Write binaryData
  stream.Position = 0
  stream.Type = 2
  stream.Charset = "utf-8"
  BinaryToUtf8 = stream.ReadText
  stream.Close
  Set stream = Nothing
End Function

Function ForceModel(json, model)
  Dim re : Set re = New RegExp
  re.Pattern = "(""model""\s*:\s*"")[^""]*("")"
  re.IgnoreCase = True
  re.Global = False

  If re.Test(json) Then
    ForceModel = re.Replace(json, "$1" & model & "$2")
  ElseIf Left(Trim(json), 1) = "{" Then
    ForceModel = "{""model"":""" & model & """," & Mid(Trim(json), 2)
  Else
    ForceModel = json
  End If
End Function

Function GetServerSecret(name)
  On Error Resume Next
  Dim value : value = Request.ServerVariables(name)
  If Len(value) = 0 Then
    Dim shell : Set shell = Server.CreateObject("WScript.Shell")
    If Err.Number = 0 Then value = shell.Environment("PROCESS")(name)
    Set shell = Nothing
  End If
  Err.Clear
  On Error GoTo 0
  GetServerSecret = Trim(value & "")
End Function

Sub FailProxy()
  Err.Clear
  On Error GoTo 0
  Response.Status = "502 Bad Gateway"
  Response.Write "{""error"":{""message"":""AI upstream request failed.""}}"
  Response.End
End Sub
%>
