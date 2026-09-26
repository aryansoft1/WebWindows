<%
' ---------------------------------------------------------------------------
' 访客地区解析（共享模块）
'
' 由 api/visitor-analytics.asp（采集）与 admin_api/visitorAnalytics.asp（管理端
' 补全历史地区）共同 include，避免两份实现漂移。
'
' 优先级：① 本机 IIS GeoIP 模块（WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO，管理员在服务器
'   上显式启用，最可信）② 服务器配置的外部 IP 解析 API。
'
' 外部解析的现实约束（免费档 HTTPS、无需 key、每客户端 IP 每日 1,000 次）：
'   * 只用 REMOTE_ADDR，绝不信任 X-Forwarded-For / CF-* 等转发头；
'   * 内网 / 回环 / 链路本地地址一律不外发；
'   * 同 IP 命中历史会话直接复用 —— 重复访客产生 0 次外部调用；
'   * 每日外部调用有硬上限（Application 计数，默认 800），打满即跳过而不是拖慢页面；
'   * 任何失败都 fail-open：地区留空，统计数据照常写入，绝不因地区解析失败丢会话。
'
' 端点与可选 key 放服务器端 api/visitor-analytics.config.asp（.gitignore 已覆盖
' api/*.config.asp），模板与可选供应商见 visitor-analytics.config.example.asp。
' 换供应商只改配置、不改代码：字段别名已兼容常见形状，且这里不写死任何供应商域名。
'
' 注意：本文件是纯 include 片段，没有 Language 码页声明（与 inc/conn.asp、
' inc/trust-schema.asp 同风格），因此**每个 include 它的页面首行必须声明
' CodePage=65001**，否则 IIS 按系统 ANSI 读无 BOM 的 UTF-8 会把中文多字节拆坏。
'
' 另一个必须守住的约定：**本文件里的注释绝对不能出现 ASP 定界符**。
' 2026-09-26 线上事故：注释里写了 Language 指令的样子，那个定界符会提前结束
' 本文件的脚本块，导致剩余源码被当成正文回显到公共采集接口的响应里
' （响应 11 KB 源码而不是 JSON）。tests/classic-asp-include-fragment-smoke.mjs
' 现在会扫描所有 inc 片段并让这种写法直接失败。
' ---------------------------------------------------------------------------
' ---------------------------------------------------------------------------
' 访客地区解析
'
' 优先级：① 本机 IIS GeoIP 模块（WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO，管理员在服务器
'   上显式启用，最可信）② 服务器配置的外部 IP 解析 API。
'
' 外部解析的现实约束（免费档 HTTPS、无需 key、每客户端 IP 每日 1,000 次）：
'   * 只用 REMOTE_ADDR，绝不信任 X-Forwarded-For / CF-* 等转发头；
'   * 内网 / 回环 / 链路本地地址一律不外发；
'   * 同 IP 命中历史会话直接复用 —— 重复访客产生 0 次外部调用；
'   * 每日外部调用有硬上限（Application 计数，默认 800），打满即跳过而不是拖慢页面；
'   * 任何失败都 fail-open：地区留空，统计数据照常写入，绝不因地区解析失败丢会话。
'
' 端点与可选 key 放服务器端 api/visitor-analytics.config.asp（.gitignore 已覆盖
' api/*.config.asp），模板与可选供应商见 visitor-analytics.config.example.asp。
' 换供应商只改配置、不改代码：字段别名已兼容常见形状，且这里不写死任何供应商域名。
' ---------------------------------------------------------------------------
Dim GeoApiBase, GeoApiKey, GeoDailyCap, GeoConfigPath
Dim GeoCountryCode, GeoCountryName, GeoRegionName, GeoCityName, GeoResolvedBy
Dim GeoDebugLog
'
' 单次解析的总时长上限（毫秒）。逐个端点各有 2.5–3s 超时，供应商变慢时三个端点
' 累加起来会让访客的上报请求等到 8 秒以上 —— 地区只是附加信息，绝不能拖慢页面。
' 超过总预算就停手，地区留空（fail-open）。
'
Dim GeoTotalBudgetMs
GeoTotalBudgetMs = 4000

' JSON 字符串转义（共享模块自带，避免与调用方的同名函数冲突）
Function GeoJsonText(ByVal value)
  Dim text
  If IsNull(value) Then
    text = ""
  Else
    text = CStr(value)
  End If
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, " ")
  text = Replace(text, vbCr, " ")
  text = Replace(text, vbLf, " ")
  text = Replace(text, vbTab, " ")
  GeoJsonText = text
End Function

' 调用方必须在使用地区解析之前调用一次，把配置文件的物理路径交进来。
' 采集端：GeoConfigureSub Server.MapPath("visitor-analytics.config.asp")        （/api/）
' 管理端：GeoConfigureSub Server.MapPath("../api/visitor-analytics.config.asp") （/api/）
Sub GeoConfigureSub(ByVal physicalPath)
  GeoConfigPath = Trim(CStr(physicalPath & ""))
End Sub

Function GeoJsonFieldValue(ByVal payload, ByVal aliasCsv, ByVal maximum)
  Dim matcher, matches
  GeoJsonFieldValue = ""
  Set matcher = New RegExp
  matcher.Global = False
  matcher.IgnoreCase = True
  '
  ' 键名后面必须再补一个引号：q & ")" 只会输出一个右括号（字符串字面量里不含引号），
  ' 少它就变成 "country_code: "JP"，真实响应却是 "country_code": "JP" —— 每个字段
  ' 都取不到，外部接口返回 200 也永远解析不出地区（2026-09-26 线上事故）。
  ' 用 Chr(34) 拼引号而不是连续双写 "" ，双写时数错一个就会变成编译期语法错误，
  ' 或者更糟：语法合法但正则悄悄少一个字符。
  '
  Dim quoteMark
  quoteMark = Chr(34)
  matcher.Pattern = quoteMark & "(" & aliasCsv & ")" & quoteMark & "\s*:\s*" & quoteMark & _
    "([^" & quoteMark & "]*)" & quoteMark
  Set matches = matcher.Execute(CStr(payload))
  If matches.Count > 0 Then
    GeoJsonFieldValue = Cut(matches(0).SubMatches(1), maximum)
  End If
  Set matches = Nothing
  Set matcher = Nothing
End Function

Function GeoSafeAddress(ByVal value)
  Dim matcher, text
  GeoSafeAddress = ""
  text = Trim(CStr(value & ""))
  If Len(text) < 3 Or Len(text) > 45 Then Exit Function
  Set matcher = New RegExp
  matcher.Global = False
  matcher.IgnoreCase = False
  '
  ' 必须是「真正的地址形状」，不能只是「由少数字符组成」：
  '   ① 写成 ^[0-9a-f:]{3,45}$ 会漏掉小数点 → 每一个 IPv4 都被判非法，
  '      地区解析在读配置之前就退出（2026-09-26 线上事故，靠 debugGeo=1 的
  '      no-client-address 才暴露）；
  '   ② 只放宽字符集又会把 "abc"、"deadbeef" 这类垃圾文本当成地址。
  ' 因此这里分两支：四段十进制（IPv4），或纯十六进制+冒号且至少两段（IPv6）。
  '
  matcher.Pattern = "^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[0-9a-f]*(:[0-9a-f]*){2,7})$"
  If matcher.Test(text) Then GeoSafeAddress = LCase(text)
  Set matcher = Nothing
End Function

Function GeoIsPublicAddress(ByVal address)
  Dim octets, secondOctet
  GeoIsPublicAddress = False
  If address = "" Then Exit Function
  If address = "::1" Or address = "0:0:0:0:0:0:0:1" Then Exit Function
  If address = "0.0.0.0" Then Exit Function
  If Left(address, 4) = "127." Then Exit Function
  If Left(address, 3) = "10." Then Exit Function
  If Left(address, 8) = "192.168." Then Exit Function
  If Left(address, 7) = "169.254" Then Exit Function
  If Left(address, 4) = "172." Then
    octets = Split(address, ".")
    If UBound(octets) >= 1 Then
      If IsNumeric(octets(1)) Then
        secondOctet = CLng(octets(1))
        If secondOctet >= 16 And secondOctet <= 31 Then Exit Function
      End If
    End If
  End If
  If Left(address, 2) = "fc" Or Left(address, 2) = "fd" Then Exit Function
  If Left(address, 3) = "fe8" Or Left(address, 3) = "fe9" Or _
     Left(address, 3) = "fea" Or Left(address, 3) = "feb" Then Exit Function
  GeoIsPublicAddress = True
End Function

Function GeoLoadApiConfig()
  Dim configPath, content, matcher, matches
  GeoLoadApiConfig = False
  GeoApiBase = ""
  GeoApiKey = ""
  GeoDailyCap = 800
  '
  ' 配置路径必须由调用方用 Server.MapPath 显式传进来（见 GeoConfigureSub）。
  '
  ' 2026-09-26 线上事故：这里原本写的是 Server.MapPath("visitor-analytics.config.asp")，
  ' 而 Server.MapPath 的相对路径是相对**本 include 片段所在目录**（/inc/）解析的，
  ' 不是调用方所在的 /api/ —— 于是配置文件明明就放在 api/ 下，每次却都判定
  ' 「未配置」直接返回，外部解析从来没有真正发起过：用不可路由地址探测时请求
  ' 恒为 ~550ms（既不超时、也从不写地区），把同一份配置放到 /inc/ 后立刻变成
  ' 2174ms 的连接超时，路径问题由此被证实。
  '
  configPath = GeoConfigPath
  If Len(configPath) = 0 Then Exit Function

  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Set fso = Nothing
    ' 每个提前返回都要复位错误处理：漏掉 On Error GoTo 0 会让 Resume Next
    ' 泄漏到本次请求的余下所有代码，把后面的真实错误悄悄吞掉。
    On Error GoTo 0
    Exit Function
  End If
  If Not fso.FileExists(configPath) Then
    Set fso = Nothing
    On Error GoTo 0
    Exit Function
  End If
  ' OpenTextFile 不支持 UTF-8 参数（线上踩过「无效的过程调用或参数」5），用 ADODB.Stream。
  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile configPath
  content = stream.ReadText
  stream.Close
  Set stream = Nothing
  Set fso = Nothing
  Err.Clear
  On Error GoTo 0

  Set matcher = New RegExp
  matcher.Global = False
  matcher.IgnoreCase = True
  '
  ' 下面三条配置解析的正则各自只有**一个**捕获组，而 SubMatches 是从 0 开始索引的
  ' —— 写成 SubMatches(1) 会抛「无效的过程调用或参数」，配置永远读不出来，
  ' 外部解析一次都没真正发起过（2026-09-26 线上事故）。
  ' GeoJsonFieldValue 用 SubMatches(1) 是对的：那条正则有两个组（字段名 + 值）。
  '
  matcher.Pattern = "GeoApiBase\s*=\s*""([^""]*)"""
  Set matches = matcher.Execute(CStr(content))
  If matches.Count > 0 Then GeoApiBase = Trim(CStr(matches(0).SubMatches(0)))
  Set matches = Nothing

  matcher.Pattern = "GeoApiKey\s*=\s*""([^""]*)"""
  Set matches = matcher.Execute(CStr(content))
  If matches.Count > 0 Then GeoApiKey = Trim(CStr(matches(0).SubMatches(0)))
  Set matches = Nothing

  matcher.Pattern = "GeoDailyCap\s*=\s*""?([0-9]{1,6})""?"
  Set matches = matcher.Execute(CStr(content))
  If matches.Count > 0 Then
    If IsNumeric(matches(0).SubMatches(0)) Then GeoDailyCap = CLng(matches(0).SubMatches(0))
  End If
  Set matches = Nothing
  Set matcher = Nothing

  ' 只接受 HTTPS，绝不把访客地址发到明文或非受信主机。
  If GeoApiBase <> "" Then
    If LCase(Left(GeoApiBase, 8)) <> "https://" Then GeoApiBase = ""
  End If
  GeoLoadApiConfig = (Len(GeoApiBase) > 0)
End Function

Sub GeoApplyCached(ByVal address)
  Dim command, record
  On Error Resume Next
  Set command = Server.CreateObject("ADODB.Command")
  With command
    .ActiveConnection = conn
    .CommandType = 1
    .CommandText = "SELECT country_code,country_name,region_name,city_name FROM webwindows_visitor_sessions " & _
      "WHERE ip_address=? AND (country_code<>'' OR city_name<>'') ORDER BY id DESC LIMIT 1"
    .Parameters.Append .CreateParameter("", 200, 1, 45, address)
    Set record = .Execute
  End With
  If Err.Number = 0 Then
    If Not record.EOF Then
      GeoCountryCode = LCase(Cut(record("country_code"), 8))
      GeoCountryName = Cut(record("country_name"), 80)
      GeoRegionName = Cut(record("region_name"), 120)
      GeoCityName = Cut(record("city_name"), 120)
      If GeoCountryCode <> "" Or GeoCityName <> "" Then GeoResolvedBy = "cache"
    End If
  End If
  If Err.Number <> 0 Then Err.Clear
  If IsObject(record) Then
    record.Close
    Set record = Nothing
  End If
  Set command = Nothing
  On Error GoTo 0
End Sub

Function GeoApiBudgetKey()
  GeoApiBudgetKey = "webwindows_geoapi_" & CStr(Year(Date())) & "_" & _
    Right("0" & CStr(Month(Date())), 2) & "_" & Right("0" & CStr(Day(Date())), 2)
End Function

' 今天还能发起多少次外部解析（只读，不消耗额度），供管理端如实展示
Function GeoApiBudgetRemaining()
  Dim cap, used
  GeoApiBudgetRemaining = 0
  cap = GeoDailyCap
  If cap <= 0 Then cap = 800
  On Error Resume Next
  used = CLng(Application(GeoApiBudgetKey()))
  If Err.Number <> 0 Then
    Err.Clear
    used = 0
  End If
  On Error GoTo 0
  If used >= cap Then
    GeoApiBudgetRemaining = 0
  Else
    GeoApiBudgetRemaining = cap - used
  End If
End Function

Function GeoApiBudgetAvailable()
  Dim budgetKey, used, cap
  GeoApiBudgetAvailable = False
  cap = GeoDailyCap
  If cap <= 0 Then cap = 800
  budgetKey = GeoApiBudgetKey()
  On Error Resume Next
  used = CLng(Application(budgetKey))
  If Err.Number <> 0 Then
    Err.Clear
    used = 0
  End If
  If used >= cap Then
    On Error GoTo 0
    Exit Function
  End If
  Application.Lock
  Err.Clear
  used = CLng(Application(budgetKey))
  If Err.Number <> 0 Then
    Err.Clear
    used = 0
  End If
  Application(budgetKey) = used + 1
  Application.UnLock
  On Error GoTo 0
  GeoApiBudgetAvailable = True
End Function

Function GeoApiEndpointCount()
  Dim parts
  If GeoApiBase = "" Then
    GeoApiEndpointCount = 0
    Exit Function
  End If
  parts = Split(GeoApiBase, ";")
  GeoApiEndpointCount = UBound(parts) + 1
End Function

Function GeoApiEndpointTemplate(ByVal index)
  Dim parts
  If GeoApiBase = "" Then
    GeoApiEndpointTemplate = ""
    Exit Function
  End If
  parts = Split(GeoApiBase, ";")
  If index < 0 Or index > UBound(parts) Then
    GeoApiEndpointTemplate = ""
  Else
    GeoApiEndpointTemplate = Trim(CStr(parts(index)))
  End If
End Function

Function GeoEndpointHost(ByVal requestUrl)
  Dim rest, slashAt, colonAt
  GeoEndpointHost = ""
  rest = requestUrl
  If InStr(rest, "://") > 0 Then rest = Mid(rest, InStr(rest, "://") + 3)
  slashAt = InStr(rest, "/")
  If slashAt > 0 Then rest = Left(rest, slashAt - 1)
  colonAt = InStr(rest, ":")
  If colonAt > 0 Then rest = Left(rest, colonAt - 1)
  GeoEndpointHost = Trim(CStr(rest))
End Function

Sub GeoResetDebug()
  GeoDebugLog = ""
End Sub

' 诊断记录只描述「调用者自己 IP」的解析过程，不包含任何其它访客数据。
Sub GeoAddDebug(ByVal endpoint, ByVal status, ByVal elapsedMs, ByVal result)
  Dim record
  record = "{""endpoint"":""" & GeoJsonText(endpoint) & """,""status"":" & CStr(status) & _
    ",""ms"":" & CStr(elapsedMs) & ",""result"":""" & GeoJsonText(result) & """}"
  If GeoDebugLog = "" Then
    GeoDebugLog = "[" & record & "]"
  Else
    GeoDebugLog = Left(GeoDebugLog, Len(GeoDebugLog) - 1) & "," & record & "]"
  End If
End Sub

Sub GeoResetResult()
  GeoCountryCode = ""
  GeoCountryName = ""
  GeoRegionName = ""
  GeoCityName = ""
  GeoResolvedBy = ""
End Sub

Sub GeoApiAttempt(ByVal template, ByVal address)
  Dim http, requestUrl, payload, started, status, host
  If template = "" Then Exit Sub
  requestUrl = Replace(template, "{IP}", Server.URLEncode(address))
  If GeoApiKey <> "" Then
    If InStr(requestUrl, "?") > 0 Then
      requestUrl = requestUrl & "&key=" & Server.URLEncode(GeoApiKey)
    Else
      requestUrl = requestUrl & "?key=" & Server.URLEncode(GeoApiKey)
    End If
  End If
  host = GeoEndpointHost(requestUrl)
  started = Timer

  On Error Resume Next
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Nothing
    On Error GoTo 0
    GeoAddDebug host, 0, CLng((Timer - started) * 1000), "client-create-failed"
    Exit Sub
  End If
  http.setTimeouts 2500, 2500, 3000, 3000
  http.Open "GET", requestUrl, False
  http.setRequestHeader "Accept", "application/json"
  http.setRequestHeader "User-Agent", "WebWindows-Analytics/1.0"
  http.send
  status = CStr(http.Status)
  payload = ""
  If status = "200" Then payload = http.responseText
  Set http = Nothing
  Err.Clear
  On Error GoTo 0

  If status <> "200" Then
    GeoAddDebug host, CLng(status), CLng((Timer - started) * 1000), "http-error"
    Exit Sub
  End If
  If Len(Trim(CStr(payload & ""))) = 0 Then
    GeoAddDebug host, 200, CLng((Timer - started) * 1000), "empty-body"
    Exit Sub
  End If

  GeoCountryCode = LCase(GeoJsonFieldValue(payload, "country_code|countryCode|code", 8))
  GeoCountryName = GeoJsonFieldValue(payload, "country|country_name|countryName", 80)
  GeoRegionName = GeoJsonFieldValue(payload, "region|region_name|regionName|stateProv|state", 120)
  GeoCityName = GeoJsonFieldValue(payload, "city|city_name|cityName|district", 120)
  If GeoCountryCode <> "" Or GeoCountryName <> "" Or GeoCityName <> "" Then
    GeoResolvedBy = "external-api"
    GeoAddDebug host, 200, CLng((Timer - started) * 1000), _
      "ok " & GeoCountryCode & " " & GeoCountryName & " " & GeoRegionName & " " & GeoCityName
  Else
    GeoAddDebug host, 200, CLng((Timer - started) * 1000), "unparsed-body"
  End If
End Sub

' 诊断入口：只解析调用者自己的 REMOTE_ADDR，逐个端点回报状态与耗时。
' 仍然消耗每日额度（不能被当成免费的 IP 查询代理），但不受同 IP 缓存影响，
' 便于运维在服务器上直接确认「哪个供应商通、为什么不通」。
Sub GeoDiagnoseSelf()
  Dim address, index, template
  GeoResetDebug
  '
  ' 全程 On Error Resume Next：诊断是运维入口，绝不能因为它自己出错而把公开的
  ' 采集接口打成 500（fail-open 与本模块其它部分保持一致）。出错时最后一个阶段
  ' 标记就是断点位置，日志因此可以自己指出「卡在哪一步」，不必再靠线上试探。
  '
  On Error Resume Next
  address = GeoSafeAddress(Request.ServerVariables("REMOTE_ADDR"))
  If Err.Number <> 0 Then
    Err.Clear
    GeoAddDebug "stage-1", 0, 0, "client-address-read-failed"
  Else
    GeoAddDebug "stage-1", 0, 0, "client-address-ok"
  End If
  If address = "" Then
    GeoAddDebug "result", 0, 0, "no-client-address"
    On Error GoTo 0
    Exit Sub
  End If
  GeoAddDebug "client", 0, 0, address
  GeoAddDebug "stage-2", 0, 0, "safe-address-accepted"
  If Not GeoIsPublicAddress(address) Then
    GeoAddDebug "result", 0, 0, "private-address-not-sent"
    On Error GoTo 0
    Exit Sub
  End If
  GeoAddDebug "stage-3", 0, 0, "public-address-ok"
  If Not GeoLoadApiConfig() Then
    GeoAddDebug "result", 0, 0, "geo-not-configured"
    On Error GoTo 0
    Exit Sub
  End If
  Err.Clear
  GeoAddDebug "stage-4", 0, 0, "config-loaded endpoints=" & CStr(GeoApiEndpointCount())

  ' 零副作用探针：只读一次同 IP 的历史会话，看**已经落库的**地区是否存在。
  ' 这一步不发任何外部请求、不消耗额度（纯 SELECT），却能回答「解析出来的地区到底
  ' 有没有真的写进数据库」—— 之前几轮就是因为只验证到「解析成功」就以为写进去了。
  GeoResetResult
  GeoApplyCached address
  If GeoResolvedBy = "cache" Then
    GeoAddDebug "cache", 200, 0, GeoCountryCode & " " & GeoCountryName & " " & GeoRegionName & " " & GeoCityName
  Else
    GeoAddDebug "cache", 0, 0, "miss"
  End If
  GeoResetResult
  Err.Clear
  GeoAddDebug "budget", 0, 0, "remaining=" & CStr(GeoApiBudgetRemaining())
  If Not GeoApiBudgetAvailable() Then
    GeoAddDebug "result", 0, 0, "daily-budget-exhausted"
    On Error GoTo 0
    Exit Sub
  End If
  Err.Clear
  GeoResetResult
  For index = 0 To GeoApiEndpointCount() - 1
    template = GeoApiEndpointTemplate(index)
    GeoApiAttempt template, address
    If GeoResolvedBy = "external-api" Then Exit For
    GeoResetResult
  Next
  If GeoResolvedBy = "external-api" Then
    GeoAddDebug "result", 200, 0, GeoCountryCode & " " & GeoCountryName & " " & GeoRegionName & " " & GeoCityName
  Else
    GeoAddDebug "result", 0, 0, "none"
  End If
  If Err.Number <> 0 Then
    GeoAddDebug "stage-error", Err.Number, 0, CStr(Err.Description)
    Err.Clear
  End If
  GeoAddDebug "stage-end", 0, 0, "done"
  On Error GoTo 0
End Sub

' 把诊断日志压成一句给管理员看的话，例如：
'   "ipwho.is 200/412ms unparsed-body; api.ip.sb 429/120ms http-error"
' 只取端点条目（跳过 stage-* / client / result），最多 3 个，避免把状态条刷屏。
' 这里不复用 GeoJsonFieldValue：它的模式要求值带引号，而日志里的 status / ms 是数字。
Function GeoFailureSummary()
  Dim matcher, matches, index, piece, text, endpointName
  text = ""
  Set matcher = New RegExp
  matcher.Global = True
  matcher.IgnoreCase = True
  ' 与 GeoAddDebug 的序列化格式一一对应；格式若变动，这里退化为兜底文案。
  matcher.Pattern = "\{""endpoint"":""([^""]*)"",""status"":(-?[0-9]+),""ms"":(-?[0-9]+),""result"":""([^""]*)""\}"
  Set matches = matcher.Execute(CStr(GeoDebugLog))
  For index = 0 To matches.Count - 1
    endpointName = CStr(matches(index).SubMatches(0))
    If Left(endpointName, 6) <> "stage-" And endpointName <> "client" And _
       endpointName <> "-" And endpointName <> "result" And endpointName <> "cache" And _
       endpointName <> "budget" And endpointName <> "resolved" Then
      piece = endpointName & " " & CStr(matches(index).SubMatches(1)) & "/" & _
        CStr(matches(index).SubMatches(2)) & "ms " & CStr(matches(index).SubMatches(3))
      If text <> "" Then text = text & "; "
      text = text & piece
    End If
    If Len(text) > 160 Then Exit For
  Next
  Set matches = Nothing
  Set matcher = Nothing
  If text = "" Then text = "外部解析未返回可识别的地区（诊断日志为空）"
  GeoFailureSummary = Cut(text, 200)
End Function

Sub GeoResolve(ByVal rawAddress)
  Dim address
  GeoCountryCode = ""
  GeoCountryName = ""
  GeoRegionName = ""
  GeoCityName = ""
  GeoResolvedBy = "none"
  address = GeoSafeAddress(rawAddress)
  If address = "" Then Exit Sub

  '
  ' 这里原本调的是 EnvironmentFlag(...) —— 一个**在本仓库任何地方都没有定义**的
  ' 全局过程（inc/conn.asp 里也没有，服务器上那份未入库的 conn.asp 里同样没有）。
  ' 线上之所以没炸，只是因为未知全局的存在与否取决于站点环境，属于定时炸弹：
  ' 换到干净部署上，GeoResolve 一旦真的走到这一行就会「未定义过程」直接把
  ' action=start 打成 500。改用本模块自带的 GeoIisTrusted()（同一份环境变量
  ' WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO，读法见该函数），模块自给自足。
  '
  If GeoIisTrusted() Then
    GeoCountryCode = ServerGeo("GEOIP_COUNTRY_CODE")
    GeoCountryName = ServerGeo("GEOIP_COUNTRY_NAME")
    GeoRegionName = ServerGeo("GEOIP_REGION_NAME")
    GeoCityName = ServerGeo("GEOIP_CITY")
    If GeoCountryCode <> "" Or GeoCityName <> "" Then
      GeoResolvedBy = "iis-geoip"
      Exit Sub
    End If
  End If

  If Not GeoIsPublicAddress(address) Then Exit Sub

  ' 先确认是否配置了外部源：没有配置时连历史缓存查询都不做，
  ' 保证未启用地区解析的部署与改动前完全一致（只多一次 FileExists）。
  If Not GeoLoadApiConfig() Then Exit Sub

  GeoApplyCached address
  If GeoResolvedBy = "cache" Then Exit Sub

  If Not GeoApiBudgetAvailable() Then Exit Sub

  Dim index, template, startedAt
  GeoResetResult
  startedAt = Timer
  For index = 0 To GeoApiEndpointCount() - 1
    ' 总预算用完就不再试下一个端点（见 GeoTotalBudgetMs）
    If (Timer - startedAt) * 1000 >= GeoTotalBudgetMs Then Exit For
    template = GeoApiEndpointTemplate(index)
    GeoApiAttempt template, address
    If GeoResolvedBy = "external-api" Then Exit For
    GeoResetResult
  Next
End Sub

Function GeoIisTrusted()
  Dim shell, environment, value
  value = ""
  On Error Resume Next
  Set shell = Server.CreateObject("WScript.Shell")
  Set environment = shell.Environment("PROCESS")
  value = LCase(Trim(CStr(environment("WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO"))))
  Set environment = Nothing
  Set shell = Nothing
  Err.Clear
  On Error GoTo 0
  GeoIisTrusted = (value = "1" Or value = "true" Or value = "yes")
End Function

' 外部解析是否已配置（管理端用它向管理员如实展示来源）
Function GeoExternalConfigured()
  GeoExternalConfigured = GeoLoadApiConfig()
End Function

' ---------------------------------------------------------------------------
' 自愈式修复历史地址
'
' 背景：IP 一直有记录，地区是后来才加的字段 —— 修复上线之前写入的历史行地区为空，
' 而外部解析有每日额度，不可能在每个访客上报时把所有历史行重算一遍。于是出现了
' 「补全历史地区」这个手动按钮。但手动步骤意味着：**只要没人点，地图就永远是空的**。
' 这里让采集端在正常上报之外，顺带把少量待补全的历史地址修好：
'   * 每 20 分钟最多触发一次（Application 计数，进程重启也不会失效）；
'   * 每次最多修 3 个地址，且仍然走同一份每日额度；
'   * 全程 On Error Resume Next，绝不影响访客上报本身（fail-open）；
'   * 调用方在 Response.Flush 之后才调用它，因此不占用访客的等待时间。
' 按钮保留：管理员想立刻补完时仍然可以点。
' ---------------------------------------------------------------------------
Sub GeoRepairPending()
  Dim slotKey, lastRun, repaired, queryRs, targetAddress, updateCmd

  On Error Resume Next
  If Not GeoExternalConfigured() Then
    On Error GoTo 0
    Exit Sub
  End If
  If Not GeoApiBudgetAvailable() Then
    On Error GoTo 0
    Exit Sub
  End If

  ' 每 20 分钟一次：lastRun 存的是那一天的累计分钟数，跨天自动重置。
  slotKey = "webwindows_geo_repair_" & CStr(Year(Date())) & "_" & _
    Right("0" & CStr(Month(Date())), 2) & "_" & Right("0" & CStr(Day(Date())), 2)
  lastRun = -1
  lastRun = CLng(Application(slotKey))
  If Err.Number <> 0 Then
    Err.Clear
    lastRun = -1
  End If
  If lastRun >= 0 Then
    If (CLng(Hour(Date())) * 60 + CLng(Minute(Date()))) - lastRun < 20 Then
      On Error GoTo 0
      Exit Sub
    End If
  End If
  Application(slotKey) = CLng(Hour(Date())) * 60 + CLng(Minute(Date()))

  Err.Clear
  Set queryRs = conn.Execute("SELECT ip_address FROM webwindows_visitor_sessions " & _
    "WHERE ip_address<>'' AND (country_code='' OR country_name='' OR city_name='') " & _
    "GROUP BY ip_address ORDER BY MAX(id) DESC LIMIT 3")
  If Err.Number <> 0 Then
    Err.Clear
    Set queryRs = Nothing
    On Error GoTo 0
    Exit Sub
  End If

  repaired = 0
  Do Until queryRs.EOF
    targetAddress = CStr(queryRs("ip_address"))
    queryRs.MoveNext
    If Not GeoIsPublicAddress(targetAddress) Then
      ' 内网地址永远不会解析成功，直接标记跳过，免得每次都白扫一遍
      On Error Resume Next
      Set updateCmd = Server.CreateObject("ADODB.Command")
      With updateCmd
        .ActiveConnection = conn
        .CommandType = 1
        .CommandText = "UPDATE webwindows_visitor_sessions SET region_name=region_name " & _
          "WHERE ip_address=? AND (country_code='' OR country_name='' OR city_name='')"
        .Parameters.Append .CreateParameter("", 200, 1, 45, targetAddress)
        .Execute
      End With
      Set updateCmd = Nothing
      Err.Clear
      On Error GoTo 0
    Else
      GeoResetResult
      GeoResetDebug
      GeoResolve targetAddress
      If GeoCountryCode <> "" Or GeoCountryName <> "" Or GeoCityName <> "" Then
        On Error Resume Next
        Set updateCmd = Server.CreateObject("ADODB.Command")
        With updateCmd
          .ActiveConnection = conn
          .CommandType = 1
          .CommandText = "UPDATE webwindows_visitor_sessions SET country_code=?,country_name=?,region_name=?,city_name=? " & _
            "WHERE ip_address=? AND (country_code='' OR country_name='' OR city_name='')"
          .Parameters.Append .CreateParameter("", 200, 1, 8, GeoCountryCode)
          .Parameters.Append .CreateParameter("", 200, 1, 80, GeoCountryName)
          .Parameters.Append .CreateParameter("", 200, 1, 120, GeoRegionName)
          .Parameters.Append .CreateParameter("", 200, 1, 120, GeoCityName)
          .Parameters.Append .CreateParameter("", 200, 1, 45, targetAddress)
          .Execute
        End With
        Set updateCmd = Nothing
        Err.Clear
        On Error GoTo 0
        repaired = repaired + 1
      End If
      GeoResetResult
    End If
    If repaired >= 3 Then Exit Do
  Loop
  queryRs.Close
  Set queryRs = Nothing
  On Error GoTo 0
End Sub
%>
