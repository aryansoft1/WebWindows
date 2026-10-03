<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
AdminSecurityRequireMutation "system-manager", "delete-datacenter"

Dim id
id = 0
If IsNumeric(Request.Form("id")) Then
  On Error Resume Next
  id = CLng(Request.Form("id"))
  Err.Clear
  On Error GoTo 0
End If

If id = 0 Then
  Response.Write("{""success"":false,""error"":""缺少ID""}")
  Response.End
End If

sql = "DELETE FROM webwindows_datacenters WHERE id=" & id
On Error Resume Next
conn.Execute sql

If Err.Number <> 0 Then
  Response.Write("{""success"":false,""error"":""删除失败，可能仍有用户使用此数据中心。""}")
Else
  AdminSecurityAudit "delete-datacenter", "success", "valid", AdminSecurityOriginCategory()
  Response.Write("{""success"":true}")
End If
%>
