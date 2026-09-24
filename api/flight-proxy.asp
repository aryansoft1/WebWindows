<%@ Language=VBScript EnableSessionState=False CodePage=65001 %>
<%
Option Explicit
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-store"

Const MAX_REQUEST_BYTES = 4096
Const AIRLABS_BASE = "https://airlabs.co/api/v9/"
Dim Q : Q = Chr(34)

If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then WriteError "405 Method Not Allowed", "method_not_allowed", "Only POST is supported."
Dim byteCount : byteCount = Request.TotalBytes
If byteCount <= 0 Or byteCount > MAX_REQUEST_BYTES Then WriteError "413 Payload Too Large", "invalid_request", "Request body is empty or too large."

Dim body : body = BinaryToUtf8(Request.BinaryRead(byteCount))
Dim action : action = LCase(Trim(Request.QueryString("action")))
Dim debugMode : debugMode = (Request.QueryString("debug") = "1")
Dim flightNumber : flightNumber = UCase(Replace(ExtractString(body, "flightNumber"), " ", ""))
Dim requestedDate : requestedDate = ExtractString(body, "date")
If Not ValidFlightNumber(flightNumber) Then WriteError "400 Bad Request", "invalid_flight_number", "The flight number format is invalid."
If Not ValidDate(requestedDate) Then WriteError "400 Bad Request", "invalid_date", "The requested date is invalid."

Dim apiKey : apiKey = FlightSecret("WEBWINDOWS_AIRLABS_API_KEY")
If Len(apiKey) = 0 Then WriteError "503 Service Unavailable", "not_configured", "The flight data service is not configured."

Dim liveUrl : liveUrl = AIRLABS_BASE & "flight?flight_iata=" & Server.URLEncode(flightNumber) & "&api_key=" & Server.URLEncode(apiKey)
If action = "live" Then
  Dim liveOnlyResult : liveOnlyResult = HttpRequest(liveUrl, 25000)
  If liveOnlyResult(2) Then WriteError "504 Gateway Timeout", "provider_timeout", "The live flight service did not respond in time."
  If liveOnlyResult(0) = 429 Then WriteRateLimit liveOnlyResult(3)
  If liveOnlyResult(0) = 401 Or liveOnlyResult(0) = 403 Then WriteError "502 Bad Gateway", "provider_auth_error", "The flight data service rejected its server credential."
  If liveOnlyResult(0) < 200 Or liveOnlyResult(0) >= 300 Then WriteError "502 Bad Gateway", "provider_http_error", "The live flight service returned an error."
  Dim liveOnlyObject : liveOnlyObject = ExtractResponseObject(liveOnlyResult(1))
  Dim emptyAirport : emptyAirport = Array("", "", "", "")
  WriteFlight "", liveOnlyObject, flightNumber, requestedDate, emptyAirport, emptyAirport
End If

Dim scheduleUrl : scheduleUrl = AIRLABS_BASE & "schedules?flight_iata=" & Server.URLEncode(flightNumber) & "&api_key=" & Server.URLEncode(apiKey)
Dim scheduleResult : scheduleResult = HttpRequest(scheduleUrl, 30000)
If debugMode Then
    WriteDebugResult _
    flightNumber, _
    requestedDate, _
    scheduleUrl, _
    scheduleResult

  Response.End
End If
If scheduleResult(2) Then WriteError "504 Gateway Timeout", "provider_timeout", "The flight data service did not respond in time."
If scheduleResult(0) = 429 Then WriteRateLimit scheduleResult(3)
If scheduleResult(0) = 401 Or scheduleResult(0) = 403 Then WriteError "502 Bad Gateway", "provider_auth_error", "The flight data service rejected its server credential."
If scheduleResult(0) < 200 Or scheduleResult(0) >= 300 Then WriteError "502 Bad Gateway", "provider_http_error", "The flight data service returned an error."

Dim scheduleObject : scheduleObject = FindSchedule(scheduleResult(1), flightNumber, requestedDate)
If Len(scheduleObject) = 0 Then WriteError "404 Not Found", "date_not_found", "No data is available for this flight on the requested date."

Dim liveObject : liveObject = ""
Dim liveResult : liveResult = HttpRequest(liveUrl, 25000)
If Not liveResult(2) And liveResult(0) >= 200 And liveResult(0) < 300 Then
  liveObject = ExtractResponseObject(liveResult(1))
  If Len(liveObject) > 0 Then
    Dim liveDate : liveDate = Left(ExtractString(liveObject, "dep_time"), 10)
    If Len(liveDate) = 10 And liveDate <> requestedDate Then liveObject = ""
  End If
End If

Dim departureAirport : departureAirport = AirportInfo(ExtractString(scheduleObject, "dep_iata"), apiKey)
Dim arrivalAirport : arrivalAirport = AirportInfo(ExtractString(scheduleObject, "arr_iata"), apiKey)
WriteFlight scheduleObject, liveObject, flightNumber, requestedDate, departureAirport, arrivalAirport

Sub WriteFlight(scheduleJson, liveJson, number, dateValue, departureAirport, arrivalAirport)
  Dim status : status = FirstString(scheduleJson, liveJson, "status")
  Dim delayed : delayed = MaxNumber(ExtractNumber(scheduleJson, "dep_delayed"), ExtractNumber(scheduleJson, "arr_delayed"))
  Dim cancelled : cancelled = (LCase(status) = "cancelled")
  Dim output
  output = "{" & Q & "flight" & Q & ":{" & _
    Q & "provider" & Q & ":" & JsonString("airlabs") & "," & _
    Q & "requestedDate" & Q & ":" & JsonString(dateValue) & "," & _
    Q & "flightNumber" & Q & ":" & JsonStringOrNull(FirstString(scheduleJson, liveJson, "flight_iata")) & "," & _
    Q & "airlineCode" & Q & ":" & JsonStringOrNull(FirstString(scheduleJson, liveJson, "airline_iata")) & "," & _
    Q & "airlineName" & Q & ":null," & _
    Q & "departure" & Q & ":{" & _
      Q & "airportCode" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "dep_iata")) & "," & _
      Q & "airportName" & Q & ":" & JsonStringOrNull(departureAirport(0)) & "," & Q & "terminal" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "dep_terminal")) & "," & _
      Q & "gate" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "dep_gate")) & "," & _
      Q & "scheduled" & Q & ":" & JsonTime(scheduleJson, "dep_time", departureAirport(3)) & "," & Q & "estimated" & Q & ":" & JsonTime(scheduleJson, "dep_estimated", departureAirport(3)) & "," & Q & "actual" & Q & ":" & JsonTime(scheduleJson, "dep_actual", departureAirport(3)) & "," & _
      Q & "latitude" & Q & ":" & JsonNumberOrNull(departureAirport(1)) & "," & Q & "longitude" & Q & ":" & JsonNumberOrNull(departureAirport(2)) & "}," & _
    Q & "arrival" & Q & ":{" & _
      Q & "airportCode" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "arr_iata")) & "," & _
      Q & "airportName" & Q & ":" & JsonStringOrNull(arrivalAirport(0)) & "," & Q & "terminal" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "arr_terminal")) & "," & _
      Q & "gate" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "arr_gate")) & "," & Q & "baggage" & Q & ":" & JsonStringOrNull(ExtractString(scheduleJson, "arr_baggage")) & "," & _
      Q & "scheduled" & Q & ":" & JsonTime(scheduleJson, "arr_time", arrivalAirport(3)) & "," & Q & "estimated" & Q & ":" & JsonTime(scheduleJson, "arr_estimated", arrivalAirport(3)) & "," & Q & "actual" & Q & ":" & JsonTime(scheduleJson, "arr_actual", arrivalAirport(3)) & "," & _
      Q & "latitude" & Q & ":" & JsonNumberOrNull(arrivalAirport(1)) & "," & Q & "longitude" & Q & ":" & JsonNumberOrNull(arrivalAirport(2)) & "}," & _
    Q & "status" & Q & ":" & JsonStringOrNull(status) & "," & Q & "delayedMinutes" & Q & ":" & JsonNumberOrNull(delayed) & "," & Q & "cancelled" & Q & ":" & LCase(CStr(cancelled)) & "," & _
    Q & "aircraft" & Q & ":{" & Q & "model" & Q & ":" & JsonStringOrNull(ExtractString(liveJson, "model")) & "," & Q & "registration" & Q & ":" & JsonStringOrNull(ExtractString(liveJson, "reg_number")) & "," & Q & "icao24" & Q & ":" & JsonStringOrNull(ExtractString(liveJson, "hex")) & "}," & _
    Q & "position" & Q & ":{" & Q & "latitude" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "lat")) & "," & Q & "longitude" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "lng")) & "," & Q & "altitude" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "alt")) & "," & Q & "groundSpeed" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "speed")) & "," & Q & "heading" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "dir")) & "," & Q & "verticalSpeed" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "v_speed")) & "," & Q & "timestamp" & Q & ":" & JsonNumberOrNull(ExtractNumber(liveJson, "updated")) & "," & Q & "source" & Q & ":" & JsonStringOrNull(PositionSource(liveJson)) & "}," & _
    Q & "positionStatus" & Q & ":" & JsonString(PositionStatus(liveJson)) & "," & _
    Q & "track" & Q & ":[]}}"
  Response.Status = "200 OK"
  Response.Write output
  Response.End
End Sub

Function AirportInfo(iataCode, secret)
  Dim emptyInfo : emptyInfo = Array("", "", "", "")
  AirportInfo = emptyInfo
  If Len(iataCode) = 0 Then Exit Function
  Dim url : url = AIRLABS_BASE & "airports?iata_code=" & Server.URLEncode(iataCode) & "&_fields=name,iata_code,lat,lng,timezone&api_key=" & Server.URLEncode(secret)
  Dim result : result = HttpRequest(url, 20000)
  If result(2) Or result(0) < 200 Or result(0) >= 300 Then Exit Function
  Dim airportJson : airportJson = ExtractFirstResponseItem(result(1))
  If Len(airportJson) = 0 Then Exit Function
  AirportInfo = Array(ExtractString(airportJson, "name"), ExtractNumber(airportJson, "lat"), ExtractNumber(airportJson, "lng"), ExtractString(airportJson, "timezone"))
End Function

Function ExtractFirstResponseItem(json)
  Dim responseArray : responseArray = ExtractArrayAfter(json, Q & "response" & Q)
  If Len(responseArray) = 0 Then ExtractFirstResponseItem = "" Else ExtractFirstResponseItem = ExtractBalancedAfter(responseArray, "[", "{", "}")
End Function

Function PositionSource(liveJson)
  If Len(ExtractNumber(liveJson, "lat")) > 0 And Len(ExtractNumber(liveJson, "lng")) > 0 Then PositionSource = "live" Else PositionSource = ""
End Function

Function PositionStatus(liveJson)
  If PositionSource(liveJson) = "live" Then PositionStatus = "live" Else PositionStatus = "unavailable"
End Function

Function FindSchedule(json, number, dateValue)
  FindSchedule = ""
  Dim responseArray : responseArray = ExtractArrayAfter(json, Q & "response" & Q)
  If Len(responseArray) = 0 Then Exit Function
  Dim index, startAt, depth, inString, escaped, ch, candidate
  For index = 2 To Len(responseArray) - 1
    ch = Mid(responseArray, index, 1)
    If startAt = 0 And ch = "{" Then startAt = index : depth = 1 : inString = False : escaped = False
    If startAt > 0 And index > startAt Then
      If inString Then
        If escaped Then
          escaped = False
        ElseIf ch = "\" Then
          escaped = True
        ElseIf ch = Q Then
          inString = False
        End If
      ElseIf ch = Q Then
        inString = True
      ElseIf ch = "{" Then
        depth = depth + 1
      ElseIf ch = "}" Then
        depth = depth - 1
        If depth = 0 Then
          candidate = Mid(responseArray, startAt, index - startAt + 1)
          If UCase(ExtractString(candidate, "flight_iata")) = number And Left(ExtractString(candidate, "dep_time"), 10) = dateValue Then FindSchedule = candidate : Exit Function
          startAt = 0
        End If
      End If
    End If
  Next
End Function

Function ExtractResponseObject(json)
  ExtractResponseObject = ExtractObjectAfter(json, Q & "response" & Q)
End Function

Function JsonTime(json, key, timezoneName)
  JsonTime = "{" & Q & "local" & Q & ":" & JsonStringOrNull(ExtractString(json, key)) & "," & Q & "utc" & Q & ":" & JsonStringOrNull(ExtractString(json, key & "_utc")) & "," & Q & "timestamp" & Q & ":" & JsonNumberOrNull(ExtractNumber(json, key & "_ts")) & "," & Q & "timezone" & Q & ":" & JsonStringOrNull(timezoneName) & "}"
End Function

Function FirstString(firstJson, secondJson, key)
  FirstString = ExtractString(firstJson, key)
  If Len(FirstString) = 0 Then FirstString = ExtractString(secondJson, key)
End Function

Function MaxNumber(firstValue, secondValue)
  MaxNumber = ""

  If IsNumeric(firstValue) Then
    MaxNumber = CDbl(firstValue)
  End If

  If IsNumeric(secondValue) Then
    If Len(CStr(MaxNumber & "")) = 0 Then
      MaxNumber = CDbl(secondValue)
    ElseIf CDbl(secondValue) > CDbl(MaxNumber) Then
      MaxNumber = CDbl(secondValue)
    End If
  End If
End Function

Function HttpRequest(url, timeoutMs)
  Dim result : result = ServerXmlHttpRequest(url, timeoutMs)
  If result(2) Then result = WinHttpRequest(url, timeoutMs)
  If result(2) Then result = XmlHttpRequest(url)
  HttpRequest = result
End Function

Function ServerXmlHttpRequest(url, timeoutMs)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then Err.Clear : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
  If Err.Number <> 0 Then Err.Clear : ServerXmlHttpRequest = Array(0, "", True, "") : Exit Function
  http.setTimeouts 8000, 8000, 20000, timeoutMs
  http.open "GET", url, False
  http.setRequestHeader "Accept", "application/json"
  http.send
  If Err.Number <> 0 Then
    Err.Clear : ServerXmlHttpRequest = Array(0, "", True, "")
  Else
    Dim responseStatus : responseStatus = CLng(http.status)
    Dim responseText : responseText = CStr(http.responseText)
    Dim retryAfter : retryAfter = http.getResponseHeader("Retry-After")
    If Err.Number <> 0 Or IsNull(retryAfter) Then Err.Clear : retryAfter = ""
    ServerXmlHttpRequest = Array(responseStatus, responseText, False, CStr(retryAfter))
  End If
  On Error GoTo 0
End Function

Function WinHttpRequest(url, timeoutMs)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("WinHttp.WinHttpRequest.5.1")
  If Err.Number <> 0 Then Err.Clear : WinHttpRequest = Array(0, "", True, "") : Exit Function
  http.SetTimeouts 8000, 8000, 20000, timeoutMs
  http.Open "GET", url, False
  http.SetRequestHeader "Accept", "application/json"
  http.Send
  If Err.Number <> 0 Then
    Err.Clear : WinHttpRequest = Array(0, "", True, "")
  Else
    Dim responseStatus : responseStatus = CLng(http.Status)
    Dim responseText : responseText = CStr(http.ResponseText)
    Dim retryAfter : retryAfter = http.GetResponseHeader("Retry-After")
    If Err.Number <> 0 Or IsNull(retryAfter) Then Err.Clear : retryAfter = ""
    WinHttpRequest = Array(responseStatus, responseText, False, CStr(retryAfter))
  End If
  On Error GoTo 0
End Function

Function XmlHttpRequest(url)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("MSXML2.XMLHTTP.6.0")
  If Err.Number <> 0 Then Err.Clear : Set http = Server.CreateObject("Microsoft.XMLHTTP")
  If Err.Number <> 0 Then Err.Clear : XmlHttpRequest = Array(0, "", True, "") : Exit Function
  http.Open "GET", url, False
  http.SetRequestHeader "Accept", "application/json"
  http.Send
  If Err.Number <> 0 Then
    Err.Clear : XmlHttpRequest = Array(0, "", True, "")
  Else
    Dim responseStatus : responseStatus = CLng(http.Status)
    Dim responseText : responseText = CStr(http.ResponseText)
    Dim retryAfter : retryAfter = http.getResponseHeader("Retry-After")
    If Err.Number <> 0 Or IsNull(retryAfter) Then Err.Clear : retryAfter = ""
    XmlHttpRequest = Array(responseStatus, responseText, False, CStr(retryAfter))
  End If
  On Error GoTo 0
End Function

Function FlightSecret(name)
  FlightSecret = ""
  Dim text : text = ReadUtf8File(Server.MapPath("flight-proxy.config.asp"))
  If Len(text) = 0 Then Exit Function
  Dim re : Set re = New RegExp
  re.Pattern = "(?:Const\s+)?" & name & "\s*=\s*" & Q & "([^" & Q & "]*)" & Q
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(text)
  If matches.Count > 0 Then FlightSecret = Trim(matches(0).SubMatches(0))
End Function

Function ReadUtf8File(filePath)
  ReadUtf8File = ""
  On Error Resume Next
  Dim stream : Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2 : stream.Charset = "utf-8" : stream.Open : stream.LoadFromFile filePath
  If Err.Number = 0 Then ReadUtf8File = stream.ReadText
  If Not stream Is Nothing Then stream.Close
  Set stream = Nothing : Err.Clear : On Error GoTo 0
End Function

Function BinaryToUtf8(binaryData)
  Dim stream : Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 1 : stream.Open : stream.Write binaryData : stream.Position = 0 : stream.Type = 2 : stream.Charset = "utf-8"
  BinaryToUtf8 = stream.ReadText
  stream.Close
End Function

Function ExtractString(json, key)
  ExtractString = ""
  Dim re : Set re = New RegExp
  re.Pattern = Q & key & Q & "\s*:\s*" & Q & "((?:\\.|[^" & Q & "\\])*)" & Q
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(CStr(json & ""))
  If matches.Count > 0 Then ExtractString = JsonUnescape(matches(0).SubMatches(0))
End Function

Function ExtractNumber(json, key)
  ExtractNumber = ""
  Dim re : Set re = New RegExp
  re.Pattern = Q & key & Q & "\s*:\s*(-?[0-9]+(?:\.[0-9]+)?)"
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(CStr(json & ""))
  If matches.Count > 0 Then ExtractNumber = matches(0).SubMatches(0)
End Function

Function ExtractObjectAfter(json, marker)
  ExtractObjectAfter = ExtractBalancedAfter(json, marker, "{", "}")
End Function

Function ExtractArrayAfter(json, marker)
  ExtractArrayAfter = ExtractBalancedAfter(json, marker, "[", "]")
End Function

Function ExtractBalancedAfter(json, marker, openChar, closeChar)
  ExtractBalancedAfter = ""
  Dim markerPosition : markerPosition = InStr(1, CStr(json & ""), marker, vbBinaryCompare)
  If markerPosition = 0 Then Exit Function
  Dim startPosition : startPosition = InStr(markerPosition + Len(marker), json, openChar, vbBinaryCompare)
  If startPosition = 0 Then Exit Function
  Dim depth, index, character, inString, escaped
  depth = 0 : inString = False : escaped = False
  For index = startPosition To Len(json)
    character = Mid(json, index, 1)
    If inString Then
      If escaped Then
        escaped = False
      ElseIf character = "\" Then
        escaped = True
      ElseIf character = Q Then
        inString = False
      End If
    ElseIf character = Q Then
      inString = True
    ElseIf character = openChar Then
      depth = depth + 1
    ElseIf character = closeChar Then
      depth = depth - 1
      If depth = 0 Then ExtractBalancedAfter = Mid(json, startPosition, index - startPosition + 1) : Exit Function
    End If
  Next
End Function

Function ValidFlightNumber(value)
  Dim re : Set re = New RegExp
  re.Pattern = "^[A-Z0-9]{2,3}[0-9]{1,4}[A-Z]?$"
  ValidFlightNumber = re.Test(value)
End Function

Function ValidDate(value)
  Dim re : Set re = New RegExp
  re.Pattern = "^[0-9]{4}-[0-9]{2}-[0-9]{2}$"
  ValidDate = re.Test(value)
End Function

Function JsonString(value)
  JsonString = Q & Replace(Replace(Replace(Replace(CStr(value & ""), "\", "\\"), Q, "\" & Q), vbCr, "\r"), vbLf, "\n") & Q
End Function

Function JsonStringOrNull(value)
  If Len(CStr(value & "")) = 0 Then JsonStringOrNull = "null" Else JsonStringOrNull = JsonString(value)
End Function

Function JsonNumberOrNull(value)
  If Len(CStr(value & "")) = 0 Or Not IsNumeric(value) Then JsonNumberOrNull = "null" Else JsonNumberOrNull = Replace(CStr(CDbl(value)), ",", ".")
End Function

Function JsonUnescape(value)
  JsonUnescape = Replace(Replace(Replace(Replace(CStr(value), "\" & Q, Q), "\\", "\"), "\n", vbLf), "\r", vbCr)
End Function

Sub WriteError(statusText, code, message)
  Response.Status = statusText
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "code" & Q & ":" & JsonString(code) & "," & Q & "message" & Q & ":" & JsonString(message) & "}}"
  Response.End
End Sub

Sub WriteRateLimit(retryAfter)
  Dim seconds : seconds = 60
  If IsNumeric(retryAfter) Then If CLng(retryAfter) > seconds Then seconds = CLng(retryAfter)
  Response.AddHeader "Retry-After", CStr(seconds)
  WriteError "429 Too Many Requests", "quota_exhausted", "The flight data service is rate-limited."
End Sub
Sub WriteDebugResult(flightNumber, requestedDate, requestUrl, providerResult)

  Dim safeUrl
  safeUrl = HideApiKey(requestUrl)

  Dim rawBody
  rawBody = ""

  If IsArray(providerResult) Then
    If UBound(providerResult) >= 1 Then
      rawBody = CStr(providerResult(1) & "")
    End If
  End If

  Dim statusCode
  statusCode = 0

  If IsArray(providerResult) Then
    If UBound(providerResult) >= 0 Then
      statusCode = providerResult(0)
    End If
  End If

  Dim timedOut
  timedOut = False

  If IsArray(providerResult) Then
    If UBound(providerResult) >= 2 Then
      timedOut = providerResult(2)
    End If
  End If

  Response.Status = "200 OK"

  Response.Write "{" & _
    Q & "debug" & Q & ":true," & _
    Q & "input" & Q & ":{" & _
      Q & "flightNumber" & Q & ":" & JsonString(flightNumber) & "," & _
      Q & "date" & Q & ":" & JsonString(requestedDate) & _
    "}," & _
    Q & "providerRequest" & Q & ":{" & _
      Q & "url" & Q & ":" & JsonString(safeUrl) & _
    "}," & _
    Q & "providerResponse" & Q & ":{" & _
      Q & "status" & Q & ":" & JsonNumberOrNull(statusCode) & "," & _
      Q & "timeout" & Q & ":" & LCase(CStr(timedOut)) & "," & _
      Q & "raw" & Q & ":" & JsonString(rawBody) & _
    "}" & _
  "}"

End Sub


Function HideApiKey(url)

  Dim result
  result = CStr(url & "")

  Dim re : Set re = New RegExp
  re.Pattern = "([?&]api_key=)[^&]+"
  re.IgnoreCase = True
  re.Global = True

  HideApiKey = re.Replace(result, "$1***")

End Function
%>
