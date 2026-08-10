<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="node-config.asp"-->
<%
Response.Buffer = True
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "application/json"

Const SEARCH_MAX_RESULTS = 500
Const SEARCH_MAX_SCANNED = 10000
Const SEARCH_MAX_DEPTH = 16

Dim queryText, exactName, extensionFilter, mimeFilter, folderFilter, sourceFilter
Dim createdFrom, createdTo, modifiedFrom, modifiedTo, uploadedFrom, uploadedTo
Dim resultLimit, sortField, sortOrder, scannedCount, resultCount, requestLanguage
Dim resultJson(), resultScore(), resultName(), resultSortValue(), resultSource()

queryText = LCase(Trim(CStr(Request.QueryString("q"))))
exactName = LCase(Trim(CStr(Request.QueryString("nameExact"))))
extensionFilter = NormalizeCsv(Request.QueryString("extensions"), True)
mimeFilter = NormalizeCsv(Request.QueryString("mimeTypes"), False)
folderFilter = LCase(Replace(Trim(CStr(Request.QueryString("folderPath"))), "\", "/"))
sourceFilter = NormalizeCsv(Request.QueryString("sources"), False)
requestLanguage = CloudRequestLanguage()
createdFrom = EpochParameter("createdFrom")
createdTo = EpochParameter("createdTo")
modifiedFrom = EpochParameter("modifiedFrom")
modifiedTo = EpochParameter("modifiedTo")
uploadedFrom = EpochParameter("uploadedFrom")
uploadedTo = EpochParameter("uploadedTo")
resultLimit = IntegerParameter("limit", 200, 1, SEARCH_MAX_RESULTS)
sortField = LCase(Trim(CStr(Request.QueryString("sort"))))
If sortField <> "name" And sortField <> "createdat" And sortField <> "modifiedat" And _
   sortField <> "uploadedat" And sortField <> "size" Then sortField = "relevance"
sortOrder = LCase(Trim(CStr(Request.QueryString("order"))))
If sortOrder <> "asc" Then sortOrder = "desc"
scannedCount = 0
resultCount = 0
ReDim resultJson(SEARCH_MAX_RESULTS - 1)
ReDim resultScore(SEARCH_MAX_RESULTS - 1)
ReDim resultName(SEARCH_MAX_RESULTS - 1)
ReDim resultSortValue(SEARCH_MAX_RESULTS - 1)
ReDim resultSource(SEARCH_MAX_RESULTS - 1)

Dim fso
Set fso = Server.CreateObject("Scripting.FileSystemObject")
If SourceRequested("public") And fso.FolderExists(CloudPublicRoot()) Then
  ScanFolder CloudPublicRoot(), "", "public", CLOUD_NODE_ID, 0
End If

Dim privateAvailable, privateRoot, privateUserId, privateUsername, cookieUsername, normalizedUsername
privateAvailable = False
privateUserId = Trim(CStr(Session("webwindows_user_id")))
privateUsername = Trim(CStr(Session("webwindows_username")))
cookieUsername = Trim(CStr(Request.Cookies("webwindows_user")))
If (privateUserId = "" Or privateUsername = "") And Not (Session("webwindows_admin") = True) And _
   cookieUsername <> "" And StrComp(cookieUsername, Trim(CStr(Session("username"))), vbBinaryCompare) = 0 Then
  privateUserId = Trim(CStr(Session("user_id")))
  privateUsername = Trim(CStr(Session("username")))
End If
If SourceRequested("private") And privateUserId <> "" And IsNumeric(privateUserId) And privateUsername <> "" Then
  If CloudTryNormalizePath(privateUsername, normalizedUsername) And normalizedUsername = privateUsername And _
     InStr(normalizedUsername, "/") = 0 Then
    privateRoot = Server.MapPath("/cloud/file/" & normalizedUsername)
    If fso.FolderExists(privateRoot) Then
      privateAvailable = True
      ScanFolder privateRoot, "", "private", "private-" & CStr(CLng(privateUserId)), 0
    End If
  End If
End If
Set fso = Nothing

SortResults
Dim outputCount, outputIndex, output
outputCount = resultCount
If outputCount > resultLimit Then outputCount = resultLimit
output = "{""ok"":true,""version"":""1.0"",""results"":["
For outputIndex = 0 To outputCount - 1
  If outputIndex > 0 Then output = output & ","
  output = output & resultJson(outputIndex)
Next
output = output & "],""total"":" & CStr(outputCount) & ",""scanned"":" & CStr(scannedCount) & _
  ",""truncated"":" & LCase(CStr(scannedCount >= SEARCH_MAX_SCANNED Or resultCount >= SEARCH_MAX_RESULTS)) & _
  ",""sources"":{""public"":" & LCase(CStr(SourceRequested("public"))) & _
  ",""private"":" & LCase(CStr(privateAvailable)) & "},""warnings"":[]}"
Response.Write output
Response.End

Sub ScanFolder(ByVal physicalFolder, ByVal relativeFolder, ByVal sourceName, ByVal nodeId, ByVal depth)
  If depth > SEARCH_MAX_DEPTH Or scannedCount >= SEARCH_MAX_SCANNED Then Exit Sub
  Dim folder, file, child, childRelative
  On Error Resume Next
  Set folder = fso.GetFolder(physicalFolder)
  If Err.Number <> 0 Then Err.Clear: On Error GoTo 0: Exit Sub
  On Error GoTo 0
  For Each file In folder.Files
    If scannedCount >= SEARCH_MAX_SCANNED Then Exit For
    If LCase(file.Name) <> ".gitkeep" And LCase(Right(file.Name, 11)) <> ".write.json" And _
       LCase(Right(file.Name, 11)) <> ".sheet.json" Then
      scannedCount = scannedCount + 1
      ConsiderFile file, relativeFolder, sourceName, nodeId
    End If
  Next
  For Each child In folder.SubFolders
    If scannedCount >= SEARCH_MAX_SCANNED Then Exit For
    If Not (sourceName = "private" And LCase(child.Name) = "_system") Then
      childRelative = child.Name
      If relativeFolder <> "" Then childRelative = relativeFolder & "/" & child.Name
      ScanFolder child.Path, childRelative, sourceName, nodeId, depth + 1
    End If
  Next
  Set folder = Nothing
End Sub

Sub ConsiderFile(ByVal file, ByVal relativeFolder, ByVal sourceName, ByVal nodeId)
  Dim fileName, displayName, extension, mimeType, createdEpoch, modifiedEpoch, uploadedEpoch, score, reason, pathValue
  fileName = CStr(file.Name)
  extension = LCase(fso.GetExtensionName(fileName))
  mimeType = MimeForExtension(extension)
  createdEpoch = DateEpoch(file.DateCreated)
  modifiedEpoch = DateEpoch(file.DateLastModified)
  uploadedEpoch = createdEpoch
  If exactName <> "" And LCase(fileName) <> exactName Then Exit Sub
  If extensionFilter <> "" And Not CsvContains(extensionFilter, extension) Then Exit Sub
  If mimeFilter <> "" And Not MimeMatches(mimeFilter, mimeType) Then Exit Sub
  If folderFilter <> "" And InStr(1, LCase(relativeFolder), folderFilter, vbBinaryCompare) = 0 Then Exit Sub
  If Not EpochMatches(createdEpoch, createdFrom, createdTo) Then Exit Sub
  If Not EpochMatches(modifiedEpoch, modifiedFrom, modifiedTo) Then Exit Sub
  If Not EpochMatches(uploadedEpoch, uploadedFrom, uploadedTo) Then Exit Sub

  displayName = CloudDisplayFileName(fileName, requestLanguage)
  score = BestFileNameScore(fileName, queryText, reason)
  If queryText <> "" And score = 0 Then Exit Sub
  Dim reasons
  reasons = ""
  AddReason reasons, reason
  If exactName <> "" Then AddReason reasons, "fileNameExact"
  If extensionFilter <> "" Then score = score + 5: AddReason reasons, "fileType"
  If mimeFilter <> "" Then score = score + 5: AddReason reasons, "mimeType"
  If folderFilter <> "" Then score = score + 5: AddReason reasons, "folderPath"
  If createdFrom > 0 Or createdTo > 0 Then score = score + 5: AddReason reasons, "createdAt"
  If modifiedFrom > 0 Or modifiedTo > 0 Then score = score + 5: AddReason reasons, "modifiedAt"
  If uploadedFrom > 0 Or uploadedTo > 0 Then score = score + 5: AddReason reasons, "uploadedAt"
  If score > 100 Then score = 100
  pathValue = fileName
  If relativeFolder <> "" Then pathValue = relativeFolder & "/" & fileName
  AddResult sourceName, nodeId, fileName, displayName, pathValue, relativeFolder, extension, mimeType, CLng(file.Size), _
    createdEpoch, modifiedEpoch, uploadedEpoch, score, reasons
End Sub

Sub AddResult(ByVal sourceName, ByVal nodeId, ByVal fileName, ByVal displayName, ByVal pathValue, ByVal folderPath, ByVal extension, _
              ByVal mimeType, ByVal size, ByVal createdEpoch, ByVal modifiedEpoch, ByVal uploadedEpoch, ByVal score, ByVal reasons)
  If resultCount >= SEARCH_MAX_RESULTS Then Exit Sub
  Dim readUrl, reasonJson, sortValue
  If sourceName = "private" Then
    readUrl = "private-resource.asp?op=content&path=" & Server.URLEncode(pathValue)
  Else
    readUrl = "openResource.asp?path=" & Server.URLEncode(pathValue) & "&raw=1"
  End If
  If reasons = "" Then reasonJson = "" Else reasonJson = """" & Replace(reasons, ",", """,""") & """"
  resultJson(resultCount) = "{""id"":""" & CloudJson(sourceName & ":" & nodeId & ":" & pathValue) & _
    """,""nodeId"":""" & CloudJson(nodeId) & """,""source"":""" & sourceName & """,""scope"":""" & sourceName & _
    """,""name"":""" & CloudJson(fileName) & """,""displayName"":""" & CloudJson(displayName) & """,""path"":""" & CloudJson(pathValue) & _
    """,""folderPath"":""" & CloudJson(folderPath) & """,""extension"":""" & CloudJson(extension) & _
    """,""mimeType"":""" & CloudJson(mimeType) & """,""size"":" & CStr(size) & _
    ",""createdAt"":""" & EpochLocalIso(createdEpoch) & """,""modifiedAt"":""" & EpochLocalIso(modifiedEpoch) & _
    """,""uploadedAt"":""" & EpochLocalIso(uploadedEpoch) & """,""readUrl"":""" & CloudJson(readUrl) & _
    """,""relevanceScore"":" & CStr(score) & ",""matchReasons"":[" & reasonJson & "]}"
  resultScore(resultCount) = score
  resultName(resultCount) = LCase(fileName)
  resultSource(resultCount) = sourceName
  sortValue = score
  If sortField = "name" Then sortValue = 0
  If sortField = "createdat" Then sortValue = createdEpoch
  If sortField = "modifiedat" Then sortValue = modifiedEpoch
  If sortField = "uploadedat" Then sortValue = uploadedEpoch
  If sortField = "size" Then sortValue = size
  resultSortValue(resultCount) = sortValue
  resultCount = resultCount + 1
End Sub

Sub SortResults()
  Dim leftIndex, rightIndex, swapNeeded
  For leftIndex = 0 To resultCount - 2
    For rightIndex = leftIndex + 1 To resultCount - 1
      If sortField = "name" Then
        If sortOrder = "asc" Then
          swapNeeded = (StrComp(resultName(leftIndex), resultName(rightIndex), vbTextCompare) > 0)
        Else
          swapNeeded = (StrComp(resultName(leftIndex), resultName(rightIndex), vbTextCompare) < 0)
        End If
      ElseIf sortOrder = "asc" Then
        swapNeeded = (CDbl(resultSortValue(leftIndex)) > CDbl(resultSortValue(rightIndex)))
      Else
        swapNeeded = (CDbl(resultSortValue(leftIndex)) < CDbl(resultSortValue(rightIndex)))
      End If
      If Not swapNeeded And CDbl(resultSortValue(leftIndex)) = CDbl(resultSortValue(rightIndex)) Then
        swapNeeded = SourceRank(resultSource(leftIndex)) > SourceRank(resultSource(rightIndex))
      End If
      If swapNeeded Then SwapResults leftIndex, rightIndex
    Next
  Next
End Sub

Sub SwapResults(ByVal leftIndex, ByVal rightIndex)
  Dim value
  value = resultJson(leftIndex): resultJson(leftIndex) = resultJson(rightIndex): resultJson(rightIndex) = value
  value = resultScore(leftIndex): resultScore(leftIndex) = resultScore(rightIndex): resultScore(rightIndex) = value
  value = resultName(leftIndex): resultName(leftIndex) = resultName(rightIndex): resultName(rightIndex) = value
  value = resultSortValue(leftIndex): resultSortValue(leftIndex) = resultSortValue(rightIndex): resultSortValue(rightIndex) = value
  value = resultSource(leftIndex): resultSource(leftIndex) = resultSource(rightIndex): resultSource(rightIndex) = value
End Sub

Function BestFileNameScore(ByVal fileName, ByVal wanted, ByRef reason)
  Dim bestScore, candidateScore, candidateReason, languageKey, candidateName
  bestScore = FileNameScore(fileName, wanted, reason)
  For Each languageKey In Array("zh", "jp", "en")
    candidateName = CloudDisplayFileName(fileName, languageKey)
    candidateReason = ""
    candidateScore = FileNameScore(candidateName, wanted, candidateReason)
    If candidateScore > bestScore Then
      bestScore = candidateScore
      reason = candidateReason
    End If
  Next
  BestFileNameScore = bestScore
End Function

Function FileNameScore(ByVal fileName, ByVal wanted, ByRef reason)
  Dim value, tokens, token, allTokens, index
  value = LCase(CStr(fileName)): wanted = LCase(Trim(CStr(wanted))): reason = ""
  If wanted = "" Then FileNameScore = 20: Exit Function
  If value = wanted Then reason = "fileNameExact": FileNameScore = 100: Exit Function
  If Left(value, Len(wanted)) = wanted Then reason = "fileNamePrefix": FileNameScore = 88: Exit Function
  If InStr(1, value, wanted, vbBinaryCompare) > 0 Then reason = "fileNameContains": FileNameScore = 78: Exit Function
  tokens = Split(wanted, " "): allTokens = True
  For Each token In tokens
    If token <> "" And InStr(1, value, token, vbBinaryCompare) = 0 Then allTokens = False
  Next
  If allTokens Then reason = "fileNameTokens": FileNameScore = 66: Exit Function
  index = 1
  Dim characterIndex
  For characterIndex = 1 To Len(value)
    If index <= Len(wanted) And Mid(value, characterIndex, 1) = Mid(wanted, index, 1) Then index = index + 1
  Next
  If Len(wanted) > 2 And index > Len(wanted) Then reason = "fileNameFuzzy": FileNameScore = 48 Else FileNameScore = 0
End Function

Function MimeForExtension(ByVal extension)
  Select Case LCase(extension)
    Case "xlsx": MimeForExtension = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    Case "xls": MimeForExtension = "application/vnd.ms-excel"
    Case "csv": MimeForExtension = "text/csv"
    Case "docx": MimeForExtension = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    Case "doc": MimeForExtension = "application/msword"
    Case "pptx": MimeForExtension = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    Case "ppt": MimeForExtension = "application/vnd.ms-powerpoint"
    Case "pdf": MimeForExtension = "application/pdf"
    Case "zip": MimeForExtension = "application/zip"
    Case "png": MimeForExtension = "image/png"
    Case "jpg", "jpeg": MimeForExtension = "image/jpeg"
    Case "gif": MimeForExtension = "image/gif"
    Case "webp": MimeForExtension = "image/webp"
    Case "json": MimeForExtension = "application/json"
    Case "md": MimeForExtension = "text/markdown"
    Case "txt": MimeForExtension = "text/plain"
    Case Else: MimeForExtension = "application/octet-stream"
  End Select
End Function

Function NormalizeCsv(ByVal value, ByVal stripDot)
  Dim raw, parts, item, result
  raw = LCase(Replace(Trim(CStr(value)), " ", "")): result = ""
  If raw = "" Then NormalizeCsv = "": Exit Function
  parts = Split(raw, ",")
  For Each item In parts
    If stripDot And Left(item, 1) = "." Then item = Mid(item, 2)
    If item <> "" And InStr(item, "..") = 0 And InStr(item, "/") = 0 And InStr(item, "\") = 0 Then
      If Not CsvContains(result, item) Then
        If result <> "" Then result = result & ","
        result = result & item
      End If
    End If
  Next
  NormalizeCsv = result
End Function
Function CsvContains(ByVal csv, ByVal value)
  CsvContains = (InStr(1, "," & csv & ",", "," & LCase(CStr(value)) & ",", vbTextCompare) > 0)
End Function
Function MimeMatches(ByVal csv, ByVal mimeType)
  Dim values, value
  MimeMatches = False: values = Split(csv, ",")
  For Each value In values
    If value <> "" And Left(LCase(mimeType), Len(value)) = LCase(value) Then MimeMatches = True: Exit Function
  Next
End Function
Function SourceRequested(ByVal sourceName)
  SourceRequested = (sourceFilter = "" Or CsvContains(sourceFilter, sourceName))
End Function
Function SourceRank(ByVal sourceName)
  If sourceName = "private" Then SourceRank = 0 Else SourceRank = 1
End Function
Function EpochParameter(ByVal name)
  Dim value: value = Trim(CStr(Request.QueryString(name)))
  If value <> "" And IsNumeric(value) Then EpochParameter = CDbl(value) Else EpochParameter = 0
End Function
Function IntegerParameter(ByVal name, ByVal fallback, ByVal minimum, ByVal maximum)
  Dim value: value = Trim(CStr(Request.QueryString(name)))
  If Not IsNumeric(value) Then IntegerParameter = fallback: Exit Function
  value = CLng(value): If value < minimum Then value = minimum
  If value > maximum Then value = maximum
  IntegerParameter = value
End Function
Function DateEpoch(ByVal value)
  DateEpoch = CDbl(DateDiff("s", DateSerial(1970, 1, 1), CDate(value)))
End Function
Function EpochLocalIso(ByVal value)
  Dim localDate
  localDate = DateAdd("s", CDbl(value), DateSerial(1970, 1, 1))
  EpochLocalIso = CStr(Year(localDate)) & "-" & Right("0" & CStr(Month(localDate)), 2) & "-" & _
    Right("0" & CStr(Day(localDate)), 2) & "T" & Right("0" & CStr(Hour(localDate)), 2) & ":" & _
    Right("0" & CStr(Minute(localDate)), 2) & ":" & Right("0" & CStr(Second(localDate)), 2)
End Function
Function EpochMatches(ByVal value, ByVal fromValue, ByVal toValue)
  EpochMatches = ((fromValue <= 0 Or value >= fromValue) And (toValue <= 0 Or value < toValue))
End Function
Sub AddReason(ByRef reasons, ByVal reason)
  If reason = "" Then Exit Sub
  If InStr(1, "," & reasons & ",", "," & reason & ",", vbTextCompare) > 0 Then Exit Sub
  If reasons <> "" Then reasons = reasons & ","
  reasons = reasons & reason
End Sub
%>
