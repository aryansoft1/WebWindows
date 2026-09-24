<%@ Language="VBScript" CodePage="65001" %>
<%
' ============================================================================
' 一次性诊断脚本：探测 12306 移动端（微信小程序）端点在「生产服务器 IP」下
' 是否可用，用于评估「运行中车次 / 真实走向 polyline」能否加源实现。
'
' 背景：本机 IP 实测 getTrainMapLine 返回 status=false「操作失败」、
'       travelServiceQrcodeTrainInfo 返回 data={}、bigScreen 403，
'       无法判断是「接口不可用」还是「按 IP/Header 限制」。
'       同一接口从生产服务器再测一次即可区分。
'
' 安全：只发 GET，不带任何凭据；不写服务器文件；不改任何线上逻辑。
' 用法：GET /api/probe-12306-mobile.asp?date=20260925&train=G4868&trainNo=78000G486801
' 完成后应从服务器删除本文件（临时诊断，不纳入部署清单）。
' ============================================================================

Option Explicit

Response.CodePage = 65001
Response.CharSet = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-cache"

Const MOBILE_BASE = "https://mobile.12306.cn/wxxcx"

Dim serviceDate
serviceDate = Trim(Request.QueryString("date"))
If Len(serviceDate) = 8 Then
  serviceDate = Left(serviceDate, 4) & "-" & Mid(serviceDate, 5, 2) & "-" & Mid(serviceDate, 7, 2)
End If
If Len(serviceDate) <> 10 Then
  serviceDate = FormatDateTime(Date, "yyyy-mm-dd")
End If

Dim serviceDateCompact
serviceDateCompact = Replace(serviceDate, "-", "")

Dim trainCode
trainCode = UCase(Trim(Request.QueryString("train")))
If Len(trainCode) = 0 Then
  trainCode = "G1"
End If

Dim trainNo
trainNo = Trim(Request.QueryString("trainNo"))

Dim stationCode
stationCode = UCase(Trim(Request.QueryString("station")))
If Len(stationCode) = 0 Then
  stationCode = "ICW"
End If

' iPhone 微信 UA：12306 小程序后端对桌面 UA 常直接 403
Const MOBILE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003128) NetType/WIFI Language/zh_CN"

Dim results
results = "&quot;serverDate&quot;:&quot;" & EscapeJson(Now()) & "&quot;,&quot;probeDate&quot;:&quot;" & serviceDate & "&quot;,&quot;cases&quot;:["

Dim first
first = True

' 1) 车次走向（真实 polyline）：能把「直线插值」升级为「沿真实线路插值」
If Len(trainNo) > 0 Then
  results = results & AddCase(first, "trainMapLine", MOBILE_BASE & "/wechat/main/getTrainMapLine?version=v2&trainNo=" & UrlEncode(trainNo), MOBILE_UA, "https://mobile.12306.cn/")
  first = False
End If

' 2) 车次运行信息（到发时刻 + 担当车底 + 车站坐标）
results = results & AddCase(first, "qrcodeTrainInfo(" & serviceDateCompact & ")", MOBILE_BASE & "/wechat/main/travelServiceQrcodeTrainInfo?trainCode=" & UrlEncode(trainCode) & "&startDay=" & serviceDateCompact, MOBILE_UA, "https://mobile.12306.cn/")
first = False

' 3) 同上但用 YYYY-MM-DD（部分文档两种格式都出现过）
If InStr(serviceDateCompact, "-") = 0 Then
  results = results & AddCase(first, "qrcodeTrainInfo(dashed)", MOBILE_BASE & "/wechat/main/travelServiceQrcodeTrainInfo?trainCode=" & UrlEncode(trainCode) & "&startDay=" & serviceDate, MOBILE_UA, "https://mobile.12306.cn/")
  first = False
End If

' 4) 车站大屏（唯一已知能列出「已发车 + 运行中」车次的公开端点）
results = results & AddCase(first, "bigScreenTrainList", MOBILE_BASE & "/bigScreen/getTrainList?stationCode=" & UrlEncode(stationCode) & "&trainDate=" & serviceDateCompact & "&reqType=json", MOBILE_UA, "https://mobile.12306.cn/")
first = False

' 5) 同一大屏端点换紧凑日期
results = results & AddCase(first, "bigScreenTrainList(dashed)", MOBILE_BASE & "/bigScreen/getTrainList?stationCode=" & UrlEncode(stationCode) & "&trainDate=" & serviceDate & "&reqType=json", MOBILE_UA, "https://mobile.12306.cn/")
first = False

' 6) 备用：官网站名表（确认服务器能直连 12306 域，非全站被墙）
results = results & AddCase(first, "stationNameJs", "https://kyfw.12306.cn/otn/resources/js/framework/station_name.js", MOBILE_UA, "https://kyfw.12306.cn/")

results = results & "]"

Response.Write "{" & results & "}"
Response.End


Function AddCase(ByRef isFirst, label, url, userAgent, referer)

  Dim result
  result = HttpGet(url, userAgent, referer)

  Dim statusCode
  statusCode = CLng(result(0))

  Dim body
  body = CStr(result(1))

  Dim errorText
  errorText = CStr(result(2))

  Dim item
  item = "{""label"":&quot;" & EscapeJson(label) & _
         "&quot;,&quot;status&quot;:" & CStr(statusCode) & _
         "&quot;bytes&quot;:" & CStr(Len(body)) & _
         "&quot;elapsedMs&quot;:" & CStr(result(3)) & _
         "&quot;error&quot;:&quot;" & EscapeJson(errorText) & "&quot;" & _
         "&quot;snippet&quot;:&quot;" & EscapeJson(Left(body, 400)) & "&quot;}"

  If isFirst Then
    isFirst = False
    AddCase = item
  Else
    AddCase = "," & item
  End If

End Function


Function HttpGet(url, userAgent, referer)

  On Error Resume Next

  Dim startedAt
  startedAt = Timer

  Dim http
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")

  If Err.Number <> 0 Then
    Err.Clear
    HttpGet = Array(0, "", "create_failed", 0)
    Exit Function
  End If

  ' connect / send / receive / total（ms）
  http.setTimeouts 8000, 8000, 20000, 30000

  http.open "GET", url, False

  http.setRequestHeader "Accept", "application/json, text/plain, */*"
  http.setRequestHeader "Accept-Encoding", "identity"
  http.setRequestHeader "User-Agent", userAgent
  http.setRequestHeader "Referer", referer
  http.setRequestHeader "X-Requested-With", "XMLHttpRequest"

  http.send

  Dim elapsedMs
  elapsedMs = CLng((Timer - startedAt) * 1000)

  If Err.Number <> 0 Then
    Dim errorText
    errorText = Err.Description
    Err.Clear
    HttpGet = Array(0, "", errorText, elapsedMs)
    Set http = Nothing
    Exit Function
  End If

  Dim statusCode
  statusCode = CLng(http.status)

  Dim body
  body = http.responseText

  HttpGet = Array(statusCode, body, "", elapsedMs)

  Set http = Nothing

  On Error GoTo 0

End Function


Function EscapeJson(value)

  Dim result
  result = CStr(value)

  result = Replace(result, "\", "\\")
  result = Replace(result, """", "\""")
  result = Replace(result, vbCr, " ")
  result = Replace(result, vbLf, " ")
  result = Replace(result, vbTab, " ")

  EscapeJson = result

End Function


Function UrlEncode(value)

  Dim result
  result = CStr(value)

  Dim i
  Dim ch
  Dim code

  For i = 1 To Len(result)
    ch = Mid(result, i, 1)
    code = AscW(ch)
    If code < 0 Then
      code = code + 65536
    End If
    If _
      (code >= 48 And code <= 57) Or _
      (code >= 65 And code <= 90) Or _
      (code >= 97 And code <= 122) Or _
      ch = "-" Or ch = "_" Or ch = "." Or ch = "~" Then
      result = Left(result, i - 1) & ch & Mid(result, i + 1)
    Else
      result = Left(result, i - 1) & "%" & Hex(code) & Mid(result, i + 1)
    End If
  Next

  UrlEncode = result

End Function
%>
