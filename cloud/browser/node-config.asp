<%
' WebWindows Cloud Resource Node V1
' Keep this file free of credentials so the browser folder can be copied safely.

Const CLOUD_PROTOCOL_NAME = "webwindows-cloud-resource"
Const CLOUD_PROTOCOL_VERSION = "1.0"
Const CLOUD_NODE_ID = "local-main"
Const CLOUD_NODE_NAME = "WebWindows 主云资源节点"
Const CLOUD_PUBLIC_ROOT_NAME = "Public"
Const CLOUD_LEGACY_PUBLIC_ROOT_NAME = "公共区域"

Function CloudPublicRoot()
  Dim fso, canonicalPath, legacyPath
  canonicalPath = Server.MapPath("/cloud/file/" & CLOUD_PUBLIC_ROOT_NAME)
  legacyPath = Server.MapPath("/cloud/file/" & CLOUD_LEGACY_PUBLIC_ROOT_NAME)

  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If fso.FolderExists(canonicalPath) Then
    CloudPublicRoot = canonicalPath
  ElseIf fso.FolderExists(legacyPath) Then
    CloudPublicRoot = legacyPath
  Else
    CloudPublicRoot = canonicalPath
  End If
  Set fso = Nothing
End Function

Function CloudUsesLegacyPublicRoot()
  Dim fso, rootPath, rootFolder
  CloudUsesLegacyPublicRoot = False
  rootPath = CloudPublicRoot()
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If fso.FolderExists(rootPath) Then
    Set rootFolder = fso.GetFolder(rootPath)
    CloudUsesLegacyPublicRoot = (rootFolder.Name = CLOUD_LEGACY_PUBLIC_ROOT_NAME)
    Set rootFolder = Nothing
  End If
  Set fso = Nothing
End Function

Function CloudNormalizeLanguage(ByVal value)
  Dim language
  language = LCase(Trim(CStr(value)))
  If language = "jp" Or Left(language, 2) = "ja" Then
    CloudNormalizeLanguage = "jp"
  ElseIf language = "en" Or Left(language, 3) = "en-" Then
    CloudNormalizeLanguage = "en"
  Else
    CloudNormalizeLanguage = "zh"
  End If
End Function

Function CloudRequestLanguage()
  Dim language
  language = Trim(CStr(Request.QueryString("lang")))
  If language = "" Then language = Request.ServerVariables("HTTP_ACCEPT_LANGUAGE")
  CloudRequestLanguage = CloudNormalizeLanguage(language)
End Function

Function CloudDisplayName(ByVal physicalName, ByVal language)
  Dim key, normalizedLanguage
  key = LCase(CStr(physicalName))
  normalizedLanguage = CloudNormalizeLanguage(language)

  Select Case key
    Case "public", "公共区域"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "パブリックエリア"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Public"
      Else
        CloudDisplayName = "公共区域"
      End If
    Case "welcome"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "ようこそ"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Welcome"
      Else
        CloudDisplayName = "欢迎"
      End If
    Case "documents"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "公式ドキュメント"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Official Documents"
      Else
        CloudDisplayName = "官方文档"
      End If
    Case "samples"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "サンプルファイル"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Sample Files"
      Else
        CloudDisplayName = "示例文件"
      End If
    Case "resources"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "公式リソース"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Official Resources"
      Else
        CloudDisplayName = "官方资源"
      End If
    Case "changelog"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "更新履歴"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Changelog"
      Else
        CloudDisplayName = "更新日志"
      End If
    Case "community"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "コミュニティ"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Community"
      Else
        CloudDisplayName = "社区"
      End If
    Case "icons"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "アイコン"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Icons"
      Else
        CloudDisplayName = "图标"
      End If
    Case "wallpapers"
      If normalizedLanguage = "jp" Then
        CloudDisplayName = "壁紙"
      ElseIf normalizedLanguage = "en" Then
        CloudDisplayName = "Wallpapers"
      Else
        CloudDisplayName = "壁纸"
      End If
    Case Else
      CloudDisplayName = CStr(physicalName)
  End Select
End Function

Function CloudDisplayFileName(ByVal physicalName, ByVal language)
  Dim key, normalizedLanguage, extension
  key = LCase(CStr(physicalName))
  normalizedLanguage = CloudNormalizeLanguage(language)
  extension = ""
  If InStrRev(CStr(physicalName), ".") > 0 Then
    extension = Mid(CStr(physicalName), InStrRev(CStr(physicalName), "."))
  End If

  If normalizedLanguage = "en" Then
    CloudDisplayFileName = CStr(physicalName)
    Exit Function
  End If

  Select Case key
    Case "welcome_to_webwindows.docx"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "WebWindows へようこそ" & extension Else CloudDisplayFileName = "欢迎使用 WebWindows" & extension
    Case "developer_guide.docx"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "開発者ガイド" & extension Else CloudDisplayFileName = "开发者指南" & extension
    Case "keyboard_shortcuts.md"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "キーボードショートカット" & extension Else CloudDisplayFileName = "键盘快捷键" & extension
    Case "user_guide.docx"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "ユーザーガイド" & extension Else CloudDisplayFileName = "用户指南" & extension
    Case "sample_document.docx"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "サンプル文書" & extension Else CloudDisplayFileName = "示例文档" & extension
    Case "sample_image.png"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "サンプル画像" & extension Else CloudDisplayFileName = "示例图片" & extension
    Case "sample_presentation.pptx"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "サンプルプレゼンテーション" & extension Else CloudDisplayFileName = "示例演示文稿" & extension
    Case "sample_spreadsheet.xlsx"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "サンプル表計算" & extension Else CloudDisplayFileName = "示例表格" & extension
    Case "webwindows_default_wallpaper.png"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "WebWindows 既定の壁紙" & extension Else CloudDisplayFileName = "WebWindows 默认壁纸" & extension
    Case "readme.md"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "アイコンについて" & extension Else CloudDisplayFileName = "图标说明" & extension
    Case "changelog.md"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "更新履歴" & extension Else CloudDisplayFileName = "更新日志" & extension
    Case "feedback_and_community.md"
      If normalizedLanguage = "jp" Then CloudDisplayFileName = "フィードバックとコミュニティ" & extension Else CloudDisplayFileName = "反馈与社区" & extension
    Case Else
      CloudDisplayFileName = CStr(physicalName)
  End Select
End Function

Function CloudGetEnvironment(ByVal name)
  On Error Resume Next
  Dim value, shell, marker
  value = Trim(CStr(Request.ServerVariables(name)))
  If value = "" Then
    marker = "%" & name & "%"
    Set shell = Server.CreateObject("WScript.Shell")
    If Err.Number = 0 Then
      value = shell.ExpandEnvironmentStrings(marker)
      If value = marker Then value = ""
    End If
    Set shell = Nothing
    Err.Clear
  End If
  On Error GoTo 0
  CloudGetEnvironment = value
End Function

Function CloudAdminKey()
  Dim value
  value = Trim(CStr(Application("WebWindowsCloudAdminKey")))
  If value = "" Then value = CloudGetEnvironment("WEBWINDOWS_CLOUD_ADMIN_KEY")
  CloudAdminKey = value
End Function

Function CloudIsAdminRequest()
  Dim configured, presented
  configured = CloudAdminKey()
  presented = CStr(Request.ServerVariables("HTTP_X_WEBWINDOWS_ADMIN_KEY"))
  CloudIsAdminRequest = (configured <> "" And presented <> "" And presented = configured)
End Function

Function CloudTryNormalizePath(ByVal value, ByRef normalized)
  Dim raw, parts, index, segment, result
  normalized = ""
  raw = Trim(CStr(value))
  raw = Replace(raw, "\", "/")

  If InStr(raw, Chr(0)) > 0 Or Left(raw, 1) = "/" Then
    CloudTryNormalizePath = False
    Exit Function
  End If

  Do While InStr(raw, "//") > 0
    raw = Replace(raw, "//", "/")
  Loop

  If Right(raw, 1) = "/" Then raw = Left(raw, Len(raw) - 1)
  If raw = "" Then
    CloudTryNormalizePath = True
    Exit Function
  End If

  parts = Split(raw, "/")
  result = ""
  For index = 0 To UBound(parts)
    segment = Trim(CStr(parts(index)))
    If segment = "" Or segment = "." Or segment = ".." Then
      CloudTryNormalizePath = False
      Exit Function
    End If
    If InStr(segment, ":") > 0 Or InStr(segment, "*") > 0 Or _
       InStr(segment, "?") > 0 Or InStr(segment, """") > 0 Or _
       InStr(segment, "<") > 0 Or InStr(segment, ">") > 0 Or _
       InStr(segment, "|") > 0 Then
      CloudTryNormalizePath = False
      Exit Function
    End If
    If result <> "" Then result = result & "/"
    result = result & segment
  Next

  normalized = result
  CloudTryNormalizePath = True
End Function

Function CloudPhysicalPath(ByVal relativePath)
  Dim normalized, result
  If Not CloudTryNormalizePath(relativePath, normalized) Then
    CloudPhysicalPath = ""
    Exit Function
  End If

  result = CloudPublicRoot()
  If normalized <> "" Then result = result & "\" & Replace(normalized, "/", "\")
  CloudPhysicalPath = result
End Function

Function CloudJoinPath(ByVal parentPath, ByVal childName)
  If parentPath = "" Then
    CloudJoinPath = childName
  Else
    CloudJoinPath = parentPath & "/" & childName
  End If
End Function

Function CloudJson(ByVal value)
  Dim text
  text = CStr(value)
  text = Replace(text, "\", "\\")
  text = Replace(text, """", "\""")
  text = Replace(text, vbCrLf, "\n")
  text = Replace(text, vbCr, "\n")
  text = Replace(text, vbLf, "\n")
  CloudJson = text
End Function

Function CloudHtml(ByVal value)
  CloudHtml = Server.HTMLEncode(CStr(value))
End Function

Sub CloudJsonError(ByVal statusCode, ByVal code, ByVal message)
  Response.Status = statusCode
  Response.ContentType = "application/json"
  Response.Charset = "utf-8"
  Response.Write "{""ok"":false,""error"":{""code"":""" & CloudJson(code) & _
    """,""message"":""" & CloudJson(message) & """}}"
  Response.End
End Sub
%>
