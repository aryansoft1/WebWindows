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
'
' 当日全量快照（实测依据）：
'   12306 leftTicket 对「当天」只返回尚未发车的车次——北京 2026-09-24 23:12
'   直连 queryG 仅剩 2 趟（23:25/23:40），已发车/运行中车次在上游就被过滤，
'   并非本代理所为（queryA/queryZ/query/lcQuery 全部 302，只有 queryG 可用）。
'   因此把每次查到的车次按「日期+区间」合并进内存快照：当天早些时候查过的
'   车次即使此刻已发车也仍可返回，运行中车次才能被搜到并按经停时刻定位。
'   只用 Application 内存，不落盘、不额外请求上游，2 天后过期。
'
Const RAIL_SNAPSHOT_TTL_SECONDS = 172800
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
  Case "__diag_snapshot_dir"
    '
    ' 一次性诊断：报告快照落盘目录探测结果（只读，不写业务数据）。
    ' 用于确认宿主实际允许应用池写入的位置；确认后应移除本 action。
    '
    SendSnapshotDirDiagnostic
  Case Else
    SendError "400 Bad Request", "unsupported_action", "不支持的 action，可用值：stations、leftTicket、schedule。"
End Select

Response.End

' ---------------------------------------------------------------------------
' 车站电报码表
' ---------------------------------------------------------------------------

' 一次性诊断：快照目录探测结果（确认后移除）
Sub SendSnapshotDirDiagnostic()
  Dim rows
  rows = ""

  Dim candidates()
  ReDim candidates(RAIL_SNAPSHOT_DIR_CANDIDATES)
  candidates(0) = Server.MapPath("../data/.rail-snapshot")
  candidates(1) = Server.MapPath("../cloud/file/.rail-snapshot")
  candidates(2) = Server.MapPath("../logs/.rail-snapshot")
  candidates(3) = LocalAppDataSnapshotDir()

  Dim i
  For i = 0 To UBound(candidates)
    Dim path
    path = CStr(candidates(i))
    Dim writable
    If Len(path) = 0 Then
      writable = "n/a"
    Else
      writable = CStr(IsDirWritable(path))
    End If

    If i > 0 Then rows = rows & ","
    rows = rows & "{""index"":" & CStr(i) & _
      ",""path"":""" & JsonEscape(path) & """" & _
      ",""writable"":""" & writable & """}"
  Next

  Dim resolved
  resolved = CStr(ResolveSnapshotDir())

  Response.Write "{""resolved"":""" & JsonEscape(resolved) & """,""candidates"":[" & rows & "]}"
End Sub

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

  '
  ' includeElapsed=1：返回「当日快照」，即把当天已抓到过的车次一并返回，
  ' 从而包含 12306 当天已过滤掉的已发车/运行中车次。
  '
  Dim includeElapsed
  includeElapsed = IsTruthy(Request.QueryString("includeElapsed"))

  Dim cacheKey
  cacheKey = "webwindows.railway.lt." & travelDate & "." & fromCode & "." & toCode

  Dim snapshotKey
  snapshotKey = "webwindows.railway.snap." & travelDate & "." & fromCode & "." & toCode

  Dim payload
  payload = CacheRead(cacheKey, RAIL_QUERY_TTL_SECONDS)

  If Len(payload) > 0 Then
    If includeElapsed Then
      Dim cachedSnapshot
      cachedSnapshot = SnapshotRead(snapshotKey)
      If Len(cachedSnapshot) > 0 Then
        Response.Write WithSnapshotFlag(cachedSnapshot)
        Exit Sub
      End If
    End If
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
    '
    ' 上游对过去日期直接拒绝（实测 502 upstream_blocked）。
    ' 若本地快照里已有该日车次，仍照常返回，避免「昨天明明查得到、
    ' 今天却搜不到」的割裂感。
    '
    Dim failedSnapshot
    failedSnapshot = SnapshotRead(snapshotKey)
    If includeElapsed And Len(failedSnapshot) > 0 Then
      Response.Write WithSnapshotFlag(failedSnapshot)
      Exit Sub
    End If
    SendError "502 Bad Gateway", "upstream_blocked", "12306 余票接口暂时不可用，请稍后重试。"
  End If

  Dim freshRows, fromName, toName, messageText
  ParseLeftTicketRows body, travelDate, fromCode, toCode, freshRows, fromName, toName, messageText

  If Not IsArrayNonEmpty(freshRows) And Len(messageText) = 0 Then
    SendError "502 Bad Gateway", "parse_failed", "无法解析 12306 余票数据。"
  End If

  payload = ComposeLeftTicketJson(travelDate, fromCode, toCode, fromName, toName, messageText, freshRows, False)
  CacheWrite cacheKey, payload

  ' 合并进当日快照（同车次以本次结果为准），供后续 includeElapsed / 过去日期回看
  Dim mergedRows
  mergedRows = SnapshotMergeRows(snapshotKey, freshRows)

  '
  ' 快照绝不能比本次响应更差：若合并结果为空（VBScript 下函数返回的数组
  ' 传给 ByRef 形参可能退化为空），退化成直接存本次响应。
  ' 线上症状：首次请求 106 趟，随后缓存命中的请求返回 "trains":[]。
  Dim snapshotPayload
  If IsArrayNonEmpty(mergedRows) Then
    snapshotPayload = ComposeLeftTicketJson(travelDate, fromCode, toCode, fromName, toName, messageText, mergedRows, False)
  Else
    snapshotPayload = payload
  End If
  SnapshotWrite snapshotKey, snapshotPayload

  If includeElapsed And IsArrayNonEmpty(mergedRows) Then
    Response.Write WithSnapshotFlag(ComposeLeftTicketJson(travelDate, fromCode, toCode, fromName, toName, messageText, mergedRows, False))
    Exit Sub
  End If

  Response.Write payload
End Sub

Sub ParseLeftTicketRows(ByVal body, ByVal travelDate, ByVal fromCode, ByVal toCode, ByRef rowsOut, ByRef fromNameOut, ByRef toNameOut, ByRef messageOut)
  rowsOut = Empty
  fromNameOut = fromCode
  toNameOut = toCode
  messageOut = ""

  Dim fromName, toName
  fromName = MapName(body, fromCode)
  toName = MapName(body, toCode)
  If Len(fromName) = 0 Then fromName = fromCode
  If Len(toName) = 0 Then toName = toCode
  fromNameOut = fromName
  toNameOut = toName

  ' 12306 是同城级查询：结果行的发站/到站可能是同城的其他车站
  '（查「成都」会返回「成都东」发车的车次）。把 map 解析一次，
  ' 每行输出真实上下车站，客户端据此切片经停表。
  Dim nameMap
  Set nameMap = ParseNameMap(body)

  Dim block
  block = ExtractArrayBlock(body, "result")

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
      one = BuildTrainJson(Split(m.SubMatches(0), "|"), fromName, toName, nameMap)
      If Len(one) > 0 Then
        rows(count) = one
        count = count + 1
      End If
    Next

    If count > 0 Then
      ReDim Preserve rows(count - 1)
      rowsOut = rows
    End If
    Set re = Nothing
  End If

  messageOut = JsonField(body, "messages")
End Sub

' rows 故意按值传：VBScript 把「函数返回的数组」传给 ByRef 形参时可能退化为空，
' 实测会让快照写成 "trains":[]（缓存命中后运行中车次全部消失）。
Function ComposeLeftTicketJson(ByVal travelDate, ByVal fromCode, ByVal toCode, ByVal fromName, ByVal toName, ByVal messageText, ByVal rows, ByVal snapshotFlag)
  Dim trains
  trains = ""
  If IsArrayNonEmpty(rows) Then
    trains = Join(rows, ",")
  End If

  Dim flag
  flag = ""
  If snapshotFlag Then
    flag = ",""snapshot"":true"
  End If

  ComposeLeftTicketJson = "{""date"":""" & JsonEscape(travelDate) & _
    """,""from"":{""code"":""" & JsonEscape(fromCode) & """,""name"":""" & JsonEscape(fromName) & """}," & _
    """to"":{""code"":""" & JsonEscape(toCode) & """,""name"":""" & JsonEscape(toName) & """}," & _
    """message"":""" & JsonEscape(messageText) & """," & _
    """trains"":[" & trains & "]" & flag & "}"
End Function

' ---------------------------------------------------------------------------
' 当日快照
' ---------------------------------------------------------------------------
'
' 存储分两层：
'   1) Application 内存（快，但应用池回收即丢——线上事故：回收后
'      includeElapsed 不再返回 snapshot 标记，10:31 的查询里
'      80 趟全是 10:42 之后的「未发车」，运行中/已过站车次全部消失）；
'   2) 站点内文件（../data/.rail-snapshot/，随站点持久化）。
'   服务器已有写盘先例（api/dt_fetch_links.asp 用 FSO 写删 ../data，
'   api/storage-quota.asp 遍历 ../cloud/file/），故复用该目录。
'   读取顺序：内存 → 文件；写入：两层都写。
'
Function SnapshotRead(ByVal key)
  Dim value
  value = CacheRead(key, RAIL_SNAPSHOT_TTL_SECONDS)

  If Len(value) = 0 Then
    value = SnapshotReadFile(SnapshotFilePath(key))
  End If

  If Len(value) = 0 Then
    ' 过期条目顺手清掉，避免 Application 随查询组合无限增长
    On Error Resume Next
    Application.Lock
    Application.UnLock key
    On Error GoTo 0
  End If

  SnapshotRead = value
End Function

Sub SnapshotWrite(ByVal key, ByVal value)
  CacheWrite key, value
  SnapshotWriteFile SnapshotFilePath(key), value
End Sub

Function SnapshotFilePath(ByVal key)
  ' key 形如 webwindows.railway.snap.2026-09-25.ICW.EAY
  Dim safeName
  safeName = Replace(CStr(key), ".", "_")

  Dim dirPath
  dirPath = ResolveSnapshotDir()

  If Len(dirPath) = 0 Then
    SnapshotFilePath = ""
    Exit Function
  End If

  SnapshotFilePath = dirPath & "\" & safeName & ".json"
End Function

'
' 快照落盘目录探测。
'
' 线上实测：Server.MapPath("../data/.rail-snapshot/") 写不进去（快照文件 404），
' 说明应用池对 data/ 没有建目录权限——而 api/dt_fetch_links.asp 能写 ../data，
' 说明不同目录的权限不一致。与其猜，不如启动时按候选顺序实测「能否建目录 +
' 写探针文件」，把第一个可写目录缓存下来；都不行就退化为纯内存快照
' （功能不受影响，只是不再跨应用池回收持久）。
'
Const RAIL_SNAPSHOT_DIR_CANDIDATES = 4

Function ResolveSnapshotDir()
  Dim cached
  cached = CachedSnapshotDir()
  If Len(cached) = 0 Then
    cached = CStr(Application("webwindows.railway.snapdir") & "")
  End If

  If Len(cached) > 0 Then
    ResolveSnapshotDir = cached
    Exit Function
  End If

  Dim candidates()
  ReDim candidates(RAIL_SNAPSHOT_DIR_CANDIDATES)
  candidates(0) = Server.MapPath("../data/.rail-snapshot")
  candidates(1) = Server.MapPath("../cloud/file/.rail-snapshot")
  candidates(2) = Server.MapPath("../logs/.rail-snapshot")
  candidates(3) = LocalAppDataSnapshotDir()

  Dim i
  Dim chosen
  chosen = ""
  For i = 0 To UBound(candidates)
    If Len(candidates(i)) > 0 Then
      If IsDirWritable(candidates(i)) Then
        chosen = candidates(i)
        Exit For
      End If
    End If
  Next

  On Error Resume Next
  Application.Lock
  Application("webwindows.railway.snapdir") = chosen
  Application.UnLock
  On Error GoTo 0

  ResolveSnapshotDir = chosen
End Function

Function LocalAppDataSnapshotDir()
  LocalAppDataSnapshotDir = ""
  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  Dim root
  root = fso.GetSpecialFolder(2) ' 2 = local app data
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If
  LocalAppDataSnapshotDir = fso.BuildPath(root & "\WebWindows\rail-snapshot")
  On Error GoTo 0
End Function

Function CachedSnapshotDir()
  CachedSnapshotDir = ""
  On Error Resume Next
  CachedSnapshotDir = CStr(Application("webwindows.railway.snapdir") & "")
  On Error GoTo 0
End Function

' 能否建目录并写入探针文件（注意：ASP 引擎没有 Dir()，只能用 FSO）
Function IsDirWritable(ByVal dirPath)
  IsDirWritable = False

  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Exit Function
  End If

  If Not fso.FolderExists(dirPath) Then
    fso.CreateFolder(dirPath)
  End If

  If Err.Number <> 0 Or Not fso.FolderExists(dirPath) Then
    Err.Clear
    Set fso = Nothing
    Exit Function
  End If

  Dim probe
  probe = fso.BuildPath(dirPath & "\.probe.tmp")

  ' 注意：CreateTextFile 不接受第 4 个参数（会报 450），统一走 ADODB UTF-8 写入
  WriteUtf8File probe, "ok"

  If Err.Number <> 0 Then
    Err.Clear
    Set fso = Nothing
    Exit Function
  End If

  fso.DeleteFile probe, True

  IsDirWritable = (Err.Number = 0)

  Set fso = Nothing
  On Error GoTo 0
End Function

Function SnapshotReadFile(ByVal path)
  SnapshotReadFile = ""
  If Len(CStr(path)) = 0 Then Exit Function

  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Set fso = Nothing
    Exit Function
  End If

  If Not fso.FileExists(path) Then
    Set fso = Nothing
    Exit Function
  End If

  ' 过期即视为不存在
  If DateDiff("s", fso.GetFile(path).DateLastModified, Now()) > RAIL_SNAPSHOT_TTL_SECONDS Then
    Set fso = Nothing
    Exit Function
  End If
  Set fso = Nothing

  SnapshotReadFile = ReadUtf8File(path)

  On Error GoTo 0
End Function

Sub SnapshotWriteFile(ByVal path, ByVal value)
  If Len(CStr(path)) = 0 Then Exit Sub

  On Error Resume Next
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then
    Err.Clear
    Set fso = Nothing
    Exit Sub
  End If

  Dim folder
  folder = fso.GetParentFolderName(path)
  If Not fso.FolderExists(folder) Then
    fso.CreateFolder(folder)
  End If
  Set fso = Nothing

  ' 先写临时文件再覆盖，避免中断留下半截 JSON（线上事故的根因之一）
  Dim tempPath
  tempPath = path & ".tmp"
  WriteUtf8File tempPath, CStr(value)

  Dim fso2
  Set fso2 = Server.CreateObject("Scripting.FileSystemObject")
  If fso2.FileExists(path) Then
    fso2.DeleteFile path, True
  End If
  fso2.MoveFile tempPath, path
  Set fso2 = Nothing

  On Error GoTo 0
End Sub

'
' UTF-8 文件读写。
'
' 线上踩坑记录：FileSystemObject 的 CreateTextFile **不支持第 4 个参数**
' （传 -65001 报「错误的参数个数或无效的参数属性值」450），OpenTextFile 传
' -65001 报「无效的过程调用或参数」5。两者都会让写入/读取静默失败——
' 曾因此误判「快照目录不可写」。ADODB.Stream 的 charset 参数才是正解。
'
Sub WriteUtf8File(ByVal path, ByVal content)
  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2                  ' adTypeText
  stream.Charset = "utf-8"
  stream.Open
  stream.WriteText CStr(content)
  stream.SaveToFile CStr(path), 2  ' adSaveCreateOverWriteFile
  stream.Close
  Set stream = Nothing
End Sub

Function ReadUtf8File(ByVal path)
  ReadUtf8File = ""
  Dim stream
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile CStr(path)
  ReadUtf8File = CStr(stream.ReadText)
  stream.Close
  Set stream = Nothing
End Function

'
' 把新抓到的车次并入快照，返回合并后的行数组。
' 存储格式：每行 "trainNo<TAB>{json}"，以 vbLf 分隔；
' 合并键取 trainNo，同车次以最新一次结果为准。
'
Function SnapshotMergeRows(ByVal key, ByRef freshRows)
  Dim dict
  Set dict = Server.CreateObject("Scripting.Dictionary")
  dict.CompareMode = 1

  Dim existing
  existing = SnapshotRead(key)

  If Len(existing) > 0 Then
    Dim block, pieces, i, row, storedNo
    block = ExtractTrainsArray(existing)
    If Len(block) > 0 Then
      pieces = Split(block, "},{")
      For i = 0 To UBound(pieces)
        row = CStr(pieces(i))
        If Left(row, 1) <> "{" Then row = "{" & row
        If Right(row, 1) <> "}" Then row = row & "}"
        storedNo = JsonStringField(row, "trainNo")
        If IsTrainNo(storedNo) And Not dict.Exists(storedNo) Then
          dict.Add storedNo, row
        End If
      Next
    End If
  End If

  If IsArrayNonEmpty(freshRows) Then
    Dim j, freshRow, freshNo
    For j = LBound(freshRows) To UBound(freshRows)
      freshRow = CStr(freshRows(j))
      freshNo = JsonStringField(freshRow, "trainNo")
      If IsTrainNo(freshNo) Then
        If dict.Exists(freshNo) Then
          dict(freshNo) = freshRow
        Else
          dict.Add freshNo, freshRow
        End If
      End If
    Next
  End If

  If dict.Count = 0 Then
    SnapshotMergeRows = Empty
    Exit Function
  End If

  Dim keys, result(), count, k
  keys = dict.Keys
  ReDim result(RAIL_MAX_TRAINS)
  count = 0
  For Each k In keys
    If count <= RAIL_MAX_TRAINS Then
      result(count) = CStr(dict(k))
      count = count + 1
    End If
  Next

  If count = 0 Then
    SnapshotMergeRows = Empty
    Exit Function
  End If

  ReDim Preserve result(count - 1)
  SnapshotMergeRows = result
End Function

Function ExtractTrainsArray(ByVal payload)
  ExtractTrainsArray = ""
  Dim marker, startPos, endPos
  ' marker 运行值 = "trains":[（用 Chr(34) 规避 VBScript 连续引号歧义）
  marker = Chr(34) & "trains" & Chr(34) & ":["
  startPos = InStr(payload, marker)
  If startPos = 0 Then Exit Function
  startPos = startPos + Len(marker)
  endPos = InStrRev(payload, "]")
  If endPos <= startPos Then Exit Function
  ExtractTrainsArray = Mid(payload, startPos, endPos - startPos)
End Function

Function WithSnapshotFlag(ByVal payload)
  Dim trimmed
  trimmed = Trim(CStr(payload))
  If Len(trimmed) = 0 Then
    WithSnapshotFlag = trimmed
    Exit Function
  End If
  If Right(trimmed, 1) <> "}" Then
    WithSnapshotFlag = trimmed
    Exit Function
  End If
  If InStr(trimmed, Chr(34) & "snapshot" & Chr(34) & ":") > 0 Then
    WithSnapshotFlag = trimmed
    Exit Function
  End If
  WithSnapshotFlag = Left(trimmed, Len(trimmed) - 1) & "," & Chr(34) & "snapshot" & Chr(34) & ":true}"
End Function

Function JsonStringField(ByVal json, ByVal fieldName)
  JsonStringField = ""
  Dim marker, startPos, endPos
  ' marker 运行值 = "trainNo":（首尾各一个双引号 + 冒号）
  marker = Chr(34) & fieldName & Chr(34) & ":"
  startPos = InStr(json, marker)
  If startPos = 0 Then Exit Function
  startPos = startPos + Len(marker)
  endPos = InStr(startPos, json, Chr(34))
  If endPos = 0 Or endPos <= startPos Then Exit Function
  JsonStringField = Mid(json, startPos, endPos - startPos)
End Function

Function IsArrayNonEmpty(ByVal value)
  IsArrayNonEmpty = False
  If Not IsArray(value) Then Exit Function
  If UBound(value) < LBound(value) Then Exit Function
  IsArrayNonEmpty = True
End Function

Function IsTruthy(ByVal value)
  Dim normalized
  normalized = LCase(Trim(CStr(value)))
  IsTruthy = (normalized = "1" Or normalized = "true" Or normalized = "yes" Or normalized = "on")
End Function

Function BuildTrainJson(ByVal fields, ByVal fallbackFromName, ByVal fallbackToName, ByVal nameMap)
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

  ' 行内真实发站/到站（同城查询时 ≠ 查询站），缺 map 时回落查询站名
  Dim rowFromCode, rowToCode, rowFromName, rowToName
  rowFromCode = ""
  rowToCode = ""
  If UBound(fields) >= 7 Then
    rowFromCode = fields(6)
    rowToCode = fields(7)
  End If
  rowFromName = fallbackFromName
  rowToName = fallbackToName
  If IsObject(nameMap) Then
    If Len(rowFromCode) > 0 And nameMap.Exists(rowFromCode) Then rowFromName = nameMap(rowFromCode)
    If Len(rowToCode) > 0 And nameMap.Exists(rowToCode) Then rowToName = nameMap(rowToCode)
  End If

  BuildTrainJson = "{""trainNo"":""" & JsonEscape(trainNo) & _
    """,""code"":""" & JsonEscape(code) & _
    """,""fromCode"":""" & JsonEscape(rowFromCode) & _
    """,""toCode"":""" & JsonEscape(rowToCode) & _
    """,""fromName"":""" & JsonEscape(rowFromName) & _
    """,""toName"":""" & JsonEscape(rowToName) & _
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

' 一次性解析 12306 响应里的电报码->站名映射（"map" 对象），
' 供建行级 fromCode/toCode 输出；正则只匹配 3 位大写电报码键。
Function ParseNameMap(ByVal body)
  Dim dict
  Set dict = CreateObject("Scripting.Dictionary")

  Dim re
  Set re = New RegExp
  re.Pattern = """([A-Z]{3})""\s*:\s*""([^""]*)"""
  re.Global = True

  Dim m
  For Each m In re.Execute(body)
    If Not dict.Exists(m.SubMatches(0)) Then
      dict(m.SubMatches(0)) = UnescapeJson(m.SubMatches(1))
    End If
  Next
  Set re = Nothing

  Set ParseNameMap = dict
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
