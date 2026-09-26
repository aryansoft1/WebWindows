<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-store"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Sub Fail(ByVal statusText, ByVal code)
  Response.Status = statusText
  Response.Write "{""ok"":false,""code"":""" & code & """}"
  If IsObject(conn) Then If conn.State <> 0 Then conn.Close
  Response.End
End Sub

Function Cut(ByVal value, ByVal maximum)
  Dim text
  text = Trim(CStr(value & ""))
  text = Replace(text, vbCr, " ")
  text = Replace(text, vbLf, " ")
  If Len(text) > maximum Then text = Left(text, maximum)
  Cut = text
End Function

Function IsUuid(ByVal value)
  Dim matcher
  Set matcher = New RegExp
  matcher.IgnoreCase = True
  matcher.Pattern = "^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$"
  IsUuid = matcher.Test(CStr(value))
  Set matcher = Nothing
End Function

Function IsFeatureKey(ByVal value)
  Dim matcher
  Set matcher = New RegExp
  matcher.IgnoreCase = True
  matcher.Pattern = "^[a-z0-9][a-z0-9._:-]{0,119}$"
  IsFeatureKey = matcher.Test(CStr(value))
  Set matcher = Nothing
End Function

Function PositiveInt(ByVal value, ByVal maximum)
  Dim matcher, parsed
  Set matcher = New RegExp
  matcher.Pattern = "^[0-9]{1,6}$"
  If matcher.Test(CStr(value)) Then
    parsed = CLng(value)
    If parsed > maximum Then parsed = maximum
    PositiveInt = parsed
  Else
    PositiveInt = 0
  End If
  Set matcher = Nothing
End Function

Function EnvironmentFlag(ByVal name)
  Dim shell, environment, value
  value = ""
  On Error Resume Next
  Set shell = Server.CreateObject("WScript.Shell")
  Set environment = shell.Environment("PROCESS")
  value = LCase(Trim(CStr(environment(name))))
  Set environment = Nothing
  Set shell = Nothing
  Err.Clear
  On Error GoTo 0
  EnvironmentFlag = (value = "1" Or value = "true" Or value = "yes")
End Function

Function ServerGeo(ByVal variableName)
  ServerGeo = Cut(Request.ServerVariables(variableName), 120)
End Function

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
Dim geoApiBase, geoApiKey, geoDailyCap
Dim geoCountryCode, geoCountryName, geoRegionName, geoCityName, geoResolvedBy

Function JsonFieldValue(ByVal payload, ByVal aliasCsv, ByVal maximum)
  Dim matcher, matches
  JsonFieldValue = ""
  Set matcher = New RegExp
  matcher.Global = False
  matcher.IgnoreCase = True
  matcher.Pattern = """(" & aliasCsv & ")\s*:\s*""([^""]*)"""
  Set matches = matcher.Execute(CStr(payload))
  If matches.Count > 0 Then
    JsonFieldValue = Cut(matches(0).SubMatches(1), maximum)
  End If
  Set matches = Nothing
  Set matcher = Nothing
End Function

Function SafeAddress(ByVal value)
  Dim matcher
  SafeAddress = ""
  Set matcher = New RegExp
  matcher.Pattern = "^[0-9a-f:]{3,45}$"
  matcher.IgnoreCase = False
  If matcher.Test(CStr(value & "")) Then SafeAddress = LCase(Trim(CStr(value)))
  Set matcher = Nothing
End Function

Function IsPublicAddress(ByVal address)
  Dim octets, secondOctet
  IsPublicAddress = False
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
  IsPublicAddress = True
End Function

Function LoadGeoApiConfig()
  Dim configPath, content, matcher, matches
  LoadGeoApiConfig = False
  geoApiBase = ""
  geoApiKey = ""
  geoDailyCap = 800
  configPath = Server.MapPath("visitor-analytics.config.asp")
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
  matcher.Pattern = "geoApiBase\s*=\s*""([^""]*)"""
  Set matches = matcher.Execute(CStr(content))
  If matches.Count > 0 Then geoApiBase = Trim(CStr(matches(0).SubMatches(1)))
  Set matches = Nothing

  matcher.Pattern = "geoApiKey\s*=\s*""([^""]*)"""
  Set matches = matcher.Execute(CStr(content))
  If matches.Count > 0 Then geoApiKey = Trim(CStr(matches(0).SubMatches(1)))
  Set matches = Nothing

  matcher.Pattern = "geoDailyCap\s*=\s*""?([0-9]{1,6})""?"
  Set matches = matcher.Execute(CStr(content))
  If matches.Count > 0 Then
    If IsNumeric(matches(0).SubMatches(1)) Then geoDailyCap = CLng(matches(0).SubMatches(1))
  End If
  Set matches = Nothing
  Set matcher = Nothing

  ' 只接受 HTTPS，绝不把访客地址发到明文或非受信主机。
  If geoApiBase <> "" Then
    If LCase(Left(geoApiBase, 8)) <> "https://" Then geoApiBase = ""
  End If
  LoadGeoApiConfig = (Len(geoApiBase) > 0)
End Function

Sub ApplyCachedGeo(ByVal address)
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
      geoCountryCode = LCase(Cut(record("country_code"), 8))
      geoCountryName = Cut(record("country_name"), 80)
      geoRegionName = Cut(record("region_name"), 120)
      geoCityName = Cut(record("city_name"), 120)
      If geoCountryCode <> "" Or geoCityName <> "" Then geoResolvedBy = "cache"
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

Function GeoApiBudgetAvailable()
  Dim budgetKey, used, cap
  GeoApiBudgetAvailable = False
  cap = geoDailyCap
  If cap <= 0 Then cap = 800
  budgetKey = "webwindows_geoapi_" & CStr(Year(Date())) & "_" & _
    Right("0" & CStr(Month(Date())), 2) & "_" & Right("0" & CStr(Day(Date())), 2)
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

Function GeoApiLookup(ByVal address)
  Dim http, requestUrl, payload
  GeoApiLookup = False
  requestUrl = Replace(geoApiBase, "{IP}", Server.URLEncode(address))
  If geoApiKey <> "" Then
    If InStr(requestUrl, "?") > 0 Then
      requestUrl = requestUrl & "&key=" & Server.URLEncode(geoApiKey)
    Else
      requestUrl = requestUrl & "?key=" & Server.URLEncode(geoApiKey)
    End If
  End If

  On Error Resume Next
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Nothing
    On Error GoTo 0
    Exit Function
  End If
  http.setTimeouts 2500, 2500, 3000, 3000
  http.Open "GET", requestUrl, False
  http.setRequestHeader "Accept", "application/json"
  http.setRequestHeader "User-Agent", "WebWindows-Analytics/1.0"
  http.send
  If CStr(http.Status) <> "200" Then
    Err.Clear
    Set http = Nothing
    On Error GoTo 0
    Exit Function
  End If
  payload = http.responseText
  Set http = Nothing
  Err.Clear
  On Error GoTo 0
  If Len(Trim(CStr(payload & ""))) = 0 Then Exit Function

  geoCountryCode = LCase(JsonFieldValue(payload, "country_code|countryCode|code", 8))
  geoCountryName = JsonFieldValue(payload, "country|country_name|countryName", 80)
  geoRegionName = JsonFieldValue(payload, "region|region_name|regionName|stateProv|state", 120)
  geoCityName = JsonFieldValue(payload, "city|city_name|cityName|district", 120)
  If geoCountryCode <> "" Or geoCountryName <> "" Or geoCityName <> "" Then
    geoResolvedBy = "external-api"
    GeoApiLookup = True
  End If
End Function

Sub ResolveVisitorGeo(ByVal rawAddress)
  Dim address
  geoCountryCode = ""
  geoCountryName = ""
  geoRegionName = ""
  geoCityName = ""
  geoResolvedBy = "none"
  address = SafeAddress(rawAddress)
  If address = "" Then Exit Sub

  If EnvironmentFlag("WEBWINDOWS_ANALYTICS_TRUST_IIS_GEO") Then
    geoCountryCode = ServerGeo("GEOIP_COUNTRY_CODE")
    geoCountryName = ServerGeo("GEOIP_COUNTRY_NAME")
    geoRegionName = ServerGeo("GEOIP_REGION_NAME")
    geoCityName = ServerGeo("GEOIP_CITY")
    If geoCountryCode <> "" Or geoCityName <> "" Then
      geoResolvedBy = "iis-geoip"
      Exit Sub
    End If
  End If

  If Not IsPublicAddress(address) Then Exit Sub

  ' 先确认是否配置了外部源：没有配置时连历史缓存查询都不做，
  ' 保证未启用地区解析的部署与改动前完全一致（只多一次 FileExists）。
  If Not LoadGeoApiConfig() Then Exit Sub

  ApplyCachedGeo address
  If geoResolvedBy = "cache" Then Exit Sub

  If Not GeoApiBudgetAvailable() Then Exit Sub

  On Error Resume Next
  GeoApiLookup address
  If Err.Number <> 0 Then Err.Clear
  On Error GoTo 0
End Sub

Function TableReady(ByVal tableName)
  Dim cmd, rs
  Set cmd = Server.CreateObject("ADODB.Command")
  With cmd
    .ActiveConnection = conn
    .CommandType = 1
    .CommandText = "SELECT COUNT(*) AS ready_count FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?"
    .Parameters.Append .CreateParameter("", 200, 1, 80, tableName)
    Set rs = .Execute
  End With
  TableReady = (Not rs.EOF And CLng(rs("ready_count")) = 1)
  rs.Close
  Set rs = Nothing
  Set cmd = Nothing
End Function

If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "POST" Then Fail "405 Method Not Allowed", "METHOD_NOT_ALLOWED"
If Request.TotalBytes > 8192 Then Fail "413 Payload Too Large", "PAYLOAD_TOO_LARGE"
Dim fetchSite
fetchSite = LCase(Cut(Request.ServerVariables("HTTP_SEC_FETCH_SITE"), 20))
If fetchSite <> "" And fetchSite <> "same-origin" Then Fail "403 Forbidden", "FETCH_CONTEXT_INVALID"
If Not TableReady("webwindows_visitor_sessions") Or Not TableReady("webwindows_visitor_feature_stats") Then
  Fail "503 Service Unavailable", "ANALYTICS_SCHEMA_REQUIRED"
End If

Dim action, visitorKey, sessionKey, featureKey, featureName, activeSeconds, featureOpened
Dim entryPath, referrer, timezoneName, languageName, deviceType, userAgent
action = LCase(Cut(Request.Form("action"), 20))
visitorKey = LCase(Cut(Request.Form("visitorKey"), 36))
sessionKey = LCase(Cut(Request.Form("sessionKey"), 36))
featureKey = LCase(Cut(Request.Form("featureKey"), 120))
featureName = Cut(Request.Form("featureName"), 160)
activeSeconds = PositiveInt(Request.Form("activeSeconds"), 300)
featureOpened = PositiveInt(Request.Form("featureOpened"), 1)
entryPath = Cut(Request.Form("entryPath"), 500)
referrer = Cut(Request.Form("referrer"), 1000)
timezoneName = Cut(Request.Form("timezone"), 80)
languageName = Cut(Request.Form("language"), 40)
deviceType = LCase(Cut(Request.Form("deviceType"), 20))
userAgent = Cut(Request.ServerVariables("HTTP_USER_AGENT"), 500)

If action <> "start" And action <> "pulse" And action <> "end" Then Fail "400 Bad Request", "ACTION_INVALID"
If Not IsUuid(visitorKey) Or Not IsUuid(sessionKey) Then Fail "400 Bad Request", "VISITOR_ID_INVALID"
If Not IsFeatureKey(featureKey) Then Fail "400 Bad Request", "FEATURE_INVALID"
If deviceType <> "mobile" And deviceType <> "tablet" And deviceType <> "desktop" Then deviceType = "desktop"

' Avoid accidental high-frequency writes while keeping start/end delivery reliable.
If action = "pulse" And IsDate(Session("webwindows_analytics_last_write")) Then
  If DateDiff("s", CDate(Session("webwindows_analytics_last_write")), Now()) < 5 Then
    Response.Write "{""ok"":true,""throttled"":true}"
    conn.Close
    Response.End
  End If
End If
Session("webwindows_analytics_last_write") = Now()

Dim userId, username, visitorType, developerCmd, developerRs
userId = 0
username = ""
visitorType = "anonymous"
If IsNumeric(Session("webwindows_user_id")) Then userId = CLng(Session("webwindows_user_id"))
If userId > 0 Then
  username = Cut(Session("webwindows_username"), 80)
  visitorType = "registered"
  If IsNumeric(Session("webwindows_analytics_type_user_id")) And _
     CLng(Session("webwindows_analytics_type_user_id")) = userId And _
     IsDate(Session("webwindows_analytics_type_checked_at")) And _
     DateDiff("s", CDate(Session("webwindows_analytics_type_checked_at")), Now()) < 300 And _
     (Session("webwindows_analytics_visitor_type") = "registered" Or Session("webwindows_analytics_visitor_type") = "developer") Then
    visitorType = CStr(Session("webwindows_analytics_visitor_type"))
  Else
    Set developerCmd = Server.CreateObject("ADODB.Command")
    With developerCmd
      .ActiveConnection = conn
      .CommandType = 1
      .CommandText = "SELECT COUNT(*) AS developer_count FROM webwindows_developers WHERE user_id=? AND status='approved'"
      .Parameters.Append .CreateParameter("", 3, 1, , userId)
      Set developerRs = .Execute
    End With
    If Not developerRs.EOF Then If CLng(developerRs("developer_count")) > 0 Then visitorType = "developer"
    developerRs.Close
    Set developerRs = Nothing
    Set developerCmd = Nothing
    Session("webwindows_analytics_type_user_id") = userId
    Session("webwindows_analytics_visitor_type") = visitorType
    Session("webwindows_analytics_type_checked_at") = Now()
  End If
End If

Dim ipAddress, countryCode, countryName, regionName, cityName
ipAddress = Cut(Request.ServerVariables("REMOTE_ADDR"), 45)
' 地区解析：IIS GeoIP 优先，其次同 IP 历史会话缓存，最后才是外部解析 API。
ResolveVisitorGeo ipAddress
countryCode = geoCountryCode
countryName = geoCountryName
regionName = geoRegionName
cityName = geoCityName

Dim lookupCmd, lookupRs, analyticsSessionId
analyticsSessionId = 0
Set lookupCmd = Server.CreateObject("ADODB.Command")
With lookupCmd
  .ActiveConnection = conn
  .CommandType = 1
  .CommandText = "SELECT id FROM webwindows_visitor_sessions WHERE session_key=? LIMIT 1"
  .Parameters.Append .CreateParameter("", 200, 1, 36, sessionKey)
  Set lookupRs = .Execute
End With
If Not lookupRs.EOF Then analyticsSessionId = CLng(lookupRs("id"))
lookupRs.Close
Set lookupRs = Nothing
Set lookupCmd = Nothing

Dim sessionCmd, endedValue, identityRs
Set sessionCmd = Server.CreateObject("ADODB.Command")
If analyticsSessionId = 0 Then
  With sessionCmd
    .ActiveConnection = conn
    .CommandType = 1
    .CommandText = "INSERT INTO webwindows_visitor_sessions " & _
      "(visitor_key,session_key,user_id,username_snapshot,visitor_type,ip_address,country_code,country_name,region_name,city_name,entry_path,referrer,timezone_name,language_name,device_type,user_agent,active_seconds,last_seen_at,ended_at) " & _
      "VALUES (?,?,NULLIF(?,0),?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NULL)"
    .Parameters.Append .CreateParameter("", 200, 1, 36, visitorKey)
    .Parameters.Append .CreateParameter("", 200, 1, 36, sessionKey)
    .Parameters.Append .CreateParameter("", 3, 1, , userId)
    .Parameters.Append .CreateParameter("", 200, 1, 80, username)
    .Parameters.Append .CreateParameter("", 200, 1, 20, visitorType)
    .Parameters.Append .CreateParameter("", 200, 1, 45, ipAddress)
    .Parameters.Append .CreateParameter("", 200, 1, 8, countryCode)
    .Parameters.Append .CreateParameter("", 200, 1, 80, countryName)
    .Parameters.Append .CreateParameter("", 200, 1, 120, regionName)
    .Parameters.Append .CreateParameter("", 200, 1, 120, cityName)
    .Parameters.Append .CreateParameter("", 200, 1, 500, entryPath)
    .Parameters.Append .CreateParameter("", 200, 1, 1000, referrer)
    .Parameters.Append .CreateParameter("", 200, 1, 80, timezoneName)
    .Parameters.Append .CreateParameter("", 200, 1, 40, languageName)
    .Parameters.Append .CreateParameter("", 200, 1, 20, deviceType)
    .Parameters.Append .CreateParameter("", 200, 1, 500, userAgent)
    .Parameters.Append .CreateParameter("", 3, 1, , activeSeconds)
    .Execute
  End With
  Set identityRs = conn.Execute("SELECT LAST_INSERT_ID() AS new_id")
  If Not identityRs.EOF Then analyticsSessionId = CLng(identityRs("new_id"))
  identityRs.Close
  Set identityRs = Nothing
Else
  endedValue = 0
  If action = "end" Then endedValue = 1
  With sessionCmd
    .ActiveConnection = conn
    .CommandType = 1
    .CommandText = "UPDATE webwindows_visitor_sessions SET user_id=NULLIF(?,0),username_snapshot=?,visitor_type=?," & _
      "ip_address=?,country_code=?,country_name=?,region_name=?,city_name=?,active_seconds=active_seconds+?," & _
      "last_seen_at=NOW(),ended_at=IF(?=1,NOW(),NULL) WHERE id=?"
    .Parameters.Append .CreateParameter("", 3, 1, , userId)
    .Parameters.Append .CreateParameter("", 200, 1, 80, username)
    .Parameters.Append .CreateParameter("", 200, 1, 20, visitorType)
    .Parameters.Append .CreateParameter("", 200, 1, 45, ipAddress)
    .Parameters.Append .CreateParameter("", 200, 1, 8, countryCode)
    .Parameters.Append .CreateParameter("", 200, 1, 80, countryName)
    .Parameters.Append .CreateParameter("", 200, 1, 120, regionName)
    .Parameters.Append .CreateParameter("", 200, 1, 120, cityName)
    .Parameters.Append .CreateParameter("", 3, 1, , activeSeconds)
    .Parameters.Append .CreateParameter("", 3, 1, , endedValue)
    .Parameters.Append .CreateParameter("", 3, 1, , analyticsSessionId)
    .Execute
  End With
End If
Set sessionCmd = Nothing

Dim featureCmd
Set featureCmd = Server.CreateObject("ADODB.Command")
With featureCmd
  .ActiveConnection = conn
  .CommandType = 1
  .CommandText = "INSERT INTO webwindows_visitor_feature_stats " & _
    "(visitor_session_id,feature_key,feature_name,open_count,active_seconds,last_seen_at) VALUES (?,?,?,?,?,NOW()) " & _
    "ON DUPLICATE KEY UPDATE feature_name=VALUES(feature_name),open_count=open_count+VALUES(open_count)," & _
    "active_seconds=active_seconds+VALUES(active_seconds),last_seen_at=NOW()"
  .Parameters.Append .CreateParameter("", 3, 1, , analyticsSessionId)
  .Parameters.Append .CreateParameter("", 200, 1, 120, featureKey)
  .Parameters.Append .CreateParameter("", 200, 1, 160, featureName)
  .Parameters.Append .CreateParameter("", 3, 1, , featureOpened)
  .Parameters.Append .CreateParameter("", 3, 1, , activeSeconds)
  .Execute
End With
Set featureCmd = Nothing

Response.Write "{""ok"":true}"
conn.Close
Set conn = Nothing
%>
