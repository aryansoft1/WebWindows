<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Option Explicit
Response.ContentType = "application/json"
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.CacheControl = "no-store"

Dim webWindowsUserId, webWindowsUsername, cookieUsername
webWindowsUserId = Trim(CStr(Session("webwindows_user_id")))
webWindowsUsername = Trim(CStr(Session("webwindows_username")))
cookieUsername = Trim(CStr(Request.Cookies("webwindows_user")))

' Upgrade a legacy normal-user session, but never an administrator or a cookie alone.
If (webWindowsUserId = "" Or webWindowsUsername = "") And _
   Not (Session("webwindows_admin") = True) And cookieUsername <> "" And _
   StrComp(cookieUsername, Trim(CStr(Session("username"))), vbBinaryCompare) = 0 Then
  webWindowsUserId = Trim(CStr(Session("user_id")))
  webWindowsUsername = Trim(CStr(Session("username")))
  If webWindowsUserId <> "" And webWindowsUsername <> "" Then
    Session("webwindows_user_id") = webWindowsUserId
    Session("webwindows_username") = webWindowsUsername
    Session("webwindows_nickname") = Trim(CStr(Session("nickname")))
  End If
End If

If webWindowsUserId = "" Or Not IsNumeric(webWindowsUserId) Or webWindowsUsername = "" Then
  Response.Write "{""ok"":true,""authenticated"":false,""storageStatus"":""unauthenticated""," & _
    """quotaKnown"":false,""statsAvailable"":false,""usedMB"":null,""remainingMB"":null," & _
    """quotaMB"":null,""usedPercent"":null,""dataCenterId"":null,""dataCenterName"":null}"
  Response.End
End If
%>
<!--#include file="../inc/conn.asp"-->
<%
Dim schemaRs, hasQuotaColumn, sql, cmd, rs
Dim dataCenterId, dataCenterName, quotaMB, quotaKnown, legacyDefault, quotaCandidate, quotaConversionOk
hasQuotaColumn = False
legacyDefault = False
Set schemaRs = Nothing
Set rs = Nothing
On Error Resume Next
Set schemaRs = conn.Execute("SHOW COLUMNS FROM webwindows_datacenters LIKE 'user_quota_mb'")
If Err.Number = 0 Then
  If Not schemaRs.EOF Then hasQuotaColumn = True
End If
If Not schemaRs Is Nothing Then schemaRs.Close
Set schemaRs = Nothing
Err.Clear
On Error GoTo 0

If hasQuotaColumn Then
  sql = "SELECT u.data_center_id, d.name AS data_center_name, d.user_quota_mb " & _
    "FROM webwindows_users u LEFT JOIN webwindows_datacenters d ON u.data_center_id=d.id " & _
    "WHERE u.id=? LIMIT 1"
Else
  legacyDefault = True
  sql = "SELECT u.data_center_id, d.name AS data_center_name, 1024 AS user_quota_mb " & _
    "FROM webwindows_users u LEFT JOIN webwindows_datacenters d ON u.data_center_id=d.id " & _
    "WHERE u.id=? LIMIT 1"
End If

Set cmd = Server.CreateObject("ADODB.Command")
Set cmd.ActiveConnection = conn
cmd.CommandType = 1
cmd.CommandText = sql
cmd.Parameters.Append cmd.CreateParameter("user_id", 3, 1, , CLng(webWindowsUserId))
On Error Resume Next
Set rs = cmd.Execute
If Err.Number <> 0 Then
  Err.Clear
  On Error GoTo 0
  Response.Status = "503 Service Unavailable"
  Response.Write "{""ok"":false,""authenticated"":true,""storageStatus"":""quota-lookup-failed""," & _
    """quotaKnown"":false,""statsAvailable"":false,""usedMB"":null,""remainingMB"":null," & _
    """quotaMB"":null,""usedPercent"":null,""dataCenterId"":null,""dataCenterName"":null}"
  Response.End
End If
On Error GoTo 0

dataCenterId = Null
dataCenterName = ""
quotaMB = Null
quotaKnown = False
If Not rs.EOF Then
  If Not IsNull(rs("data_center_id")) Then dataCenterId = CLng(rs("data_center_id"))
  dataCenterName = Trim(CStr(rs("data_center_name") & ""))
  If Not IsNull(dataCenterId) And dataCenterName <> "" And Not IsNull(rs("user_quota_mb").Value) Then
    quotaConversionOk = False
    On Error Resume Next
    quotaCandidate = CDbl(rs("user_quota_mb").Value)
    If Err.Number = 0 Then quotaConversionOk = True
    Err.Clear
    On Error GoTo 0
    If quotaConversionOk Then
      If quotaCandidate >= 1024 Then
        quotaMB = quotaCandidate
        quotaKnown = True
      End If
    End If
  End If
End If
rs.Close
Set rs = Nothing
Set cmd = Nothing
conn.Close
Set conn = Nothing

Dim normalizedUsername, fso, userPath, usedBytes, statsAvailable
normalizedUsername = ""
If Not TrySinglePath(webWindowsUsername, normalizedUsername) Then
  WriteStorageResult quotaKnown, quotaMB, dataCenterId, dataCenterName, False, Null, legacyDefault, "stats-failed"
  Response.End
End If
Set fso = Server.CreateObject("Scripting.FileSystemObject")
userPath = Server.MapPath("../cloud/file/" & normalizedUsername)
usedBytes = 0
statsAvailable = True
On Error Resume Next
If fso.FolderExists(userPath) Then usedBytes = FolderBytes(fso.GetFolder(userPath), statsAvailable)
If Err.Number <> 0 Then statsAvailable = False
Err.Clear
On Error GoTo 0
Set fso = Nothing

Dim storageStatus
If Not statsAvailable Then
  storageStatus = "stats-failed"
ElseIf Not quotaKnown Then
  storageStatus = "quota-unknown"
ElseIf CDbl(usedBytes) > CDbl(quotaMB) * 1048576 Then
  storageStatus = "over-quota"
Else
  storageStatus = "available"
End If
WriteStorageResult quotaKnown, quotaMB, dataCenterId, dataCenterName, statsAvailable, usedBytes, legacyDefault, storageStatus

Function TrySinglePath(ByVal value, ByRef normalized)
  Dim raw
  raw = Trim(CStr(value))
  normalized = ""
  If raw = "" Or raw = "." Or raw = ".." Or LCase(raw) = "_system" Then TrySinglePath = False: Exit Function
  If InStr(raw, Chr(0)) > 0 Or InStr(raw, "/") > 0 Or InStr(raw, "\") > 0 Or _
     InStr(raw, ":") > 0 Or InStr(raw, "*") > 0 Or InStr(raw, "?") > 0 Or _
     InStr(raw, """") > 0 Or InStr(raw, "<") > 0 Or InStr(raw, ">") > 0 Or InStr(raw, "|") > 0 Then
    TrySinglePath = False
    Exit Function
  End If
  normalized = raw
  TrySinglePath = True
End Function

Function FolderBytes(ByVal folder, ByRef succeeded)
  Dim total, file, child, childBytes
  total = 0
  On Error Resume Next
  For Each file In folder.Files
    total = CDbl(total) + CDbl(file.Size)
    If Err.Number <> 0 Then succeeded = False: Err.Clear: Exit For
  Next
  If succeeded Then
    For Each child In folder.SubFolders
      childBytes = FolderBytes(child, succeeded)
      total = CDbl(total) + CDbl(childBytes)
      If Not succeeded Then Exit For
    Next
  End If
  If Err.Number <> 0 Then succeeded = False: Err.Clear
  On Error GoTo 0
  FolderBytes = total
End Function

Sub WriteStorageResult(ByVal known, ByVal totalMB, ByVal dcId, ByVal dcName, ByVal statsOk, ByVal bytesUsed, ByVal usedLegacyDefault, ByVal status)
  Dim usedMB, remainingMB, usedPercent
  usedMB = Null
  remainingMB = Null
  usedPercent = Null
  If statsOk Then usedMB = Round(CDbl(bytesUsed) / 1048576, 2)
  If known And statsOk Then
    remainingMB = Round(CDbl(totalMB) - (CDbl(bytesUsed) / 1048576), 2)
    If remainingMB < 0 Then remainingMB = 0
    usedPercent = Round((CDbl(bytesUsed) / (CDbl(totalMB) * 1048576)) * 100, 2)
    If usedPercent > 100 Then usedPercent = 100
  End If
  Response.Write "{""ok"":true,""authenticated"":true,""storageStatus"":""" & Json(status) & """," & _
    """quotaKnown"":" & JsonBoolean(known) & ",""statsAvailable"":" & JsonBoolean(statsOk) & "," & _
    """usedMB"":" & JsonNumber(usedMB) & ",""remainingMB"":" & JsonNumber(remainingMB) & "," & _
    """quotaMB"":" & JsonNumber(totalMB) & ",""usedPercent"":" & JsonNumber(usedPercent) & "," & _
    """dataCenterId"":" & JsonNumber(dcId) & ",""dataCenterName"":""" & Json(dcName) & """," & _
    """legacyDefault"":" & JsonBoolean(usedLegacyDefault) & "}"
End Sub

Function Json(ByVal value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  Json = text
End Function

Function JsonBoolean(ByVal value)
  If CBool(value) Then JsonBoolean = "true" Else JsonBoolean = "false"
End Function

Function JsonNumber(ByVal value)
  Dim text
  If IsNull(value) Or IsEmpty(value) Then JsonNumber = "null": Exit Function
  text = CStr(value)
  text = Replace(text, ",", ".")
  If Left(text, 1) = "." Then text = "0" & text
  If Left(text, 2) = "-." Then text = "-0" & Mid(text, 2)
  JsonNumber = text
End Function
%>
