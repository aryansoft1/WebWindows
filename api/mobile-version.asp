<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Option Explicit
Response.Buffer = True
Response.CodePage = 65001
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.Expires = -1
Response.AddHeader "Cache-Control", "no-store, no-cache, must-revalidate, max-age=0"
Response.AddHeader "Pragma", "no-cache"
Response.AddHeader "X-Content-Type-Options", "nosniff"

Function Pad2(ByVal value)
  Pad2 = Right("0" & CStr(value), 2)
End Function

Dim fileSystem, entryFile, modified, versionToken
Set fileSystem = Server.CreateObject("Scripting.FileSystemObject")
Set entryFile = fileSystem.GetFile(Server.MapPath("../index.html"))
modified = entryFile.DateLastModified
versionToken = CStr(Year(modified)) & Pad2(Month(modified)) & Pad2(Day(modified)) & _
  "-" & Pad2(Hour(modified)) & Pad2(Minute(modified)) & Pad2(Second(modified)) & _
  "-" & CStr(entryFile.Size)

Response.Write "{""version"":""" & versionToken & """,""entry"":""/"",""source"":""index.html""}"

Set entryFile = Nothing
Set fileSystem = Nothing
%>
