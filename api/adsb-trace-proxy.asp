<%@ Language=VBScript EnableSessionState=False CodePage=65001 %>
<%
Option Explicit

Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-store"

Dim hex
hex = LCase(Trim(Request.QueryString("hex")))

Dim mode
mode = LCase(Trim(Request.QueryString("mode")))

If mode <> "recent" And mode <> "full" Then
    mode = "full"
End If

Dim re
Set re = New RegExp
re.Pattern = "^[0-9a-f]{6}$"
re.IgnoreCase = True

If Not re.Test(hex) Then
    Response.Status = "400 Bad Request"
    Response.Write "{""error"":{""code"":""invalid_hex""}}"
    Response.End
End If

' tar1090 trace 目录使用 ICAO hex 最后两位作为子目录
Dim bucket
bucket = Right(hex, 2)

'
' 先验证 ADSB.lol 当前公开 tar1090 trace URL。
' 如果浏览器直接访问此路径返回 200，则保持。
' 如果 ADSB.lol 后续更换 hostname，只需改这里。
'
Dim upstream
upstream = "https://adsb.lol/data/traces/" & _
           bucket & _
           "/trace_" & mode & "_" & _
           hex & _
           ".json"

Dim http
Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")

On Error Resume Next

http.setTimeouts 5000, 5000, 12000, 12000
http.open "GET", upstream, False
http.setRequestHeader "Accept", "application/json"
http.send

If Err.Number <> 0 Then
    Err.Clear
    Response.Status = "502 Bad Gateway"
    Response.Write "{""error"":{""code"":""trace_upstream_failed""}}"
    Response.End
End If

On Error GoTo 0

If http.status = 404 Then
    Response.Status = "404 Not Found"
    Response.Write "{""error"":{""code"":""trace_not_found""}}"
    Response.End
End If

If http.status < 200 Or http.status >= 300 Then
    Response.Status = "502 Bad Gateway"
    Response.Write "{""error"":{""code"":""trace_provider_error"",""status"":" & http.status & "}}"
    Response.End
End If

Dim contentType
contentType = http.getResponseHeader("Content-Type")

Dim contentEncoding
contentEncoding = http.getResponseHeader("Content-Encoding")

Dim stream
Set stream = Server.CreateObject("ADODB.Stream")

stream.Type = 1
stream.Open
stream.Write http.responseBody
stream.Position = 0

Dim bytes
bytes = stream.Read

stream.Close
Set stream = Nothing

Response.Status = "200 OK"
Response.ContentType = "application/json; charset=utf-8"
Response.AddHeader "Content-Encoding", "gzip"
Response.BinaryWrite bytes
Response.End
%>