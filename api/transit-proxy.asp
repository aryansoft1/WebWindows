<%@ Language="VBScript" CodePage="65001" %>
<%
Option Explicit

Response.CodePage = 65001
Response.CharSet = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-cache"

Const TRANSITLAND_BASE = "https://transit.land/api/v2/rest"

'
' Transitland API Key 放在服务器端独立配置文件 transit-proxy.config.asp，
' 该文件不纳入版本管理（见 .gitignore）。
' 模板见 transit-proxy.config.example.asp。
'
Dim transitlandApiKey
transitlandApiKey = LoadApiKey()

Dim action
action = LCase(Trim(Request.QueryString("action")))

If Len(transitlandApiKey) = 0 Then
  WriteError 503, "not_configured", "Transitland API key is not configured."
End If

'
' 服务器侧配置加载。注意：ASP 的 VBScript 引擎**没有 Dir()**（线上实测
' 报「未定义: 'Dir'」于本行），文件存在性必须用 FileSystemObject 判断。
'
Function LoadApiKey()
  Dim configPath
  configPath = Server.MapPath("transit-proxy.config.asp")

  If Len(configPath) = 0 Then
    LoadApiKey = ""
    Exit Function
  End If

  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")

  If Not fso.FileExists(configPath) Then
    Set fso = Nothing
    LoadApiKey = ""
    Exit Function
  End If

  Set fso = Nothing

  On Error Resume Next
  Server.Execute(configPath)
  If Err.Number <> 0 Then
    Err.Clear
    LoadApiKey = ""
    Exit Function
  End If
  On Error GoTo 0

  LoadApiKey = Trim(CStr(transitlandApiKey))
End Function

Select Case action

  Case "stops"
    HandleStops

  Case "departures"
    HandleDepartures

  Case "trip"
    HandleTrip

  Case "realtime"
    HandleRealtime

  Case Else
    WriteError 400, "invalid_action", "Unsupported transit action."

End Select


Sub HandleStops()

  Dim search
  search = Trim(Request.QueryString("search"))

  If Len(search) = 0 Then
    WriteError 400, "missing_search", "Missing stop search text."
  End If

  Dim limit
  limit = SafeInteger(Request.QueryString("limit"), 8, 1, 20)

  Dim url
  url = TRANSITLAND_BASE & _
        "/stops" & _
        "?search=" & UrlEncode(search) & _
        "&limit=" & CStr(limit) & _
        "&include_routes=true"

  ProxyJson url

End Sub


Sub HandleDepartures()

  Dim stopKey
  stopKey = Trim(Request.QueryString("stop_key"))

  If Len(stopKey) = 0 Then
    WriteError 400, "missing_stop_key", "Missing stop_key."
  End If

  Dim serviceDate
  serviceDate = Trim(Request.QueryString("service_date"))

  If Not IsIsoDate(serviceDate) Then
    WriteError 400, "invalid_service_date", "service_date must be YYYY-MM-DD."
  End If

  Dim startTime
  startTime = Trim(Request.QueryString("start_time"))

  If Len(startTime) > 0 Then
    If Not IsGtfsTime(startTime) Then
      WriteError 400, "invalid_start_time", "start_time must be HH:MM:SS."
    End If
  End If

  Dim limit
  limit = SafeInteger(Request.QueryString("limit"), 20, 1, 50)

  Dim url
  url = TRANSITLAND_BASE & _
        "/stops/" & _
        PathEncode(stopKey) & _
        "/departures" & _
        "?service_date=" & _
        UrlEncode(serviceDate)

  If Len(startTime) > 0 Then
    url = url & _
          "&start_time=" & _
          UrlEncode(startTime)
  End If

  url = url & _
        "&limit=" & _
        CStr(limit)

  ProxyJson url

End Sub


Sub HandleTrip()

  Dim routeKey
  routeKey = Trim(Request.QueryString("route_key"))

  Dim tripId
  tripId = Trim(Request.QueryString("trip_id"))

  If Len(routeKey) = 0 Then
    WriteError 400, "missing_route_key", "Missing route_key."
  End If

  If Len(tripId) = 0 Then
    WriteError 400, "missing_trip_id", "Missing trip_id."
  End If

  If Not IsTripRef(tripId) Then
    WriteError 400, "invalid_trip", "trip_id is neither a Transitland trip_id nor an internal id."
  End If

  '
  ' 关键：Transitland v2 的单班次端点只接受**内部数字 id**。
  ' 实测（同一线路同一班次 r-xn77-丸ノ内線）：
  '   /trips/20B0809000    → 500 {"error":"parameter error"}（无经停，海外查询必然失败）
  '   /trips/12368625337   → 200，stop_times=18
  ' 所以这里不做任何转换，原样透传；客户端负责传 id（见 transit-providers.js）。
  '
  Dim url
  url = TRANSITLAND_BASE & _
        "/routes/" & _
        PathEncode(routeKey) & _
        "/trips/" & _
        PathEncode(tripId) & _
        "?include_geometry=true" & _
        "&include_alerts=true"

  ProxyJson url

End Sub


' 允许两种形态：对外 trip_id（如 20B0809000）或内部数字 id（如 12368625337）
Function IsTripRef(ByVal value)

  Dim re
  Set re = New RegExp

  re.Global = False
  re.IgnoreCase = True

  re.Pattern = "^[A-Za-z0-9_\-]{1,32}$"
  IsTripRef = re.Test(CStr(value))

  Set re = Nothing

End Function


Sub HandleRealtime()

  Dim feedKey
  feedKey = Trim(Request.QueryString("feed_key"))

  If Len(feedKey) = 0 Then
    WriteError 400, "missing_feed_key", "Missing feed_key."
  End If

  Dim url
  url = TRANSITLAND_BASE & _
        "/feeds/" & _
        PathEncode(feedKey) & _
        "/download_latest_rt/" & _
        "vehicle_positions.json"

  ProxyJson url

End Sub


Sub ProxyJson(url)

  Dim result
  result = HttpGet(url)

  Dim statusCode
  statusCode = result(0)

  Dim body
  body = result(1)

  If statusCode = 401 Then
    WriteError 502, "transitland_unauthorized", "Transitland rejected the API key or feed access."
  End If

  If statusCode = 404 Then
    WriteError 404, "transit_not_found", "Transitland data was not found."
  End If

  If statusCode = 429 Then
    WriteError 429, "transitland_rate_limited", "Transitland rate limit exceeded."
  End If

  If statusCode < 200 Or statusCode >= 300 Then
    WriteError 502, "transitland_error", "Transitland upstream request failed with status " & CStr(statusCode) & "."
  End If

  Response.Status = "200 OK"
  Response.ContentType = "application/json; charset=utf-8"
  Response.Write body
  Response.End

End Sub


Function HttpGet(url)

  On Error Resume Next

  Dim http
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")

  If Err.Number <> 0 Then
    Err.Clear

    HttpGet = Array(0, "", "create_failed")
    Exit Function
  End If

  http.setTimeouts 8000, 8000, 20000, 30000

  http.open "GET", url, False

  http.setRequestHeader "Accept", "application/json"
  http.setRequestHeader "Accept-Encoding", "identity"
  http.setRequestHeader "apikey", transitlandApiKey
  http.setRequestHeader "User-Agent", "WebWindows-Wendao/1.0"

  http.send

  If Err.Number <> 0 Then

    Dim errorText
    errorText = Err.Description

    Err.Clear

    HttpGet = Array(0, "", errorText)

    Set http = Nothing

    Exit Function
  End If

  Dim statusCode
  statusCode = CLng(http.status)

  Dim body
  body = http.responseText

  HttpGet = Array(statusCode, body, "")

  Set http = Nothing

  On Error GoTo 0

End Function


Function SafeInteger(value, defaultValue, minimumValue, maximumValue)

  Dim result
  result = defaultValue

  If IsNumeric(value) Then
    result = CLng(value)
  End If

  If result < minimumValue Then
    result = minimumValue
  End If

  If result > maximumValue Then
    result = maximumValue
  End If

  SafeInteger = result

End Function


Function IsIsoDate(value)

  Dim re
  Set re = New RegExp

  re.Pattern = "^\d{4}-\d{2}-\d{2}$"
  re.IgnoreCase = True
  re.Global = False

  IsIsoDate = re.Test(CStr(value))

  Set re = Nothing

End Function

Function IsGtfsTime(value)

  Dim re
  Set re = New RegExp

  re.Pattern = "^\d{2}:\d{2}:\d{2}$"
  re.IgnoreCase = True
  re.Global = False

  If Not re.Test(CStr(value)) Then
    IsGtfsTime = False
    Set re = Nothing
    Exit Function
  End If

  Dim parts
  parts = Split(CStr(value), ":")

  Dim hours
  Dim minutes
  Dim seconds

  hours = CLng(parts(0))
  minutes = CLng(parts(1))
  seconds = CLng(parts(2))

  IsGtfsTime = _
    hours >= 0 And _
    hours <= 47 And _
    minutes >= 0 And _
    minutes <= 59 And _
    seconds >= 0 And _
    seconds <= 59

  Set re = Nothing

End Function

Function UrlEncode(value)

  UrlEncode = Server.URLEncode(CStr(value))

End Function


Function PathEncode(value)

  Dim encoded

  encoded = Server.URLEncode(CStr(value))

  encoded = Replace(encoded, "+", "%20")

  PathEncode = encoded

End Function


Function JsonEscape(value)

  Dim text

  text = CStr(value)

  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCr, "\r")
  text = Replace(text, vbLf, "\n")
  text = Replace(text, vbTab, "\t")

  JsonEscape = text

End Function


Sub WriteError(statusCode, code, message)

  Select Case statusCode

    Case 400
      Response.Status = "400 Bad Request"

    Case 404
      Response.Status = "404 Not Found"

    Case 429
      Response.Status = "429 Too Many Requests"

    Case 503
      Response.Status = "503 Service Unavailable"

    Case Else
      Response.Status = CStr(statusCode) & " Error"

  End Select

  Response.ContentType = "application/json; charset=utf-8"

  Response.Write _
    "{""error"":{" & _
      """code"":""" & JsonEscape(code) & """," & _
      """message"":""" & JsonEscape(message) & """" & _
    "}}"

  Response.End

End Sub
%>