<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
Dim action, method, cmd, rs, json, contentId
action = LCase(Trim(CStr(Request("action"))))
method = UCase(CStr(Request.ServerVariables("REQUEST_METHOD")))
If method = "GET" Then
  AdminSecurityRequireRead "developer-platform", "content-" & action
Else
  AdminSecurityRequireMutation "developer-platform", "content-" & action
End If

If action = "list" And method = "GET" Then
  Set rs = conn.Execute("SELECT id,content_type,slug,version_number,title,body,sample_url,status," & _
    "DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at," & _
    "DATE_FORMAT(published_at,'%Y-%m-%d %H:%i') AS published_at " & _
    "FROM webwindows_developer_content ORDER BY content_type,slug,version_number DESC LIMIT 500")
  json = "["
  Do Until rs.EOF
    If Len(json) > 1 Then json = json & ","
    json = json & ContentJson(rs)
    rs.MoveNext
  Loop
  rs.Close
  Response.Write json & "]"
  Response.End
End If

If action = "preview" And method = "GET" Then
  contentId = ParseContentId(Request.QueryString("id"))
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT id,content_type,slug,version_number,title,body,sample_url,status," & _
    "DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at," & _
    "DATE_FORMAT(published_at,'%Y-%m-%d %H:%i') AS published_at " & _
    "FROM webwindows_developer_content WHERE id=? LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , contentId)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 400, "CONTENT_NOT_FOUND", "内容版本不存在。", "not-needed", "same-origin"
  Response.Write ContentJson(rs)
  rs.Close
  Response.End
End If

If action = "save-draft" And method = "POST" Then
  Dim contentType, slug, title, body, sampleUrl, slugRegex, nextVersion, existingStatus
  contentType = LCase(Trim(CStr(Request.Form("content_type"))))
  slug = LCase(Trim(CStr(Request.Form("slug"))))
  title = Trim(CStr(Request.Form("title")))
  body = Trim(CStr(Request.Form("body")))
  sampleUrl = Trim(CStr(Request.Form("sample_url")))
  If contentType <> "document" And contentType <> "sample" And contentType <> "announcement" Then
    AdminSecurityFail 400, "INVALID_TYPE", "内容类型无效。", "valid", "same-origin"
  End If
  Set slugRegex = New RegExp
  slugRegex.Pattern = "^[a-z0-9][a-z0-9-]{0,79}$"
  If Not slugRegex.Test(slug) Or title = "" Or body = "" Or _
     Len(title) > 200 Or Len(body) > 30000 Then
    AdminSecurityFail 400, "INVALID_CONTENT", "请检查标识、标题和正文。", "valid", "same-origin"
  End If
  If sampleUrl <> "" Then
    slugRegex.Pattern = "^developer-samples/[a-z0-9/_-]+\.zip$"
    If contentType <> "sample" Or Not slugRegex.Test(sampleUrl) Or Len(sampleUrl) > 500 Then
      AdminSecurityFail 400, "INVALID_SAMPLE_URL", "样例地址须为站内 developer-samples ZIP 路径。", "valid", "same-origin"
    End If
  End If
  contentId = 0
  If Trim(CStr(Request.Form("id"))) <> "" Then contentId = ParseContentId(Request.Form("id"))
  If contentId > 0 Then
    Set cmd = Server.CreateObject("ADODB.Command")
    Set cmd.ActiveConnection = conn
    cmd.CommandType = 1
    cmd.CommandText = "SELECT status,content_type,slug FROM webwindows_developer_content WHERE id=? LIMIT 1"
    cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , contentId)
    Set rs = cmd.Execute
    If rs.EOF Then AdminSecurityFail 400, "CONTENT_NOT_FOUND", "草稿不存在。", "valid", "same-origin"
    existingStatus = CStr(rs("status"))
    If existingStatus <> "draft" Or CStr(rs("content_type")) <> contentType Or CStr(rs("slug")) <> slug Then
      AdminSecurityFail 400, "DRAFT_ONLY", "只能编辑同一内容的草稿版本。", "valid", "same-origin"
    End If
    rs.Close
  End If
  If contentId = 0 Then
    Set cmd = Server.CreateObject("ADODB.Command")
    Set cmd.ActiveConnection = conn
    cmd.CommandType = 1
    cmd.CommandText = "SELECT COALESCE(MAX(version_number),0)+1 AS next_version " & _
      "FROM webwindows_developer_content WHERE content_type=? AND slug=?"
    cmd.Parameters.Append cmd.CreateParameter("type", 200, 1, 20, contentType)
    cmd.Parameters.Append cmd.CreateParameter("slug", 200, 1, 80, slug)
    Set rs = cmd.Execute
    nextVersion = CLng(rs("next_version"))
    rs.Close
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  If contentId = 0 Then
    cmd.CommandText = "INSERT INTO webwindows_developer_content" & _
      "(content_type,slug,version_number,title,body,sample_url,status) VALUES (?,?,?,?,?,?,'draft')"
    cmd.Parameters.Append cmd.CreateParameter("type", 200, 1, 20, contentType)
    cmd.Parameters.Append cmd.CreateParameter("slug", 200, 1, 80, slug)
    cmd.Parameters.Append cmd.CreateParameter("version", 3, 1, , nextVersion)
  Else
    cmd.CommandText = "UPDATE webwindows_developer_content SET title=?,body=?,sample_url=? WHERE id=? AND status='draft'"
  End If
  cmd.Parameters.Append cmd.CreateParameter("title", 200, 1, 200, title)
  cmd.Parameters.Append cmd.CreateParameter("body", 201, 1, Len(body), body)
  cmd.Parameters.Append cmd.CreateParameter("sample", 200, 1, 500, sampleUrl)
  If contentId > 0 Then cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , contentId)
  On Error Resume Next
  cmd.Execute
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "DRAFT_SAVE_FAILED", "草稿保存失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  AdminSecurityAudit "content-draft", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If (action = "publish" Or action = "unpublish" Or action = "rollback") And method = "POST" Then
  contentId = ParseContentId(Request.Form("id"))
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT content_type,slug,version_number,title,body,sample_url,status " & _
    "FROM webwindows_developer_content WHERE id=? LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , contentId)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 400, "CONTENT_NOT_FOUND", "内容版本不存在。", "valid", "same-origin"
  Dim sourceType, sourceSlug, sourceVersion, sourceTitle, sourceBody, sourceUrl, sourceStatus
  sourceType = CStr(rs("content_type"))
  sourceSlug = CStr(rs("slug"))
  sourceVersion = CLng(rs("version_number"))
  sourceTitle = CStr(rs("title"))
  sourceBody = CStr(rs("body"))
  sourceUrl = CStr(rs("sample_url") & "")
  sourceStatus = CStr(rs("status"))
  rs.Close
  If action = "publish" And sourceStatus <> "draft" Then
    AdminSecurityFail 400, "DRAFT_ONLY", "只能发布草稿。", "valid", "same-origin"
  End If
  If action = "unpublish" And sourceStatus <> "published" Then
    AdminSecurityFail 400, "PUBLISHED_ONLY", "只能下线已发布版本。", "valid", "same-origin"
  End If
  If action = "rollback" And sourceStatus = "draft" Then
    AdminSecurityFail 400, "HISTORY_ONLY", "请选择历史版本回滚。", "valid", "same-origin"
  End If
  conn.BeginTrans
  On Error Resume Next
  If action = "unpublish" Then
    conn.Execute "UPDATE webwindows_developer_content SET status='withdrawn' WHERE id=" & contentId
  Else
    Set cmd = Server.CreateObject("ADODB.Command")
    Set cmd.ActiveConnection = conn
    cmd.CommandType = 1
    cmd.CommandText = "UPDATE webwindows_developer_content SET status='archived' " & _
      "WHERE content_type=? AND slug=? AND status='published'"
    cmd.Parameters.Append cmd.CreateParameter("type", 200, 1, 20, sourceType)
    cmd.Parameters.Append cmd.CreateParameter("slug", 200, 1, 80, sourceSlug)
    cmd.Execute
    If action = "publish" Then
      conn.Execute "UPDATE webwindows_developer_content SET status='published',published_at=NOW() WHERE id=" & contentId
    Else
      Set cmd = Server.CreateObject("ADODB.Command")
      Set cmd.ActiveConnection = conn
      cmd.CommandType = 1
      cmd.CommandText = "SELECT COALESCE(MAX(version_number),0)+1 AS next_version " & _
        "FROM webwindows_developer_content WHERE content_type=? AND slug=?"
      cmd.Parameters.Append cmd.CreateParameter("type", 200, 1, 20, sourceType)
      cmd.Parameters.Append cmd.CreateParameter("slug", 200, 1, 80, sourceSlug)
      Set rs = cmd.Execute
      Dim rollbackVersion
      rollbackVersion = CLng(rs("next_version"))
      rs.Close
      Set cmd = Server.CreateObject("ADODB.Command")
      Set cmd.ActiveConnection = conn
      cmd.CommandType = 1
      cmd.CommandText = "INSERT INTO webwindows_developer_content" & _
        "(content_type,slug,version_number,title,body,sample_url,status,published_at) " & _
        "VALUES (?,?,?,?,?,?,'published',NOW())"
      cmd.Parameters.Append cmd.CreateParameter("type", 200, 1, 20, sourceType)
      cmd.Parameters.Append cmd.CreateParameter("slug", 200, 1, 80, sourceSlug)
      cmd.Parameters.Append cmd.CreateParameter("version", 3, 1, , rollbackVersion)
      cmd.Parameters.Append cmd.CreateParameter("title", 200, 1, 200, sourceTitle)
      cmd.Parameters.Append cmd.CreateParameter("body", 201, 1, Len(sourceBody), sourceBody)
      cmd.Parameters.Append cmd.CreateParameter("sample", 200, 1, 500, sourceUrl)
      cmd.Execute
    End If
  End If
  If Err.Number <> 0 Then
    conn.RollbackTrans
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "CONTENT_TRANSITION_FAILED", "内容状态更新失败。", "valid", "same-origin"
  End If
  conn.CommitTrans
  On Error GoTo 0
  AdminSecurityAudit "content-" & action, "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

AdminSecurityFail 400, "INVALID_ACTION", "不支持的内容操作。", "not-checked", "not-checked"

Function ParseContentId(ByVal value)
  Dim idText
  idText = Trim(CStr(value))
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "内容编号无效。", "not-checked", "same-origin"
  On Error Resume Next
  ParseContentId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "内容编号无效。", "not-checked", "same-origin"
  On Error GoTo 0
  If ParseContentId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "内容编号无效。", "not-checked", "same-origin"
End Function

Function ContentJson(ByVal row)
  ContentJson = "{""id"":" & CLng(row("id")) & _
    ",""type"":""" & AdminSecurityJson(row("content_type")) & _
    """,""slug"":""" & AdminSecurityJson(row("slug")) & _
    """,""version"":" & CLng(row("version_number")) & _
    ",""title"":""" & AdminSecurityJson(row("title")) & _
    """,""body"":""" & AdminSecurityJson(row("body")) & _
    """,""sampleUrl"":""" & AdminSecurityJson(row("sample_url")) & _
    """,""status"":""" & AdminSecurityJson(row("status")) & _
    """,""createdAt"":""" & AdminSecurityJson(row("created_at")) & _
    """,""publishedAt"":""" & AdminSecurityJson(row("published_at")) & """}"
End Function
%>
