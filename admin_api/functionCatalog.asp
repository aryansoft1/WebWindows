<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/trust-schema.asp"-->
<!--#include file="../inc/admin-security.asp"-->
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

Function Base64EncodeUtf8(ByVal value)
  Dim stream, bytes, xml, node
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.WriteText CStr(value)
  stream.Position = 0
  stream.Type = 1
  stream.Position = 3
  bytes = stream.Read
  stream.Close
  Set stream = Nothing

  Set xml = Server.CreateObject("Msxml2.DOMDocument.3.0")
  Set node = xml.createElement("base64")
  node.dataType = "bin.base64"
  node.nodeTypedValue = bytes
  Base64EncodeUtf8 = Replace(Replace(node.text, vbCr, ""), vbLf, "")
  Set node = Nothing
  Set xml = Nothing
End Function

Function Base64DecodeUtf8(ByVal value)
  Dim xml, node, bytes, stream
  Set xml = Server.CreateObject("Msxml2.DOMDocument.3.0")
  Set node = xml.createElement("base64")
  node.dataType = "bin.base64"
  node.text = CStr(value)
  bytes = node.nodeTypedValue
  Set node = Nothing
  Set xml = Nothing

  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.Write bytes
  stream.Position = 0
  stream.Type = 2
  stream.Charset = "utf-8"
  Base64DecodeUtf8 = stream.ReadText
  stream.Close
  Set stream = Nothing
End Function

Sub FinishError(ByVal statusCode, ByVal code, ByVal message)
  Select Case CLng(statusCode)
    Case 400: Response.Status = "400 Bad Request"
    Case 401: Response.Status = "401 Unauthorized"
    Case 403: Response.Status = "403 Forbidden"
    Case 409: Response.Status = "409 Conflict"
    Case 405: Response.Status = "405 Method Not Allowed"
    Case Else: Response.Status = "500 Internal Server Error"
  End Select
  Response.Write "{""ok"":false,""code"":""" & JsonText(code) & _
    """,""message"":""" & JsonText(message) & """}"
  If IsObject(conn) Then
    If conn.State <> 0 Then conn.Close
  End If
  Response.End
End Sub


Dim adminName
adminName = LCase(Trim(CStr(Session("username"))))
If Len(CStr(Session("user_id"))) = 0 Or adminName <> "admin" Or _
   Session("webwindows_admin") <> True Then
  FinishError 401, "ADMIN_LOGIN_REQUIRED", "请先使用 admin 账户登录 WebWindows。"
End If

If Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_REQUEST") <> "function-catalog" Then
  FinishError 403, "ADMIN_REQUEST_REQUIRED", "无效的后台管理请求。"
End If
If Not WebWindowsTrustSchemaReady() Then
  FinishError 500, "TRUST_SCHEMA_REQUIRED", "WebWindows 信任数据库结构尚未完成部署迁移。"
End If

Dim method
method = UCase(Request.ServerVariables("REQUEST_METHOD"))

If method = "GET" Then
  Dim catalogRs, catalogJson, revisionId, catalogVersion, publishNote, createdAt
  Set catalogRs = conn.Execute("SELECT id,catalog_version,catalog_json,storage_encoding,publish_note,created_at " & _
    "FROM webwindows_function_catalog_versions WHERE is_active=1 ORDER BY id DESC LIMIT 1")

  If catalogRs.EOF Then
    catalogJson = "null"
    revisionId = 0
    catalogVersion = ""
    publishNote = ""
    createdAt = ""
  Else
    If LCase(CStr(catalogRs("storage_encoding"))) = "base64" Then
      catalogJson = Base64DecodeUtf8(CStr(catalogRs("catalog_json")))
    Else
      catalogJson = "null"
    End If
    revisionId = CLng(catalogRs("id"))
    catalogVersion = CStr(catalogRs("catalog_version"))
    publishNote = CStr(catalogRs("publish_note"))
    createdAt = CStr(catalogRs("created_at"))
  End If
  catalogRs.Close
  Set catalogRs = Nothing

  Response.Write "{""ok"":true,""revision"":{""id"":" & revisionId & _
    ",""version"":""" & JsonText(catalogVersion) & _
    """,""note"":""" & JsonText(publishNote) & _
    """,""createdAt"":""" & JsonText(createdAt) & _
    """},""catalog"":" & catalogJson & "}"

ElseIf method = "POST" Then
  AdminSecurityRequireMutation "function-catalog", "catalog-publish"
  Dim catalogText, versionText, noteText, normalized, securityCompact, encodedCatalog, protectedRs, activeRevisionId
  catalogText = CStr(Request.Form("catalogJson"))
  versionText = Left(Trim(CStr(Request.Form("version"))), 40)
  noteText = Left(Trim(CStr(Request.Form("note"))), 255)
  normalized = Replace(Replace(Replace(catalogText, vbCr, ""), vbLf, ""), vbTab, "")
  securityCompact = Replace(normalized, " ", "")

  If Len(catalogText) < 50 Or Len(catalogText) > 524288 Then
    FinishError 400, "CATALOG_SIZE_INVALID", "功能目录内容大小无效。"
  End If
  If Left(Trim(normalized), 1) <> "{" Or _
     InStr(1, normalized, """schemaVersion"":1", vbTextCompare) = 0 Or _
     InStr(1, normalized, """apps"":[", vbTextCompare) = 0 Then
    FinishError 400, "CATALOG_FORMAT_INVALID", "功能目录格式无效。"
  End If
  Set protectedRs = conn.Execute("SELECT v.id,(SELECT COUNT(*) FROM webwindows_catalog_release_bindings b " & _
    "WHERE b.catalog_revision_id=v.id) AS binding_count FROM webwindows_function_catalog_versions v " & _
    "WHERE v.is_active=1 ORDER BY v.id DESC LIMIT 1")
  activeRevisionId = 0
  If Not protectedRs.EOF Then
    activeRevisionId = CLng(protectedRs("id"))
    If CLng(protectedRs("binding_count")) > 0 Then
      protectedRs.Close
      FinishError 409, "RELEASE_AUTHORITY_REQUIRED", _
        "当前目录包含 PublishedRelease；请通过开发者平台发布、下架或撤销。"
    End If
  End If
  protectedRs.Close
  Set protectedRs = Nothing
  If InStr(1, securityCompact, """sourceType"":""developer-release""", vbTextCompare) > 0 Or _
     InStr(1, securityCompact, """publishedReleaseId""", vbTextCompare) > 0 Then
    FinishError 409, "RELEASE_AUTHORITY_REQUIRED", "第三方 Release 只能由开发者平台写入目录。"
  End If
  If InStr(1, securityCompact, """package"":", vbTextCompare) > 0 Or _
     InStr(1, securityCompact, """releaseBinding"":""verified""", vbTextCompare) > 0 Then
    FinishError 409, "RELEASE_BOUND_FIELD_READ_ONLY", "Package/Release 信任字段不可在功能仓库中直接编辑。"
  End If
  If versionText = "" Then versionText = Replace(Replace(CStr(Now()), "/", ""), " ", "-")
  If noteText = "" Then noteText = "后台发布"
  encodedCatalog = Base64EncodeUtf8(catalogText)

  On Error Resume Next
  conn.BeginTrans
  conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1"

  Dim publishCmd
  Set publishCmd = Server.CreateObject("ADODB.Command")
  With publishCmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_function_catalog_versions " & _
      "(catalog_version,catalog_json,storage_encoding,publish_note,published_by,is_active) " & _
      "VALUES (?,?,?,?,?,1)"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 40, versionText)
    .Parameters.Append .CreateParameter(, 201, 1, Len(encodedCatalog), encodedCatalog)
    .Parameters.Append .CreateParameter(, 200, 1, 12, "base64")
    .Parameters.Append .CreateParameter(, 200, 1, 255, noteText)
    .Parameters.Append .CreateParameter(, 3, 1, , CLng(Session("user_id")))
    .Execute
  End With
  Set publishCmd = Nothing

  If Err.Number <> 0 Then
    Dim publishError
    publishError = Err.Description
    Err.Clear
    conn.RollbackTrans
    On Error GoTo 0
    FinishError 500, "CATALOG_PUBLISH_FAILED", "功能目录发布失败：" & publishError
  End If
  conn.CommitTrans
  On Error GoTo 0

  AdminSecurityAudit "catalog-publish", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""ok"":true,""version"":""" & JsonText(versionText) & _
    """,""message"":""功能目录已发布。""}"

Else
  Response.AddHeader "Allow", "GET, POST"
  FinishError 405, "METHOD_NOT_ALLOWED", "不支持的请求方法。"
End If

If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
