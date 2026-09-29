<%@LANGUAGE="VBScript" CODEPAGE="65001" EnableSessionState=True %>
<%
Option Explicit
%>
<!--#include file="../inc/conn.asp"-->
<%
Response.Buffer = True
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.CacheControl = "no-store"
Const MAX_FILE_BYTES = 15728640
Const MAX_EMOJI_BYTES = 524288
Dim userId, userName, op
userId = Trim(CStr(Session("webwindows_user_id")))
userName = Trim(CStr(Session("webwindows_username")))
If userId = "" Or userName = "" Or Not IsNumeric(userId) Then
  JsonError "401 Unauthorized", "LOGIN_REQUIRED", "请先登录 WebWindows"
End If
If userName <> Replace(Replace(userName, "/", ""), "\", "") Or userName = "." Or userName = ".." Then
  JsonError "401 Unauthorized", "INVALID_ACCOUNT", "登录账户无效"
End If
If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
  If CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_REQUEST")) <> "desktalk-file" Then
    JsonError "403 Forbidden", "REQUEST_HEADER_REQUIRED", "桌讯文件请求验证失败"
  End If
End If
op = LCase(Trim(CStr(Request.QueryString("op"))))
Select Case op
  Case "share"
    RequirePost
    ShareCloudFile
  Case "download"
    DownloadSharedFile
  Case "revoke"
    RequirePost
    RevokeSharedFile
  Case Else
    JsonError "400 Bad Request", "INVALID_OPERATION", "文件操作无效"
End Select

Sub RequirePost()
  If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
    Response.AddHeader "Allow", "POST"
    JsonError "405 Method Not Allowed", "METHOD_NOT_ALLOWED", "只允许 POST 请求"
  End If
End Sub

Sub EnsureTransferTable()
  On Error Resume Next
  conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_desktalk_file_transfers (" & _
    "id CHAR(32) CHARACTER SET ascii NOT NULL PRIMARY KEY," & _
    "sender_user_id BIGINT UNSIGNED NOT NULL,recipient_user_id BIGINT UNSIGNED NOT NULL," & _
    "conversation_id VARCHAR(160) CHARACTER SET ascii NOT NULL,file_name VARCHAR(180) NOT NULL," & _
    "mime_type VARCHAR(80) CHARACTER SET ascii NOT NULL,file_size INT UNSIGNED NOT NULL," & _
    "purpose VARCHAR(12) CHARACTER SET ascii NOT NULL,status VARCHAR(12) CHARACTER SET ascii NOT NULL," & _
    "created_at DATETIME NOT NULL,expires_at DATETIME NOT NULL,revoked_at DATETIME NULL," & _
    "KEY idx_dt_file_receiver (recipient_user_id,status,expires_at)," & _
    "KEY idx_dt_file_sender (sender_user_id,status,expires_at)" & _
    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    JsonError "503 Service Unavailable", "FILE_STORE_UNAVAILABLE", "文件传输服务暂不可用"
  End If
  On Error GoTo 0
End Sub

Function SqlText(ByVal value)
  SqlText = "'" & Replace(CStr(value), "'", "''") & "'"
End Function

Function ValidId(ByVal value)
  Dim re
  Set re = New RegExp
  re.Pattern = "^[a-f0-9]{32}$"
  ValidId = re.Test(LCase(CStr(value)))
  Set re = Nothing
End Function

Function ValidConversation(ByVal value)
  Dim re
  Set re = New RegExp
  re.Pattern = "^[A-Za-z0-9_-]{1,160}$"
  ValidConversation = re.Test(CStr(value))
  Set re = Nothing
End Function

Function NormalizeCloudPath(ByVal value, ByRef normalized)
  Dim raw, parts, i, part, result, re
  normalized = ""
  raw = Replace(Trim(CStr(value)), "\", "/")
  If raw = "" Or Left(raw, 1) = "/" Or InStr(raw, ":") > 0 Or InStr(raw, Chr(0)) > 0 Then
    NormalizeCloudPath = False
    Exit Function
  End If
  Do While InStr(raw, "//") > 0
    raw = Replace(raw, "//", "/")
  Loop
  parts = Split(raw, "/")
  result = ""
  For i = 0 To UBound(parts)
    part = Trim(CStr(parts(i)))
    If part = "" Or part = "." Or part = ".." Or LCase(part) = "_system" Or HasControlChars(part) Then
      NormalizeCloudPath = False
      Exit Function
    End If
    If result <> "" Then result = result & "/"
    result = result & part
  Next
  normalized = result
  NormalizeCloudPath = True
End Function

Function HasControlChars(ByVal value)
  Dim i, n
  HasControlChars = False
  For i = 1 To Len(value)
    n = AscW(Mid(value, i, 1))
    If n >= 0 And n < 32 Then HasControlChars = True : Exit Function
    If n = 127 Then HasControlChars = True : Exit Function
  Next
End Function

Function RandomTransferId()
  RandomTransferId = ""
  On Error Resume Next
  Dim rs
  Set rs = conn.Execute("SELECT LOWER(HEX(RANDOM_BYTES(16))) AS value")
  If Err.Number = 0 Then If Not rs.EOF Then RandomTransferId = LCase(CStr(rs("value")))
  If Not rs Is Nothing Then rs.Close
  Set rs = Nothing
  Err.Clear
  On Error GoTo 0
End Function

Function MimeForExtension(ByVal ext)
  Select Case LCase(ext)
    Case "png": MimeForExtension = "image/png"
    Case "jpg", "jpeg": MimeForExtension = "image/jpeg"
    Case "webp": MimeForExtension = "image/webp"
    Case "pdf": MimeForExtension = "application/pdf"
    Case "txt": MimeForExtension = "text/plain"
    Case "csv": MimeForExtension = "text/csv"
    Case "docx": MimeForExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    Case "xlsx": MimeForExtension = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    Case "pptx": MimeForExtension = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    Case Else: MimeForExtension = ""
  End Select
End Function

Function SafeName(ByVal value)
  Dim name, i, ch, result
  name = CStr(value)
  result = ""
  For i = 1 To Len(name)
    ch = Mid(name, i, 1)
    If AscW(ch) >= 32 And AscW(ch) <> 127 And ch <> "\" And ch <> "/" And ch <> ":" Then result = result & ch
  Next
  result = Trim(result)
  If result = "" Or result = "." Or result = ".." Then result = "shared-file"
  If Len(result) > 150 Then result = Right(result, 150)
  SafeName = result
End Function

Function HasAllowedSignature(ByVal path, ByVal ext, ByVal purpose)
  HasAllowedSignature = False
  Dim stream, bytes, count, signature, width, height
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.LoadFromFile path
  count = stream.Size
  If count < 8 Then stream.Close : Set stream = Nothing : Exit Function
  If purpose = "emoji" Then
    If LCase(ext) <> "png" Or count < 24 Or count > MAX_EMOJI_BYTES Then stream.Close : Set stream = Nothing : Exit Function
    stream.Position = 0
    bytes = stream.Read(24)
    signature = HexByte(bytes, 0) & HexByte(bytes, 1) & HexByte(bytes, 2) & HexByte(bytes, 3) & HexByte(bytes, 4) & HexByte(bytes, 5) & HexByte(bytes, 6) & HexByte(bytes, 7)
    width = BigEndian32(bytes, 16)
    height = BigEndian32(bytes, 20)
    HasAllowedSignature = (signature = "89504E470D0A1A0A" And width > 0 And height > 0 And width <= 512 And height <= 512 And width * height <= 262144)
    stream.Close
    Set stream = Nothing
    Exit Function
  End If
  Select Case LCase(ext)
    Case "png"
      stream.Position = 0 : bytes = stream.Read(8)
      HasAllowedSignature = (HexByte(bytes,0) & HexByte(bytes,1) & HexByte(bytes,2) & HexByte(bytes,3) & HexByte(bytes,4) & HexByte(bytes,5) & HexByte(bytes,6) & HexByte(bytes,7) = "89504E470D0A1A0A")
    Case "jpg", "jpeg"
      stream.Position = 0 : bytes = stream.Read(3)
      HasAllowedSignature = (HexByte(bytes,0) & HexByte(bytes,1) & HexByte(bytes,2) = "FFD8FF")
    Case "webp"
      stream.Position = 0 : bytes = stream.Read(12)
      HasAllowedSignature = (BytesToAscii(bytes,0,4) = "RIFF" And BytesToAscii(bytes,8,4) = "WEBP")
    Case "pdf"
      stream.Position = 0 : bytes = stream.Read(5)
      HasAllowedSignature = (BytesToAscii(bytes,0,5) = "%PDF-")
    Case "docx", "xlsx", "pptx"
      stream.Position = 0 : bytes = stream.Read(4)
      HasAllowedSignature = (HexByte(bytes,0) & HexByte(bytes,1) = "504B" And HexByte(bytes,2) = "0304")
    Case "txt", "csv"
      stream.Position = 0 : bytes = stream.Read(MinLong(count, 4096))
      HasAllowedSignature = Not HasNullByte(bytes)
    Case Else
      HasAllowedSignature = False
  End Select
  stream.Close
  Set stream = Nothing
End Function

Function HexByte(ByRef data, ByVal index)
  HexByte = Right("0" & Hex(AscB(MidB(data, index + 1, 1))), 2)
End Function

Function BigEndian32(ByRef data, ByVal index)
  BigEndian32 = CDbl(AscB(MidB(data,index+1,1))) * 16777216# + CDbl(AscB(MidB(data,index+2,1))) * 65536# + CDbl(AscB(MidB(data,index+3,1))) * 256# + CDbl(AscB(MidB(data,index+4,1)))
End Function

Function BytesToAscii(ByRef data, ByVal index, ByVal length)
  Dim i, value
  value = ""
  For i = 0 To length - 1
    value = value & Chr(AscB(MidB(data,index+i+1,1)))
  Next
  BytesToAscii = value
End Function

Function HasNullByte(ByRef data)
  Dim i
  HasNullByte = False
  For i = 1 To LenB(data)
    If AscB(MidB(data,i,1)) = 0 Then HasNullByte = True : Exit Function
  Next
End Function

Function MinLong(ByVal a, ByVal b)
  If a < b Then MinLong = a Else MinLong = b
End Function

Sub ShareCloudFile()
  EnsureTransferTable
  Dim senderId, targetId, conv, purpose, path, normalizedPath, ext, dot, mime, physical, dataRoot, targetPath
  Dim fso, info, transferId, recordName, fileSize, rs, escapedName
  senderId = CLng(userId)
  targetId = Trim(CStr(Request.Form("recipientId")))
  conv = Trim(CStr(Request.Form("convId")))
  purpose = LCase(Trim(CStr(Request.Form("purpose"))))
  path = CStr(Request.Form("path"))
  If Not IsNumeric(targetId) Or CLng(targetId) = senderId Or Not ValidConversation(conv) Then JsonError "400 Bad Request", "INVALID_TARGET", "会话对象无效"
  If purpose <> "file" And purpose <> "emoji" Then JsonError "400 Bad Request", "INVALID_PURPOSE", "分享类型无效"
  If Not NormalizeCloudPath(path, normalizedPath) Then JsonError "400 Bad Request", "INVALID_PATH", "云资源路径无效"
  dot = InStrRev(normalizedPath, ".")
  If dot <= 0 Then JsonError "415 Unsupported Media Type", "UNSUPPORTED_TYPE", "不支持此文件类型"
  ext = LCase(Mid(normalizedPath, dot + 1))
  mime = MimeForExtension(ext)
  If mime = "" Then JsonError "415 Unsupported Media Type", "UNSUPPORTED_TYPE", "文件类型不在安全允许列表中"
  If purpose = "emoji" And ext <> "png" Then JsonError "415 Unsupported Media Type", "EMOJI_TYPE", "自定义表情目前仅支持 PNG 图片"
  If purpose = "emoji" Then
    If Trim(CStr(Request.Form("rightsConfirmed"))) <> "1" Then JsonError "400 Bad Request", "RIGHTS_CONFIRMATION_REQUIRED", "请先确认你有权使用此表情"
  End If
  physical = Server.MapPath("../file/" & userName & "/" & Replace(normalizedPath, "/", "\"))
  On Error Resume Next
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then Err.Clear : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_STORAGE_UNAVAILABLE", "文件存储服务暂不可用"
  If Not fso.FileExists(physical) Then
    If Err.Number <> 0 Then Err.Clear : Set fso = Nothing : On Error GoTo 0 : JsonError "503 Service Unavailable", "CLOUD_FILE_CHECK_FAILED", "无法读取所选云资源"
    Set fso = Nothing : On Error GoTo 0 : JsonError "404 Not Found", "CLOUD_FILE_NOT_FOUND", "所选云资源不存在"
  End If
  Set info = fso.GetFile(physical)
  If Err.Number <> 0 Then Err.Clear : Set fso = Nothing : On Error GoTo 0 : JsonError "503 Service Unavailable", "CLOUD_FILE_READ_FAILED", "无法读取所选云资源"
  fileSize = CLng(info.Size)
  If Err.Number <> 0 Then Err.Clear : Set info = Nothing : Set fso = Nothing : On Error GoTo 0 : JsonError "503 Service Unavailable", "CLOUD_FILE_READ_FAILED", "无法读取所选云资源"
  On Error GoTo 0
  If fileSize <= 0 Or fileSize > MAX_FILE_BYTES Or (purpose = "emoji" And fileSize > MAX_EMOJI_BYTES) Then Set info = Nothing : Set fso = Nothing : JsonError "413 Content Too Large", "FILE_TOO_LARGE", "文件超过允许大小"
  On Error Resume Next
  If Not HasAllowedSignature(physical, ext, purpose) Then
    If Err.Number <> 0 Then Err.Clear : Set info = Nothing : Set fso = Nothing : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_VALIDATION_FAILED", "无法验证文件内容"
    Set info = Nothing : Set fso = Nothing : On Error GoTo 0 : JsonError "415 Unsupported Media Type", "CONTENT_MISMATCH", "文件实际内容与允许格式不符"
  End If
  If Err.Number <> 0 Then Err.Clear : Set info = Nothing : Set fso = Nothing : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_VALIDATION_FAILED", "无法验证文件内容"
  On Error GoTo 0
  Set info = Nothing
  On Error Resume Next
  Set rs = conn.Execute("SELECT COUNT(*) AS allowed FROM webwindows_desktalk_friends WHERE user_id=" & senderId & " AND friend_user_id=" & CLng(targetId))
  If Err.Number <> 0 Then Err.Clear : On Error GoTo 0 : Set fso = Nothing : JsonError "503 Service Unavailable", "FRIEND_STORE_UNAVAILABLE", "好友授权服务不可用"
  If rs.EOF Or CLng(rs("allowed")) = 0 Then rs.Close : Set rs = Nothing : On Error GoTo 0 : Set fso = Nothing : JsonError "403 Forbidden", "RECIPIENT_NOT_FRIEND", "只能向已添加的好友分享文件"
  rs.Close : Set rs = Nothing
  Set rs = conn.Execute("SELECT LOWER(HEX(RANDOM_BYTES(16))) AS value")
  If Err.Number <> 0 Or rs.EOF Then Err.Clear : On Error GoTo 0 : Set fso = Nothing : JsonError "503 Service Unavailable", "ID_GENERATION_FAILED", "无法创建安全文件编号"
  transferId = LCase(CStr(rs("value")))
  rs.Close : Set rs = Nothing
  On Error GoTo 0
  If Not ValidId(transferId) Then Set fso = Nothing : JsonError "503 Service Unavailable", "ID_GENERATION_FAILED", "无法创建安全文件编号"
  On Error Resume Next
  dataRoot = Server.MapPath("../data/chat/files")
  If Err.Number <> 0 Then Err.Clear : Set fso = Nothing : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_STORAGE_UNAVAILABLE", "文件存储服务暂不可用"
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Err.Number <> 0 Then Err.Clear : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_STORAGE_UNAVAILABLE", "文件存储服务暂不可用"
  If Not fso.FolderExists(Server.MapPath("../data")) Then fso.CreateFolder Server.MapPath("../data")
  If Err.Number = 0 And Not fso.FolderExists(Server.MapPath("../data/chat")) Then fso.CreateFolder Server.MapPath("../data/chat")
  If Err.Number = 0 And Not fso.FolderExists(dataRoot) Then fso.CreateFolder dataRoot
  If Err.Number <> 0 Then
    Err.Clear : Set fso = Nothing : On Error GoTo 0
    JsonError "503 Service Unavailable", "FILE_STORAGE_UNAVAILABLE", "无法创建文件存储目录"
  End If
  targetPath = dataRoot & "\" & transferId & ".bin"
  fso.CopyFile physical, targetPath, False
  If Err.Number <> 0 Then
    Err.Clear : Set fso = Nothing : On Error GoTo 0
    JsonError "503 Service Unavailable", "FILE_COPY_FAILED", "无法保存分享文件"
  End If
  Set fso = Nothing
  recordName = SafeName(infoName(normalizedPath))
  escapedName = SqlText(recordName)
  On Error Resume Next
  conn.Execute "INSERT INTO webwindows_desktalk_file_transfers (id,sender_user_id,recipient_user_id,conversation_id,file_name,mime_type,file_size,purpose,status,created_at,expires_at) VALUES (" & _
    SqlText(transferId) & "," & senderId & "," & CLng(targetId) & "," & SqlText(conv) & "," & escapedName & "," & SqlText(mime) & "," & fileSize & "," & SqlText(purpose) & ",'ready',NOW(),DATE_ADD(NOW(),INTERVAL 7 DAY))"
  If Err.Number <> 0 Then
    Err.Clear
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    If fso.FileExists(targetPath) Then fso.DeleteFile targetPath, True
    Set fso = Nothing
    On Error GoTo 0
    JsonError "503 Service Unavailable", "FILE_STORE_UNAVAILABLE", "无法登记安全文件"
  End If
  On Error GoTo 0
  Response.ContentType = "application/json; charset=utf-8"
  Response.Write "{""ok"":true,""id"":""" & transferId & """,""name"":""" & JsonEscape(recordName) & """,""mimeType"":""" & mime & """,""size"":" & fileSize & ",""purpose"":""" & purpose & """,""expiresInDays"":7}"
End Sub

Function infoName(ByVal path)
  Dim p
  p = InStrRev(path, "/")
  If p > 0 Then infoName = Mid(path, p + 1) Else infoName = path
End Function

Sub LoadAuthorizedTransfer(ByVal transferId, ByRef rs)
  If Not ValidId(transferId) Then JsonError "400 Bad Request", "INVALID_ID", "文件编号无效"
  EnsureTransferTable
  On Error Resume Next
  Set rs = conn.Execute("SELECT id,sender_user_id,recipient_user_id,conversation_id,file_name,mime_type,file_size,purpose,status FROM webwindows_desktalk_file_transfers WHERE id=" & SqlText(LCase(transferId)) & _
    " AND (sender_user_id=" & CLng(userId) & " OR recipient_user_id=" & CLng(userId) & ") AND status='ready' AND revoked_at IS NULL AND expires_at>NOW()")
  If Err.Number <> 0 Then Err.Clear : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_STORE_UNAVAILABLE", "文件服务暂不可用"
  On Error GoTo 0
  If rs.EOF Then rs.Close : Set rs = Nothing : JsonError "404 Not Found", "FILE_NOT_FOUND", "文件不存在、已过期或你无权访问"
End Sub

Sub DownloadSharedFile()
  Dim transferId, rs, dataRoot, path, fso, filename, mime, purpose, stream
  transferId = LCase(Trim(CStr(Request.QueryString("id"))))
  LoadAuthorizedTransfer transferId, rs
  filename = SafeName(CStr(rs("file_name")))
  mime = CStr(rs("mime_type"))
  purpose = CStr(rs("purpose"))
  rs.Close : Set rs = Nothing
  dataRoot = Server.MapPath("../data/chat/files")
  path = dataRoot & "\" & transferId & ".bin"
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Not fso.FileExists(path) Then Set fso = Nothing : JsonError "404 Not Found", "FILE_MISSING", "文件内容已清理"
  Set fso = Nothing
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.LoadFromFile path
  Response.Clear
  Response.Buffer = False
  Response.ContentType = "application/octet-stream"
  If purpose = "emoji" Then Response.ContentType = "image/png"
  Response.AddHeader "X-Content-Type-Options", "nosniff"
  Response.AddHeader "Cache-Control", "private, no-store"
  If purpose = "emoji" Then
    Response.AddHeader "Content-Disposition", "inline"
  Else
    Response.AddHeader "Content-Disposition", "attachment; filename*=UTF-8''" & Replace(Server.URLEncode(filename), "+", "%20")
  End If
  Response.BinaryWrite stream.Read
  stream.Close
  Set stream = Nothing
  Response.End
End Sub

Sub RevokeSharedFile()
  Dim transferId
  transferId = LCase(Trim(CStr(Request.Form("id"))))
  If Not ValidId(transferId) Then JsonError "400 Bad Request", "INVALID_ID", "文件编号无效"
  EnsureTransferTable
  On Error Resume Next
  conn.Execute "UPDATE webwindows_desktalk_file_transfers SET status='revoked',revoked_at=NOW() WHERE id=" & SqlText(transferId) & " AND sender_user_id=" & CLng(userId) & " AND status='ready'"
  If Err.Number <> 0 Then Err.Clear : On Error GoTo 0 : JsonError "503 Service Unavailable", "FILE_STORE_UNAVAILABLE", "无法撤回文件"
  On Error GoTo 0
  Dim fso, path
  path = Server.MapPath("../data/chat/files/" & transferId & ".bin")
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If fso.FileExists(path) Then fso.DeleteFile path, True
  Set fso = Nothing
  Response.ContentType = "application/json; charset=utf-8"
  Response.Write "{""ok"":true}"
End Sub

Sub JsonError(ByVal status, ByVal code, ByVal message)
  Response.Status = status
  Response.ContentType = "application/json; charset=utf-8"
  Response.Write "{""ok"":false,""error"":{""code"":""" & code & """,""message"":""" & JsonEscape(message) & """}}"
  Response.End
End Sub

Function JsonEscape(ByVal value)
  Dim result
  result = CStr(value & "")
  result = Replace(result, "\", "\\")
  result = Replace(result, """", "\""")
  result = Replace(result, vbCr, "\r")
  result = Replace(result, vbLf, "\n")
  result = Replace(result, vbTab, "\t")
  JsonEscape = result
End Function
%>
