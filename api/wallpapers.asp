<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
' Public wallpaper catalogue. The desktop settings page reads this so that
' wallpapers uploaded by an administrator appear without a code deployment.
' assets/data/wallpaper-index.json stays as the static fallback.
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.CacheControl = "no-cache"
Response.AddHeader "Pragma", "no-cache"

Const WALLPAPER_URL_ROOT = "assets/wallpapers/"
Const MAX_DEPTH = 4
Const MAX_ITEMS = 500

Function JsonText(ByVal value)
  Dim text
  If IsNull(value) Then text = "" Else text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, Chr(34), "\" & Chr(34))
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  JsonText = text
End Function

Function IsImageFile(ByVal fileName)
  Dim extension, position
  position = InStrRev(fileName, ".")
  If position < 2 Then Exit Function
  extension = LCase(Mid(fileName, position))
  Select Case extension
    Case ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".bmp"
      IsImageFile = True
  End Select
End Function

Function ToUrlPath(ByVal relativePath)
  ToUrlPath = Replace(relativePath, "\", "/")
End Function

Function WebRelativePath(ByVal rootPath, ByVal filePath)
  Dim relativePath
  relativePath = Mid(filePath, Len(rootPath) + 1)
  If Left(relativePath, 1) = "\" Or Left(relativePath, 1) = "/" Then
    relativePath = Mid(relativePath, 2)
  End If
  WebRelativePath = WALLPAPER_URL_ROOT & ToUrlPath(relativePath)
End Function

Sub CollectFiles(ByVal fso, ByVal folder, ByVal depth, ByRef items)
  Dim subFolders, fileItem
  If depth > MAX_DEPTH Then Exit Sub
  If items.Count >= MAX_ITEMS Then Exit Sub
  On Error Resume Next
  For Each fileItem In folder.Files
    If items.Count < MAX_ITEMS Then
      If Left(fileItem.Name, 1) <> "." And IsImageFile(fileItem.Name) Then
        items.Add fileItem
      End If
    End If
  Next
  Set subFolders = folder.SubFolders
  Dim subItem
  For Each subItem In subFolders
    If items.Count < MAX_ITEMS Then CollectFiles fso, subItem, depth + 1, items
  Next
  Err.Clear
  On Error GoTo 0
End Sub

Function ReadDefaultWallpaper()
  Dim rows, value
  ReadDefaultWallpaper = ""
  On Error Resume Next
  Set rows = conn.Execute("SELECT setting_value FROM webwindows_admin_settings " & _
    "WHERE setting_key='default_wallpaper' LIMIT 1")
  If Err.Number = 0 Then
    If Not rows.EOF Then value = CStr(rows("setting_value"))
  End If
  If IsObject(rows) Then rows.Close
  Set rows = Nothing
  Err.Clear
  On Error GoTo 0
  ReadDefaultWallpaper = Trim(CStr(value))
End Function

Dim fso, rootPath, rootFolder, defaultWallpaper, payload, index, item
Dim found
Set found = CreateObject("System.Collections.ArrayList")
Set fso = Server.CreateObject("Scripting.FileSystemObject")
rootPath = Server.MapPath("/" & WALLPAPER_URL_ROOT)

If fso.FolderExists(rootPath) Then
  Set rootFolder = fso.GetFolder(rootPath)
  CollectFiles fso, rootFolder, 1, found
End If

For Each item In found
  index = index + 1
  If index > 1 Then payload = payload & ","
  payload = payload & "{""url"":""" & JsonText(WebRelativePath(rootPath, item.Path)) & _
    """,""name"":""" & JsonText(fso.GetBaseName(item.Name)) & _
    """,""bytes"":" & CStr(CLng(item.Size)) & _
    "}"
  If index >= MAX_ITEMS Then Exit For
Next

defaultWallpaper = ReadDefaultWallpaper()
If defaultWallpaper <> "" Then
  ' A default that no longer resolves would leave new users without a wallpaper.
  Dim defaultName
  defaultName = Mid(defaultWallpaper, InStrRev(defaultWallpaper, "/") + 1)
  If LCase(Left(defaultWallpaper, Len(WALLPAPER_URL_ROOT))) <> LCase(WALLPAPER_URL_ROOT) Then
    defaultWallpaper = ""
  ElseIf Not IsImageFile(defaultName) Then
    defaultWallpaper = ""
  ElseIf Not fso.FileExists(rootPath & defaultName) Then
    defaultWallpaper = ""
  End If
End If

Response.Write "{""ok"":true,""schemaVersion"":1,""count"":" & CStr(index) & _
  ",""defaultWallpaper"":""" & JsonText(defaultWallpaper) & """,""wallpapers"":[" & _
  payload & "]}"
Set found = Nothing
Set fso = Nothing
If conn.State <> 0 Then conn.Close
Set conn = Nothing
%>
