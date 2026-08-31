<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/trust-schema.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "X-WebWindows-Catalog", "aryansoft-main"

Function ReadCatalogFile()
  Dim fileStream
  Set fileStream = Server.CreateObject("ADODB.Stream")
  fileStream.Type = 2
  fileStream.Charset = "utf-8"
  fileStream.Open
  fileStream.LoadFromFile Server.MapPath("../data/apps/system-apps.json")
  ReadCatalogFile = fileStream.ReadText
  fileStream.Close
  Set fileStream = Nothing
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

Function ValidCatalog(ByVal value)
  Dim compact
  compact = Replace(Replace(Replace(Replace(CStr(value), vbCr, ""), vbLf, ""), vbTab, ""), " ", "")
  ValidCatalog = (Len(compact) > 50 And Left(Trim(compact), 1) = "{" And _
    Right(Trim(compact), 1) = "}" And _
    InStr(1, compact, """schemaVersion"":1", vbTextCompare) > 0 And _
    InStr(1, compact, """apps"":[", vbTextCompare) > 0)
End Function


Function ReleaseBindingsValid(ByVal catalogText, ByVal revisionId)
  Dim rs, valid, bindingCount, referenceRegex, referenceMatches
  valid = True
  bindingCount = 0
  On Error Resume Next
  Set rs = conn.Execute("SELECT catalog_entry_id,published_release_identity,package_sha256,source_manifest_integrity_version," & _
    "review_decision_identity,release_binding_state FROM webwindows_catalog_release_bindings " & _
    "WHERE catalog_revision_id=" & CLng(revisionId))
  If Err.Number <> 0 Then
    Err.Clear
    ReleaseBindingsValid = (InStr(1, catalogText, """sourceType"":""developer-release""", vbTextCompare) = 0)
    On Error GoTo 0
    Exit Function
  End If
  Do Until rs.EOF
    bindingCount = bindingCount + 1
    If LCase(CStr(rs("release_binding_state"))) <> "verified" Or _
       InStr(1, catalogText, """id"":""" & CStr(rs("catalog_entry_id")) & """", vbBinaryCompare) = 0 Or _
       InStr(1, catalogText, """publishedReleaseId"":""" & CStr(rs("published_release_identity")) & """", vbBinaryCompare) = 0 Or _
       InStr(1, catalogText, """packageSha256"":""" & CStr(rs("package_sha256")) & """", vbTextCompare) = 0 Or _
       CLng(rs("source_manifest_integrity_version")) <> 1 Or _
       InStr(1, catalogText, """sourceManifestIntegrityVersion"":1", vbBinaryCompare) = 0 Or _
       InStr(1, catalogText, """reviewDecisionId"":""" & CStr(rs("review_decision_identity")) & """", vbBinaryCompare) = 0 Then
      valid = False
      Exit Do
    End If
    rs.MoveNext
  Loop
  rs.Close
  Set rs = Nothing
  Set referenceRegex = New RegExp
  referenceRegex.Pattern = """publishedReleaseId""\s*:"
  referenceRegex.Global = True
  Set referenceMatches = referenceRegex.Execute(CStr(catalogText))
  If referenceMatches.Count <> bindingCount Then valid = False
  Set referenceMatches = Nothing
  Set referenceRegex = Nothing
  On Error GoTo 0
  ReleaseBindingsValid = valid
End Function

Function ActiveCatalog(ByRef revisionId)
  Dim rs
  ActiveCatalog = ""
  revisionId = 0
  On Error Resume Next
  Set rs = conn.Execute("SELECT id,catalog_json,storage_encoding FROM webwindows_function_catalog_versions " & _
    "WHERE is_active=1 ORDER BY id DESC LIMIT 1")
  If Err.Number = 0 Then
    If Not rs.EOF Then
      If LCase(CStr(rs("storage_encoding"))) = "base64" Then
        ActiveCatalog = Base64DecodeUtf8(CStr(rs("catalog_json")))
        revisionId = CLng(rs("id"))
      End If
    End If
    rs.Close
    Set rs = Nothing
  End If
  Err.Clear
  On Error GoTo 0
End Function

Sub SeedCatalog(ByVal catalogText)
  Dim encodedCatalog, seedCmd
  encodedCatalog = Base64EncodeUtf8(catalogText)
  On Error Resume Next
  Set seedCmd = Server.CreateObject("ADODB.Command")
  With seedCmd
    .ActiveConnection = conn
    .CommandText = "INSERT INTO webwindows_function_catalog_versions " & _
      "(catalog_version,catalog_json,storage_encoding,publish_note,published_by,is_active) " & _
      "VALUES (?,?,?, ?,NULL,1)"
    .CommandType = 1
    .Parameters.Append .CreateParameter(, 200, 1, 40, "bootstrap-json")
    .Parameters.Append .CreateParameter(, 201, 1, Len(encodedCatalog), encodedCatalog)
    .Parameters.Append .CreateParameter(, 200, 1, 12, "base64")
    .Parameters.Append .CreateParameter(, 200, 1, 255, "JSON bootstrap")
    .Execute
  End With
  Set seedCmd = Nothing
  Err.Clear
  On Error GoTo 0
End Sub

Dim catalogText, tableReady, catalogSource, activeRevisionId
catalogText = ""
catalogSource = "unavailable"
tableReady = WebWindowsTrustSchemaReady()
If Not tableReady Then
  Response.Status = "503 Service Unavailable"
  Response.Write "{""ok"":false,""code"":""trust-schema-required"",""message"":""WebWindows 信任数据库结构尚未完成部署迁移。""}"
  If conn.State <> 0 Then conn.Close
  Response.End
End If

If tableReady Then
  catalogText = ActiveCatalog(activeRevisionId)
  If catalogText <> "" And (Not ValidCatalog(catalogText) Or _
     Not ReleaseBindingsValid(catalogText, activeRevisionId)) Then
    On Error Resume Next
    conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1"
    Err.Clear
    On Error GoTo 0
    catalogText = ""
  End If
  If catalogText <> "" Then catalogSource = "database"
End If

If catalogText = "" Then
  On Error Resume Next
  catalogText = ReadCatalogFile()
  If Err.Number <> 0 Then
    Err.Clear
    catalogText = ""
  End If
  On Error GoTo 0

  If catalogText <> "" And Not ValidCatalog(catalogText) Then catalogText = ""
  If catalogText <> "" And tableReady Then
    SeedCatalog catalogText
  End If
  If catalogText <> "" Then catalogSource = "json-fallback"
End If

Response.AddHeader "X-WebWindows-Catalog-Source", catalogSource
Response.AddHeader "X-WebWindows-Catalog-Release-Binding", "v1"
If catalogText = "" Then
  Response.Status = "503 Service Unavailable"
  Response.Write "{""ok"":false,""message"":""功能仓库目录暂不可用。""}"
Else
  Response.Write catalogText
End If

If IsObject(conn) Then
  If conn.State <> 0 Then conn.Close
End If
Set conn = Nothing
%>
