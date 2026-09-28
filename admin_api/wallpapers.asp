<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
' Wallpaper administration for SystemManager.
' The catalogue is the shared assets/wallpapers folder, which is also what
' assets/js/wallpaper.js and api/wallpapers.asp read, so an upload here is
' visible to every desktop without a deployment.
'
' Binary uploads arrive as base64 in an application/x-www-form-urlencoded body
' because the shared admin security gate only accepts that content type. Every
' response returns the stored byte count so the console can verify the upload.
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.AddHeader "X-Content-Type-Options", "nosniff"

Const WALLPAPER_ROOT = "\assets\wallpapers\"
Const MAX_UPLOAD_BYTES = 4194304
Const MAX_BASE64_CHARS = 6000000
Const MAX_NAME_CHARS = 120

Dim action, method, fso, rootPath
Dim rawName, fileName, base64Text, targetPath, storedName, storedSize, storedUrl
Dim requestedUrl, targetFile, relativeName, defaultName, uploadError
action = LCase(Trim(CStr(Request("action"))))
method = UCase(Trim(CStr(Request.ServerVariables("REQUEST_METHOD"))))
Set fso = Server.CreateObject("Scripting.FileSystemObject")

If method = "GET" Then
  AdminSecurityRequireRead "system-manager", "wallpapers-list"
Else
  AdminSecurityRequireMutation "system-manager", "wallpapers-" & action
End If

rootPath = Server.MapPath(WALLPAPER_ROOT)
If Not fso.FolderExists(rootPath) Then
  AdminSecurityFail 500, "WALLPAPER_STORAGE_MISSING", _
    "壁纸目录不存在，请联系部署管理员创建 assets/wallpapers。", "not-checked", "not-checked"
End If

Function ToUrlPath(ByVal fileSystemPath)
  ToUrlPath = Replace(fileSystemPath, "\", "/")
End Function

Function IsImageFile(ByVal fileName)
  Dim extension, position
  position = InStrRev(fileName, ".")
  If position < 2 Then Exit Function
  Select Case LCase(Mid(fileName, position))
    Case ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"
      IsImageFile = True
  End Select
End Function

Function SafeName(ByVal rawName)
  Dim name, position, character, index, allowed
  name = Trim(CStr(rawName))
  position = InStrRev(name, "\")
  If position > 0 Then name = Mid(name, position + 1)
  position = InStrRev(name, "/")
  If position > 0 Then name = Mid(name, position + 1)
  If Len(name) > MAX_NAME_CHARS Then name = Left(name, MAX_NAME_CHARS)
  allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._- ()[]#'!"
  For index = 1 To Len(name)
    character = Mid(name, index, 1)
    If InStr(allowed, character) = 0 Then name = Left(name, index - 1) & "_" & Mid(name, index + 1)
  Next
  name = Trim(name)
  Do While InStr(name, "..") > 0
    name = Replace(name, "..", ".")
  Loop
  If Len(name) = 0 Then name = "wallpaper"
  SafeName = name
End Function

' ADODB only: the base64 text is written to a binary stream, the Unicode header
' is skipped, and the remaining bytes are the decoded image.
Sub WriteBase64ToFile(ByVal base64Text, ByVal filePath)
  Dim source, target
  Set source = Server.CreateObject("ADODB.Stream")
  Set target = Server.CreateObject("ADODB.Stream")
  source.Type = 1
  source.Open
  source.WriteText base64Text
  source.Position = 0
  target.Type = 1
  target.Open
  target.SetStream source
  target.Position = 3
  target.Type = 2
  target.Charset = "iso-8859-1"
  target.ReadText
  source.Position = 3
  source.SaveToFile filePath, 2
  source.Close
  target.Close
  Set source = Nothing
  Set target = Nothing
End Sub

Function UniquePath(ByVal folderPath, ByVal fileName)
  Dim candidate, stem, extension, counter, fullPath, suffix
  candidate = fileName
  counter = 2
  Do
    fullPath = folderPath & candidate
    If Not fso.FileExists(fullPath) Then Exit Do
    stem = fso.GetBaseName(fileName)
    extension = fso.GetExtensionName(fileName)
    suffix = ""
    If Len(extension) > 0 Then suffix = "." & extension
    candidate = stem & "-" & CStr(counter) & suffix
    counter = counter + 1
    If counter > 999 Then Exit Do
  Loop
  UniquePath = fullPath
End Function

Sub WriteDefault(ByVal value)
  Dim cmd
  Set cmd = Server.CreateObject("ADODB.Command")
  cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_admin_settings(setting_key,setting_value) VALUES (?,?) " & _
    "ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)"
  cmd.Parameters.Append cmd.CreateParameter("key", 200, 1, 64, "default_wallpaper")
  cmd.Parameters.Append cmd.CreateParameter("value", 200, 1, 1000, value)
  cmd.Execute
  Set cmd = Nothing
End Sub

If action = "upload" And method = "POST" Then
  rawName = Trim(CStr(Request.Form("filename")))
  base64Text = Trim(CStr(Request.Form("data")))
  If rawName = "" Or base64Text = "" Then
    AdminSecurityFail 400, "FIELDS_REQUIRED", "请选择要上传的壁纸图片。", "valid", "same-origin"
  End If
  If Len(base64Text) > MAX_BASE64_CHARS Then
    AdminSecurityFail 400, "WALLPAPER_TOO_LARGE", _
      "壁纸图片过大，请上传小于 4MB 的图片。", "valid", "same-origin"
  End If
  fileName = SafeName(rawName)
  If Not IsImageFile(fileName) Then
    AdminSecurityFail 400, "WALLPAPER_TYPE_UNSUPPORTED", _
      "仅支持 JPG、PNG、WebP、GIF、AVIF 或 BMP 格式的壁纸。", "valid", "same-origin"
  End If
  targetPath = UniquePath(rootPath, fileName)
  storedName = fso.GetFileName(targetPath)
  On Error Resume Next
  WriteBase64ToFile base64Text, targetPath
  If Err.Number <> 0 Then
    uploadError = Err.Number
    Err.Clear
    On Error GoTo 0
    Response.AppendToLog "&wwallpaper=upload-failed&we=" & Server.URLEncode(CStr(uploadError))
    AdminSecurityFail 500, "WALLPAPER_UPLOAD_FAILED", _
      "壁纸写入服务器失败，请检查 assets/wallpapers 目录写权限。", "valid", "same-origin"
  End If
  On Error GoTo 0
  If Not fso.FileExists(targetPath) Then
    AdminSecurityFail 500, "WALLPAPER_UPLOAD_FAILED", _
      "壁纸写入服务器失败，请检查 assets/wallpapers 目录写权限。", "valid", "same-origin"
  End If
  storedSize = fso.GetFile(targetPath).Size
  If storedSize <= 0 Or storedSize > MAX_UPLOAD_BYTES Then
    fso.DeleteFile targetPath, True
    AdminSecurityFail 400, "WALLPAPER_TOO_LARGE", _
      "壁纸图片过大，请上传小于 4MB 的图片。", "valid", "same-origin"
  End If
  storedUrl = ToUrlPath(WALLPAPER_ROOT) & storedName
  AdminSecurityAudit "wallpaper-upload", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""ok"":true,""success"":true,""url"":""" & storedUrl & _
    """,""name"":""" & storedName & """,""bytes"":" & CStr(CLng(storedSize)) & "}"
  Response.End
End If

If action = "delete" And method = "POST" Then
  requestedUrl = Replace(Trim(CStr(Request.Form("url"))), "\", "/")
  If requestedUrl = "" Then
    AdminSecurityFail 400, "FIELDS_REQUIRED", "请选择要删除的壁纸。", "valid", "same-origin"
  End If
  relativeName = Mid(requestedUrl, InStrRev(requestedUrl, "/") + 1)
  If InStr(relativeName, "..") > 0 Or Len(relativeName) > MAX_NAME_CHARS Then
    AdminSecurityFail 400, "WALLPAPER_PATH_INVALID", "壁纸路径无效。", "valid", "same-origin"
  End If
  If Left(LCase(requestedUrl), Len(ToUrlPath(WALLPAPER_ROOT))) <> LCase(ToUrlPath(WALLPAPER_ROOT)) Then
    AdminSecurityFail 400, "WALLPAPER_PATH_INVALID", "只能管理 assets/wallpapers 内的壁纸。", "valid", "same-origin"
  End If
  targetFile = rootPath & relativeName
  If Not fso.FileExists(targetFile) Then
    AdminSecurityFail 404, "WALLPAPER_NOT_FOUND", "该壁纸已不存在。", "valid", "same-origin"
  End If
  If Not IsImageFile(relativeName) Then
    AdminSecurityFail 400, "WALLPAPER_TYPE_UNSUPPORTED", "只能管理壁纸图片文件。", "valid", "same-origin"
  End If
  On Error Resume Next
  fso.DeleteFile targetFile, True
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "WALLPAPER_DELETE_FAILED", "壁纸删除失败，请稍后重试。", "valid", "same-origin"
  End If
  On Error GoTo 0
  AdminSecurityAudit "wallpaper-delete", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""ok"":true,""success"":true}"
  Response.End
End If

If action = "default" And method = "POST" Then
  requestedUrl = Replace(Trim(CStr(Request.Form("url"))), "\", "/")
  If requestedUrl <> "" Then
    defaultName = Mid(requestedUrl, InStrRev(requestedUrl, "/") + 1)
    If Left(LCase(requestedUrl), Len(ToUrlPath(WALLPAPER_ROOT))) <> LCase(ToUrlPath(WALLPAPER_ROOT)) _
       Or InStr(defaultName, "..") > 0 Or Not IsImageFile(defaultName) _
       Or Not fso.FileExists(rootPath & defaultName) Then
      AdminSecurityFail 400, "WALLPAPER_DEFAULT_INVALID", "只能把 assets/wallpapers 内已存在的壁纸设为默认。", "valid", "same-origin"
    End If
  End If
  On Error Resume Next
  WriteDefault requestedUrl
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "WALLPAPER_DEFAULT_SAVE_FAILED", "默认壁纸保存失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  AdminSecurityAudit "wallpaper-default", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""ok"":true,""success"":true,""url"":""" & requestedUrl & """}"
  Response.End
End If

AdminSecurityFail 400, "INVALID_ACTION", "不支持的壁纸管理操作。", "not-checked", "not-checked"
%>
