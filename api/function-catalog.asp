<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
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

Function EnsureCatalogTable()
  Dim schemaSql
  schemaSql = "CREATE TABLE IF NOT EXISTS webwindows_function_catalog_versions (" & _
    "id BIGINT NOT NULL AUTO_INCREMENT," & _
    "catalog_version VARCHAR(40) NOT NULL," & _
    "catalog_json LONGTEXT NOT NULL," & _
    "storage_encoding VARCHAR(12) NOT NULL DEFAULT 'base64'," & _
    "publish_note VARCHAR(255) NOT NULL DEFAULT ''," & _
    "published_by BIGINT NULL," & _
    "is_active TINYINT(1) NOT NULL DEFAULT 0," & _
    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," & _
    "PRIMARY KEY (id)," & _
    "KEY idx_function_catalog_active (is_active,id)" & _
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"

  On Error Resume Next
  conn.Execute schemaSql
  If Err.Number = 0 Then
    conn.Execute "ALTER TABLE webwindows_function_catalog_versions " & _
      "ADD COLUMN storage_encoding VARCHAR(12) NOT NULL DEFAULT 'raw' AFTER catalog_json"
    Err.Clear
    conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 " & _
      "WHERE is_active=1 AND storage_encoding<>'base64'"
    Err.Clear
    EnsureCatalogTable = True
  Else
    EnsureCatalogTable = False
  End If
  Err.Clear
  On Error GoTo 0
End Function

Function CatalogVersion(ByVal catalogText)
  Dim expression, matches
  CatalogVersion = ""
  Set expression = New RegExp
  expression.Pattern = """catalogVersion""\s*:\s*""([^""]+)"""
  expression.IgnoreCase = True
  expression.Global = False
  Set matches = expression.Execute(CStr(catalogText))
  If matches.Count > 0 Then CatalogVersion = CStr(matches(0).SubMatches(0))
  Set matches = Nothing
  Set expression = Nothing
End Function

Function ActiveCatalog(ByRef activeVersion)
  Dim rs
  ActiveCatalog = ""
  activeVersion = ""
  On Error Resume Next
  Set rs = conn.Execute("SELECT catalog_version,catalog_json,storage_encoding FROM webwindows_function_catalog_versions " & _
    "WHERE is_active=1 ORDER BY id DESC LIMIT 1")
  If Err.Number = 0 Then
    If Not rs.EOF Then
      If LCase(CStr(rs("storage_encoding"))) = "base64" Then
        ActiveCatalog = Base64DecodeUtf8(CStr(rs("catalog_json")))
        activeVersion = CStr(rs("catalog_version"))
      End If
    End If
    rs.Close
    Set rs = Nothing
  End If
  Err.Clear
  On Error GoTo 0
End Function

Sub SeedCatalog(ByVal catalogText, ByVal catalogVersion, ByVal publishNote)
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
    .Parameters.Append .CreateParameter(, 200, 1, 40, Left(CStr(catalogVersion), 40))
    .Parameters.Append .CreateParameter(, 201, 1, Len(encodedCatalog), encodedCatalog)
    .Parameters.Append .CreateParameter(, 200, 1, 12, "base64")
    .Parameters.Append .CreateParameter(, 200, 1, 255, Left(CStr(publishNote), 255))
    .Execute
  End With
  Set seedCmd = Nothing
  Err.Clear
  On Error GoTo 0
End Sub

Dim catalogText, tableReady, catalogSource, activeVersion, fileCatalog, fileVersion
catalogText = ""
catalogSource = "unavailable"
activeVersion = ""
fileCatalog = ""
fileVersion = ""
tableReady = EnsureCatalogTable()

On Error Resume Next
fileCatalog = ReadCatalogFile()
If Err.Number <> 0 Then Err.Clear: fileCatalog = ""
On Error GoTo 0
If fileCatalog <> "" And Not ValidCatalog(fileCatalog) Then fileCatalog = ""
If fileCatalog <> "" Then fileVersion = CatalogVersion(fileCatalog)

If tableReady Then
  catalogText = ActiveCatalog(activeVersion)
  If catalogText <> "" And Not ValidCatalog(catalogText) Then
    On Error Resume Next
    conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1"
    Err.Clear
    On Error GoTo 0
    catalogText = ""
  End If
  If catalogText <> "" Then catalogSource = "database"
End If

If fileCatalog <> "" And (catalogText = "" Or _
   (fileVersion <> "" And StrComp(fileVersion, activeVersion, vbTextCompare) > 0)) Then
  If tableReady Then
    On Error Resume Next
    conn.Execute "UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1"
    Err.Clear
    On Error GoTo 0
    SeedCatalog fileCatalog, fileVersion, "Static catalog version upgrade"
  End If
  catalogText = fileCatalog
  activeVersion = fileVersion
  If tableReady Then catalogSource = "json-upgrade" Else catalogSource = "json-fallback"
End If

Response.AddHeader "X-WebWindows-Catalog-Source", catalogSource
Response.AddHeader "X-WebWindows-Catalog-Version", activeVersion
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
