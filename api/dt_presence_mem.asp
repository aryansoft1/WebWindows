<%@LANGUAGE="VBScript" CODEPAGE="65001" EnableSessionState=True %>
<%
Option Explicit
%>
<!--#include file="../inc/conn.asp"-->
<%
On Error GoTo 0
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "application/json"
Response.Buffer = True

' ---- config (ASCII only) ----
Dim TTL: TTL = 120                ' seconds to keep online
Dim SEP_REC: SEP_REC = "^"        ' record separator
Dim SEP_FLD: SEP_FLD = "|"        ' field  separator

' ---- helpers ----
Function NowTs()
  NowTs = DateDiff("s","1970-01-01 00:00:00", Now())
End Function

Function J(s)
  If IsNull(s) Then J = "" : Exit Function
  s = CStr(s)
  s = Replace(s, "\", "\\")
  s = Replace(s, """", "\""")
  s = Replace(s, vbCrLf, "\n")
  s = Replace(s, vbCr,  "\n")
  s = Replace(s, vbLf,  "\n")
  J = s
End Function

Function Clean(s)
  s = CStr(s)
  s = Replace(s, SEP_REC, "")
  s = Replace(s, SEP_FLD, "")
  Clean = s
End Function

Function GetStore()
  On Error Resume Next
  GetStore = CStr(Application("dtp_s"))
  On Error GoTo 0
End Function

Sub SetStore(s)
  On Error Resume Next
  Application.Lock
  Application("dtp_s") = s
  Application.UnLock
  On Error GoTo 0
End Sub

Sub RemovePresence(id)
  If Len(id)=0 Then Exit Sub
  Dim s, parts, outArr(), n, i, rec, f, rid
  s = GetStore()
  parts = Split(s, SEP_REC)
  ReDim outArr(-1)
  n = -1
  For i = 0 To UBound(parts)
    rec = parts(i)
    If Len(rec)>0 Then
      f = Split(rec, SEP_FLD)
      rid = ""
      If UBound(f)>=0 Then rid=f(0)
      If StrComp(rid, id, vbBinaryCompare)<>0 Then
        n=n+1 : ReDim Preserve outArr(n)
        outArr(n)=rec
      End If
    End If
  Next
  If n>=0 Then SetStore Join(outArr, SEP_REC) Else SetStore ""
End Sub

Function LoadHiddenUsers(ByRef hidden)
  On Error Resume Next
  Dim rs
  Set hidden = Server.CreateObject("Scripting.Dictionary")
  hidden.CompareMode = vbBinaryCompare
  Err.Clear
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_desktalk_preferences (" & _
    "user_id BIGINT UNSIGNED NOT NULL," & _
    "undiscoverable TINYINT(1) NOT NULL DEFAULT 0," & _
    "updated_at DATETIME NOT NULL," & _
    "PRIMARY KEY (user_id)," & _
    "KEY idx_desktalk_undiscoverable (undiscoverable)" & _
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number<>0 Then LoadHiddenUsers=False : Err.Clear : Exit Function
  Set rs = conn.Execute("SELECT user_id FROM webwindows_desktalk_preferences WHERE undiscoverable=1")
  If Err.Number<>0 Then LoadHiddenUsers=False : Err.Clear : Exit Function
  Do Until rs.EOF
    hidden(CStr(rs("user_id"))) = True
    rs.MoveNext
  Loop
  rs.Close
  Set rs = Nothing
  LoadHiddenUsers=True
  On Error GoTo 0
End Function

Function IsHidden(hidden, id)
  IsHidden = False
  If hidden Is Nothing Then Exit Function
  If IsNumeric(id) Then IsHidden = hidden.Exists(CStr(CLng(id)))
End Function

' ---- heartbeat ----
Sub Touch(id, display)
  If Len(id)=0 Then Exit Sub
  If LCase(id)="guest" Then Exit Sub

  Dim s, parts, i, rec, outArr(), n, nowS
  s = GetStore()
  parts = Split(s, SEP_REC)
  ReDim outArr(-1)
  n = -1
  nowS = CLng(NowTs())

  For i = 0 To UBound(parts)
    rec = parts(i)
    If Len(rec) > 0 Then
      Dim f, rid, rts, rname
      f = Split(rec, SEP_FLD)
      If UBound(f) >= 1 Then
        rid = f(0)
        rts = CLng(0 & f(1))
        rname = ""
        If UBound(f) >= 2 Then rname = f(2)
        If rid<>"" And LCase(rid)<>"guest" Then
          ' A legacy client published its nickname as the id.  When the same
          ' display name reports a stable account id, replace the stale record
          ' instead of showing one person twice.
          If nowS - rts < TTL And rid <> id And _
             (Len(display)=0 Or Len(rname)=0 Or StrComp(rname, display, vbTextCompare)<>0) Then
            n = n + 1 : ReDim Preserve outArr(n)
            outArr(n) = rid & SEP_FLD & rts & SEP_FLD & rname
          End If
        End If
      End If
    End If
  Next

  n = n + 1 : ReDim Preserve outArr(n)
  outArr(n) = Clean(id) & SEP_FLD & CStr(nowS) & SEP_FLD & Clean(display)

  If n >= 0 Then
    SetStore Join(outArr, SEP_REC)
  Else
    SetStore ""
  End If
End Sub

' ---- presence list ----
Function ListPresence(hidden)
  Dim meId : meId = ""
  On Error Resume Next
  meId = Request("u")
  On Error GoTo 0

  Dim s, parts, i, rec, nowS, first, onlineCnt, json
  s         = GetStore()
  parts     = Split(s, SEP_REC)
  nowS      = CLng(NowTs())
  first     = True
  onlineCnt = 0

  json = "{""ok"":true,""ttl"":" & TTL
  If Len(meId)>0 And LCase(meId)<>"guest" Then
    json = json & ",""me"":""" & J(meId) & """"
  End If
  json = json & ",""users"":["

  Dim outArr(), n
  ReDim outArr(-1) : n = -1

  For i = 0 To UBound(parts)
    rec = parts(i)
    If Len(rec) > 0 Then
      Dim f, rid, rts, rname, secs
      f = Split(rec, SEP_FLD)
      If UBound(f) >= 1 Then
        rid = f(0)
        rts = CLng(0 & f(1))
        rname = "" : If UBound(f) >= 2 Then rname = f(2)
        secs = nowS - rts

        If rid<>"" And LCase(rid)<>"guest" And Not IsHidden(hidden, rid) Then
          If secs < TTL Then
            If Not first Then json = json & ","
            json = json & "{""u"":""" & J(rid) & """"
            If Len(rname) > 0 Then json = json & ",""name"":""" & J(rname) & """"
            json = json & ",""ts"":" & rts & ",""secs"":" & secs & "}"
            first = False
            onlineCnt = onlineCnt + 1

            n = n + 1 : ReDim Preserve outArr(n)
            outArr(n) = rid & SEP_FLD & rts & SEP_FLD & rname
          End If
        End If
      End If
    End If
  Next

  json = json & "],""online"":" & onlineCnt & "}"

  If n >= 0 Then
    SetStore Join(outArr, SEP_REC)
  Else
    SetStore ""
  End If

  ListPresence = json
End Function

' ---- main ----
Dim isList : isList = (Trim(Request("list")) <> "")
Dim u  : u  = Trim(Request("u"))
Dim nm : nm = Trim(Request("name"))
Dim hidden, privacyReady
privacyReady = LoadHiddenUsers(hidden)
If Not privacyReady Then
  If isList Then Response.Status = "503 Service Unavailable"
  Response.Write "{""ok"":false,""error"":""privacy_store_unavailable"",""users"":[]}"
  Response.End
End If

If isList Then
  On Error Resume Next
  Dim out : out = ListPresence(hidden)
  If Err.Number<>0 Then
    Response.Status = "500 Internal Server Error"
    Response.Write "{""ok"":false,""err"":" & Err.Number & ",""desc"":""" & J(Err.Description) & """}"
    Response.End
  End If
  Response.Write out
  Response.End
End If

Dim sessionUserId, sessionNickname
sessionUserId = Trim(CStr(Session("webwindows_user_id")))
sessionNickname = Trim(CStr(Session("webwindows_nickname")))
If sessionUserId<>"" And IsNumeric(sessionUserId) Then
  u = CStr(CLng(sessionUserId))
  If sessionNickname<>"" Then nm=sessionNickname
  If IsHidden(hidden, u) Then
    Call RemovePresence(u)
    Response.Write "{""ok"":true,""published"":false,""undiscoverable"":true}"
    Response.End
  End If
ElseIf LCase(Left(u,6))<>"guest_" Then
  u = ""
End If

If Len(u)>0 And LCase(u)<>"guest" Then
  On Error Resume Next
  Call Touch(u, nm)
  If Err.Number<>0 Then
    ' heartbeat never 500
    Response.Status = "200 OK"
    Response.Write "{""ok"":false,""err"":" & Err.Number & ",""desc"":""" & J(Err.Description) & """}"
    Response.End
  End If
End If

Response.Write "{""ok"":true}"
Response.End
%>
