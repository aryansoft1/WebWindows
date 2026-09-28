<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
If UCase(CStr(Request.ServerVariables("REQUEST_METHOD"))) <> "POST" Then
  AdminSecurityFail 405, "POST_REQUIRED", "请使用表单提交咨询。", "not-needed", "not-checked"
End If
If AdminSecurityOriginCategory() <> "origin-exact" And _
   AdminSecurityOriginCategory() <> "referer-exact" Then
  AdminSecurityFail 403, "ORIGIN_INVALID", "提交来源无效。", "not-needed", "mismatch"
End If
Dim lastSubmit, submitter, contact, subject, body, urgency, attachmentUrl
Dim cmd, feedbackId, rs
lastSubmit = Session("webwindows_feedback_last_submit")
If IsDate(lastSubmit) Then
  If DateDiff("s", CDate(lastSubmit), Now()) < 60 Then
    AdminSecurityFail 400, "TOO_FREQUENT", "请稍后再提交新的咨询。", "not-needed", "same-origin"
  End If
End If
submitter = Trim(CStr(Request.Form("submitter")))
contact = Trim(CStr(Request.Form("contact")))
subject = Trim(CStr(Request.Form("subject")))
body = Trim(CStr(Request.Form("body")))
urgency = LCase(Trim(CStr(Request.Form("urgency"))))
attachmentUrl = Trim(CStr(Request.Form("attachment_url")))
If submitter = "" Or contact = "" Or subject = "" Or body = "" Or _
   Len(submitter) > 100 Or Len(contact) > 255 Or Len(subject) > 200 Or Len(body) > 10000 Then
  AdminSecurityFail 400, "INVALID_FEEDBACK", "请完整填写咨询内容并检查长度。", "not-needed", "same-origin"
End If
If urgency <> "normal" And urgency <> "high" And urgency <> "low" Then
  AdminSecurityFail 400, "INVALID_URGENCY", "紧急程度无效。", "not-needed", "same-origin"
End If
If Len(attachmentUrl) > 1000 Or (attachmentUrl <> "" And _
   Left(LCase(attachmentUrl), 8) <> "https://" And Left(attachmentUrl, 1) <> "/") Then
  AdminSecurityFail 400, "INVALID_ATTACHMENT", "附件地址须为 HTTPS 或站内路径。", "not-needed", "same-origin"
End If
conn.BeginTrans
On Error Resume Next
Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = "INSERT INTO webwindows_feedback(user_id,submitter,contact,subject,urgency) VALUES (?,?,?,?,?)"
Dim userId
userId = Null
If IsNumeric(Session("webwindows_user_id")) Then userId = CLng(Session("webwindows_user_id"))
cmd.Parameters.Append cmd.CreateParameter("user", 3, 1, , userId)
cmd.Parameters.Append cmd.CreateParameter("submitter", 200, 1, 100, submitter)
cmd.Parameters.Append cmd.CreateParameter("contact", 200, 1, 255, contact)
cmd.Parameters.Append cmd.CreateParameter("subject", 200, 1, 200, subject)
cmd.Parameters.Append cmd.CreateParameter("urgency", 200, 1, 12, urgency)
cmd.Execute
If Err.Number = 0 Then
  Set rs = conn.Execute("SELECT LAST_INSERT_ID() AS feedback_id")
  feedbackId = CLng(rs("feedback_id"))
  rs.Close
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_feedback_messages(feedback_id,author_role,body,attachment_url) VALUES (?,'user',?,?)"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , feedbackId)
  cmd.Parameters.Append cmd.CreateParameter("body", 201, 1, Len(body), body)
  cmd.Parameters.Append cmd.CreateParameter("attachment", 200, 1, 1000, attachmentUrl)
  cmd.Execute
End If
If Err.Number <> 0 Then
  conn.RollbackTrans
  Err.Clear
  On Error GoTo 0
  AdminSecurityFail 500, "FEEDBACK_SAVE_FAILED", "咨询提交失败，请稍后重试。", "not-needed", "same-origin"
End If
conn.CommitTrans
On Error GoTo 0
Session("webwindows_feedback_last_submit") = Now()
Response.Write "{""success"":true,""id"":" & feedbackId & "}"
%>
