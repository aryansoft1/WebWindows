<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="adminGuard.asp"-->
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
If Session("webwindows_admin") <> True Then
  Fail "401 Unauthorized", "ADMIN_LOGIN_REQUIRED", "请先登录 WebWindows 管理后台。"
End If
If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "GET" Then
  Fail "405 Method Not Allowed", "METHOD_NOT_ALLOWED", "该接口仅支持读取。"
End If
If Not TableReady("webwindows_visitor_sessions") Or Not TableReady("webwindows_visitor_feature_stats") Then
  Fail "503 Service Unavailable", "ANALYTICS_SCHEMA_REQUIRED", "访客统计数据库迁移尚未应用。"
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
