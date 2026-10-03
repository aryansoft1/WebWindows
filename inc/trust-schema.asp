<%
' Read-only application gate for the explicitly deployed WebWindows trust schema.
Const WEBWINDOWS_TRUST_SCHEMA_MIGRATION_ID = "001_webwindows_trust_schema"
Const WEBWINDOWS_TRUST_SCHEMA_CHECKSUM = "6cab4f9a9107f03bd6f9dd87ce0a45c0a7a506dc43d339a83d0266008e73b7a9"

Function WebWindowsTrustSchemaReady()
  Dim schemaRs, schemaSql, ready
  ready = False
  schemaSql = "SELECT migration_id FROM webwindows_schema_migrations " & _
    "WHERE migration_id='" & WEBWINDOWS_TRUST_SCHEMA_MIGRATION_ID & "' " & _
    "AND checksum_sha256='" & WEBWINDOWS_TRUST_SCHEMA_CHECKSUM & "' " & _
    "AND success=1 LIMIT 1"
  On Error Resume Next
  Set schemaRs = conn.Execute(schemaSql)
  If Err.Number = 0 Then
    If Not schemaRs.EOF Then ready = True
  End If
  Err.Clear
  If IsObject(schemaRs) Then schemaRs.Close
  Set schemaRs = Nothing
  On Error GoTo 0
  WebWindowsTrustSchemaReady = ready
End Function
%>
