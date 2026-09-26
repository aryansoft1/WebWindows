<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
' ---------------------------------------------------------------------------
' 区划边界数据代理（供后台访客统计的中国下钻使用）
'
' 为什么需要它：边界数据原先由浏览器直接向第三方
'   https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json
' 取。该边缘节点带防盗链策略，实测响应头为
'   X-Tengine-Error: denied by Referer ACL
' 只要请求带 Referer 就返回 403；不带才是 200。浏览器跨域 fetch 默认带 Referer，
' 于是「点地图加载中国下钻」必然失败。虽然 fetch 的 referrerPolicy:"no-referrer"
' 按规范应当生效，但一旦有代理类浏览器扩展重发请求、丢掉 fetch 选项，就会退回 403
' —— 让功能依赖「客户端一定正确设置请求头」是不可靠的。
'
' 所以改成同源代理：请求由服务器发起（MSXML 不带 Referer），第三方再改策略也与
' 页面无关；顺带省掉跨域往返，边界数据还能被缓存。
'
' 安全边界（这是一个对外可访问的接口，必须按「可能被当成代理」来防）：
'   * 只接受 **纯数字的 adcode**，不接受任何 URL、主机名或路径 —— 不存在 SSRF；
'   * 上游地址由本文件写死，adcode 只作为路径片段拼接，且经数字校验；
'   * 不读数据库、不读任何用户数据、不依赖 Session；
'   * 上游失败时返回 502 与明确错误码，绝不把第三方错误页原样吐给页面。
' ---------------------------------------------------------------------------
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "Cache-Control", "public, max-age=86400"

Const UPSTREAM_BASE = "https://geo.datav.aliyun.com/areas_v3/bound/"
Const NATIONAL_ADCODE = "100000"
Const CACHE_TTL_MINUTES = 10080   ' 边界数据是不可变资源，缓存 7 天

Sub Fail(ByVal statusText, ByVal code, ByVal message)
  Response.Status = statusText
  Response.Write "{""ok"":false,""code"":""" & JsonEscape(code) & """,""message"":""" & JsonEscape(message) & """}"
  Response.End
End Sub

Function JsonEscape(ByVal value)
  Dim text, quoteMark
  ' 用 Chr(34) 拼引号。连续写一串 "" 时数错一个，VBScript 要么编译报错，
  ' 要么静默把后面的代码吞进字符串里 —— 写这个文件时就这样踩了一次：
  ' 字符串没闭合，后面整段代码都被当成字符串，只有编译期才暴露。
  quoteMark = Chr(34)
  text = CStr(value & "")
  text = Replace(text, "\", "\\")
  text = Replace(text, quoteMark, "\" & quoteMark)
  text = Replace(text, vbCrLf, " ")
  text = Replace(text, vbCr, " ")
  text = Replace(text, vbLf, " ")
  JsonEscape = text
End Function

' 只接受 1..6 位纯数字，杜绝任何路径/主机注入
Function SafeAdcode(ByVal raw)
  Dim text
  SafeAdcode = ""
  text = Trim(CStr(raw & ""))
  If Len(text) < 1 Or Len(text) > 6 Then Exit Function
  Dim index, digit
  For index = 1 To Len(text)
    digit = Mid(text, index, 1)
    If digit < "0" Or digit > "9" Then Exit Function
  Next
  SafeAdcode = text
End Function

Function CacheKey(ByVal adcode)
  CacheKey = "webwindows_region_geo_" & adcode
End Function

' 纯判断：缓存是否仍然新鲜。**刻意不做日期字符串运算** —— 2026-09-26 上线后
' 缓存命中路径直接 500，因为 CStr(Now()) 是本地化格式的字符串，
' Now() - "2026-09-26 19:51:50" 在非 en-US 区域抛类型不匹配。
' 这里只用「日序 + 当日分钟数」两个整数比较，任何 locale 都不会出错，
' 而且这个函数不碰 Application，可以在门禁里用真实样本直接验证。
Function GeoCacheFresh(ByVal dayNo, ByVal minuteNo, ByVal ttlMinutes)
  Dim nowMinute
  GeoCacheFresh = False
  If Not IsNumeric(dayNo) Or Not IsNumeric(minuteNo) Then Exit Function
  If CLng(dayNo) <> CLng(Day(Now())) Then Exit Function
  nowMinute = CLng(Hour(Now())) * 60 + CLng(Minute(Now()))
  GeoCacheFresh = ((nowMinute - CLng(minuteNo)) < CLng(ttlMinutes))
End Function

Sub ReadCache(ByVal adcode, ByRef payload, ByRef hit)
  Dim stored, dayNo, minuteNo
  payload = ""
  hit = False
  ' 任何异常都必须走「未命中」—— 这个接口是公开的，绝不能因为缓存出问题而 500。
  On Error Resume Next
  Err.Clear
  stored = Application(CacheKey(adcode))
  dayNo = Application(CacheKey(adcode) & "_day")
  minuteNo = Application(CacheKey(adcode) & "_min")
  If Err.Number <> 0 Then
    Err.Clear
    stored = ""
  End If
  On Error GoTo 0
  If Len(CStr(stored & "")) = 0 Then Exit Sub
  If Not GeoCacheFresh(dayNo, minuteNo, CACHE_TTL_MINUTES) Then Exit Sub
  payload = CStr(stored)
  hit = True
End Sub

Sub WriteCache(ByVal adcode, ByVal payload)
  ' 只存整数：日序 + 当日分钟数。存 Date 再用字符串比较是本文件踩过的坑。
  On Error Resume Next
  Application.Lock
  Application(CacheKey(adcode)) = payload
  Application(CacheKey(adcode) & "_day") = CLng(Day(Now()))
  Application(CacheKey(adcode) & "_min") = CLng(Hour(Now())) * 60 + CLng(Minute(Now()))
  Application.UnLock
  Err.Clear
  On Error GoTo 0
End Sub

Sub WriteCache(ByVal adcode, ByVal payload)
  On Error Resume Next
  Application.Lock
  Application(CacheKey(adcode)) = payload
  Application(CacheKey(adcode) & "_at") = Now()
  Application.UnLock
  Err.Clear
  On Error GoTo 0
End Sub

Function FetchUpstream(ByVal adcode)
  Dim http, url, body
  FetchUpstream = ""
  url = UPSTREAM_BASE & adcode & "_full.json"
  On Error Resume Next
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Nothing
    On Error GoTo 0
    Exit Function
  End If
  http.setTimeouts 3000, 3000, 5000, 6000
  http.Open "GET", url, False
  http.setRequestHeader "Accept", "application/json"
  http.setRequestHeader "User-Agent", "WebWindows-RegionGeo/1.0"
  http.send
  If CStr(http.Status) = "200" Then body = CStr(http.responseText)
  Set http = Nothing
  Err.Clear
  On Error GoTo 0
  If Len(Trim(body & "")) = 0 Then Exit Function
  ' 必须是对象而不是数组/错误页：边界数据的根节点带 features
  If InStr(1, body, """features""", vbTextCompare) = 0 Then Exit Function
  FetchUpstream = body
End Function

Dim adcode, payload, cached, hit
adcode = SafeAdcode(Request.QueryString("adcode"))
If adcode = "" Then
  Fail "400 Bad Request", "ADCODE_INVALID", "adcode 必须是 1 到 6 位纯数字。"
End If

ReadCache adcode, payload, hit
If Not hit Then
  payload = FetchUpstream(adcode)
  If payload = "" Then
    Fail "502 Bad Gateway", "UPSTREAM_UNAVAILABLE", "区划边界数据暂时取不到（上游 " & UPSTREAM_BASE & " 不可达或已变更策略），请稍后重试。"
  End If
  ' 全国图很大且每次都要用，值得放服务器缓存；省级体积小，交给浏览器缓存即可。
  If adcode = NATIONAL_ADCODE Then WriteCache adcode, payload
End If

Response.Write payload
Response.End
%>
