<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="adminGuard.asp"-->
<%
RequireAdminMutation "datacenter-quota"
%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"

Dim id
id = 0
If IsNumeric(Request("id")) Then id = CLng(Request("id"))

If id = 0 Then
  Response.Write("{""success"":false,""error"":""缺少ID""}")
  Response.End
End If

sql = "DELETE FROM webwindows_datacenters WHERE id=" & id
On Error Resume Next
conn.Execute sql

If Err.Number <> 0 Then
  Response.Write("{""success"":false,""error"":""" & Replace(Err.Description, """", "'") & """}")
Else
  Response.Write("{""success"":true}")
End If
%>
