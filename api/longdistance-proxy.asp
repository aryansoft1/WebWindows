<%@ Language=VBScript EnableSessionState=False CodePage=65001 %>
<%
' ---------------------------------------------------------------------------
' 全球长途交通代理（长途 / 高速 / 跨境）
'
' **第一行 CodePage=65001 不能删**：.asp 源文件是 UTF-8 无 BOM，
' IIS 默认按系统 ANSI 代码页（本机 GB2312/936）读取，中文的多字节序列
' 会被拆坏 —— 实测线上直接 500「未结束的字符串常量」，
' 报错行指向任意含中文的 WriteError。编译期检查发现不了，只有真机才暴露。
' ---------------------------------------------------------------------------
' 定位：WebWindows 面向全球，中国铁路走 railway-proxy、全球本地公交/轨道走
' Transitland GTFS，而**长途线路**（新干线、欧洲 ICE/高速巴士、轮渡…）
' 这两类免费源都不覆盖——实测 Transitland 里 `新大阪` 搜到 0 个站点、
' 日本相关 feed 全是地区线与社区巴士。本代理就是为补这一层而存在。
'
' 数据源：Rome2Rio Search API（全球 240+ 国家、2 万+ 运营商、约 200 万条
' 地面线路，含日本铁路）。**按调用计费**，所以客户端只在前面所有免费源都
' 覆盖不到时才调用本代理。
'
' 配置：服务器端 longdistance.config.asp（不入库、不在上传集），
'   longDistanceApiKey = "..."
'   longDistanceBase  = "https://rome2rio.com/api/1.4/json"  ' 可选
'
' 动作：
'   capabilities —— 无需 Key，返回 {provider, enabled, base}，供客户端决定
'                  是否启用（未配置时 enabled=false，客户端直接跳过，
'                  整个功能零行为变化、零请求）
'   search       —— 需要 Key。转发 Search（只转发白名单参数，防注入/滥用）
'   selftest     —— 需要 Key。用固定查询自检契约，返回精简摘要（线路数、
'                  交通方式、运营商名、耗时、是否出现新干线关键词），
'                  **不返回 Key**。拿到 Key 后先跑它，确认上游字段与我们的
'                  解析假设一致，再启用 search。
'
' 踩坑记录（沿用之前两次教训）：
'   - ASP 的 VBScript 引擎**没有 Dir()**，存在性判断必须用 FileSystemObject；
'   - OpenTextFile/CreateTextFile 的第 4 参不支持 UTF-8，必须用
'     ADODB.Stream（stream.Type=2 + Charset="utf-8"）；
'   - Application.UnLock **不接受参数**，删键要用 Application.Remove；
'   - 缓存键**绝不能包含 key**（key 在 query string 里）。
' ---------------------------------------------------------------------------
Option Explicit

Response.CodePage = 65001
Response.CharSet = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-store"

Const LONGDISTANCE_DEFAULT_BASE = "https://rome2rio.com/api/1.4/json"
Const LONGDISTANCE_CACHE_TTL_SECONDS = 300
Const LONGDISTANCE_MAX_RESULTS = 6

Dim gMethod, gAction
gMethod = UCase(Request.ServerVariables("REQUEST_METHOD"))
gAction = Trim(Request.QueryString("action"))

If gMethod <> "GET" Then
  WriteError 405, "method_not_allowed", "该接口只支持 GET 请求。"
End If

Dim apiKey
apiKey = LoadApiKey()

Dim apiBase
apiBase = LoadApiBase()

Select Case gAction
  Case "capabilities"
    SendCapabilities apiKey, apiBase
  Case "search"
    If Len(apiKey) = 0 Then
      WriteError 503, "not_configured", "全球长途数据源尚未配置。"
    End If
    SendSearch apiKey, apiBase
  Case "selftest"
    If Len(apiKey) = 0 Then
      WriteError 503, "not_configured", "全球长途数据源尚未配置。"
    End If
    SendSelfTest apiKey, apiBase
  Case Else
    WriteError 400, "invalid_action", "不支持的 action，可用值：capabilities、search、selftest。"
End Select

Response.End


' ---------------------------------------------------------------------------
' capabilities：不带 Key 也能调用，让客户端零成本判断是否启用
' ---------------------------------------------------------------------------
Sub SendCapabilities(apiKey, apiBase)
  ' 一律用 Chr(34) 拼引号：T-018 已实测 VBScript 里连续引号会被拆成两段
  Dim body
  body = "{" & Q() & "provider" & Q() & ":" & Q() & "rome2rio" & Q() _
    & "," & Q() & "enabled" & Q() & ":" & JsonBool(Len(apiKey) > 0) _
    & "," & Q() & "base" & Q() & ":" & Q() & JsonEscape(CStr(apiBase)) & Q() & "}"

  Response.Status = "200 OK"
  Response.Write body
  Response.End
End Sub


' ---------------------------------------------------------------------------
' search：只转发白名单参数，避免把任意 query 透传给上游
' ---------------------------------------------------------------------------
Sub SendSearch(apiKey, apiBase)
  Dim query
  query = BuildSearchQuery(apiKey, Request.QueryString("oName"), _
                           Request.QueryString("dName"), _
                           Request.QueryString("oPos"), _
                           Request.QueryString("dPos"), _
                           Request.QueryString("date"), _
                           Request.QueryString("mode"), _
                           Request.QueryString("currency"), _
                           Request.QueryString("language"))

  If Len(query) = 0 Then
    WriteError 400, "missing_route", "缺少出发地或目的地（oName/dName 或 oPos/dPos）。"
  End If

  Dim url
  url = CStr(apiBase) & "/Search?" & query

  Dim cached
  cached = CacheRead(url)

  If Len(cached) > 0 Then
    Response.Status = "200 OK"
    Response.Write cached
    Response.End
  End If

  Dim result
  result = HttpGet(url, apiKey)

  Dim statusCode
  statusCode = result(0)

  Dim body
  body = result(1)

  If statusCode = 401 Or statusCode = 403 Then
    WriteError 502, "longdistance_unauthorized", "全球长途数据源拒绝了 API Key。"
  End If

  If statusCode = 429 Then
    WriteError 429, "longdistance_rate_limited", "全球长途数据源限流，请稍后重试。"
  End If

  If statusCode < 200 Or statusCode >= 300 Then
    WriteError 502, "longdistance_error", "全球长途数据源请求失败，状态码 " & CStr(statusCode) & "。"
  End If

  CacheWrite url, body

  Response.Status = "200 OK"
  Response.Write body
  Response.End
End Sub


' ---------------------------------------------------------------------------
' selftest：固定查询 東京→大阪，验证上游契约与新干线覆盖（不返回 Key）
' ---------------------------------------------------------------------------
Sub SendSelfTest(apiKey, apiBase)
  Dim query
  query = BuildSearchQuery(apiKey, "Tokyo Station, Japan", "Osaka Station, Japan", "", "", "", "train", "", "en")

  If Len(query) = 0 Then
    WriteError 400, "missing_route", "无法构造自检查询。"
  End If

  Dim url
  url = CStr(apiBase) & "/Search?" & query

  Dim result
  result = HttpGet(url, apiKey)

  If result(0) < 200 Or result(0) >= 300 Then
    WriteError 502, "longdistance_error", "自检查询失败，状态码 " & CStr(result(0)) & "。"
  End If

  ' 只回摘要：上游字段是否存在 / 关键词命中，**不返回 Key**
  Dim body
  body = CStr(result(1))

  Dim summary
  summary = "{" & Q() & "ok" & Q() & ":true" _
    & "," & Q() & "bytes" & Q() & ":" & CStr(Len(body)) _
    & "," & Q() & "hasRoutesKey" & Q() & ":" & JsonBool(InStr(1, body, Q() & "routes" & Q(), vbTextCompare) > 0) _
    & "," & Q() & "hasSegmentsKey" & Q() & ":" & JsonBool(InStr(1, body, Q() & "segments" & Q(), vbTextCompare) > 0) _
    & "," & Q() & "hasPlacesKey" & Q() & ":" & JsonBool(InStr(1, body, Q() & "places" & Q(), vbTextCompare) > 0) _
    & "," & Q() & "hasTravelMode" & Q() & ":" & JsonBool(InStr(1, body, "travelMode", vbTextCompare) > 0) _
    & "," & Q() & "mentionsShinkansen" & Q() & ":" & JsonBool(InStr(1, body, "Shinkansen", vbTextCompare) > 0) _
    & "," & Q() & "mentionsNozomi" & Q() & ":" & JsonBool(InStr(1, body, "Nozomi", vbTextCompare) > 0) _
    & "," & Q() & "mentionsHikari" & Q() & ":" & JsonBool(InStr(1, body, "Hikari", vbTextCompare) > 0) _
    & "," & Q() & "mentionsJr" & Q() & ":" & JsonBool(InStr(1, body, "JR", vbTextCompare) > 0) _
    & "," & Q() & "head" & Q() & ":" & Q() & JsonEscape(PlainSnippet(body, 1500)) & Q() _
    & "}"
  Response.Status = "200 OK"
  Response.Write summary
  Response.End
End Sub


' ---------------------------------------------------------------------------
' 参数白名单：只允许这些参数进上游 URL
' ---------------------------------------------------------------------------
Function BuildSearchQuery(apiKey, oName, dName, oPos, dPos, date, mode, currCode, language)
  Dim parts
  parts = ""

  AddQueryParam parts, "oName", CleanText(oName)
  AddQueryParam parts, "dName", CleanText(dName)
  AddQueryParam parts, "oPos", CleanPair(oPos)
  AddQueryParam parts, "dPos", CleanPair(dPos)
  AddQueryParam parts, "date", CleanDate(date)
  AddQueryParam parts, "mode", CleanMode(mode)
  AddQueryParam parts, "currency", CleanText(currCode)
  AddQueryParam parts, "language", CleanText(language)
  AddQueryParam parts, "maxResults", CStr(LONGDISTANCE_MAX_RESULTS)

  ' Rome2Rio v1 鉴权 key 走 query string；CacheKey 会先把 key= 剔除再做缓存键
  AddQueryParam parts, "key", CleanText(apiKey)

  BuildSearchQuery = parts
End Function

Sub AddQueryParam(ByRef parts, ByVal name, ByVal value)
  If Len(value) = 0 Then Exit Sub
  If Len(parts) > 0 Then parts = parts & "&"
  parts = parts & PathEncode(name) & "=" & PathEncode(value)
End Sub

' 站点名：允许中日英与常见符号，剥离控制字符并限长
Function CleanText(ByVal value)
  Dim v
  v = Trim(CStr(value))
  v = Replace(v, "<", "")
  v = Replace(v, ">", "")
  v = Replace(v, """", "")
  v = Replace(v, "\", "/")
  If Len(v) > 120 Then v = Left(v, 120)
  CleanText = v
End Function

' 坐标：仅允许 "lat,lng"
Function CleanPair(ByVal value)
  Dim v
  v = Trim(CStr(value))
  CleanPair = ""
  If Len(v) = 0 Then Exit Function
  If InStr(v, ",") = 0 Then Exit Function
  Dim parts
  parts = Split(v, ",")
  If UBound(parts) <> 1 Then Exit Function
  If Not IsNumeric(parts(0)) Then Exit Function
  If Not IsNumeric(parts(1)) Then Exit Function
  CleanPair = Trim(CStr(parts(0))) & "," & Trim(CStr(parts(1)))
End Function

' 日期：YYYY-MM-DD（Rome2Rio 用 date=YYYY-MM-DD 形式）
Function CleanDate(ByVal value)
  Dim v
  v = Trim(CStr(value))
  CleanDate = ""
  If Len(v) <> 10 Then Exit Function
  If Not IsNumeric(Left(v, 4)) Then Exit Function
  If Mid(v, 5, 1) <> "-" Then Exit Function
  If Not IsNumeric(Mid(v, 6, 2)) Then Exit Function
  If Mid(v, 8, 1) <> "-" Then Exit Function
  If Not IsNumeric(Right(v, 2)) Then Exit Function
  CleanDate = v
End Function

' 交通方式白名单：| 分隔
Function CleanMode(ByVal value)
  Dim v
  v = LCase(Trim(CStr(value)))
  Dim allowed
  allowed = Array("train", "bus", "ferry")
  Dim out
  out = ""

  Dim raw
  raw = Split(v, "|")
  Dim i
  For i = 0 To UBound(raw)
    Dim item
    item = Trim(CStr(raw(i)))
    If Len(item) > 0 Then
      Dim j
      Dim matched
      matched = False
      For j = 0 To UBound(allowed)
        If item = allowed(j) Then matched = True
      Next
      If matched Then
        If Len(out) > 0 Then out = out & "|"
        out = out & item
      End If
    End If
  Next

  CleanMode = out
End Function


' ---------------------------------------------------------------------------
' 配置读取（FSO 判断存在 + ADODB 读 UTF-8 + 正则取值）
' 不用 Server.Execute：实测其变量不跨作用域，会导致 503
' 不用 Dir()/OpenTextFile 第 4 参：ASP 引擎不支持
' ---------------------------------------------------------------------------
Function ConfigFilePath()
  ConfigFilePath = Server.MapPath("longdistance.config.asp")
End Function

Function LoadConfigValue(ByVal variableName)
  LoadConfigValue = ""

  Dim path
  path = ConfigFilePath()
  If Len(path) = 0 Then Exit Function

  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  If Not fso.FileExists(path) Then
    Set fso = Nothing
    Exit Function
  End If
  Set fso = Nothing

  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile path
  Dim content
  content = stream.ReadText
  stream.Close
  Set stream = Nothing

  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  On Error GoTo 0

  Dim re
  Set re = New RegExp
  re.Global = False
  re.IgnoreCase = True
  re.Pattern = variableName & "\s*=\s*""([^""]*)"""
  Dim matches
  Set matches = re.Execute(CStr(content))
  Set re = Nothing

  If matches.Count = 0 Then Exit Function

  LoadConfigValue = Trim(CStr(matches(0).SubMatches(0)))
End Function

Function LoadApiKey()
  LoadApiKey = LoadConfigValue("longDistanceApiKey")
End Function

Function LoadApiBase()
  Dim configured
  configured = LoadConfigValue("longDistanceBase")

  If Len(configured) = 0 Then
    LoadApiBase = LONGDISTANCE_DEFAULT_BASE
    Exit Function
  End If

  ' 只允许 https，且必须是已知主机（避免配置文件把请求引到别处）
  If InStr(1, configured, "https://", vbTextCompare) <> 1 Then
    LoadApiBase = LONGDISTANCE_DEFAULT_BASE
    Exit Function
  End If

  If InStr(1, configured, "rome2rio.com", vbTextCompare) = 0 Then
    LoadApiBase = LONGDISTANCE_DEFAULT_BASE
    Exit Function
  End If

  ' 去掉结尾斜杠
  Do While Right(configured, 1) = "/"
    configured = Left(configured, Len(configured) - 1)
  Loop

  LoadApiBase = configured
End Function


' ---------------------------------------------------------------------------
' 缓存：Application 内存，TTL 300s。**键里必须剔除 key 参数**
' ---------------------------------------------------------------------------
Function CacheKey(ByVal url)
  Dim raw
  raw = CStr(url)
  raw = Replace(raw, "key=", "|KEYREMOVED|")
  raw = Replace(raw, "&key", "&|KEYREMOVED|")
  raw = Replace(raw, "?", "_")
  raw = Replace(raw, "/", "_")
  raw = Replace(raw, "&", "_")
  raw = Replace(raw, "=", "-")
  raw = Replace(raw, ",", ".")
  CacheKey = "webwindows.longdistance.cache." & Hex(Len(raw)) & "_" & Checksum(raw) & "_" & Left(raw, 20)
End Function

Function Checksum(ByVal value)
  Dim sum
  Dim i
  sum = 0
  For i = 1 To Len(value)
    sum = sum + (AscW(Mid(value, i, 1)) * ((i Mod 11) + 1))
  Next
  Checksum = Hex(sum)
End Function

Function CacheRead(ByVal url)
  CacheRead = ""

  Dim key
  key = CacheKey(url)

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
    On Error Resume Next
    Application.Lock
    Application.Remove key
    Application.UnLock
    On Error GoTo 0
    Exit Function
  End If

  Dim age
  age = -1
  On Error Resume Next
  age = DateDiff("s", CDate(Left(raw, sep - 1)), Now())
  On Error GoTo 0

  If age < 0 Or age > LONGDISTANCE_CACHE_TTL_SECONDS Then
    On Error Resume Next
    Application.Lock
    Application.Remove key
    Application.UnLock
    On Error GoTo 0
    Exit Function
  End If

  CacheRead = Mid(raw, sep + 1)
End Function

Sub CacheWrite(ByVal url, ByVal body)
  If Len(CStr(body)) = 0 Then Exit Sub

  Dim key
  key = CacheKey(url)

  On Error Resume Next
  Application.Lock
  Application(key) = CStr(Now()) & "|" & CStr(body)
  Application.UnLock
  On Error GoTo 0
End Sub


' ---------------------------------------------------------------------------
' HTTP
' ---------------------------------------------------------------------------
Function HttpGet(ByVal url, ByVal apiKey)
  On Error Resume Next

  Dim http
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")

  If Err.Number <> 0 Then
    Err.Clear
    HttpGet = Array(0, "", "create_failed")
    Exit Function
  End If

  http.setTimeouts 6000, 6000, 20000, 30000
  http.open "GET", url, False
  http.setRequestHeader "Accept", "application/json"
  http.setRequestHeader "Accept-Encoding", "identity"
  http.setRequestHeader "User-Agent", "WebWindows/1.0 (longdistance-proxy)"


  http.send

  Dim statusCode
  statusCode = http.Status

  Dim body
  body = http.responseText

  http.Close
  Set http = Nothing

  If Err.Number <> 0 Then
    Err.Clear
    HttpGet = Array(0, "", "send_failed")
    Exit Function
  End If

  HttpGet = Array(statusCode, CStr(body), "")
End Function


' ---------------------------------------------------------------------------
' 工具
' ---------------------------------------------------------------------------
Function PathEncode(ByVal value)
  Dim v
  v = CStr(value)
  v = Replace(v, "%", "%25")
  v = Replace(v, " ", "%20")
  v = Replace(v, "&", "%26")
  v = Replace(v, "=", "%3D")
  v = Replace(v, "?", "%3F")
  v = Replace(v, "#", "%23")
  v = Replace(v, "+", "%2B")
  v = Replace(v, "/", "%2F")
  v = Replace(v, ":", "%3A")
  v = Replace(v, ",", "%2C")
  PathEncode = v
End Function

' JSON 引号一律用 Chr(34)：T-018 已实测 VBScript 连续引号会被拆成两段
Function Q()
  Q = Chr(34)
End Function

' 摘要片段：先剥掉引号与反斜杠再截断。
' 直接 Left(body, N) 会把 JSON 的 \" 转义对切成半个，产出**非法 JSON**（已实测）。
Function PlainSnippet(ByVal value, ByVal limit)
  Dim v
  v = Replace(CStr(value), "\", "")
  v = Replace(v, Chr(34), "'")
  PlainSnippet = Left(v, CLng(limit))
End Function

' VBScript 的 CStr(True) 是 "True"，不是合法 JSON 布尔
Function JsonBool(ByVal value)
  If CBool(value) Then
    JsonBool = "true"
  Else
    JsonBool = "false"
  End If
End Function

Function JsonEscape(ByVal value)
  Dim v
  v = CStr(value)
  v = Replace(v, "\", "\\")
  v = Replace(v, Chr(34), "\")
  v = Replace(v, vbCrLf, " ")
  v = Replace(v, vbCr, " ")
  v = Replace(v, vbLf, " ")
  v = Replace(v, vbTab, " ")
  JsonEscape = v
End Function

Sub WriteError(ByVal httpStatus, ByVal code, ByVal message)
  Response.Status = CStr(httpStatus) & " " & StatusText(httpStatus)
  Response.ContentType = "application/json; charset=utf-8"
  Response.Write "{""error"":{""code"":""" & JsonEscape(code) & """,""message"":""" & JsonEscape(message) & """}}"
  Response.End
End Sub

Function StatusText(ByVal httpStatus)
  Select Case CLng(httpStatus)
    Case 400: StatusText = "Bad Request"
    Case 405: StatusText = "Method Not Allowed"
    Case 429: StatusText = "Too Many Requests"
    Case 502: StatusText = "Bad Gateway"
    Case 503: StatusText = "Service Unavailable"
    Case Else: StatusText = "Error"
  End Select
End Function
%>
