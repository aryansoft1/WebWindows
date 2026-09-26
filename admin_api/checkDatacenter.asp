<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireMutation "system-manager", "check-datacenter"
Dim idText, centerId, cmd, rs, apiUrl, hostRegex, hostMatches, hostName
Dim allowedHosts, shell, processEnvironment, http, healthy, detail, statusText
idText = Trim(CStr(Request.Form("id")))
If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "数据中心编号无效。", "valid", "same-origin"
On Error Resume Next
centerId = CLng(idText)
If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "数据中心编号无效。", "valid", "same-origin"
On Error GoTo 0
If centerId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "数据中心编号无效。", "valid", "same-origin"
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "SELECT api_url FROM webwindows_datacenters WHERE id=? LIMIT 1"
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , centerId)
Set rs = cmd.Execute
If rs.EOF Then AdminSecurityFail 400, "DATACENTER_NOT_FOUND", "数据中心不存在。", "valid", "same-origin"
apiUrl = Trim(CStr(rs("api_url")))
rs.Close
Set rs = Nothing
Set cmd = Nothing
Set hostRegex = New RegExp
hostRegex.Pattern = "^https://([a-z0-9][a-z0-9.-]+)(:[0-9]{1,5})?(/[a-z0-9/_-]*)?$"
hostRegex.IgnoreCase = True
Set hostMatches = hostRegex.Execute(apiUrl)
If hostMatches.Count <> 1 Then
  AdminSecurityFail 400, "INVALID_API_URL", "数据中心接口地址无效。", "valid", "same-origin"
End If
hostName = LCase(CStr(hostMatches(0).SubMatches(0)))
allowedHosts = ",www.y0.hk,y0.hk,"
On Error Resume Next
Set shell = Server.CreateObject("WScript.Shell")
Set processEnvironment = shell.Environment("PROCESS")
allowedHosts = allowedHosts & LCase(Replace(Trim(CStr(processEnvironment("WEBWINDOWS_DATACENTER_ALLOWED_HOSTS"))), " ", "")) & ","
Set processEnvironment = Nothing
Set shell = Nothing
Err.Clear
On Error GoTo 0
If InStr(allowedHosts, "," & hostName & ",") = 0 Then
  AdminSecurityFail 403, "DATACENTER_HOST_NOT_ALLOWED", "此域名尚未加入服务端健康检查允许列表。", "valid", "same-origin"
End If
healthy = False
detail = "连接失败"
On Error Resume Next
Set http = Server.CreateObject("WinHttp.WinHttpRequest.5.1")
http.Option(6) = False
http.SetTimeouts 2000, 2000, 3000, 3000
http.Open "GET", apiUrl & "/node-info.asp", False
http.Send
If Err.Number = 0 Then
  If http.Status = 200 Then
    Dim protocolRegex, versionRegex, readyRegex
    Set protocolRegex = New RegExp
    protocolRegex.Pattern = """protocol""\s*:\s*""webwindows-cloud-resource"""
    protocolRegex.IgnoreCase = True
    Set versionRegex = New RegExp
    versionRegex.Pattern = """version""\s*:\s*""[^""]+"""
    Set readyRegex = New RegExp
    readyRegex.Pattern = """publicReady""\s*:\s*true"
    readyRegex.IgnoreCase = True
    healthy = protocolRegex.Test(Left(CStr(http.ResponseText), 4096)) And _
      versionRegex.Test(Left(CStr(http.ResponseText), 4096)) And _
      readyRegex.Test(Left(CStr(http.ResponseText), 4096))
    If healthy Then detail = "节点协议及公共服务正常" Else detail = "节点响应格式或公共服务状态异常"
  Else
    detail = "HTTP " & CStr(http.Status)
  End If
End If
Err.Clear
On Error GoTo 0
Set http = Nothing
statusText = "异常"
If healthy Then statusText = "正常"
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "UPDATE webwindows_datacenters SET status=?,last_check_detail=?,last_check_time=NOW() WHERE id=?"
cmd.Parameters.Append cmd.CreateParameter("status", 200, 1, 20, statusText)
cmd.Parameters.Append cmd.CreateParameter("detail", 200, 1, 255, detail)
cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , centerId)
cmd.Execute
AdminSecurityAudit "check-datacenter", "success", "valid", AdminSecurityOriginCategory()
Response.Write "{""success"":true,""healthy"":" & LCase(CStr(healthy)) & _
  ",""status"":""" & AdminSecurityJson(statusText) & _
  """,""detail"":""" & AdminSecurityJson(detail) & """}"
%>
