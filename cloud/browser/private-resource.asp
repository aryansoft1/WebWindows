<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Option Explicit
Response.Buffer = True
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.AddHeader "X-WebWindows-Private-Resource-Version", "2026.08.10.3"

Const MAX_PRIVATE_FILE_BYTES = 15728640
Const MAX_CHUNK_BYTES = 131072

Dim userId, usernameFolder, normalizedUsername, operation
Dim webWindowsUserId, webWindowsUsername, webWindowsCookieUsername
webWindowsUserId = Trim(CStr(Session("webwindows_user_id")))
webWindowsUsername = Trim(CStr(Session("webwindows_username")))
webWindowsCookieUsername = Trim(CStr(Request.Cookies("webwindows_user")))

' 兼容升级前的普通前台会话；后台管理员会话不得迁移为私人云身份。
If (webWindowsUserId = "" Or webWindowsUsername = "") And _
   Not (Session("webwindows_admin") = True) And webWindowsCookieUsername <> "" And _
   StrComp(webWindowsCookieUsername, Trim(CStr(Session("username"))), vbBinaryCompare) = 0 Then
  webWindowsUserId = Trim(CStr(Session("user_id")))
  webWindowsUsername = Trim(CStr(Session("username")))
  If webWindowsUserId <> "" And webWindowsUsername <> "" Then
    Session("webwindows_user_id") = webWindowsUserId
    Session("webwindows_username") = webWindowsUsername
    Session("webwindows_nickname") = Trim(CStr(Session("nickname")))
  End If
End If

If webWindowsUserId = "" Or webWindowsUsername = "" Then
  JsonError "401 Unauthorized", "LOGIN_REQUIRED", "请先登录 WebWindows"
End If
If Not IsNumeric(webWindowsUserId) Then
  JsonError "401 Unauthorized", "LOGIN_REQUIRED", "WebWindows 登录会话无效"
End If
userId = CLng(webWindowsUserId)
usernameFolder = webWindowsUsername
If Not TryPrivatePath(usernameFolder, normalizedUsername) Or normalizedUsername = "" Or _
   normalizedUsername <> usernameFolder Or InStr(normalizedUsername, "/") > 0 Then
  JsonError "403 Forbidden", "INVALID_USERNAME", "登录用户名无法映射到云资料目录"
End If
operation = LCase(Trim(CStr(Request.QueryString("op"))))

If Request.ServerVariables("REQUEST_METHOD") = "POST" Then
  If CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_REQUEST")) <> "private-resource" Then
    JsonError "403 Forbidden", "REQUEST_HEADER_REQUIRED", "私人资源请求验证失败"
  End If
End If

Select Case operation
  Case "content"
    SendContent False
  Case "editor-data"
    SendContent True
  Case "create-folder"
    RequirePost
    CreatePrivateFolder
  Case "rename-folder"
    RequirePost
    RenamePrivateFolder
  Case "delete-folder"
    RequirePost
    DeletePrivateFolder
  Case "begin"
    RequirePost
    BeginUpload
  Case "chunk"
    RequirePost
    AppendChunk
  Case "commit"
    RequirePost
    CommitUpload
  Case "cancel"
    RequirePost
    CancelUpload
  Case Else
    JsonError "400 Bad Request", "INVALID_OPERATION", "私人资源操作无效"
End Select

Sub RequirePost()
  If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
    JsonError "405 Method Not Allowed", "METHOD_NOT_ALLOWED", "只允许 POST 请求"
  End If
End Sub

Function PrivateRoot()
  PrivateRoot = Server.MapPath("../file/" & normalizedUsername)
End Function

Sub EnsurePrivateRoot()
  Dim fso, filesRoot, rootPath, systemPath, uploadsPath
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  filesRoot = Server.MapPath("../file")
  rootPath = PrivateRoot()
  systemPath = rootPath & "\_system"
  uploadsPath = systemPath & "\uploads"
  If Not fso.FolderExists(filesRoot) Then fso.CreateFolder filesRoot
  If Not fso.FolderExists(rootPath) Then fso.CreateFolder rootPath
  If Not fso.FolderExists(systemPath) Then fso.CreateFolder systemPath
  If Not fso.FolderExists(uploadsPath) Then fso.CreateFolder uploadsPath
  Set fso = Nothing
End Sub

Function TryPrivatePath(ByVal value, ByRef normalized)
  Dim raw, parts, index, segment, result
  normalized = ""
  raw = Replace(Trim(CStr(value)), "\", "/")
  If InStr(raw, Chr(0)) > 0 Or Left(raw, 1) = "/" Then
    TryPrivatePath = False
    Exit Function
  End If
  Do While InStr(raw, "//") > 0
    raw = Replace(raw, "//", "/")
  Loop
  If Right(raw, 1) = "/" Then raw = Left(raw, Len(raw) - 1)
  If raw = "" Then
    TryPrivatePath = True
    Exit Function
  End If
  parts = Split(raw, "/")
  result = ""
  For index = 0 To UBound(parts)
    segment = Trim(CStr(parts(index)))
    If segment = "" Or segment = "." Or segment = ".." Or LCase(segment) = "_system" Then
      TryPrivatePath = False
      Exit Function
    End If
    If InStr(segment, ":") > 0 Or InStr(segment, "*") > 0 Or _
       InStr(segment, "?") > 0 Or InStr(segment, """") > 0 Or _
       InStr(segment, "<") > 0 Or InStr(segment, ">") > 0 Or _
       InStr(segment, "|") > 0 Then
      TryPrivatePath = False
      Exit Function
    End If
    If result <> "" Then result = result & "/"
    result = result & segment
  Next
  normalized = result
  TryPrivatePath = True
End Function

Function PhysicalPath(ByVal relativePath)
  Dim normalized
  If Not TryPrivatePath(relativePath, normalized) Or normalized = "" Then
    PhysicalPath = ""
  Else
    PhysicalPath = PrivateRoot() & "\" & Replace(normalized, "/", "\")
  End If
End Function

Function EditorPath(ByVal relativePath, ByVal editorType)
  If LCase(Trim(CStr(editorType))) = "write-editor" Then
    EditorPath = PhysicalPath(relativePath) & ".write.json"
  Else
    EditorPath = PhysicalPath(relativePath) & ".sheet.json"
  End If
End Function

Function AllowedSpreadsheet(ByVal fileName)
  Dim fso, extension
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  extension = LCase(fso.GetExtensionName(fileName))
  Set fso = Nothing
  AllowedSpreadsheet = (extension = "xlsx" Or extension = "xls" Or extension = "csv")
End Function

Function AllowedCloudFile(ByVal fileName)
  Dim fso, extension
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  extension = LCase(fso.GetExtensionName(fileName))
  Set fso = Nothing
  AllowedCloudFile = (InStr(1, ",xlsx,xls,csv,docx,doc,pptx,ppt,pdf,png,jpg,jpeg,gif,webp,json,md,txt,zip,", _
    "," & extension & ",", vbTextCompare) > 0)
End Function

Sub SendContent(ByVal editorData)
  Dim relativePath, targetPath, fso, fileName, extension, contentType, stream, editorType
  If Not TryPrivatePath(Request.QueryString("path"), relativePath) Or relativePath = "" Then
    JsonError "400 Bad Request", "INVALID_PATH", "私人文件位置无效"
  End If
  If editorData Then
    editorType = LCase(Trim(CStr(Request.QueryString("editor"))))
    If editorType <> "write-editor" Then editorType = "sheet-editor"
    targetPath = EditorPath(relativePath, editorType)
  Else
    targetPath = PhysicalPath(relativePath)
  End If
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If targetPath = "" Or Not fso.FileExists(targetPath) Then
    Set fso = Nothing
    JsonError "404 Not Found", "NOT_FOUND", "私人文件不存在"
  End If
  fileName = fso.GetFileName(PhysicalPath(relativePath))
  extension = LCase(fso.GetExtensionName(fileName))
  Set fso = Nothing
  If editorData Then
    contentType = "application/json; charset=utf-8"
  ElseIf extension = "xlsx" Then
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ElseIf extension = "xls" Then
    contentType = "application/vnd.ms-excel"
  ElseIf extension = "docx" Then
    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ElseIf extension = "doc" Then
    contentType = "application/msword"
  ElseIf extension = "pptx" Then
    contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ElseIf extension = "ppt" Then
    contentType = "application/vnd.ms-powerpoint"
  ElseIf extension = "zip" Then
    contentType = "application/zip"
  ElseIf extension = "pdf" Then
    contentType = "application/pdf"
  ElseIf extension = "png" Then
    contentType = "image/png"
  ElseIf extension = "jpg" Or extension = "jpeg" Then
    contentType = "image/jpeg"
  ElseIf extension = "gif" Then
    contentType = "image/gif"
  ElseIf extension = "webp" Then
    contentType = "image/webp"
  ElseIf extension = "json" Then
    contentType = "application/json; charset=utf-8"
  ElseIf extension = "md" Then
    contentType = "text/markdown; charset=utf-8"
  ElseIf extension = "txt" Then
    contentType = "text/plain; charset=utf-8"
  Else
    contentType = "text/csv; charset=utf-8"
  End If
  Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.LoadFromFile targetPath
  Response.ContentType = contentType
  Response.AddHeader "Cache-Control", "private, no-store"
  Response.AddHeader "X-Content-Type-Options", "nosniff"
  If Not editorData Then
    Response.AddHeader "Content-Disposition", "inline; filename*=UTF-8''" & Replace(Server.URLEncode(fileName), "+", "%20")
  End If
  Response.BinaryWrite stream.Read
  stream.Close
  Set stream = Nothing
  Response.End
End Sub

Sub CreatePrivateFolder()
  Dim parentPath, folderName, normalizedName, parentPhysical, targetPath, relativePath, fso
  If Not TryPrivatePath(Request.Form("path"), parentPath) Then
    JsonError "400 Bad Request", "INVALID_PATH", "目标文件夹无效"
  End If
  folderName = Trim(CStr(Request.Form("name")))
  If Not TryPrivatePath(folderName, normalizedName) Or normalizedName = "" Or _
     normalizedName <> folderName Or InStr(normalizedName, "/") > 0 Then
    JsonError "400 Bad Request", "INVALID_NAME", "文件夹名称无效"
  End If

  EnsurePrivateRoot
  parentPhysical = PrivateRoot()
  relativePath = normalizedName
  If parentPath <> "" Then
    parentPhysical = parentPhysical & "\" & Replace(parentPath, "/", "\")
    relativePath = parentPath & "/" & normalizedName
  End If

  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Not fso.FolderExists(parentPhysical) Then
    Set fso = Nothing
    JsonError "404 Not Found", "PARENT_NOT_FOUND", "目标文件夹不存在"
  End If
  targetPath = parentPhysical & "\" & normalizedName
  If fso.FolderExists(targetPath) Or fso.FileExists(targetPath) Then
    Set fso = Nothing
    JsonError "409 Conflict", "NAME_CONFLICT", "已存在同名资料"
  End If
  fso.CreateFolder targetPath
  Set fso = Nothing
  JsonOk """path"":""" & Json(relativePath) & """,""name"":""" & Json(normalizedName) & """"
End Sub

Sub RenamePrivateFolder()
  Dim relativePath, newName, normalizedName, sourcePath, parentPath, parentPhysical, targetPath, slashIndex, fso
  If Not TryPrivatePath(Request.Form("path"), relativePath) Or relativePath = "" Then
    JsonError "400 Bad Request", "INVALID_PATH", "文件夹位置无效"
  End If
  newName = Trim(CStr(Request.Form("name")))
  If Not TryPrivatePath(newName, normalizedName) Or normalizedName = "" Or _
     normalizedName <> newName Or InStr(normalizedName, "/") > 0 Then
    JsonError "400 Bad Request", "INVALID_NAME", "文件夹名称无效"
  End If

  sourcePath = PhysicalPath(relativePath)
  slashIndex = InStrRev(relativePath, "/")
  parentPath = ""
  If slashIndex > 0 Then parentPath = Left(relativePath, slashIndex - 1)
  parentPhysical = PrivateRoot()
  If parentPath <> "" Then parentPhysical = parentPhysical & "\" & Replace(parentPath, "/", "\")
  targetPath = parentPhysical & "\" & normalizedName

  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Not fso.FolderExists(sourcePath) Then
    Set fso = Nothing
    JsonError "404 Not Found", "NOT_FOUND", "文件夹不存在"
  End If
  If LCase(sourcePath) <> LCase(targetPath) And (fso.FolderExists(targetPath) Or fso.FileExists(targetPath)) Then
    Set fso = Nothing
    JsonError "409 Conflict", "NAME_CONFLICT", "已存在同名资料"
  End If
  If LCase(sourcePath) <> LCase(targetPath) Then fso.MoveFolder sourcePath, targetPath
  Set fso = Nothing
  JsonOk """renamed"":true"
End Sub

Sub DeletePrivateFolder()
  Dim relativePath, targetPath, fso, targetFolder
  If Not TryPrivatePath(Request.Form("path"), relativePath) Or relativePath = "" Then
    JsonError "400 Bad Request", "INVALID_PATH", "文件夹位置无效"
  End If
  targetPath = PhysicalPath(relativePath)
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Not fso.FolderExists(targetPath) Then
    Set fso = Nothing
    JsonError "404 Not Found", "NOT_FOUND", "文件夹不存在"
  End If
  Set targetFolder = fso.GetFolder(targetPath)
  If targetFolder.Files.Count > 0 Or targetFolder.SubFolders.Count > 0 Then
    Set targetFolder = Nothing
    Set fso = Nothing
    JsonError "409 Conflict", "FOLDER_NOT_EMPTY", "只能删除空文件夹"
  End If
  Set targetFolder = Nothing
  fso.DeleteFolder targetPath, False
  Set fso = Nothing
  JsonOk """deleted"":true"
End Sub

Sub BeginUpload()
  Dim mode, relativePath, parentPath, fileName, targetPath, fso, uploadId, tempPath, editorType, sourceExtension
  mode = LCase(Trim(CStr(Request.Form("mode"))))
  If mode = "editor" Then
    If Not TryPrivatePath(Request.Form("path"), relativePath) Or relativePath = "" Then
      JsonError "400 Bad Request", "INVALID_PATH", "编辑文件位置无效"
    End If
    editorType = LCase(Trim(CStr(Request.Form("editorType"))))
    If editorType <> "write-editor" Then editorType = "sheet-editor"
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    sourceExtension = LCase(fso.GetExtensionName(relativePath))
    Set fso = Nothing
    If editorType = "write-editor" And sourceExtension <> "docx" Then
      JsonError "415 Unsupported Media Type", "UNSUPPORTED_EDITOR", "Write Editor 只能保存 DOCX 的编辑副本"
    End If
    If editorType = "sheet-editor" And sourceExtension <> "xlsx" And sourceExtension <> "xls" And sourceExtension <> "csv" Then
      JsonError "415 Unsupported Media Type", "UNSUPPORTED_EDITOR", "Sheet Editor 文件类型无效"
    End If
    targetPath = EditorPath(relativePath, editorType)
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    If Not fso.FileExists(PhysicalPath(relativePath)) Then
      Set fso = Nothing
      JsonError "404 Not Found", "SOURCE_NOT_FOUND", "原始文件不存在"
    End If
    Set fso = Nothing
  ElseIf mode = "save-as" Then
    If Not TryPrivatePath(Request.Form("path"), relativePath) Or relativePath = "" Then
      JsonError "400 Bad Request", "INVALID_PATH", "保存位置无效"
    End If
    If Len(relativePath) > 500 Then
      JsonError "400 Bad Request", "PATH_TOO_LONG", "保存位置过长"
    End If
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    fileName = fso.GetFileName(relativePath)
    Set fso = Nothing
    If Len(fileName) > 120 Or Left(fileName, 1) = "." Or Right(fileName, 1) = "." Or _
       Right(fileName, 1) = " " Or Not AllowedCloudFile(fileName) Then
      JsonError "415 Unsupported Media Type", "UNSUPPORTED_FILE_TYPE", "此文件类型不能保存到云资料"
    End If
    EnsurePrivateRoot
    targetPath = PhysicalPath(relativePath)
    parentPath = Left(targetPath, InStrRev(targetPath, "\") - 1)
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    If Not fso.FolderExists(parentPath) Then
      Set fso = Nothing
      JsonError "404 Not Found", "PARENT_NOT_FOUND", "目标文件夹不存在"
    End If
    Set fso = Nothing
  ElseIf mode = "original" Then
    JsonError "403 Forbidden", "LOCAL_UPLOAD_DISABLED", "请通过 WebWindows 云文件对话框保存文件"
  Else
    JsonError "400 Bad Request", "INVALID_MODE", "上传模式无效"
  End If

  EnsurePrivateRoot
  Randomize
  uploadId = CStr(userId) & "-" & Replace(CStr(Timer), ".", "") & "-" & CStr(Int(Rnd() * 1000000))
  tempPath = PrivateRoot() & "\_system\uploads\" & uploadId & ".tmp"
  Session("private_upload_target_" & uploadId) = targetPath
  Session("private_upload_temp_" & uploadId) = tempPath
  Session("private_upload_mode_" & uploadId) = mode
  Session("private_upload_overwrite_" & uploadId) = (Trim(CStr(Request.Form("overwrite"))) = "1")
  Session("private_upload_size_" & uploadId) = 0
  JsonOk """uploadId"":""" & Json(uploadId) & """,""path"":""" & Json(relativePath) & """"
End Sub

Sub AppendChunk()
  Dim uploadId, tempPath, chunkBytes, chunkSize, totalSize, targetStream
  uploadId = Trim(CStr(Request.QueryString("id")))
  tempPath = CStr(Session("private_upload_temp_" & uploadId))
  If uploadId = "" Or tempPath = "" Then
    JsonError "404 Not Found", "UPLOAD_NOT_FOUND", "上传会话不存在或已过期"
  End If
  chunkSize = Request.TotalBytes
  If chunkSize <= 0 Or chunkSize > MAX_CHUNK_BYTES Then
    JsonError "413 Request Entity Too Large", "INVALID_CHUNK", "上传分块大小无效"
  End If
  totalSize = CLng(Session("private_upload_size_" & uploadId)) + chunkSize
  If totalSize > MAX_PRIVATE_FILE_BYTES Then
    CancelUploadById uploadId
    JsonError "413 Request Entity Too Large", "RESOURCE_TOO_LARGE", "私人云资料文件不能超过 15 MB"
  End If
  chunkBytes = Request.BinaryRead(chunkSize)
  Set targetStream = Server.CreateObject("ADODB.Stream")
  targetStream.Type = 1
  targetStream.Open
  Dim fso
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If fso.FileExists(tempPath) Then
    targetStream.LoadFromFile tempPath
    targetStream.Position = targetStream.Size
  End If
  Set fso = Nothing
  targetStream.Write chunkBytes
  targetStream.SaveToFile tempPath, 2
  targetStream.Close
  Set targetStream = Nothing
  Session("private_upload_size_" & uploadId) = totalSize
  JsonOk """received"":" & totalSize
End Sub

Sub CommitUpload()
  Dim uploadId, targetPath, tempPath, mode, fso, backupPath
  uploadId = Trim(CStr(Request.QueryString("id")))
  targetPath = CStr(Session("private_upload_target_" & uploadId))
  tempPath = CStr(Session("private_upload_temp_" & uploadId))
  mode = CStr(Session("private_upload_mode_" & uploadId))
  If uploadId = "" Or targetPath = "" Or tempPath = "" Then
    JsonError "404 Not Found", "UPLOAD_NOT_FOUND", "上传会话不存在或已过期"
  End If
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If Not fso.FileExists(tempPath) Then
    Set fso = Nothing
    JsonError "409 Conflict", "UPLOAD_EMPTY", "没有可保存的上传内容"
  End If
  If mode = "save-as" And fso.FileExists(targetPath) And _
     Not CBool(Session("private_upload_overwrite_" & uploadId)) Then
    Set fso = Nothing
    CancelUploadById uploadId
    JsonError "409 Conflict", "NAME_CONFLICT", "私人文件夹中已存在同名文件"
  End If
  If (mode = "editor" Or mode = "save-as") And fso.FileExists(targetPath) Then
    backupPath = targetPath & ".bak"
    If fso.FileExists(backupPath) Then fso.DeleteFile backupPath, True
    fso.CopyFile targetPath, backupPath, True
    fso.DeleteFile targetPath, True
  End If
  fso.MoveFile tempPath, targetPath
  Set fso = Nothing
  ClearUpload uploadId
  JsonOk """saved"":true"
End Sub

Sub CancelUpload()
  Dim uploadId
  uploadId = Trim(CStr(Request.QueryString("id")))
  CancelUploadById uploadId
  JsonOk """cancelled"":true"
End Sub

Sub CancelUploadById(ByVal uploadId)
  Dim tempPath, fso
  tempPath = CStr(Session("private_upload_temp_" & uploadId))
  If tempPath <> "" Then
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    If fso.FileExists(tempPath) Then fso.DeleteFile tempPath, True
    Set fso = Nothing
  End If
  ClearUpload uploadId
End Sub

Sub ClearUpload(ByVal uploadId)
  Session.Contents.Remove "private_upload_target_" & uploadId
  Session.Contents.Remove "private_upload_temp_" & uploadId
  Session.Contents.Remove "private_upload_mode_" & uploadId
  Session.Contents.Remove "private_upload_overwrite_" & uploadId
  Session.Contents.Remove "private_upload_size_" & uploadId
End Sub

Function Json(ByVal value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  Json = text
End Function

Sub JsonOk(ByVal fields)
  Response.ContentType = "application/json"
  Response.Write "{""ok"":true," & fields & "}"
  Response.End
End Sub

Sub JsonError(ByVal statusText, ByVal code, ByVal message)
  Response.Status = statusText
  Response.ContentType = "application/json"
  Response.Write "{""ok"":false,""error"":{""code"":""" & Json(code) & _
    """,""message"":""" & Json(message) & """}}"
  Response.End
End Sub
%>
