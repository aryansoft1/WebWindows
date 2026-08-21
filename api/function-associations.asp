<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Function JsonText(ByVal value)
  Dim text
  If IsNull(value) Then
    text = ""
  Else
    text = CStr(value)
  End If
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

Sub Fail(ByVal statusCode, ByVal message)
  Select Case CLng(statusCode)
    Case 400: Response.Status = "400 Bad Request"
    Case 401: Response.Status = "401 Unauthorized"
    Case 403: Response.Status = "403 Forbidden"
    Case 405: Response.Status = "405 Method Not Allowed"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  Response.Write "{""ok"":false,""message"":""" & JsonText(message) & """}"
  If IsObject(conn) Then
    If conn.State <> 0 Then conn.Close
  End If
  Response.End
End Sub

Function FormFlag(ByVal name, ByVal defaultValue)
  Dim value
  value = LCase(Trim(CStr(Request.Form(name))))
  If value = "" Then
    FormFlag = defaultValue
  Else
    FormFlag = (value = "1" Or value = "true" Or value = "yes")
  End If
End Function

Function BoolJson(ByVal value)
  If CBool(value) Then
    BoolJson = "true"
  Else
    BoolJson = "false"
  End If
End Function

Function ValidAppId(ByVal value)
  Dim regex
  Set regex = New RegExp
  regex.Pattern = "^[a-z0-9]+([._-][a-z0-9]+)+$"
  regex.IgnoreCase = False
  ValidAppId = (Len(value) <= 160 And regex.Test(value))
  Set regex = Nothing
End Function

Dim userId
If Len(CStr(Session("user_id"))) = 0 Then
  Fail 401, "请先登录 WebWindows。"
End If
userId = CLng(Session("user_id"))

If Request.ServerVariables("HTTP_X_WEBWINDOWS_REQUEST") <> "function-sync" Then
  Fail 403, "无效的同步请求。"
End If

Dim schemaSql
schemaSql = "CREATE TABLE IF NOT EXISTS webwindows_user_function_associations (" & _
  "user_id BIGINT NOT NULL," & _
  "app_id VARCHAR(160) NOT NULL," & _
  "state VARCHAR(20) NOT NULL," & _
  "desktop_visible TINYINT(1) NOT NULL DEFAULT 0," & _
  "retain_data TINYINT(1) NOT NULL DEFAULT 1," & _
  "install_source VARCHAR(40) NOT NULL DEFAULT 'repository'," & _
  "client_changed_at VARCHAR(40) NOT NULL," & _
  "updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," & _
  "PRIMARY KEY (user_id, app_id)," & _
  "KEY idx_webwindows_user_function_updated (user_id, updated_at)" & _
  ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"

On Error Resume Next
conn.Execute schemaSql
If Err.Number <> 0 Then
  Dim schemaError
  schemaError = Err.Description
  Err.Clear
  On Error GoTo 0
  Fail 500, "功能同步数据表初始化失败：" & schemaError
End If
On Error GoTo 0

Dim method
method = UCase(Request.ServerVariables("REQUEST_METHOD"))

If method = "GET" Then
  Dim listCmd, rs, json, firstRow
  Set listCmd = Server.CreateObject("ADODB.Command")
  With listCmd
    .ActiveConnection = conn
    .CommandText = "SELECT app_id,state,desktop_visible,retain_data,install_source,client_changed_at " & _
      "FROM webwindows_user_function_associations WHERE user_id=? ORDER BY app_id"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , userId)
    Set rs = .Execute
  End With

  json = "{""ok"":true,""associations"":["
  firstRow = True
  Do Until rs.EOF
    If Not firstRow Then json = json & ","
    firstRow = False
    json = json & "{" & _
      """appId"":""" & JsonText(rs("app_id")) & """," & _
      """state"":""" & JsonText(rs("state")) & """," & _
      """desktopVisible"":" & BoolJson(CLng(rs("desktop_visible")) <> 0) & "," & _
      """retainData"":" & BoolJson(CLng(rs("retain_data")) <> 0) & "," & _
      """source"":""" & JsonText(rs("install_source")) & """," & _
      """changedAt"":""" & JsonText(rs("client_changed_at")) & """" & _
      "}"
    rs.MoveNext
  Loop
  json = json & "]}"
  rs.Close
  Set rs = Nothing
  Set listCmd = Nothing
  Response.Write json

ElseIf method = "POST" Then
  Dim appId, state, desktopVisible, retainData, installSource, changedAt
  appId = LCase(Trim(CStr(Request.Form("appId"))))
  state = LCase(Trim(CStr(Request.Form("state"))))
  desktopVisible = FormFlag("desktopVisible", False)
  retainData = FormFlag("retainData", True)
  installSource = Left(Trim(CStr(Request.Form("source"))), 40)
  changedAt = Left(Trim(CStr(Request.Form("changedAt"))), 40)

  If Not ValidAppId(appId) Then Fail 400, "功能 ID 无效。"
  If state <> "installed" And state <> "uninstalled" Then Fail 400, "功能状态无效。"
  If installSource = "" Then installSource = "repository"
  If changedAt = "" Then changedAt = Replace(Replace(CStr(Now()), "/", "-"), " ", "T") & "Z"

  Dim saveCmd
  Set saveCmd = Server.CreateObject("ADODB.Command")
  With saveCmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_user_function_associations " & _
      "(user_id,app_id,state,desktop_visible,retain_data,install_source,client_changed_at) " & _
      "VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE " & _
      "state=VALUES(state),desktop_visible=VALUES(desktop_visible)," & _
      "retain_data=VALUES(retain_data),install_source=VALUES(install_source)," & _
      "client_changed_at=VALUES(client_changed_at)"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 3, 1, , userId)
    .Parameters.Append .CreateParameter(, 200, 1, 160, appId)
    .Parameters.Append .CreateParameter(, 200, 1, 20, state)
    .Parameters.Append .CreateParameter(, 3, 1, , Abs(CInt(desktopVisible)))
    .Parameters.Append .CreateParameter(, 3, 1, , Abs(CInt(retainData)))
    .Parameters.Append .CreateParameter(, 200, 1, 40, installSource)
    .Parameters.Append .CreateParameter(, 200, 1, 40, changedAt)
    .Execute
  End With
  Set saveCmd = Nothing
  Response.Write "{""ok"":true,""association"":{""appId"":""" & JsonText(appId) & _
    """,""state"":""" & JsonText(state) & """,""changedAt"":""" & JsonText(changedAt) & """}}"

Else
  Response.AddHeader "Allow", "GET, POST"
  Fail 405, "不支持的请求方法。"
End If

If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
