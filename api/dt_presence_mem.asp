<%@LANGUAGE="VBScript" CODEPAGE="65001"%><%
Option Explicit
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
          If nowS - rts < TTL And rid <> id Then
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
Function ListPresence()
  Dim meId : meId = ""
  On Error Resume Next
  meId = Trim(CStr(Session("username")))
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

        If rid<>"" And LCase(rid)<>"guest" Then
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

If isList Then
  On Error Resume Next
  Dim out : out = ListPresence()
  If Err.Number<>0 Then
    Response.Status = "500 Internal Server Error"
    Response.Write "{""ok"":false,""err"":" & Err.Number & ",""desc"":""" & J(Err.Description) & """}"
    Response.End
  End If
  Response.Write out
  Response.End
End If

If Len(u)>0 And LCase(u)<>"guest" Then
  On Error Resume Next
  Session("username") = u
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
