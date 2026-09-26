<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Dim action, method, cmd, rs, json, idText, newsId, affected
action = LCase(Trim(CStr(Request("action"))))
method = UCase(CStr(Request.ServerVariables("REQUEST_METHOD")))
If method = "GET" Then
  AdminSecurityRequireRead "system-manager", "news-" & action
Else
  AdminSecurityRequireMutation "system-manager", "news-" & action
End If

If action = "list" And method = "GET" Then
  Set rs = conn.Execute("SELECT id,title,category,content," & _
    "DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i') AS publish_at " & _
    "FROM webwindows_news ORDER BY COALESCE(publish_at,created_at) DESC,id DESC LIMIT 500")
  json = "["
  Do Until rs.EOF
    If Len(json) > 1 Then json = json & ","
    json = json & "{""id"":" & CLng(rs("id")) & _
      ",""title"":""" & AdminSecurityJson(rs("title")) & _
      """,""category"":""" & AdminSecurityJson(rs("category")) & _
      """,""content"":""" & AdminSecurityJson(rs("content")) & _
      """,""publish_at"":""" & AdminSecurityJson(rs("publish_at")) & """}"
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "]"
  Response.End
End If

If action = "categories" And method = "GET" Then
  Set rs = conn.Execute("SELECT id,name FROM webwindows_news_categories ORDER BY name ASC")
  json = "["
  Do Until rs.EOF
    If Len(json) > 1 Then json = json & ","
    json = json & "{""id"":" & CLng(rs("id")) & _
      ",""name"":""" & AdminSecurityJson(rs("name")) & """}"
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "]"
  Response.End
End If

If action = "save" And method = "POST" Then
  Dim title, category, content, publishAt, dateRegex
  title = Trim(CStr(Request.Form("title")))
  category = Trim(CStr(Request.Form("category")))
  content = Trim(CStr(Request.Form("content")))
  publishAt = Replace(Trim(CStr(Request.Form("publish_at"))), "T", " ")
  idText = Trim(CStr(Request.Form("id")))
  newsId = 0
  If idText <> "" Then
    If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
    On Error Resume Next
    newsId = CLng(idText)
    If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
    On Error GoTo 0
    If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  End If
  If title = "" Or category = "" Or content = "" Or _
     Len(title) > 200 Or Len(category) > 100 Or Len(content) > 20000 Then
    AdminSecurityFail 400, "INVALID_NEWS", "标题、分类和内容必填，且不能超过长度限制。", "valid", "same-origin"
  End If
  Set dateRegex = New RegExp
  dateRegex.Pattern = "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$"
  If publishAt <> "" Then
    If Not dateRegex.Test(publishAt) Or Not IsDate(publishAt) Then
      AdminSecurityFail 400, "INVALID_PUBLISH_AT", "发布时间无效。", "valid", "same-origin"
    End If
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT id FROM webwindows_news_categories WHERE name=? LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("category", 200, 1, 100, category)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 400, "CATEGORY_NOT_FOUND", "请先创建新闻分类。", "valid", "same-origin"
  rs.Close
  Set rs = Nothing
  Set cmd = Nothing
  If publishAt = "" Then publishAt = Year(Now()) & "-" & Right("0" & Month(Now()), 2) & _
    "-" & Right("0" & Day(Now()), 2) & " " & Right("0" & Hour(Now()), 2) & _
    ":" & Right("0" & Minute(Now()), 2)
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  If newsId = 0 Then
    cmd.CommandText = "INSERT INTO webwindows_news(title,category,content,publish_at) " & _
      "VALUES (?,?,?,STR_TO_DATE(?,'%Y-%m-%d %H:%i'))"
  Else
    cmd.CommandText = "UPDATE webwindows_news SET title=?,category=?,content=?," & _
      "publish_at=STR_TO_DATE(?,'%Y-%m-%d %H:%i') WHERE id=?"
  End If
  cmd.Parameters.Append cmd.CreateParameter("title", 200, 1, 200, title)
  cmd.Parameters.Append cmd.CreateParameter("category", 200, 1, 100, category)
  cmd.Parameters.Append cmd.CreateParameter("content", 201, 1, Len(content), content)
  cmd.Parameters.Append cmd.CreateParameter("publish_at", 200, 1, 16, publishAt)
  If newsId > 0 Then cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  On Error Resume Next
  cmd.Execute affected
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "NEWS_SAVE_FAILED", "新闻保存失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  AdminSecurityAudit "news-save", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "delete" And method = "POST" Then
  idText = Trim(CStr(Request.Form("id")))
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  On Error Resume Next
  newsId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "DELETE FROM webwindows_news WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  cmd.Execute
  AdminSecurityAudit "news-delete", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "add-category" And method = "POST" Then
  Dim categoryName
  categoryName = Trim(CStr(Request.Form("name")))
  If categoryName = "" Or Len(categoryName) > 100 Then
    AdminSecurityFail 400, "INVALID_CATEGORY", "分类名称无效。", "valid", "same-origin"
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_news_categories(name) VALUES (?)"
  cmd.Parameters.Append cmd.CreateParameter("name", 200, 1, 100, categoryName)
  On Error Resume Next
  cmd.Execute
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 400, "CATEGORY_EXISTS", "分类已存在或保存失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "delete-category" And method = "POST" Then
  idText = Trim(CStr(Request.Form("id")))
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  On Error Resume Next
  newsId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT COUNT(*) AS uses_count FROM webwindows_news n " & _
    "JOIN webwindows_news_categories c ON n.category=c.name WHERE c.id=?"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  Set rs = cmd.Execute
  If CLng(rs("uses_count")) > 0 Then
    AdminSecurityFail 400, "CATEGORY_IN_USE", "此分类仍有新闻，不能删除。", "valid", "same-origin"
  End If
  rs.Close
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "DELETE FROM webwindows_news_categories WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  cmd.Execute
  Response.Write "{""success"":true}"
  Response.End
End If

AdminSecurityFail 400, "INVALID_ACTION", "不支持的新闻操作。", "not-checked", "not-checked"
%>
