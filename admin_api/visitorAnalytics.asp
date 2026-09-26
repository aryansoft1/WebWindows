<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<!--#include file="../inc/visitor-geo.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-store"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Function JsonText(ByVal value)
  Dim text
  If IsNull(value) Then text = "" Else text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

Sub Fail(ByVal statusText, ByVal code, ByVal message)
  Response.Status = statusText
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & """,""message"":""" & JsonText(message) & """}"
  If IsObject(conn) Then If conn.State <> 0 Then conn.Close
  Response.End
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

If Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST") <> "visitor-analytics" Then
  Fail "403 Forbidden", "ADMIN_REQUEST_REQUIRED", "无效的访客统计管理请求。"
End If
If Session("webwindows_admin") <> True Or _
   LCase(Trim(CStr(Session("username")))) <> "admin" Or _
   Not AdminSecurityTokenShape(Session("webwindows_admin_authority")) Then
  Fail "401 Unauthorized", "ADMIN_LOGIN_REQUIRED", "请先登录 WebWindows 管理后台。"
End If
Dim actionName
actionName = LCase(Trim(CStr(Request.QueryString("action"))))
If actionName = "" Then actionName = "summary"

' 共享模块里的相对 MapPath 会解析到 /inc/，配置必须由本页面（位于 /admin_api/）
' 显式解析后传进去，否则地区来源会一直误报为「未启用」。
GeoConfigureSub Server.MapPath("../api/visitor-analytics.config.asp")

If Not TableReady("webwindows_visitor_sessions") Or Not TableReady("webwindows_visitor_feature_stats") Then
  Fail "503 Service Unavailable", "ANALYTICS_SCHEMA_REQUIRED", "访客统计数据库迁移尚未应用。"
End If

'
' 补全历史地区：地区解析是显式启用的，启用之前产生的会话地区四列是空的，
' 世界地图自然没有颜色。这里让管理员按需回填，而不是等新访客慢慢积累。
' 写操作走与其它后台端点同一套 CSRF 门禁，并复用采集端的解析实现与每日额度。
'
If actionName = "backfill-geo" Then
  If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "POST" Then
    Fail "405 Method Not Allowed", "METHOD_NOT_ALLOWED", "补全历史地区仅支持 POST。"
  End If
  AdminSecurityRequireMutation "visitor-analytics", "visitor-geo-backfill"
  If Not GeoIisTrusted() And Not GeoExternalConfigured() Then
    Fail "503 Service Unavailable", "GEO_NOT_CONFIGURED", _
      "尚未启用地区解析：服务器缺少 api/visitor-analytics.config.asp，也没有开启本机 IIS GeoIP。"
  End If

  Dim backfillLimit
  backfillLimit = 200
  If IsNumeric(Request.Form("limit")) Then backfillLimit = CLng(Request.Form("limit"))
  If backfillLimit < 1 Then backfillLimit = 1
  If backfillLimit > 500 Then backfillLimit = 500

  Dim addressList(0), addressCount, index, targetAddress
  Dim pendingRs, scanned, resolvedCount, skipped, failed
  addressCount = 0
  scanned = 0
  resolvedCount = 0
  skipped = 0
  failed = 0
  Set pendingRs = conn.Execute("SELECT ip_address,COUNT(*) AS sessions FROM webwindows_visitor_sessions " & _
    "WHERE ip_address<>'' AND (country_code='' OR country_name='' OR city_name='') " & _
    "GROUP BY ip_address ORDER BY sessions DESC LIMIT " & backfillLimit)
  Do Until pendingRs.EOF
    ReDim Preserve addressList(addressCount)
    addressList(addressCount) = CStr(pendingRs("ip_address"))
    addressCount = addressCount + 1
    pendingRs.MoveNext
  Loop
  pendingRs.Close
  Set pendingRs = Nothing

  Dim updateCmd
  For index = 0 To addressCount - 1
    targetAddress = addressList(index)
    scanned = scanned + 1
    If Not GeoIsPublicAddress(targetAddress) Then
      skipped = skipped + 1
    Else
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
        If Err.Number <> 0 Then
          Err.Clear
          failed = failed + 1
        Else
          resolvedCount = resolvedCount + 1
        End If
        On Error GoTo 0
      Else
        failed = failed + 1
      End If
    End If
  Next

  Response.Write "{""ok"":true,""scanned"":" & scanned & _
    ",""resolved"":" & resolvedCount & _
    ",""skippedPrivate"":" & skipped & _
    ",""failed"":" & failed & _
    ",""remainingBudget"":" & GeoApiBudgetRemaining() & "}"
  conn.Close
  Set conn = Nothing
  Response.End
End If

If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "GET" Then
  Fail "405 Method Not Allowed", "METHOD_NOT_ALLOWED", "该接口仅支持读取。"
End If

Dim days, limitRows
days = 7
limitRows = 100
If IsNumeric(Request.QueryString("days")) Then days = CLng(Request.QueryString("days"))
If IsNumeric(Request.QueryString("limit")) Then limitRows = CLng(Request.QueryString("limit"))
If days < 1 Then days = 1
If days > 90 Then days = 90
If limitRows < 1 Then limitRows = 1
If limitRows > 500 Then limitRows = 500

Dim summaryRs, result
Set summaryRs = conn.Execute("SELECT COUNT(*) AS sessions,COUNT(DISTINCT visitor_key) AS visitors," & _
  "COALESCE(SUM(visitor_type='registered'),0) AS registered_sessions," & _
  "COALESCE(SUM(visitor_type='developer'),0) AS developer_sessions," & _
  "COALESCE(ROUND(AVG(active_seconds)),0) AS avg_active_seconds,COALESCE(SUM(active_seconds),0) AS total_active_seconds " & _
  "FROM webwindows_visitor_sessions WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY)")
result = "{""ok"":true,""days"":" & days & ",""summary"":{" & _
  """sessions"":" & CLng(summaryRs("sessions")) & _
  ",""visitors"":" & CLng(summaryRs("visitors")) & _
  ",""registeredSessions"":" & CLng(summaryRs("registered_sessions")) & _
  ",""developerSessions"":" & CLng(summaryRs("developer_sessions")) & _
  ",""averageActiveSeconds"":" & CLng(summaryRs("avg_active_seconds")) & _
  ",""totalActiveSeconds"":" & CLng(summaryRs("total_active_seconds")) & "}"
summaryRs.Close
Set summaryRs = Nothing

Dim typeRs, first
Set typeRs = conn.Execute("SELECT visitor_type,COUNT(*) AS sessions FROM webwindows_visitor_sessions " & _
  "WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) GROUP BY visitor_type ORDER BY sessions DESC")
result = result & ",""visitorTypes"": ["
first = True
Do Until typeRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""type"":""" & JsonText(typeRs("visitor_type")) & """,""sessions"":" & CLng(typeRs("sessions")) & "}"
  typeRs.MoveNext
Loop
typeRs.Close
Set typeRs = Nothing
result = result & "]"

Dim hourRs
Set hourRs = conn.Execute("SELECT HOUR(started_at) AS visit_hour,COUNT(*) AS sessions FROM webwindows_visitor_sessions " & _
  "WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) GROUP BY HOUR(started_at) ORDER BY visit_hour")
result = result & ",""hours"": ["
first = True
Do Until hourRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""hour"":" & CLng(hourRs("visit_hour")) & ",""sessions"":" & CLng(hourRs("sessions")) & "}"
  hourRs.MoveNext
Loop
hourRs.Close
Set hourRs = Nothing
result = result & "]"

'
' 地区来源与解析覆盖率。诚实展示：哪些会话真的解析出了地区、当前用的是哪个来源，
' 避免"地图空着但看不出原因"。解析实现与采集端共用 inc/visitor-geo.asp。
'
Dim geoRs, geoResolved, geoTotal, geoSource
geoResolved = 0
geoTotal = 0
Set geoRs = conn.Execute("SELECT COALESCE(SUM((country_code<>'' OR city_name<>'')),0) AS resolved," & _
  "COUNT(*) AS total FROM webwindows_visitor_sessions WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY)")
If Not geoRs.EOF Then
  geoResolved = CLng(geoRs("resolved"))
  geoTotal = CLng(geoRs("total"))
End If
geoRs.Close
Set geoRs = Nothing
If GeoIisTrusted() Then
  geoSource = "iis-geoip"
ElseIf GeoExternalConfigured() Then
  geoSource = "external-api"
Else
  geoSource = "none"
End If
Dim geoUnresolvedAddresses
geoUnresolvedAddresses = 0
Set geoRs = conn.Execute("SELECT COUNT(DISTINCT ip_address) AS pending FROM webwindows_visitor_sessions " & _
  "WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) AND ip_address<>'' " & _
  "AND (country_code='' OR country_name='' OR city_name='')")
If Not geoRs.EOF Then geoUnresolvedAddresses = CLng(geoRs("pending"))
geoRs.Close
Set geoRs = Nothing
result = result & ",""geo"":{""source"":""" & geoSource & """,""resolvedSessions"":" & geoResolved & _
  ",""totalSessions"":" & geoTotal & ",""pendingAddresses"":" & geoUnresolvedAddresses & "}"

'
' 设备分布
'
Dim deviceRs
result = result & ",""devices"": ["
first = True
Set deviceRs = conn.Execute("SELECT device_type,COUNT(*) AS sessions,COUNT(DISTINCT visitor_key) AS visitors," & _
  "COALESCE(ROUND(AVG(active_seconds)),0) AS avg_active FROM webwindows_visitor_sessions " & _
  "WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) GROUP BY device_type ORDER BY sessions DESC")
Do Until deviceRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""type"":""" & JsonText(deviceRs("device_type")) & _
    """,""sessions"":" & CLng(deviceRs("sessions")) & _
    ",""visitors"":" & CLng(deviceRs("visitors")) & _
    ",""averageActiveSeconds"":" & CLng(deviceRs("avg_active")) & "}"
  deviceRs.MoveNext
Loop
deviceRs.Close
Set deviceRs = Nothing
result = result & "]"

'
' 停留时间分布（6 档直方图，一次查询取回）
'
Dim dwellRs
Set dwellRs = conn.Execute("SELECT COALESCE(SUM(active_seconds<30),0) AS b1," & _
  "COALESCE(SUM(active_seconds>=30 AND active_seconds<120),0) AS b2," & _
  "COALESCE(SUM(active_seconds>=120 AND active_seconds<600),0) AS b3," & _
  "COALESCE(SUM(active_seconds>=600 AND active_seconds<1800),0) AS b4," & _
  "COALESCE(SUM(active_seconds>=1800 AND active_seconds<3600),0) AS b5," & _
  "COALESCE(SUM(active_seconds>=3600),0) AS b6 FROM webwindows_visitor_sessions " & _
  "WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY)")
Dim dwellValues, dwellLabels, dwellIndex
dwellValues = Array(0, 0, 0, 0, 0, 0)
If Not dwellRs.EOF Then
  dwellValues(0) = CLng(dwellRs("b1"))
  dwellValues(1) = CLng(dwellRs("b2"))
  dwellValues(2) = CLng(dwellRs("b3"))
  dwellValues(3) = CLng(dwellRs("b4"))
  dwellValues(4) = CLng(dwellRs("b5"))
  dwellValues(5) = CLng(dwellRs("b6"))
End If
dwellRs.Close
Set dwellRs = Nothing
dwellLabels = Array("30 秒内", "30 秒–2 分", "2–10 分", "10–30 分", "30–60 分", "1 小时以上")
result = result & ",""dwell"": ["
For dwellIndex = 0 To 5
  If dwellIndex > 0 Then result = result & ","
  result = result & "{""label"":""" & JsonText(dwellLabels(dwellIndex)) & _
    """,""sessions"":" & CLng(dwellValues(dwellIndex)) & "}"
Next
result = result & "]"

'
' 每日趋势
'
Dim dailyRs
result = result & ",""daily"": ["
first = True
Set dailyRs = conn.Execute("SELECT DATE_FORMAT(started_at,'%Y-%m-%d') AS visit_day,COUNT(*) AS sessions," & _
  "COUNT(DISTINCT visitor_key) AS visitors,COALESCE(SUM(active_seconds),0) AS active_seconds " & _
  "FROM webwindows_visitor_sessions WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) " & _
  "GROUP BY visit_day ORDER BY visit_day")
Do Until dailyRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""day"":""" & JsonText(dailyRs("visit_day")) & _
    """,""sessions"":" & CLng(dailyRs("sessions")) & _
    ",""visitors"":" & CLng(dailyRs("visitors")) & _
    ",""activeSeconds"":" & CLng(dailyRs("active_seconds")) & "}"
  dailyRs.MoveNext
Loop
dailyRs.Close
Set dailyRs = Nothing
result = result & "]"

'
' 世界地图数据：按国家聚合（country_code 是 ISO 3166-1 alpha-2）
'
Dim countryRs
result = result & ",""countries"": ["
first = True
Set countryRs = conn.Execute("SELECT COALESCE(country_code,'') AS country_code," & _
  "COALESCE(country_name,'') AS country_name,COUNT(*) AS sessions,COUNT(DISTINCT visitor_key) AS visitors " & _
  "FROM webwindows_visitor_sessions WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) " & _
  "GROUP BY country_code,country_name HAVING country_code<>'' OR country_name<>'' " & _
  "ORDER BY sessions DESC LIMIT 60")
Do Until countryRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""code"":""" & JsonText(countryRs("country_code")) & _
    """,""name"":""" & JsonText(countryRs("country_name")) & _
    """,""sessions"":" & CLng(countryRs("sessions")) & _
    ",""visitors"":" & CLng(countryRs("visitors")) & "}"
  countryRs.MoveNext
Loop
countryRs.Close
Set countryRs = Nothing
result = result & "]"

'
' 中国下钻数据：省 + 市
'
Dim chinaRs
result = result & ",""chinaRegions"": ["
first = True
Set chinaRs = conn.Execute("SELECT COALESCE(region_name,'') AS region_name," & _
  "COALESCE(city_name,'') AS city_name,COUNT(*) AS sessions,COUNT(DISTINCT visitor_key) AS visitors " & _
  "FROM webwindows_visitor_sessions WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) " & _
  "AND (country_code='CN' OR country_name='中国') " & _
  "GROUP BY region_name,city_name ORDER BY sessions DESC LIMIT 200")
Do Until chinaRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""region"":""" & JsonText(chinaRs("region_name")) & _
    """,""city"":""" & JsonText(chinaRs("city_name")) & _
    """,""sessions"":" & CLng(chinaRs("sessions")) & _
    ",""visitors"":" & CLng(chinaRs("visitors")) & "}"
  chinaRs.MoveNext
Loop
chinaRs.Close
Set chinaRs = Nothing
result = result & "]"

Dim featureRs
Set featureRs = conn.Execute("SELECT f.feature_key,MAX(f.feature_name) AS feature_name,SUM(f.open_count) AS open_count," & _
  "SUM(f.active_seconds) AS active_seconds,COUNT(DISTINCT f.visitor_session_id) AS sessions " & _
  "FROM webwindows_visitor_feature_stats f JOIN webwindows_visitor_sessions s ON s.id=f.visitor_session_id " & _
  "WHERE s.started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) GROUP BY f.feature_key " & _
  "ORDER BY active_seconds DESC,open_count DESC LIMIT 100")
result = result & ",""features"": ["
first = True
Do Until featureRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""key"":""" & JsonText(featureRs("feature_key")) & _
    """,""name"":""" & JsonText(featureRs("feature_name")) & _
    """,""opens"":" & CLng(featureRs("open_count")) & _
    ",""activeSeconds"":" & CLng(featureRs("active_seconds")) & _
    ",""sessions"":" & CLng(featureRs("sessions")) & "}"
  featureRs.MoveNext
Loop
featureRs.Close
Set featureRs = Nothing
result = result & "]"

Dim sessionRs, addressText
Set sessionRs = conn.Execute("SELECT id,visitor_type,username_snapshot,ip_address,country_code,country_name,region_name,city_name," & _
  "device_type,entry_path,active_seconds,started_at,last_seen_at FROM webwindows_visitor_sessions " & _
  "WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) ORDER BY started_at DESC LIMIT " & limitRows)
result = result & ",""sessions"": ["
first = True
Do Until sessionRs.EOF
  If Not first Then result = result & ","
  first = False
  addressText = Trim(CStr(sessionRs("country_name") & " " & sessionRs("region_name") & " " & sessionRs("city_name")))
  If addressText = "" Then addressText = CStr(sessionRs("country_code") & "")
  result = result & "{""id"":" & CLng(sessionRs("id")) & _
    ",""type"":""" & JsonText(sessionRs("visitor_type")) & _
    """,""username"":""" & JsonText(sessionRs("username_snapshot")) & _
    """,""ip"":""" & JsonText(sessionRs("ip_address")) & _
    """,""address"":""" & JsonText(addressText) & _
    """,""device"":""" & JsonText(sessionRs("device_type")) & _
    """,""entryPath"":""" & JsonText(sessionRs("entry_path")) & _
    """,""activeSeconds"":" & CLng(sessionRs("active_seconds")) & _
    ",""startedAt"":""" & JsonText(sessionRs("started_at")) & _
    """,""lastSeenAt"":""" & JsonText(sessionRs("last_seen_at")) & """}"
  sessionRs.MoveNext
Loop
sessionRs.Close
Set sessionRs = Nothing
result = result & "]"

Dim sessionFeatureRs
Set sessionFeatureRs = conn.Execute("SELECT f.visitor_session_id,f.feature_key,f.feature_name,f.open_count,f.active_seconds " & _
  "FROM webwindows_visitor_feature_stats f JOIN (" & _
  "SELECT id FROM webwindows_visitor_sessions WHERE started_at>=DATE_SUB(NOW(),INTERVAL " & days & " DAY) " & _
  "ORDER BY started_at DESC LIMIT " & limitRows & ") recent ON recent.id=f.visitor_session_id " & _
  "ORDER BY f.visitor_session_id DESC,f.active_seconds DESC LIMIT 1000")
result = result & ",""sessionFeatures"": ["
first = True
Do Until sessionFeatureRs.EOF
  If Not first Then result = result & ","
  first = False
  result = result & "{""sessionId"":" & CLng(sessionFeatureRs("visitor_session_id")) & _
    ",""key"":""" & JsonText(sessionFeatureRs("feature_key")) & _
    """,""name"":""" & JsonText(sessionFeatureRs("feature_name")) & _
    """,""opens"":" & CLng(sessionFeatureRs("open_count")) & _
    ",""activeSeconds"":" & CLng(sessionFeatureRs("active_seconds")) & "}"
  sessionFeatureRs.MoveNext
Loop
sessionFeatureRs.Close
Set sessionFeatureRs = Nothing
result = result & "]}"

Response.Write result
conn.Close
Set conn = Nothing
%>
