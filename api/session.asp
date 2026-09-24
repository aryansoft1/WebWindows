<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Option Explicit
Response.ContentType = "application/json"
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.CacheControl = "no-store"
Response.AddHeader "Pragma", "no-cache"

Function JsonText(ByVal value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

Dim userId, username, nickname, cookieUsername
userId = Trim(CStr(Session("webwindows_user_id")))
username = Trim(CStr(Session("webwindows_username")))
nickname = Trim(CStr(Session("webwindows_nickname")))
cookieUsername = Trim(CStr(Request.Cookies("webwindows_user")))

' Upgrade an older normal front-end session, but never turn an admin session or
' a cookie alone into a private-cloud identity.
If (userId = "" Or username = "") And Not (Session("webwindows_admin") = True) And _
   cookieUsername <> "" And _
   StrComp(cookieUsername, Trim(CStr(Session("username"))), vbBinaryCompare) = 0 Then
  userId = Trim(CStr(Session("user_id")))
  username = Trim(CStr(Session("username")))
  nickname = Trim(CStr(Session("nickname")))
  If userId <> "" And username <> "" Then
    Session("webwindows_user_id") = userId
    Session("webwindows_username") = username
    Session("webwindows_nickname") = nickname
  End If
End If

If userId <> "" And IsNumeric(userId) And username <> "" Then
  If nickname = "" Then nickname = username
  Response.Write "{""authenticated"":true,""user"":{""id"":" & CLng(userId) & _
    ",""username"":""" & JsonText(username) & """,""nickname"":""" & _
    JsonText(nickname) & """}}"
Else
  Response.Write "{""authenticated"":false,""user"":null}"
End If
%>
