<%@ Language=VBScript EnableSessionState=False CodePage=65001%>
<%
Option Explicit

' ============================================================================
' WebWindows · 问道「问乡」中国铁路数据代理
'
' 数据来源：中国铁路 12306 官方公开接口（只读、无密钥、同源访问）。
'   stations   kyfw.12306.cn/otn/resources/js/framework/station_name.js
'              车站电报码表（站名/电报码/拼音/简拼/城市）
'   leftTicket kyfw.12306.cn/otn/leftTicket/query
'              余票与时刻表（必须先取 init 会话 Cookie 与 CLeftTicketUrl）
'   schedule   kyfw.12306.cn/otn/czxx/queryByTrainNo
'              车次经停站表（每站到达/发车时刻）
'
' 约束：
'   * 只接受 GET，只输出 application/json；
'   * 所有入参先做白名单校验，URL 固定拼接，不存在 SSRF 面；
'   * 不落盘、不带密钥；Application 内存缓存（车次 30 秒 / 车站表 12 小时）；
'   * 出错统一返回 {"error":{"code":"...","message":"..."}}，由前端按 code 本地化。
' ============================================================================

Const RAIL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
Const RAIL_HOST = "https://kyfw.12306.cn"
Const RAIL_STATION_URL = "https://kyfw.12306.cn/otn/resources/js/framework/station_name.js"
Const RAIL_INIT_URL = "https://kyfw.12306.cn/otn/leftTicket/init"
Const RAIL_SCHEDULE_URL = "https://kyfw.12306.cn/otn/czxx/queryByTrainNo"
Const RAIL_STATION_TTL_SECONDS = 43200
Const RAIL_QUERY_TTL_SECONDS = 30
Const RAIL_MAX_TRAINS = 300
Const RAIL_MAX_STOPS = 120

Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CacheControl = "no-store"

Dim gMethod, gAction
gMethod = UCase(Request.ServerVariables("REQUEST_METHOD"))
gAction = Trim(Request.QueryString("action"))

If gMethod <> "GET" Then
  SendError "405 Method Not Allowed", "method_not_allowed", "该接口只支持 GET 请求。"
End If

Select Case gAction
  Case "stations"
    SendStations
  Case "leftTicket"
    SendLeftTicket
  Case "schedule"
    SendSchedule
  Case Else
    SendError "400 Bad Request", "unsupported_action", "不支持的 action，可用值：stations、leftTicket、schedule。"
End Select

Response.End

' ---------------------------------------------------------------------------
' 车站电报码表
' ---------------------------------------------------------------------------
Sub SendStations()
  Dim payload
  payload = CacheRead("webwindows.railway.stations", RAIL_STATION_TTL_SECONDS)

  If Len(payload) = 0 Then
    Dim ok
    Dim body
    body = HttpGetText(RAIL_STATION_URL, "", ok)
    If Not ok Then
      SendError "502 Bad Gateway", "station_source_unavailable", "12306 车站表暂时无法访问。"
    End If
    payload = BuildStationsJson(body)
    If Len(payload) < 40 Then
      SendError "502 Bad Gateway", "station_source_invalid", "12306 车站表返回了无法解析的数据。"
    End If
    CacheWrite "webwindows.railway.stations", payload
  End If

  Response.Write payload
End Sub

Function BuildStationsJson(ByVal body)
  BuildStationsJson = ""

  Dim firstQuote
  firstQuote = InStr(body, "'")
  If firstQuote = 0 Then Exit Function

  Dim lastQuote
  lastQuote = InStrRev(body, "'")
  If lastQuote <= firstQuote Then Exit Function

  Dim payload
  payload = Mid(body, firstQuote + 1, lastQuote - firstQuote - 1)

  Dim parts
  parts = Split(payload, "@")

  Dim rows()
  Dim count
  count = 0
  ReDim rows(UBound(parts))

  Dim i, fields, name, code, pinyin, abbr, city
  For i = 0 To UBound(parts)
    fields = Split(parts(i), "|")
    ' 字段：简拼|站名|电报码|全拼|简拼|序号|城市码|城市|...
    If UBound(fields) >= 7 Then
      name = fields(1)
      code = fields(2)
      pinyin = fields(3)
      abbr = fields(4)
      city = fields(7)
      If Len(name) > 0 And Len(code) > 0 Then
        rows(count) = "{""name"":""" & JsonEscape(name) & _
          """,""code"":""" & JsonEscape(code) & _
          """,""pinyin"":""" & JsonEscape(pinyin) & _
          """,""abbr"":""" & JsonEscape(abbr) & _
          """,""city"":""" & JsonEscape(city) & """}"
        count = count + 1
      End If
    End If
  Next

  If count = 0 Then Exit Function
  ReDim Preserve rows(count - 1)
  BuildStationsJson = "{""stations"":[" & Join(rows, ",") & "]}"
End Function

' ---------------------------------------------------------------------------
' 余票（车次列表）
' ---------------------------------------------------------------------------
Sub SendLeftTicket()
  Dim travelDate, fromCode, toCode
  travelDate = Trim(Request.QueryString("date"))
  fromCode = UCase(Trim(Request.QueryString("from")))
  toCode = UCase(Trim(Request.QueryString("to")))

  If Not IsServiceDate(travelDate) Then
    SendError "400 Bad Request", "invalid_date", "日期格式应为 YYYY-MM-DD。"
  End If
  If Not IsStationCode(fromCode) Or Not IsStationCode(toCode) Then
    SendError "400 Bad Request", "invalid_station", "车站电报码不合法。"
  End If

  Dim cacheKey
  cacheKey = "webwindows.railway.lt." & travelDate & "." & fromCode & "." & toCode

  Dim payload
  payload = CacheRead(cacheKey, RAIL_QUERY_TTL_SECONDS)
  If Len(payload) > 0 Then
    Response.Write payload
    Exit Sub
  End If

  ' 1) init：取会话 Cookie 与当前余票接口路径（12306 会轮换该路径）
  Dim cookies, leftPath, initBody
  initBody = FetchInit(cookies, leftPath)
  If Len(leftPath) = 0 Then leftPath = "leftTicket/query"

  ' 2) 余票查询；接口路径不可用时按历史路径依次回退
  Dim candidates
  candidates = Array(leftPath, "leftTicket/queryA", "leftTicket/queryG", "leftTicket/queryZ")

  Dim body, ok, i, queryUrl
  ok = False
  For i = 0 To UBound(candidates)
    queryUrl = RAIL_HOST & "/otn/" & candidates(i) & _
      "?leftTicketDTO.train_date=" & travelDate & _
      "&leftTicketDTO.from_station=" & fromCode & _
      "&leftTicketDTO.to_station=" & toCode & _
      "&purpose_codes=ADULT"
    body = HttpGetText(queryUrl, cookies, ok)
    If ok Then
      If Left(Trim(body), 1) = "{" Then
        Exit For
      End If
      ok = False
    End If
  Next

  If Not ok Then
    SendError "502 Bad Gateway", "upstream_blocked", "12306 余票接口暂时不可用，请稍后重试。"
  End If

  payload = BuildLeftTicketJson(body, travelDate, fromCode, toCode)
  If Len(payload) = 0 Then
    SendError "502 Bad Gateway", "parse_failed", "无法解析 12306 余票数据。"
  End If

  CacheWrite cacheKey, payload
  Response.Write payload
End Sub

Function BuildLeftTicketJson(ByVal body, ByVal travelDate, ByVal fromCode, ByVal toCode)
  BuildLeftTicketJson = ""

  Dim fromName, toName
  fromName = MapName(body, fromCode)
  toName = MapName(body, toCode)
  If Len(fromName) = 0 Then fromName = fromCode
  If Len(toName) = 0 Then toName = toCode

  Dim block
  block = ExtractArrayBlock(body, "result")

  Dim trains
  trains = ""

  If Len(block) > 0 Then
    Dim re
    Set re = New RegExp
    re.Pattern = """([^""]*)"""
    re.Global = True

    Dim rows()
    Dim count
    count = 0
    ReDim rows(RAIL_MAX_TRAINS)

    Dim m
    For Each m In re.Execute(block)
      If count > RAIL_MAX_TRAINS Then Exit For
      Dim one
      one = BuildTrainJson(Split(m.SubMatches(0), "|"), fromName, toName)
      If Len(one) > 0 Then
        rows(count) = one
        count = count + 1
      End If
    Next

    If count > 0 Then
      ReDim Preserve rows(count - 1)
      trains = Join(rows, ",")
    End If
    Set re = Nothing
  End If

  Dim messageText
  messageText = JsonField(body, "messages")

  BuildLeftTicketJson = "{""date"":""" & JsonEscape(travelDate) & _
    """,""from"":{""code"":""" & JsonEscape(fromCode) & """,""name"":""" & JsonEscape(fromName) & """}," & _
    """to"":{""code"":""" & JsonEscape(toCode) & """,""name"":""" & JsonEscape(toName) & """}," & _
    """message"":""" & JsonEscape(messageText) & """," & _
    """trains"":[" & trains & "]}"
End Function

Function BuildTrainJson(ByVal fields, ByVal fromName, ByVal toName)
  BuildTrainJson = ""

  ' 12306 result 字段：|秘密串|预订|train_no|车次|始发码|终到码|发站码|到站码|发时|到时|历时|可购|...
  If UBound(fields) < 11 Then Exit Function

  Dim trainNo, code, startTime, arriveTime, duration, canBuy
  trainNo = fields(2)
  code = fields(3)
  startTime = fields(8)
  arriveTime = fields(9)
  duration = fields(10)
  canBuy = fields(11)

  If Len(code) = 0 Then Exit Function

  BuildTrainJson = "{""trainNo"":""" & JsonEscape(trainNo) & _
    """,""code"":""" & JsonEscape(code) & _
    """,""fromName"":""" & JsonEscape(fromName) & _
    """,""toName"":""" & JsonEscape(toName) & _
    """,""startTime"":""" & JsonEscape(startTime) & _
    """,""arriveTime"":""" & JsonEscape(arriveTime) & _
    """,""duration"":""" & JsonEscape(duration) & _
    """,""canBuy"":""" & JsonEscape(canBuy) & """}"
End Function

' ---------------------------------------------------------------------------
' 经停站表
' ---------------------------------------------------------------------------
Sub SendSchedule()
  Dim trainNo, fromCode, toCode, travelDate
  trainNo = Trim(Request.QueryString("trainNo"))
  fromCode = UCase(Trim(Request.QueryString("from")))
  toCode = UCase(Trim(Request.QueryString("to")))
  travelDate = Trim(Request.QueryString("date"))

  If Not IsTrainNo(trainNo) Then
    SendError "400 Bad Request", "invalid_train", "车次标识不合法。"
  End If
  If Not IsServiceDate(travelDate) Then
    SendError "400 Bad Request", "invalid_date", "日期格式应为 YYYY-MM-DD。"
  End If
  If Not IsStationCode(fromCode) Or Not IsStationCode(toCode) Then
    SendError "400 Bad Request", "invalid_station", "车站电报码不合法。"
  End If

  Dim cacheKey
  cacheKey = "webwindows.railway.sc." & trainNo & "." & travelDate & "." & fromCode & "." & toCode

  Dim payload
  payload = CacheRead(cacheKey, RAIL_QUERY_TTL_SECONDS)
  If Len(payload) > 0 Then
    Response.Write payload
    Exit Sub
  End If

  Dim queryUrl, body, ok
  queryUrl = RAIL_SCHEDULE_URL & "?train_no=" & trainNo & _
    "&from_station_telecode=" & fromCode & _
    "&to_station_telecode=" & toCode & _
    "&depart_date=" & travelDate

  body = HttpGetText(queryUrl, "", ok)
  If Not ok Then
    SendError "502 Bad Gateway", "upstream_blocked", "12306 经停站接口暂时不可用，请稍后重试。"
  End If
  If Left(Trim(body), 1) <> "{" Then
    SendError "502 Bad Gateway", "upstream_blocked", "12306 经停站接口返回了无法解析的数据。"
  End If

  payload = BuildScheduleJson(body)
  If Len(payload) = 0 Then
    SendError "404 Not Found", "schedule_unavailable", "该车次没有可用的经停站数据。"
  End If

  CacheWrite cacheKey, payload
  Response.Write payload
End Sub

Function BuildScheduleJson(ByVal body)
  BuildScheduleJson = ""

  Dim re
  Set re = New RegExp
  ' 经停站对象都是平面 JSON（值不含花括号），先整块取出再逐字段解析
  re.Pattern = "\{[^{}]*?""station_name""\s*:\s*""[^""]*""[^{}]*?\}"
  re.Global = True
  re.SingleLine = True

  Dim rows()
  Dim count
  count = 0
  ReDim rows(RAIL_MAX_STOPS)

  Dim m
  For Each m In re.Execute(body)
    If count > RAIL_MAX_STOPS Then Exit For
    Dim one
    one = StationRowJson(m.Value)
    If Len(one) > 0 Then
      rows(count) = one
      count = count + 1
    End If
  Next

  If count = 0 Then Exit Function
  ReDim Preserve rows(count - 1)
  BuildScheduleJson = "{""stations"":[" & Join(rows, ",") & "]}"
  Set re = Nothing
End Function

Function StationRowJson(ByVal chunk)
  StationRowJson = ""

  Dim name
  name = JsonField(chunk, "station_name")
  If Len(name) = 0 Then Exit Function

  StationRowJson = "{""no"":""" & JsonEscape(JsonField(chunk, "station_no")) & _
    """,""name"":""" & JsonEscape(name) & _
    """,""arrive"":""" & JsonEscape(JsonField(chunk, "arrive_time")) & _
    """,""depart"":""" & JsonEscape(JsonField(chunk, "start_time")) & _
    """,""stopover"":""" & JsonEscape(JsonField(chunk, "stopover_time")) & """}"
End Function

' ---------------------------------------------------------------------------
' 通用取数
' ---------------------------------------------------------------------------
Function FetchInit(ByRef cookieHeader, ByRef leftPath)
  FetchInit = ""
  cookieHeader = ""
  leftPath = ""

  Dim http
  Set http = CreateHttp()
  If http Is Nothing Then Exit Function

  If SendGet(http, RAIL_INIT_URL, "") Then
    FetchInit = DecodeBody(http)
    cookieHeader = ParseSetCookies(http.getAllResponseHeaders())
    leftPath = ExtractLeftPath(FetchInit)
  End If

  Set http = Nothing
End Function

Function HttpGetText(ByVal url, ByVal cookieHeader, ByRef ok)
  HttpGetText = ""
  ok = False

  Dim http
  Set http = CreateHttp()
  If http Is Nothing Then Exit Function

  If SendGet(http, url, cookieHeader) Then
    HttpGetText = DecodeBody(http)
    ok = True
  End If

  Set http = Nothing
End Function

Function CreateHttp()
  On Error Resume Next

  Dim http
  Set http = Nothing

  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
  End If
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Nothing
  End If

  Set CreateHttp = http
  On Error GoTo 0
End Function

Function SendGet(ByVal http, ByVal url, ByVal cookieHeader)
  SendGet = False

  On Error Resume Next
  http.setTimeouts 5000, 5000, 20000, 30000
  http.Open "GET", url, False
  http.setRequestHeader "User-Agent", RAIL_UA
  http.setRequestHeader "Accept", "application/json, text/javascript, text/plain, */*; q=0.01"
  http.setRequestHeader "Referer", RAIL_INIT_URL
  http.setRequestHeader "X-Requested-With", "XMLHttpRequest"
  If Len(cookieHeader) > 0 Then
    http.setRequestHeader "Cookie", cookieHeader
  End If
  http.Send

  Dim failed
  failed = (Err.Number <> 0)
  Err.Clear

  If Not failed Then
    If http.status >= 200 And http.status < 300 Then
      SendGet = True
    End If
  End If

  On Error GoTo 0
End Function

Function DecodeBody(ByVal http)
  DecodeBody = ""

  On Error Resume Next

  Dim contentType, charsetName, bytes
  contentType = ""
  contentType = http.getResponseHeader("Content-Type")
  charsetName = "utf-8"
  If InStr(1, contentType, "charset=gb", vbTextCompare) > 0 Then
    charsetName = "gb2312"
  End If

  bytes = http.responseBody
  If Err.Number <> 0 Then
    Err.Clear
    DecodeBody = http.responseText
    On Error GoTo 0
    Exit Function
  End If

  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  If Err.Number <> 0 Then
    Err.Clear
    DecodeBody = http.responseText
    On Error GoTo 0
    Exit Function
  End If

  stream.Type = 1
  stream.Open
  stream.Write bytes
  stream.Position = 0
  stream.Type = 2
  stream.Charset = charsetName
  DecodeBody = stream.ReadText
  stream.Close
  Set stream = Nothing

  Err.Clear
  On Error GoTo 0
End Function

Function ParseSetCookies(ByVal headerText)
  ParseSetCookies = ""

  Dim re
  Set re = New RegExp
  re.Pattern = "^set-cookie:\s*([^;\r\n]+)"
  re.IgnoreCase = True
  re.MultiLine = True
  re.Global = True

  Dim parts()
  Dim count
  count = 0
  ReDim parts(31)

  Dim m
  For Each m In re.Execute(headerText)
    If count > UBound(parts) Then Exit For
    parts(count) = Trim(m.SubMatches(0))
    If Len(parts(count)) > 0 Then count = count + 1
  Next

  If count = 0 Then
    Set re = Nothing
    Exit Function
  End If

  ReDim Preserve parts(count - 1)
  ParseSetCookies = Join(parts, "; ")
  Set re = Nothing
End Function

Function ExtractLeftPath(ByVal body)
  ExtractLeftPath = ""

  Dim re
  Set re = New RegExp
  re.Pattern = "CLeftTicketUrl\s*=\s*['""]([^'""]+)"
  re.IgnoreCase = True

  Dim m
  Set m = re.Execute(body)
  If m.Count > 0 Then ExtractLeftPath = Trim(m(0).SubMatches(0))
  Set re = Nothing
End Function

Function ExtractArrayBlock(ByVal body, ByVal fieldName)
  ExtractArrayBlock = ""

  Dim re
  Set re = New RegExp
  re.Pattern = """" & fieldName & """\s*:\s*\[([^\]]*)\]"
  re.SingleLine = True

  Dim m
  Set m = re.Execute(body)
  If m.Count > 0 Then ExtractArrayBlock = m(0).SubMatches(0)
  Set re = Nothing
End Function

Function MapName(ByVal body, ByVal code)
  MapName = ""
  If Len(code) = 0 Then Exit Function

  Dim re
  Set re = New RegExp
  re.Pattern = """" & code & """\s*:\s*""([^""]*)"""

  Dim m
  Set m = re.Execute(body)
  If m.Count > 0 Then MapName = m(0).SubMatches(0)
  Set re = Nothing
End Function

Function JsonField(ByVal chunk, ByVal fieldName)
  JsonField = ""

  Dim re
  Set re = New RegExp
  re.Pattern = """" & fieldName & """\s*:\s*""((?:[^""\\]|\\.)*)"""

  Dim m
  Set m = re.Execute(chunk)
  If m.Count > 0 Then JsonField = UnescapeJson(m(0).SubMatches(0))
  Set re = Nothing
End Function

Function UnescapeJson(ByVal value)
  value = Replace(value, "\""", """")
  value = Replace(value, "\\", "\")
  UnescapeJson = value
End Function

Function JsonEscape(ByVal value)
  Dim escaped
  escaped = CStr(value & "")
  escaped = Replace(escaped, "\", "\\")
  escaped = Replace(escaped, """", "\""")
  escaped = Replace(escaped, vbCrLf, "\n")
  escaped = Replace(escaped, vbCr, "\n")
  escaped = Replace(escaped, vbLf, "\n")
  escaped = Replace(escaped, vbTab, "\t")
  JsonEscape = escaped
End Function

' ---------------------------------------------------------------------------
' 入参校验
' ---------------------------------------------------------------------------
Function IsServiceDate(ByVal value)
  Dim re
  Set re = New RegExp
  re.Pattern = "^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$"
  IsServiceDate = re.Test(value)
  Set re = Nothing
End Function

Function IsStationCode(ByVal value)
  IsStationCode = False
  If Len(value) < 2 Or Len(value) > 6 Then Exit Function

  Dim re
  Set re = New RegExp
  re.Pattern = "^[A-Z0-9]+$"
  IsStationCode = re.Test(value)
  Set re = Nothing
End Function

Function IsTrainNo(ByVal value)
  IsTrainNo = False
  If Len(value) < 4 Or Len(value) > 24 Then Exit Function

  Dim re
  Set re = New RegExp
  re.Pattern = "^[0-9A-Za-z]+$"
  IsTrainNo = re.Test(value)
  Set re = Nothing
End Function

' ---------------------------------------------------------------------------
' Application 内存缓存（失败时静默降级为不缓存）
' ---------------------------------------------------------------------------
Function CacheRead(ByVal key, ByVal maxAgeSeconds)
  CacheRead = ""

  On Error Resume Next
  Dim storedAt
  storedAt = CDate(Application(key & ".at"))
  If Err.Number = 0 Then
    If DateDiff("s", storedAt, Now()) <= maxAgeSeconds Then
      CacheRead = CStr(Application(key) & "")
    End If
  End If
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

' ---------------------------------------------------------------------------
' 错误输出
' ---------------------------------------------------------------------------
Sub SendError(ByVal statusLine, ByVal code, ByVal message)
  On Error Resume Next
  Response.Status = statusLine
  Response.ContentType = "application/json"
  Response.Charset = "utf-8"
  Response.Write "{""error"":{""code"":""" & JsonEscape(code) & _
    """,""message"":""" & JsonEscape(message) & """}}"
  Response.End
  On Error GoTo 0
End Sub
%>
