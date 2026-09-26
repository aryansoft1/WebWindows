<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Dim action, method, statusFilter, urgencyFilter, sql, cmd, rs, json, idText, feedbackId
action = LCase(Trim(CStr(Request("action"))))
method = UCase(CStr(Request.ServerVariables("REQUEST_METHOD")))
If method = "GET" Then
  AdminSecurityRequireRead "system-manager", "feedback-" & action
Else
  AdminSecurityRequireMutation "system-manager", "feedback-" & action
End If

If (action = "list" Or action = "export") And method = "GET" Then
  statusFilter = LCase(Trim(CStr(Request.QueryString("status"))))
  urgencyFilter = LCase(Trim(CStr(Request.QueryString("urgency"))))
  If statusFilter <> "" And statusFilter <> "pending" And statusFilter <> "replied" And statusFilter <> "closed" Then
    AdminSecurityFail 400, "INVALID_STATUS", "状态筛选无效。", "not-needed", "same-origin"
  End If
  If urgencyFilter <> "" And urgencyFilter <> "low" And urgencyFilter <> "normal" And urgencyFilter <> "high" Then
    AdminSecurityFail 400, "INVALID_URGENCY", "紧急程度筛选无效。", "not-needed", "same-origin"
  End If
  sql = "SELECT id,submitter,contact,subject,urgency,rating,status," & _
    "DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at " & _
    "FROM webwindows_feedback WHERE (?='' OR status=?) AND (?='' OR urgency=?) " & _
    "ORDER BY created_at DESC,id DESC LIMIT 1000"
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = sql
  cmd.Parameters.Append cmd.CreateParameter("status1", 200, 1, 20, statusFilter)
  cmd.Parameters.Append cmd.CreateParameter("status2", 200, 1, 20, statusFilter)
  cmd.Parameters.Append cmd.CreateParameter("urgency1", 200, 1, 12, urgencyFilter)
  cmd.Parameters.Append cmd.CreateParameter("urgency2", 200, 1, 12, urgencyFilter)
  Set rs = cmd.Execute
  If action = "export" Then
    Response.ContentType = "text/csv"
    Response.AddHeader "Content-Disposition", "attachment; filename=webwindows-feedback.csv"
    Response.Write ChrW(&HFEFF) & "编号,提交人,联系方式,主题,紧急程度,评级,状态,提交时间" & vbCrLf
    Do Until rs.EOF
      Response.Write CsvCell(rs("id")) & "," & CsvCell(rs("submitter")) & "," & _
        CsvCell(rs("contact")) & "," & CsvCell(rs("subject")) & "," & _
        CsvCell(rs("urgency")) & "," & CsvCell(rs("rating")) & "," & _
        CsvCell(rs("status")) & "," & CsvCell(rs("created_at")) & vbCrLf
      rs.MoveNext
    Loop
    rs.Close
    Response.End
  End If
  json = "["
  Do Until rs.EOF
    If Len(json) > 1 Then json = json & ","
    Dim ratingJson
    ratingJson = "null"
    If Not IsNull(rs("rating")) Then ratingJson = CStr(CLng(rs("rating")))
    json = json & "{""id"":" & CLng(rs("id")) & _
      ",""submitter"":""" & AdminSecurityJson(rs("submitter")) & _
      """,""contact"":""" & AdminSecurityJson(rs("contact")) & _
      """,""subject"":""" & AdminSecurityJson(rs("subject")) & _
      """,""urgency"":""" & AdminSecurityJson(rs("urgency")) & _
      """,""rating"":" & ratingJson & _
      ",""status"":""" & AdminSecurityJson(rs("status")) & _
      """,""created_at"":""" & AdminSecurityJson(rs("created_at")) & """}"
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "]"
  Response.End
End If

If action = "detail" And method = "GET" Then
  feedbackId = ParseFeedbackId(Request.QueryString("id"))
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT id,submitter,contact,subject,urgency,rating,status FROM webwindows_feedback WHERE id=? LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , feedbackId)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 400, "FEEDBACK_NOT_FOUND", "咨询不存在。", "not-needed", "same-origin"
  Dim detailRating
  detailRating = "null"
  If Not IsNull(rs("rating")) Then detailRating = CStr(CLng(rs("rating")))
  json = "{""id"":" & CLng(rs("id")) & _
    ",""submitter"":""" & AdminSecurityJson(rs("submitter")) & _
    """,""contact"":""" & AdminSecurityJson(rs("contact")) & _
    """,""subject"":""" & AdminSecurityJson(rs("subject")) & _
    """,""urgency"":""" & AdminSecurityJson(rs("urgency")) & _
    """,""rating"":" & detailRating & _
    ",""status"":""" & AdminSecurityJson(rs("status")) & """,""messages":["
  rs.Close
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT id,author_role,body,attachment_url," & _
    "DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at " & _
    "FROM webwindows_feedback_messages WHERE feedback_id=? ORDER BY id ASC"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , feedbackId)
  Set rs = cmd.Execute
  Do Until rs.EOF
    If Right(json, 1) <> "[" Then json = json & ","
    json = json & "{""id"":" & CLng(rs("id")) & _
      ",""author_role"":""" & AdminSecurityJson(rs("author_role")) & _
      """,""body"":""" & AdminSecurityJson(rs("body")) & _
      """,""attachment_url"":""" & AdminSecurityJson(rs("attachment_url")) & _
      """,""created_at"":""" & AdminSecurityJson(rs("created_at")) & """}"
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "]}"
  Response.End
End If

If action = "reply" And method = "POST" Then
  feedbackId = ParseFeedbackId(Request.Form("id"))
  Dim replyBody, replyAttachment
  replyBody = Trim(CStr(Request.Form("body")))
  replyAttachment = Trim(CStr(Request.Form("attachment_url")))
  If replyBody = "" Or Len(replyBody) > 10000 Then
    AdminSecurityFail 400, "INVALID_REPLY", "回复内容不能为空且不得超过 10000 字。", "valid", "same-origin"
  End If
  If Len(replyAttachment) > 1000 Or (replyAttachment <> "" And _
     Left(LCase(replyAttachment), 8) <> "https://" And Left(replyAttachment, 1) <> "/") Then
    AdminSecurityFail 400, "INVALID_ATTACHMENT", "附件地址无效。", "valid", "same-origin"
  End If
  conn.BeginTrans
  On Error Resume Next
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_feedback_messages(feedback_id,author_role,body,attachment_url) VALUES (?,'admin',?,?)"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , feedbackId)
  cmd.Parameters.Append cmd.CreateParameter("body", 201, 1, Len(replyBody), replyBody)
  cmd.Parameters.Append cmd.CreateParameter("attachment", 200, 1, 1000, replyAttachment)
  cmd.Execute
  If Err.Number = 0 Then conn.Execute "UPDATE webwindows_feedback SET status='replied' WHERE id=" & feedbackId
  If Err.Number <> 0 Then
    conn.RollbackTrans
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "REPLY_FAILED", "回复保存失败。", "valid", "same-origin"
  End If
  conn.CommitTrans
  On Error GoTo 0
  AdminSecurityAudit "feedback-reply", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "update" And method = "POST" Then
  feedbackId = ParseFeedbackId(Request.Form("id"))
  Dim nextStatus, nextUrgency, ratingText, ratingValue
  nextStatus = LCase(Trim(CStr(Request.Form("status"))))
  nextUrgency = LCase(Trim(CStr(Request.Form("urgency"))))
  ratingText = Trim(CStr(Request.Form("rating")))
  If nextStatus <> "pending" And nextStatus <> "replied" And nextStatus <> "closed" Then
    AdminSecurityFail 400, "INVALID_STATUS", "状态无效。", "valid", "same-origin"
  End If
  If nextUrgency <> "low" And nextUrgency <> "normal" And nextUrgency <> "high" Then
    AdminSecurityFail 400, "INVALID_URGENCY", "紧急程度无效。", "valid", "same-origin"
  End If
  ratingValue = Null
  If ratingText <> "" Then
    If Not IsNumeric(ratingText) Then AdminSecurityFail 400, "INVALID_RATING", "评级无效。", "valid", "same-origin"
    ratingValue = CLng(ratingText)
    If ratingValue < 1 Or ratingValue > 5 Then AdminSecurityFail 400, "INVALID_RATING", "评级须为 1 至 5 星。", "valid", "same-origin"
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "UPDATE webwindows_feedback SET status=?,urgency=?,rating=? WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("status", 200, 1, 20, nextStatus)
  cmd.Parameters.Append cmd.CreateParameter("urgency", 200, 1, 12, nextUrgency)
  cmd.Parameters.Append cmd.CreateParameter("rating", 3, 1, , ratingValue)
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , feedbackId)
  cmd.Execute
  AdminSecurityAudit "feedback-update", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

AdminSecurityFail 400, "INVALID_ACTION", "不支持的咨询操作。", "not-checked", "not-checked"

Function ParseFeedbackId(ByVal value)
  Dim candidate
  candidate = Trim(CStr(value))
  If Not IsNumeric(candidate) Then AdminSecurityFail 400, "INVALID_ID", "咨询编号无效。", "not-checked", "same-origin"
  On Error Resume Next
  ParseFeedbackId = CLng(candidate)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "咨询编号无效。", "not-checked", "same-origin"
  On Error GoTo 0
  If ParseFeedbackId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "咨询编号无效。", "not-checked", "same-origin"
End Function

Function CsvCell(ByVal value)
  Dim result
  If IsNull(value) Then result = "" Else result = CStr(value)
  If Len(result) > 0 Then
    If InStr("=+-@", Left(result, 1)) > 0 Then result = "'" & result
  End If
  result = Replace(result, Chr(34), Chr(34) & Chr(34))
  CsvCell = Chr(34) & result & Chr(34)
End Function
%>
