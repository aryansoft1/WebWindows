<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.Buffer = True

Dim relativePath, physicalPath, fso, extension, mimeType, stream
Dim rawRequested
If Not CloudTryNormalizePath(Request.QueryString("path"), relativePath) Or relativePath = "" Then
  CloudJsonError "400 Bad Request", "INVALID_PATH", "资料位置无效"
End If

physicalPath = CloudPhysicalPath(relativePath)
Set fso = Server.CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(physicalPath) Then
  Set fso = Nothing
  CloudJsonError "404 Not Found", "NOT_FOUND", "资料不存在"
End If

extension = LCase(fso.GetExtensionName(physicalPath))
rawRequested = (LCase(Trim(CStr(Request.QueryString("raw")))) = "1")
mimeType = ""
Select Case extension
  Case "jpg", "jpeg": mimeType = "image/jpeg"
  Case "png": mimeType = "image/png"
  Case "gif": mimeType = "image/gif"
  Case "webp": mimeType = "image/webp"
  Case "pdf": mimeType = "application/pdf"
  Case "txt", "log", "csv": mimeType = "text/plain; charset=utf-8"
  Case "md": mimeType = "text/markdown; charset=utf-8"
  Case "json": mimeType = "application/json; charset=utf-8"
  Case "doc": mimeType = "application/msword"
  Case "docx": mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  Case "xls": mimeType = "application/vnd.ms-excel"
  Case "xlsx": mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  Case "ppt": mimeType = "application/vnd.ms-powerpoint"
  Case "pptx": mimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  Case "zip": mimeType = "application/zip"
End Select
Set fso = Nothing

If mimeType = "" And Not rawRequested Then
  CloudJsonError "415 Unsupported Media Type", "NO_OPEN_HANDLER", "此类资料暂时没有可用的打开方式"
End If
If mimeType = "" Then mimeType = "application/octet-stream"

Set stream = Server.CreateObject("ADODB.Stream")
stream.Type = 1
stream.Open
stream.LoadFromFile physicalPath
Response.ContentType = mimeType
Response.AddHeader "Content-Disposition", "inline"
If rawRequested Then Response.AddHeader "Cache-Control", "private, no-store"
Response.AddHeader "X-Content-Type-Options", "nosniff"
Response.AddHeader "Content-Length", stream.Size
Response.BinaryWrite stream.Read
stream.Close
Set stream = Nothing
%>
