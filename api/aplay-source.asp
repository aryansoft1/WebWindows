<%@ Language=VBScript EnableSessionState=False CodePage=65001 %>
<%
Option Explicit

Const APLAY_CACHE_TTL_SECONDS = 300
Const APLAY_MAX_RESPONSE_CHARS = 2097152
Const APLAY_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

Response.Charset = "utf-8"
Response.CacheControl = "no-store"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Dim requestMethod, sourceName, country, term, partitionId, channelId
Dim upstream, fallbackUpstream, contentType, cacheKey, body, upstreamStatus
requestMethod = UCase(Trim(Request.ServerVariables("REQUEST_METHOD")))
sourceName = LCase(Trim(Request.QueryString("source")))
country = LCase(Trim(Request.QueryString("country")))
term = Trim(Request.QueryString("term"))
partitionId = Trim(Request.QueryString("tid"))
channelId = Trim(Request.QueryString("id"))
upstream = ""
fallbackUpstream = ""
contentType = "application/json; charset=utf-8"
cacheKey = ""

If requestMethod <> "GET" Then SendError "405 Method Not Allowed", "method_not_allowed"

Select Case sourceName
  Case "apple-chart"
    If Not IsAllowedCountry(country) Then SendError "400 Bad Request", "invalid_country"
    upstream = "https://itunes.apple.com/" & country & "/rss/topsongs/limit=100/explicit=true/json"
    cacheKey = "webwindows.aplay.apple-chart." & country

  Case "apple-search"
    If Not IsAllowedCountry(country) Then SendError "400 Bad Request", "invalid_country"
    If Len(term) = 0 Or Len(term) > 180 Or HasControlCharacters(term) Then SendError "400 Bad Request", "invalid_search"
    upstream = "https://itunes.apple.com/search?term=" & Server.URLEncode(term) & "&entity=song&limit=10&country=" & country

  Case "bili-popular"
    upstream = "https://rsshub.bili.ren/bilibili/popular/all"
    fallbackUpstream = "https://rsshub.mt.cd/bilibili/popular/all"
    contentType = "application/xml; charset=utf-8"
    cacheKey = "webwindows.aplay.bili-popular"

  Case "bili-partition"
    If partitionId <> "3" And partitionId <> "188" Then SendError "400 Bad Request", "invalid_partition"
    upstream = "https://rsshub.bili.ren/bilibili/partion/" & partitionId
    fallbackUpstream = "https://rsshub.mt.cd/bilibili/partion/" & partitionId
    contentType = "application/xml; charset=utf-8"
    cacheKey = "webwindows.aplay.bili-partition." & partitionId

  Case "youtube-channel"
    If Not IsAllowedChannel(channelId) Then SendError "400 Bad Request", "invalid_channel"
    upstream = "https://www.youtube.com/feeds/videos.xml?channel_id=" & channelId
    fallbackUpstream = "https://rsshub.app/youtube/channel/" & channelId
    contentType = "application/atom+xml; charset=utf-8"
    cacheKey = "webwindows.aplay.youtube." & channelId

  Case Else
    SendError "400 Bad Request", "unsupported_source"
End Select

Dim cachedBody
cachedBody = ""
If Len(cacheKey) > 0 Then cachedBody = CacheRead(cacheKey, APLAY_CACHE_TTL_SECONDS)
If Len(cachedBody) > 0 Then
  If (sourceName = "bili-popular" Or sourceName = "bili-partition") And InStr(1, cachedBody, "<rss", vbTextCompare) > 0 Then contentType = "application/xml; charset=utf-8"
  WriteBody contentType, cachedBody
End If

body = HttpGetText(upstream, sourceName, upstreamStatus)
If Not IsValidSourceBody(sourceName, body) And Len(fallbackUpstream) > 0 Then
  body = HttpGetText(fallbackUpstream, sourceName, upstreamStatus)
  If Len(body) > 0 Then contentType = "application/xml; charset=utf-8"
End If

If Not IsValidSourceBody(sourceName, body) Then
  If Len(cacheKey) > 0 Then
    cachedBody = CacheRead(cacheKey, 21600)
    If Len(cachedBody) > 0 Then
      If (sourceName = "bili-popular" Or sourceName = "bili-partition") And InStr(1, cachedBody, "<rss", vbTextCompare) > 0 Then contentType = "application/xml; charset=utf-8"
      WriteBody contentType, cachedBody
    End If
  End If
  SendError "502 Bad Gateway", "source_unavailable"
End If

If Len(cacheKey) > 0 Then CacheWrite cacheKey, body
WriteBody contentType, body

Function IsAllowedCountry(ByVal value)
  IsAllowedCountry = (value = "cn" Or value = "tw" Or value = "hk" Or value = "sg" Or value = "us" Or value = "jp" Or value = "ca" Or value = "gb")
End Function

Function IsAllowedChannel(ByVal value)
  IsAllowedChannel = (value = "UC-9-kyTW8ZkZNDHQJ6FgpwQ" Or value = "UCXuqSBlHAE6Xw-yeJA0Tunw" Or value = "UCSJ4gkVC6NrvII8umztf0Ow")
End Function

Function HasControlCharacters(ByVal value)
  Dim i, code
  HasControlCharacters = False
  For i = 1 To Len(value)
    code = AscW(Mid(value, i, 1))
    If code >= 0 And code < 32 Then
      HasControlCharacters = True
      Exit Function
    End If
  Next
End Function

Function IsValidSourceBody(ByVal kind, ByVal value)
  Dim normalizedBody
  IsValidSourceBody = False
  If IsNull(value) Then Exit Function
  If IsEmpty(value) Then Exit Function
  normalizedBody = LCase(CStr(value))
  If Len(normalizedBody) = 0 Then Exit Function
  If Len(normalizedBody) > APLAY_MAX_RESPONSE_CHARS Then Exit Function
  Select Case kind
    Case "apple-chart", "apple-search"
      IsValidSourceBody = (InStr(normalizedBody, """results""") > 0 Or InStr(normalizedBody, """feed""") > 0)
    Case "bili-popular"
      IsValidSourceBody = (InStr(normalizedBody, """code"":0") > 0 Or InStr(normalizedBody, """code"": 0") > 0) And InStr(normalizedBody, """list""") > 0
      If Not IsValidSourceBody And InStr(normalizedBody, "<rss") > 0 And InStr(normalizedBody, "<item") > 0 Then IsValidSourceBody = True
    Case "bili-partition"
      IsValidSourceBody = (InStr(normalizedBody, """code"":0") > 0 Or InStr(normalizedBody, """code"": 0") > 0) And (InStr(normalizedBody, """archives""") > 0 Or InStr(normalizedBody, """list""") > 0)
      If Not IsValidSourceBody And InStr(normalizedBody, "<rss") > 0 And InStr(normalizedBody, "<item") > 0 Then IsValidSourceBody = True
    Case "youtube-channel"
      IsValidSourceBody = (InStr(normalizedBody, "<feed") > 0 And InStr(normalizedBody, "</feed>") > 0) Or (InStr(normalizedBody, "<rss") > 0 And InStr(normalizedBody, "</rss>") > 0)
  End Select
End Function

Function HttpGetText(ByVal url, ByVal kind, ByRef statusCode)
  HttpGetText = ""
  statusCode = 0

  Dim http
  On Error Resume Next
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
  End If
  If Err.Number <> 0 Or http Is Nothing Then
    Err.Clear
    On Error GoTo 0
    Exit Function
  End If

  http.setTimeouts 5000, 5000, 12000, 15000
  http.open "GET", url, False
  http.setRequestHeader "User-Agent", APLAY_USER_AGENT
  http.setRequestHeader "Accept", "application/json, application/atom+xml, application/rss+xml, application/xml, text/xml, */*"
  If kind = "bili-popular" Or kind = "bili-partition" Then http.setRequestHeader "Referer", "https://www.bilibili.com/"
  http.send
  If Err.Number = 0 Then
    statusCode = CLng(http.status)
    If statusCode >= 200 And statusCode < 300 Then HttpGetText = CStr(http.responseText)
  End If
  Err.Clear
  Set http = Nothing
  On Error GoTo 0
End Function

Function CacheRead(ByVal key, ByVal maxAgeSeconds)
  CacheRead = ""
  On Error Resume Next
  Application.Lock
  Dim storedAt
  storedAt = Application(key & ".at")
  If Err.Number = 0 And IsDate(storedAt) Then
    If DateDiff("s", CDate(storedAt), Now()) <= maxAgeSeconds Then CacheRead = CStr(Application(key) & "")
  End If
  Application.Unlock
  Err.Clear
  On Error GoTo 0
End Function

Sub CacheWrite(ByVal key, ByVal value)
  On Error Resume Next
  Application.Lock
  Application(key) = value
  Application(key & ".at") = Now()
  Application.Unlock
  Err.Clear
  On Error GoTo 0
End Sub

Sub WriteBody(ByVal mimeType, ByVal value)
  Response.Status = "200 OK"
  Response.ContentType = mimeType
  Response.Write value
  Response.End
End Sub

Sub SendError(ByVal statusLine, ByVal code)
  Response.Status = statusLine
  Response.ContentType = "application/json; charset=utf-8"
  Response.Write "{""error"":{""code"":""" & code & """}}"
  Response.End
End Sub
%>
