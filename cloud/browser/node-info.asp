<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "utf-8"
Response.CodePage = 65001

Dim fso, publicReady, legacyRoot
Set fso = Server.CreateObject("Scripting.FileSystemObject")
publicReady = fso.FolderExists(CloudPublicRoot())
legacyRoot = CloudUsesLegacyPublicRoot()
Set fso = Nothing

Response.Write "{""protocol"":""" & CLOUD_PROTOCOL_NAME & _
  """,""version"":""" & CLOUD_PROTOCOL_VERSION & _
  """,""nodeId"":""" & CloudJson(CLOUD_NODE_ID) & _
  """,""name"":""" & CloudJson(CLOUD_NODE_NAME) & _
  """,""publicReady"":" & LCase(CStr(publicReady)) & _
  ",""publicRoot"":{""name"":""" & CLOUD_PUBLIC_ROOT_NAME & _
  """,""displayName"":""" & CloudJson(CloudDisplayName(CLOUD_PUBLIC_ROOT_NAME, CloudRequestLanguage())) & _
  """,""legacyActive"":" & LCase(CStr(legacyRoot)) & "}" & _
  ",""capabilities"":{""publicRead"":true,""publicManage"":true," & _
  """addResource"":true,""download"":true," & _
  """privateResources"":true,""spreadsheetEditor"":true," & _
  """inlineOpen"":[""image"",""pdf"",""text"",""json"",""markdown"",""spreadsheet""]}}"
%>
