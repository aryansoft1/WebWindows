<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Option Explicit
Dim DeskTalkBigModelApiKey : DeskTalkBigModelApiKey = ""
Dim KnowledgeIds(31), KnowledgeKeywords(31), KnowledgeFiles(31)
Dim KnowledgeCount : KnowledgeCount = 0

Sub RegisterKnowledge(id, keywords, filePath)
  If KnowledgeCount > UBound(KnowledgeIds) Then Exit Sub
  KnowledgeIds(KnowledgeCount) = id
  KnowledgeKeywords(KnowledgeCount) = keywords
  KnowledgeFiles(KnowledgeCount) = filePath
  KnowledgeCount = KnowledgeCount + 1
End Sub
%>
<!--#include file="chatproxy.config.asp"-->
<!--#include virtual="/ai/knowledge/index.inc.asp"-->
<%
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-store"

Const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
Const API_MODEL = "glm-4.7-flash"
Const MAX_REQUEST_BYTES = 1048576

If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
  Response.Status = "405 Method Not Allowed"
  Response.AddHeader "Allow", "POST"
  Response.Write "{""error"":{""message"":""Only POST is supported.""}}"
  Response.End
End If

Dim apiKey : apiKey = Trim(DeskTalkBigModelApiKey & "")
If Len(apiKey) = 0 Then
  Response.Status = "503 Service Unavailable"
  Response.Write "{""error"":{""message"":""AI service is not configured.""}}"
  Response.End
End If

Dim byteCount : byteCount = Request.TotalBytes
If byteCount <= 0 Or byteCount > MAX_REQUEST_BYTES Then
  Response.Status = "413 Payload Too Large"
  Response.Write "{""error"":{""message"":""Request body is empty or too large.""}}"
  Response.End
End If

Dim requestBody : requestBody = BinaryToUtf8(Request.BinaryRead(byteCount))
requestBody = ForceModel(requestBody, API_MODEL)

Dim userQuestion : userQuestion = ExtractLastUserMessage(requestBody)
Dim selectedKnowledgeIds, knowledgeContext
knowledgeContext = BuildKnowledgeContext(userQuestion, selectedKnowledgeIds)

Dim systemPrompt : systemPrompt = ReadUtf8File("/ai/system-prompt.md")
If Len(systemPrompt) = 0 Then
  systemPrompt = "你是 WebWindows 内置智能助手桌讯。依据提供的 WebWindows Knowledge 回答；不知道时明确说明，不得编造。"
End If
If Len(knowledgeContext) > 0 Then
  systemPrompt = systemPrompt & vbCrLf & vbCrLf & _
    "[WebWindows Knowledge - only use when relevant]" & vbCrLf & knowledgeContext
End If
requestBody = InjectSystemMessage(requestBody, systemPrompt)

If Len(selectedKnowledgeIds) = 0 Then selectedKnowledgeIds = "general"
Response.AddHeader "X-WebWindows-Knowledge", selectedKnowledgeIds
Response.AddHeader "X-WebWindows-AI-Model", API_MODEL

On Error Resume Next
Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
If Err.Number <> 0 Then
  Err.Clear
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
End If
If Err.Number <> 0 Then FailProxy

http.setTimeouts 10000, 10000, 30000, 60000
http.open "POST", API_URL, False
http.setRequestHeader "Content-Type", "application/json"
http.setRequestHeader "Authorization", "Bearer " & apiKey
http.send requestBody

If Err.Number <> 0 Then FailProxy

Dim upstreamStatus : upstreamStatus = http.status
If upstreamStatus = 429 Then
  Dim providerCode : providerCode = ExtractProviderErrorCode(http.responseText)
  Dim retrySeconds : retrySeconds = 3
  If Request.ServerVariables("HTTP_X_WEBWINDOWS_AI_ATTEMPT") = "2" Then retrySeconds = 6
  If Request.ServerVariables("HTTP_X_WEBWINDOWS_AI_ATTEMPT") = "3" Then retrySeconds = 12
  Response.AddHeader "Retry-After", CStr(retrySeconds)
  Response.Status = "429 Too Many Requests"
  Response.Write "{""error"":{""code"":""" & JsonEscape(providerCode) & _
    """,""message"":""当前免费 AI 模型访问量较大，请稍后重试。"",""retryable"":true}}"
  Response.End
End If
If upstreamStatus < 200 Or upstreamStatus >= 300 Then
  Response.Status = CStr(upstreamStatus) & " Upstream Error"
Else
  Response.Status = "200 OK"
End If
Response.Write http.responseText

Function BinaryToUtf8(binaryData)
  Dim stream : Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1
  stream.Open
  stream.Write binaryData
  stream.Position = 0
  stream.Type = 2
  stream.Charset = "utf-8"
  BinaryToUtf8 = stream.ReadText
  stream.Close
  Set stream = Nothing
End Function

Function ReadUtf8File(virtualPath)
  On Error Resume Next
  ReadUtf8File = ""
  Dim stream : Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile Server.MapPath(virtualPath)
  If Err.Number = 0 Then ReadUtf8File = stream.ReadText
  If Not stream Is Nothing Then stream.Close
  Set stream = Nothing
  Err.Clear
  On Error GoTo 0
End Function

Function ExtractLastUserMessage(json)
  ExtractLastUserMessage = ""
  Dim re : Set re = New RegExp
  re.Pattern = """content""\s*:\s*""((\\.|[^""])*)"""
  re.IgnoreCase = True
  re.Global = True
  Dim matches : Set matches = re.Execute(json)
  If matches.Count > 0 Then
    ExtractLastUserMessage = matches(matches.Count - 1).SubMatches(0)
  End If
End Function

Function BuildKnowledgeContext(question, ByRef selectedIds)
  selectedIds = ""
  BuildKnowledgeContext = ""
  If Len(Trim(question)) = 0 Then Exit Function

  Dim chosenIndex(2), chosenScore(2), slot
  For slot = 0 To 2
    chosenIndex(slot) = -1
    chosenScore(slot) = 0
  Next

  Dim normalized : normalized = LCase(question)
  Dim topicIndex, keyword, score, keywords
  For topicIndex = 0 To KnowledgeCount - 1
    score = 0
    keywords = Split(KnowledgeKeywords(topicIndex), "|")
    For Each keyword In keywords
      If Len(keyword) > 0 And InStr(1, normalized, LCase(keyword), vbTextCompare) > 0 Then
        score = score + Len(keyword)
      End If
    Next
    If score > 0 Then InsertKnowledgeCandidate chosenIndex, chosenScore, topicIndex, score
  Next

  Dim content, topicContent
  content = ""
  For slot = 0 To 2
    If chosenIndex(slot) >= 0 Then
      topicContent = ReadUtf8File(KnowledgeFiles(chosenIndex(slot)))
      If Len(topicContent) > 0 Then
        If Len(selectedIds) > 0 Then selectedIds = selectedIds & ","
        selectedIds = selectedIds & KnowledgeIds(chosenIndex(slot))
        content = content & vbCrLf & vbCrLf & _
          "## " & KnowledgeIds(chosenIndex(slot)) & vbCrLf & Left(topicContent, 5000)
      End If
    End If
  Next
  BuildKnowledgeContext = Trim(content)
End Function

Sub InsertKnowledgeCandidate(ByRef indexes, ByRef scores, topicIndex, score)
  Dim position, move
  For position = 0 To 2
    If score > scores(position) Then
      For move = 2 To position + 1 Step -1
        scores(move) = scores(move - 1)
        indexes(move) = indexes(move - 1)
      Next
      scores(position) = score
      indexes(position) = topicIndex
      Exit Sub
    End If
  Next
End Sub

Function InjectSystemMessage(json, prompt)
  InjectSystemMessage = json
  Dim re : Set re = New RegExp
  re.Pattern = """messages""\s*:\s*\["
  re.IgnoreCase = True
  re.Global = False
  Dim matches : Set matches = re.Execute(json)
  If matches.Count = 0 Then Exit Function

  Dim insertAt : insertAt = matches(0).FirstIndex + matches(0).Length
  Dim message : message = "{""role"":""system"",""content"":""" & JsonEscape(prompt) & """},"
  InjectSystemMessage = Left(json, insertAt) & message & Mid(json, insertAt + 1)
End Function

Function JsonEscape(value)
  Dim escaped : escaped = CStr(value & "")
  escaped = Replace(escaped, "\", "\\")
  escaped = Replace(escaped, """", "\""")
  escaped = Replace(escaped, vbCrLf, "\n")
  escaped = Replace(escaped, vbCr, "\n")
  escaped = Replace(escaped, vbLf, "\n")
  escaped = Replace(escaped, vbTab, "\t")
  JsonEscape = escaped
End Function

Function ExtractProviderErrorCode(responseText)
  ExtractProviderErrorCode = "rate_limited"
  Dim re : Set re = New RegExp
  re.Pattern = """code""\s*:\s*""?([0-9]+)""?"
  re.Global = False
  Dim matches : Set matches = re.Execute(CStr(responseText & ""))
  If matches.Count > 0 Then ExtractProviderErrorCode = matches(0).SubMatches(0)
End Function

Function ForceModel(json, model)
  Dim re : Set re = New RegExp
  re.Pattern = "(""model""\s*:\s*"")[^""]*("")"
  re.IgnoreCase = True
  re.Global = False

  If re.Test(json) Then
    ForceModel = re.Replace(json, "$1" & model & "$2")
  ElseIf Left(Trim(json), 1) = "{" Then
    ForceModel = "{""model"":""" & model & """," & Mid(Trim(json), 2)
  Else
    ForceModel = json
  End If
End Function

Sub FailProxy()
  Err.Clear
  On Error GoTo 0
  Response.Status = "502 Bad Gateway"
  Response.Write "{""error"":{""message"":""AI upstream request failed.""}}"
  Response.End
End Sub
%>
