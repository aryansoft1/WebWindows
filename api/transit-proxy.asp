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
' 服务器侧配置加载。
'
' 两个线上踩过的坑：
'   1) ASP 的 VBScript 引擎**没有 Dir()**（报「未定义: 'Dir'」），存在性只能用
'      FileSystemObject.FileExists；
'   2) Server.Execute 执行配置文件后，配置里的变量在调用方取不到
'      （线上表现：action=stops 返回 503 not_configured）。
' 因此改为直接读文件并解析赋值语句，不依赖作用域。
'
Function LoadApiKey()
  LoadApiKey = ""

  Dim configPath
  configPath = Server.MapPath("transit-proxy.config.asp")

  If Len(configPath) = 0 Then Exit Function

  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Set fso = Nothing
    Exit Function
  End If

  If Not fso.FileExists(configPath) Then
    Set fso = Nothing
    Exit Function
  End If

  Dim content
  '
  ' 注意：OpenTextFile 传 -65001 会报「无效的过程调用或参数」5，
  ' FileSystemObject 也无法指定 UTF-8；用 ADODB.Stream 才是正解
  ' （配置文件由 FTP 以 ASCII 写入，utf-8 读取同样安全）。
  '
  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2                  ' adTypeText
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile configPath
  content = stream.ReadText
  stream.Close
  Set stream = Nothing
  Set fso = Nothing
  On Error GoTo 0

  ' 形如：transitlandApiKey = "..."
  Dim re
  Set re = New RegExp
  re.Global = False
  re.IgnoreCase = True
  re.Pattern = "transitlandApiKey\s*=\s*""([^""]*)"""

  Dim matches
  Set matches = re.Execute(CStr(content))
  Set re = Nothing

  If matches.Count = 0 Then Exit Function

  LoadApiKey = Trim(CStr(matches(0).SubMatches(0)))
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

  ' ---------------------------------------------------------------------
  ' 时刻表类响应缓存（stops / departures / trip）
  '
  ' 为什么要缓存：Transitland 的 /stops/{key}/departures 极慢（实测单次
  ' 1.7s~5.7s，个别超过 10s 超时），而客户端为覆盖「多运营商同名站」
  ' 会连续请求多个起点站的 departures——串行叠加后整次查询可达 29 秒，
  ' 直接撞穿客户端阶段预算，界面误报「上游故障」（真实页面回归事故）。
  '
  ' 时刻表数据按 service_date 是静态的，缓存 10 分钟既安全又能让重复
  ' 查询秒回；GTFS-Realtime（vehicle_positions）**不缓存**，否则车辆位置
  ' 会停在旧数据上。
  ' ---------------------------------------------------------------------
  Dim cacheable
  cacheable = (InStr(1, url, "vehicle_positions", vbTextCompare) = 0)

  If cacheable Then
    Dim cachedBody
    cachedBody = ScheduleCacheRead(url)

    If Len(cachedBody) > 0 Then
      Response.Write cachedBody
      Exit Sub
    End If
  End If

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

  If cacheable Then
    ScheduleCacheWrite url, body
  End If

  Response.Write body
  Response.End

End Sub


' 时刻表缓存：Application 内存，键含 action+参数，TTL 10 分钟。
' 过期条目在读取时顺手清掉，避免随查询组合无限增长。
Const SCHEDULE_CACHE_TTL_SECONDS = 600

Function ScheduleCacheKey(ByVal url)
  Dim raw
  raw = CStr(url)

  ' 去掉 apikey 之类的可变部分（本代理的 key 不在 url 里，这里只做保险）
  raw = Replace(raw, "?", "_")
  raw = Replace(raw, "/", "_")
  raw = Replace(raw, "&", "_")
  raw = Replace(raw, "=", "-")

  ScheduleCacheKey = "webwindows.transit.cache." & Left(CStr(Md5Hex(raw)), 40)
End Function

Function Md5Hex(ByVal value)
  ' 纯 VBScript 无 MD5；用长度+校验和做键足够（仅用于内存缓存去重）
  Dim sum
  Dim i
  sum = 0

  For i = 1 To Len(value)
    sum = sum + (AscW(Mid(value, i, 1)) * ((i Mod 7) + 1))
  Next

  Md5Hex = Hex(Len(value)) & "_" & Hex(sum) & "_" & Left(CStr(value), 24)
End Function

Function ScheduleCacheRead(ByVal url)
  ScheduleCacheRead = ""

  Dim key
  key = ScheduleCacheKey(url)

  On Error Resume Next

  Dim raw
  raw = CStr(Application(key) & "")

  If Err.Number <> 0 Then
    Err.Clear
    raw = ""
  End If

  On Error GoTo 0

  If Len(raw) = 0 Then Exit Function

  Dim sep
  sep = InStr(raw, "|")

  If sep <= 0 Then
    ' 结构损坏：清掉并当作未命中
    On Error Resume Next
    Application.Lock
    Application.Remove key
    On Error GoTo 0
    Exit Function
  End If

  Dim stamp
  stamp = Left(raw, sep - 1)
  Dim body
  body = Mid(raw, sep + 1)

  Dim age
  age = -1

  On Error Resume Next
  age = DateDiff("s", CDate(stamp), Now())
  On Error GoTo 0

  If age < 0 Or age > SCHEDULE_CACHE_TTL_SECONDS Then
    On Error Resume Next
    Application.Lock
    Application.Remove key
    On Error GoTo 0
    Exit Function
  End If

  ScheduleCacheRead = body
End Function

Sub ScheduleCacheWrite(ByVal url, ByVal body)
  If Len(CStr(body)) = 0 Then Exit Sub

  Dim key
  key = ScheduleCacheKey(url)

  On Error Resume Next
  Application.Lock
  Application(key) = CStr(Now()) & "|" & CStr(body)
  Application.UnLock
  On Error GoTo 0
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