<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/visitor-geo.asp"-->
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


Function ServerGeo(ByVal variableName)
  ServerGeo = Cut(Request.ServerVariables(variableName), 120)
End Function


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
' 配置路径由本页面（位于 /api/）自己解析后交给共享模块 —— 共享模块里的相对
' MapPath 会解析到 /inc/，那是 2026-09-26 地图一直空着的真正原因。
GeoConfigureSub Server.MapPath("visitor-analytics.config.asp")
GeoResolve ipAddress
countryCode = GeoCountryCode
countryName = GeoCountryName
regionName = GeoRegionName
cityName = GeoCityName

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

Dim debugGeo, geoDebugSuffix
debugGeo = (LCase(Cut(Request.Form("debugGeo"), 10)) = "1")
If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "POST" Then
  ' GET 只允许自诊断：解析「调用者自己」的地址，不接受任何目标地址参数，
  ' 因此不能被当成「IP 查询代理」使用。方便管理员/访客在自己浏览器里直接
  ' 打开 https://www.y0.hk/api/visitor-analytics.asp?debugGeo=1 看自己 IP 的解析结果。
  debugGeo = (LCase(Cut(Request.QueryString("debugGeo"), 10)) = "1")
End If
geoDebugSuffix = ""
If debugGeo Then
  ' 受限诊断：只回显「调用者自己 IP」的解析过程（状态码/耗时/解析结果），
  ' 不含任何其它访客数据；仍然消耗每日额度，因此不能被当成免费的 IP 查询代理。
  ' 用途：服务器出口网络受限时，运维可以直接确认到底哪个供应商通、为什么不通。
  GeoDiagnoseSelf
  geoDebugSuffix = ",""geoDebug"":{""source"":""" & GeoResolvedBy & _
    """,""country"":""" & GeoJsonText(GeoCountryCode) & _
    """,""countryName"":""" & GeoJsonText(GeoCountryName) & _
    """,""region"":""" & GeoJsonText(GeoRegionName) & _
    """,""city"":""" & GeoJsonText(GeoCityName) & _
    """,""repair"":""" & GeoJsonText(GeoRepairLastReport()) & _
    """,""log"":" & GeoDebugLog & "}"
End If

Response.Write "{""ok"":true" & geoDebugSuffix & "}"

' 先把响应刷给访客，再做历史地址的自愈修复：
'   * 修复是「锦上添花」，绝不能让访客等它（外部解析每次几百毫秒起步）；
'   * 刷出之后再出错也已经影响不到任何人；
'   * 这样地图不再依赖管理员记得点按钮 —— 每 20 分钟自动补最多 3 个地址。
Response.Flush
GeoRepairPending

conn.Close
Set conn = Nothing
%>
