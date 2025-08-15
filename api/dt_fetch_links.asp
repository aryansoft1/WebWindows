<%@ LANGUAGE="VBScript" %>
<%
Response.Buffer = True
Session.CodePage  = 65001 
Response.Clear
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"

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

Function SafeId(s)
  Dim x, i, ch, out
  x = LCase(CStr(s)) : out = ""
  For i = 1 To Len(x)
    ch = Mid(x, i, 1)
    If (ch>="a" And ch<="z") Or (ch>="0" And ch<="9") Or ch="-" Or ch="_" Then out = out & ch
  Next
  If Len(out) = 0 Then out = "guest"
  SafeId = out
End Function

Function GetUser()
  Dim u : u = Session("username")
  If Len(u) = 0 Then
    u = Request("u")
    If Len(u) > 0 Then
      u = SafeId(u)
      Session("username") = u
      Response.Cookies("DT_USER") = u
      Response.Cookies("DT_USER").Path = "/"
      Response.Cookies("DT_USER").Expires = DateAdd("d", 30, Now())
    End If
  End If
  If Len(u) = 0 Then u = Request.Cookies("DT_USER")
  If Len(u) = 0 Then
    Randomize
    u = "guest_" & CStr(Int(Rnd() * 1000000))
    u = SafeId(u)
    Session("username") = u
    Response.Cookies("DT_USER") = u
    Response.Cookies("DT_USER").Path = "/"
    Response.Cookies("DT_USER").Expires = DateAdd("d", 30, Now())
  End If
  GetUser = SafeId(u)
End Function

On Error Resume Next

Dim uname : uname = GetUser()
Dim fso : Set fso = Server.CreateObject("Scripting.FileSystemObject")
Fail "CreateObject.FSO"

Dim basePath : basePath = Server.MapPath("../data")
Fail "MapPath(../data)"

Dim inboxDir : inboxDir = basePath & "\chat\inbox\" & uname

If Not fso.FolderExists(inboxDir) Then
  Response.Write "{""ok"":true,""me"":""" & JsonEsc(uname) & """,""links"":[]}"
  Response.End
End If

Dim folder : Set folder = fso.GetFolder(inboxDir)
Fail "GetFolder(" & inboxDir & ")"

Dim arr : arr = "["
Dim i : i = 0
Dim file, ts, link

For Each file In folder.Files
  If LCase(Right(file.Name, 4)) = ".ref" Then
    Set ts = file.OpenAsTextStream(1, 0)
    Fail "OpenAsTextStream(" & file.Path & ")"
    link = Trim(ts.ReadAll)
    ts.Close
    arr = arr & """" & JsonEsc(link) & ""","
    file.Delete True
    Fail "Delete(" & file.Path & ")"
    i = i + 1
    If i >= 100 Then Exit For
  End If
Next

If Right(arr, 1) = "," Then arr = Left(arr, Len(arr) - 1)
arr = arr & "]"

Response.Write "{""ok"":true,""me"":""" & JsonEsc(uname) & """,""links"":" & arr & "}"
Response.End
%>
