<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Response.ContentType = "application/json;charset=utf-8"
Function JsonEsc(s): If IsNull(s) Then s="" : JsonEsc = Replace(Replace(Replace(CStr(s),"\","\\") ,"""","\""") ,vbCrLf,"\n"): End Function

Dim uname: uname = Session("username")
If Len(uname)=0 Then
  Response.Write("{""ok"":false,""error"":""not_logged_in""}")
Else
  Response.Write("{""ok"":true,""username"":""" & JsonEsc(uname) & """}")
End If
%>