<%@ LANGUAGE="VBScript" %>
<%
' ===== 输出设置 =====
Response.CodePage = 65001
Session.CodePage  = 65001
Response.Buffer = True
Response.Clear
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"

' ===== 工具 =====
Function JsonEsc(s)
  If IsNull(s) Then s = ""
  Dim t : t = CStr(s)
  t = Replace(t, Chr(92), Chr(92) & Chr(92))
  t = Replace(t, Chr(34), Chr(92) & Chr(34))
  t = Replace(t, vbCrLf, "\n")
  t = Replace(t, vbCr,   "\n")
  t = Replace(t, vbLf,   "\n")
  JsonEsc = t
End Function

Sub Fail(at)
  If Err.Number <> 0 Then
    Response.Write "{""ok"":false,""at"":""" & JsonEsc(at) & """,""err_no"":" & Err.Number & ",""err_desc"":""" & JsonEsc(Err.Description) & """}"
    Response.End
  End If
End Sub

Function ReadCookie(name)
  Dim v : v = CStr(Request.Cookies(name))
  If Len(v)>0 Then ReadCookie = v Else ReadCookie = ""
End Function

' —— 读取 ActiveTimeBias（分钟；正负皆可能；含 DST）
Function GetActiveBiasMinutes()
  On Error Resume Next
  Dim sh, v, n, bias
  bias = 0
  Set sh = Server.CreateObject("WScript.Shell")
  v = sh.RegRead("HKLM\System\CurrentControlSet\Control\TimeZoneInformation\ActiveTimeBias")
  If Err.Number <> 0 Then
    Err.Clear
    bias = 0
  Else
    If IsArray(v) Then
      n = v(0) + v(1)*256 + v(2)*65536 + v(3)*16777216
      If n > 2147483647 Then n = n - 4294967296
      bias = n
    Else
      bias = CLng(v)
    End If
  End If
  On Error Goto 0
  GetActiveBiasMinutes = bias   ' 这个“bias”需要加到“本地时间”上才能得到 UTC
End Function

Function NowTs() ' -> Long (UTC seconds)
  Dim bias, utcNow
  bias   = GetActiveBiasMinutes()
  utcNow = DateAdd("n", bias, Now())            ' 关键修正：本地 + 偏移 = UTC
  NowTs  = DateDiff("s","1970-01-01 00:00:00", utcNow)

  ' —— 如果你的主机读不了注册表，临时用常量兜底（日本=+09:00 => 540；中国=+08:00 => 480）——
  ' Const FORCE_TZ_MIN = 540
  ' NowTs = DateDiff("s","1970-01-01 00:00:00", DateAdd("n", FORCE_TZ_MIN, Now()))
End Function

Function IsoUtc(d) ' -> "YYYY-MM-DDThh:mm:ssZ"
  Dim s
  s = CStr(Year(d)) & "-" & Right("0"&Month(d),2) & "-" & Right("0"&Day(d),2) & "T" & _
      Right("0"&Hour(d),2) & ":" & Right("0"&Minute(d),2) & ":" & Right("0"&Second(d),2) & "Z"
  IsoUtc = s
End Function

' —— 用 ts（UTC 秒）生成 0 时区（Z）时间串，和 NowTs 同一套偏移规则
Function IsoUtcFromTs(ts)
  Dim baseLocal, asLocal, bias, asUtc
  baseLocal = CDate("1970-01-01 00:00:00")      ' “本地解释”的 epoch
  asLocal   = DateAdd("s", CLng(ts), baseLocal)  ' epoch + ts => 本地时区的那一刻
  bias      = GetActiveBiasMinutes()             ' 与 NowTs 同源的偏移
  asUtc     = DateAdd("n", bias, asLocal)        ' 本地 + 偏移 = UTC
  IsoUtcFromTs = IsoUtc(asUtc)
End Function

' 将文本保存为 UTF-8（无 BOM），返回是否成功 + 错误信息
Function SaveUtf8NoBom(path, txt, ByRef errNo, ByRef errDesc)
  On Error Resume Next
  errNo = 0 : errDesc = ""

  Dim s : Set s = Server.CreateObject("ADODB.Stream")
  s.Type = 2 : s.Charset = "utf-8" : s.Open
  s.WriteText CStr(txt)
  s.Position = 0 : s.Type = 1
  Dim buf : buf = s.Read
  s.Close : Set s = Nothing

  ' 去掉 UTF-8 BOM
  If IsArray(buf) Then
    If UBound(buf) >= 2 Then
      If buf(0)=239 And buf(1)=187 And buf(2)=191 Then
        Dim i, b2() : ReDim b2(UBound(buf)-3)
        For i=3 To UBound(buf) : b2(i-3)=buf(i) : Next
        buf = b2
      End If
    End If
  End If

  Dim o : Set o = Server.CreateObject("ADODB.Stream")
  o.Type = 1 : o.Open : o.Write buf
  o.SaveToFile path, 2
  errNo  = Err.Number
  errDesc = Err.Description
  o.Close : Set o = Nothing

  SaveUtf8NoBom = (errNo = 0)
End Function

' ===== 主逻辑 =====
On Error Resume Next

Dim convId, toUser, body
convId = Request("convId")
toUser = Request("to")
body   = Request("content")

If Len(convId)=0 Or Len(toUser)=0 Or Len(body)=0 Then
  Response.Write "{""ok"":false,""error"":""bad_params""}"
  Response.End
End If

Dim fso : Set fso = Server.CreateObject("Scripting.FileSystemObject") : Fail "CreateObject.FSO"
Dim base : base = Server.MapPath("../data") : Fail "MapPath(../data)"

Dim chatDir, inboxDir
chatDir  = base & "\chat\conversations\" & convId
inboxDir = base & "\chat\inbox\" & toUser

If Not fso.FolderExists(base) Then fso.CreateFolder(base)
If Not fso.FolderExists(base & "\chat") Then fso.CreateFolder(base & "\chat")
If Not fso.FolderExists(base & "\chat\conversations") Then fso.CreateFolder(base & "\chat\conversations")
If Not fso.FolderExists(chatDir) Then fso.CreateFolder(chatDir)
If Not fso.FolderExists(base & "\chat\inbox") Then fso.CreateFolder(base & "\chat\inbox")
If Not fso.FolderExists(inboxDir) Then fso.CreateFolder(inboxDir)

Dim ts, fname, fpath
Dim senderU : senderU = Request("u")            ' ← 前端传来的稳定“我方ID”
If Len(senderU)=0 Then senderU = convId         ' ← 兜底：老版本仍可写，但尽量不要触发

ts = NowTs()
Randomize
fname = CStr(ts) & "-" & CStr(Int(Rnd()*1000000)) & ".json"
fpath = chatDir & "\" & fname

Dim one
one = "{""id"":""" & fname & """,""ts"":" & ts & ",""ts_iso"":""" & IsoUtcFromTs(ts) & """,""from"":""" & _
      JsonEsc(senderU) & """,""to"":""" & JsonEsc(toUser) & """,""type"":""text"",""body"":""" & JsonEsc(body) & """}"

Dim wroteUtf8, eNo, eDesc, wroteUnicode
wroteUtf8   = SaveUtf8NoBom(fpath, one, eNo, eDesc)

' —— 如果 UTF-8 写失败，降级成 Unicode（UTF-16），后续读取会自动转 UTF-8 —— 
If Not wroteUtf8 Then
  On Error Resume Next
  Dim jf : Set jf = fso.CreateTextFile(fpath, True, True) ' Unicode=True
  If Err.Number = 0 Then
    jf.Write one : jf.Close : wroteUnicode = True
  Else
    wroteUnicode = False
  End If
  Set jf = Nothing
End If

' 生成前端可 GET 的 URL（/data 与 /api 同级）
Dim appPath, appDir, httpPath
appPath = Request.ServerVariables("SCRIPT_NAME")  ' 例如 /api/dt_send_link.asp
appDir  = Left(appPath, InStrRev(appPath,"/")-1) ' /api
appDir  = Left(appDir , InStrRev(appDir ,"/")-1) ' 站点根（可能为空字符串）
httpPath = appDir & "/data/chat/conversations/" & convId & "/" & fname

' 写入收件箱指针（仅当文件确实存在）
Dim existsNow : existsNow = fso.FileExists(fpath)
If existsNow Then
  Dim rf : Set rf = fso.CreateTextFile(inboxDir & "\" & fname & ".ref", True, False)
  rf.Write httpPath : rf.Close : Set rf = Nothing
End If

' —— debug 输出 —— 
If LCase(Request("debug"))="1" Then
  Dim sizeNow : sizeNow = 0
  If existsNow Then sizeNow = fso.GetFile(fpath).Size
  Response.Write "{""ok"":" & LCase(CStr(existsNow)) _
    & ",""convId"":""" & JsonEsc(convId) & """" _
    & ",""base"":""" & JsonEsc(base) & """" _
    & ",""chatDir"":""" & JsonEsc(chatDir) & """" _
    & ",""inboxDir"":""" & JsonEsc(inboxDir) & """" _
    & ",""fpath"":""" & JsonEsc(fpath) & """" _
    & ",""wrote_utf8"":" & LCase(CStr(wroteUtf8)) _
    & ",""utf8_err_no"":" & eNo & ",""utf8_err_desc"":""" & JsonEsc(eDesc) & """" _
    & ",""wrote_unicode"":" & LCase(CStr(wroteUnicode)) _
    & ",""exists"":" & LCase(CStr(existsNow)) _
    & ",""size"":" & sizeNow _
    & ",""ts"":" & ts & ",""ts_iso"":""" & IsoUtcFromTs(ts) & """" _
    & ",""key"":""" & JsonEsc(httpPath) & """}"
  Response.End
End If

If existsNow Then
  Response.Write "{""ok"":true,""key"":""" & httpPath & """,""ts"":" & ts & "}"
Else
  Response.Write "{""ok"":false,""error"":""write_failed"",""utf8_err_no"":" & eNo & ",""utf8_err_desc"":""" & JsonEsc(eDesc) & """,""fpath"":""" & JsonEsc(fpath) & """}"
End If
Response.End
%>
