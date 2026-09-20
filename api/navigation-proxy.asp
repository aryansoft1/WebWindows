<%@ Language=VBScript EnableSessionState=False CodePage=65001 %>
<%
Option Explicit
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-store"

Const MAX_REQUEST_BYTES = 16384
Dim Q : Q = Chr(34)
Dim RoutingConfigText : RoutingConfigText = ReadUtf8File(Server.MapPath("navigation-proxy.config.asp"))

If Request.ServerVariables("REQUEST_METHOD") <> "POST" Then
  Response.Status = "405 Method Not Allowed"
  Response.AddHeader "Allow", "POST"
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & "Only POST is supported." & Q & "}}"
  Response.End
End If

If LCase(Request.QueryString("service") & "") <> "route" Then
  Response.Status = "400 Bad Request"
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & "Unsupported navigation service." & Q & "}}"
  Response.End
End If

Dim byteCount : byteCount = Request.TotalBytes
If byteCount <= 0 Or byteCount > MAX_REQUEST_BYTES Then
  Response.Status = "413 Payload Too Large"
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & "Request body is empty or too large." & Q & "}}"
  Response.End
End If

Dim body : body = BinaryToUtf8(Request.BinaryRead(byteCount))
Dim mode : mode = ExtractString(body, "mode")
If mode <> "driving" And mode <> "transit" And mode <> "walking" And mode <> "cycling" Then BadRequest

Dim startLat, startLng, endLat, endLng
startLat = ExtractPointNumber(body, "start", "lat")
startLng = ExtractPointNumber(body, "start", "lng")
endLat = ExtractPointNumber(body, "end", "lat")
endLng = ExtractPointNumber(body, "end", "lng")
If Not ValidCoordinate(startLat, startLng) Or Not ValidCoordinate(endLat, endLng) Then BadRequest

Dim requested : requested = LCase(Request.QueryString("provider") & "")
If requested = "cn-proxy" Then
  ProxyChina mode, startLat, startLng, endLat, endLng
ElseIf requested = "global-proxy" Then
  ProxyOrs mode, startLat, startLng, endLat, endLng
Else
  BadRequest
End If

Sub ProxyChina(travelMode, originLat, originLng, destinationLat, destinationLng)
  Dim amapKey : amapKey = RoutingSecret("WEBWINDOWS_AMAP_KEY")
  Dim baiduKey : baiduKey = RoutingSecret("WEBWINDOWS_BAIDU_MAP_AK")
  Dim result, url, normalized, hadInvalidResponse
  result = Array(0, "", True) : hadInvalidResponse = False
  If Len(amapKey) > 0 Then
    url = AmapRouteUrl(travelMode, originLat, originLng, destinationLat, destinationLng, amapKey)
    If Len(url) > 0 Then
      result = HttpRequest("GET", url, "", "", 45000)
      If result(0) >= 200 And result(0) < 300 And JsonValueEquals(result(1), "status", "1") Then
        normalized = NormalizeChinaRoute(result(1), "amap", travelMode)
        If Len(normalized) > 0 Then WriteJson normalized
        hadInvalidResponse = True
      End If
    End If
  End If
  If Len(baiduKey) > 0 Then
    url = BaiduRouteUrl(travelMode, originLat, originLng, destinationLat, destinationLng, baiduKey)
    result = HttpRequest("GET", url, "", "", 45000)
    If result(0) >= 200 And result(0) < 300 And JsonValueEquals(result(1), "status", "0") Then
      normalized = NormalizeChinaRoute(result(1), "baidu", travelMode)
      If Len(normalized) > 0 Then WriteJson normalized
      hadInvalidResponse = True
    End If
  End If
  If Len(amapKey) = 0 And Len(baiduKey) = 0 Then NotConfigured "Mainland China routing"
  If hadInvalidResponse Then WriteError "502 Bad Gateway", "provider_invalid_response", "The routing provider returned an invalid response."
  ProviderFailure result
End Sub

Function AmapRouteUrl(travelMode, originLat, originLng, destinationLat, destinationLng, apiKey)
  AmapRouteUrl = ""
  Dim endpoint, origin, destination, extra
  origin = Coordinate(originLng, originLat)
  destination = Coordinate(destinationLng, destinationLat)
  extra = "&show_fields=cost,polyline,navi&alternative_route=3"
  Select Case travelMode
    Case "driving" : endpoint = "https://restapi.amap.com/v5/direction/driving"
    Case "walking" : endpoint = "https://restapi.amap.com/v5/direction/walking"
    Case "cycling" : endpoint = "https://restapi.amap.com/v5/direction/bicycling"
    Case "transit"
      endpoint = "https://restapi.amap.com/v5/direction/transit/integrated"
      Dim city1, city2
      city1 = AmapCityCode(origin, apiKey)
      city2 = AmapCityCode(destination, apiKey)
      If Len(city1) = 0 Or Len(city2) = 0 Then Exit Function
      extra = extra & "&city1=" & Server.URLEncode(city1) & "&city2=" & Server.URLEncode(city2)
  End Select
  AmapRouteUrl = endpoint & "?origin=" & origin & "&destination=" & destination & "&key=" & Server.URLEncode(apiKey) & extra
End Function

Function BaiduRouteUrl(travelMode, originLat, originLng, destinationLat, destinationLng, apiKey)
  Dim profile
  Select Case travelMode
    Case "driving" : profile = "driving"
    Case "walking" : profile = "walking"
    Case "cycling" : profile = "riding"
    Case "transit" : profile = "transit"
  End Select
  BaiduRouteUrl = "https://api.map.baidu.com/directionlite/v1/" & profile & _
    "?origin=" & Coordinate(originLat, originLng) & "&destination=" & Coordinate(destinationLat, destinationLng) & _
    "&coord_type=gcj02&ret_coordtype=gcj02&ak=" & Server.URLEncode(apiKey)
End Function

Sub ProxyOrs(travelMode, originLat, originLng, destinationLat, destinationLng)
  If travelMode = "transit" Then WriteError "422 Unprocessable Entity", "unsupported_mode", "Public transit routing is not available from the configured provider."
  Dim apiKey : apiKey = RoutingSecret("WEBWINDOWS_ORS_API_KEY")
  If Len(apiKey) = 0 Then NotConfigured "Global routing"
  Dim profile
  Select Case travelMode
    Case "driving" : profile = "driving-car"
    Case "walking" : profile = "foot-walking"
    Case "cycling" : profile = "cycling-regular"
    Case Else : WriteError "422 Unprocessable Entity", "unsupported_mode", "This travel mode is not supported."
  End Select
  Dim payload : payload = "{" & Q & "coordinates" & Q & ":[[" & JsonNumber(originLng) & "," & JsonNumber(originLat) & "],[" & JsonNumber(destinationLng) & "," & JsonNumber(destinationLat) & "]]}"
  Dim result : result = HttpRequest("POST", "https://api.heigit.org/openrouteservice/v2/directions/" & profile & "/geojson", payload, apiKey, 45000)
  If result(0) < 200 Or result(0) >= 300 Then ProviderFailure result
  WriteOrsRoute result(1), travelMode
End Sub

Function HttpRequest(method, url, payload, authorization, timeoutMs)
  Dim result : result = ServerXmlHttpRequest(method, url, payload, authorization, timeoutMs)
  If result(2) Then result = WinHttpRequest(method, url, payload, authorization, timeoutMs)
  If result(2) Then result = XmlHttpRequest(method, url, payload, authorization)
  HttpRequest = result
End Function

Function XmlHttpRequest(method, url, payload, authorization)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("MSXML2.XMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Server.CreateObject("Microsoft.XMLHTTP")
  End If
  If Err.Number <> 0 Then
    Err.Clear
    XmlHttpRequest = Array(0, "", True)
    Exit Function
  End If
  http.Open method, url, False
  SetRequestHeaders http, method, url, authorization
  http.Send payload
  If Err.Number <> 0 Then
    Err.Clear
    XmlHttpRequest = Array(0, "", True)
  Else
    XmlHttpRequest = Array(CLng(http.Status), CStr(http.ResponseText), False)
  End If
  On Error GoTo 0
End Function

Function ServerXmlHttpRequest(method, url, payload, authorization, timeoutMs)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
  End If
  If Err.Number <> 0 Then
    Err.Clear
    ServerXmlHttpRequest = Array(0, "", True)
    Exit Function
  End If
  http.setTimeouts 10000, 10000, 30000, timeoutMs
  http.open method, url, False
  SetRequestHeaders http, method, url, authorization
  http.send payload
  If Err.Number <> 0 Then
    Err.Clear
    ServerXmlHttpRequest = Array(0, "", True)
  Else
    ServerXmlHttpRequest = Array(CLng(http.status), CStr(http.responseText), False)
  End If
  On Error GoTo 0
End Function

Function WinHttpRequest(method, url, payload, authorization, timeoutMs)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("WinHttp.WinHttpRequest.5.1")
  If Err.Number <> 0 Then
    Err.Clear
    WinHttpRequest = Array(0, "", True)
    Exit Function
  End If
  http.SetTimeouts 10000, 10000, 30000, timeoutMs
  http.Open method, url, False
  SetRequestHeaders http, method, url, authorization
  http.Send payload
  If Err.Number <> 0 Then
    Err.Clear
    WinHttpRequest = Array(0, "", True)
  Else
    WinHttpRequest = Array(CLng(http.Status), CStr(http.ResponseText), False)
  End If
  On Error GoTo 0
End Function

Sub SetRequestHeaders(http, method, url, authorization)
  If InStr(1, url, "https://api.heigit.org/openrouteservice/", vbTextCompare) = 1 Then
    http.SetRequestHeader "Accept", "application/geo+json"
  Else
    http.SetRequestHeader "Accept", "application/json"
  End If
  If method = "POST" Then http.SetRequestHeader "Content-Type", "application/json"
  If Len(authorization) > 0 Then http.SetRequestHeader "Authorization", authorization
End Sub

Sub WriteJson(json)
  Response.Status = "200 OK"
  Response.Write json
  Response.End
End Sub

Function NormalizeChinaRoute(rawJson, providerName, travelMode)
  NormalizeChinaRoute = ""
  Dim routeArray
  routeArray = ExtractArrayAfter(rawJson, Q & "paths" & Q)
  If Len(routeArray) = 0 Then routeArray = ExtractArrayAfter(rawJson, Q & "transits" & Q)
  If Len(routeArray) = 0 Then routeArray = ExtractArrayAfter(rawJson, Q & "routes" & Q)
  Dim selected : selected = ExtractObjectAfter(routeArray, "")
  If Len(selected) = 0 Then Exit Function
  Dim geometry : geometry = ExtractCoordinateGeometry(selected)
  Dim distance : distance = ExtractNumber(selected, "distance")
  Dim duration : duration = ExtractNumber(selected, "duration")
  Dim steps : steps = ExtractRouteSteps(selected)
  Dim toll : toll = ExtractNumber(selected, "tolls")
  If Len(toll) = 0 Then toll = ExtractNumber(selected, "toll")
  Dim transitFee : transitFee = ExtractNumber(selected, "transit_fee")
  Dim costsAvailable : costsAvailable = (Len(toll) > 0 Or Len(transitFee) > 0)
  If Len(geometry) = 0 Or Len(distance) = 0 Or Len(duration) = 0 Then Exit Function
  NormalizeChinaRoute = "{" & Q & "provider" & Q & ":" & Q & providerName & Q & "," & Q & "mode" & Q & ":" & Q & travelMode & Q & "," & Q & "coordinateSystem" & Q & ":" & Q & "GCJ02" & Q & "," & Q & "geometry" & Q & ":" & geometry & "," & Q & "distance" & Q & ":" & distance & "," & Q & "duration" & Q & ":" & duration & "," & Q & "steps" & Q & ":" & steps & "," & Q & "costs" & Q & ":{" & Q & "available" & Q & ":" & LCase(CStr(costsAvailable)) & "," & Q & "currency" & Q & ":" & Q & "CNY" & Q & "," & Q & "toll" & Q & ":" & JsonNumberOrNull(toll) & "," & Q & "icCard" & Q & ":" & JsonNumberOrNull(transitFee) & "," & Q & "cash" & Q & ":" & JsonNumberOrNull(transitFee) & "}}"
End Function

Function ExtractCoordinateGeometry(json)
  ExtractCoordinateGeometry = ""
  Dim re : Set re = New RegExp
  re.Pattern = Q & "(?:polyline|path)" & Q & "\s*:\s*" & Q & "([^" & Q & "]+)" & Q
  re.IgnoreCase = True : re.Global = True
  Dim matches : Set matches = re.Execute(json)
  Dim output, match, pairs, pair, values, lng, lat, pointCount
  pointCount = 0
  output = "["
  For Each match In matches
    pairs = Split(match.SubMatches(0), ";")
    For Each pair In pairs
      values = Split(pair, ",")
      If UBound(values) = 1 Then
        lng = Trim(values(0)) : lat = Trim(values(1))
        If IsNumeric(lng) And IsNumeric(lat) Then
          If Len(output) > 1 Then output = output & ","
          output = output & "[" & JsonNumber(lng) & "," & JsonNumber(lat) & "]"
          pointCount = pointCount + 1
        End If
      End If
    Next
  Next
  output = output & "]"
  If pointCount >= 2 Then ExtractCoordinateGeometry = output
End Function

Function ExtractRouteSteps(json)
  Dim re : Set re = New RegExp
  re.Pattern = Q & "instruction" & Q & "\s*:\s*" & Q & "((?:\\.|[^" & Q & "\\])*)" & Q
  re.IgnoreCase = True : re.Global = True
  Dim output, match : output = "["
  For Each match In re.Execute(json)
    If Len(output) > 1 Then output = output & ","
    output = output & "{" & Q & "type" & Q & ":" & Q & "continue" & Q & "," & Q & "instruction" & Q & ":" & Q & match.SubMatches(0) & Q & "," & Q & "distance" & Q & ":0}"
  Next
  ExtractRouteSteps = output & "]"
End Function

Function JsonNumberOrNull(value)
  If Len(value) = 0 Or Not IsNumeric(value) Then
    JsonNumberOrNull = "null"
  Else
    JsonNumberOrNull = JsonNumber(value)
  End If
End Function

Sub WriteOrsRoute(rawJson, travelMode)
  If InStr(1, Replace(rawJson, " ", ""), Q & "features" & Q & ":[]", vbTextCompare) > 0 Then WriteError "404 Not Found", "route_not_found", "No route was found between these locations."
  Dim geometryObject : geometryObject = ExtractObjectAfter(rawJson, Q & "geometry" & Q)
  Dim coordinates : coordinates = ExtractArrayAfter(geometryObject, Q & "coordinates" & Q)
  Dim summaryObject : summaryObject = ExtractObjectAfter(rawJson, Q & "summary" & Q)
  Dim distance : distance = ExtractNumber(summaryObject, "distance")
  Dim duration : duration = ExtractNumber(summaryObject, "duration")
  Dim steps : steps = ExtractRouteSteps(rawJson)
  If Len(coordinates) = 0 Or Len(distance) = 0 Or Len(duration) = 0 Then WriteError "502 Bad Gateway", "provider_invalid_response", "The routing provider returned an invalid response."
  Response.Status = "200 OK"
  Response.Write "{" & Q & "provider" & Q & ":" & Q & "ors" & Q & "," & Q & "mode" & Q & ":" & Q & travelMode & Q & "," & Q & "coordinateSystem" & Q & ":" & Q & "WGS84" & Q & "," & Q & "geometry" & Q & ":" & coordinates & "," & Q & "distance" & Q & ":" & distance & "," & Q & "duration" & Q & ":" & duration & "," & Q & "steps" & Q & ":" & steps & "," & Q & "costs" & Q & ":{" & Q & "available" & Q & ":false}}"
  Response.End
End Sub

Sub ProviderFailure(result)
  If result(2) Then WriteError "504 Gateway Timeout", "provider_timeout", "The routing provider did not respond in time."
  Dim compact : compact = Replace(Replace(Replace(Replace(result(1), " ", ""), vbCr, ""), vbLf, ""), vbTab, "")
  If InStr(1, compact, Q & "code" & Q & ":2009", vbTextCompare) > 0 Or InStr(1, compact, Q & "code" & Q & ":2016", vbTextCompare) > 0 Then WriteError "404 Not Found", "route_not_found", "No route was found between these locations."
  If result(0) = 429 Then
    Response.AddHeader "Retry-After", "5"
    WriteError "429 Too Many Requests", "provider_rate_limited", "The routing service is busy. Please try again later."
  End If
  WriteError "502 Bad Gateway", "provider_http_error", "The routing provider returned an error."
End Sub

Function AmapCityCode(location, apiKey)
  AmapCityCode = ""
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  http.setTimeouts 5000, 5000, 10000, 15000
  http.open "GET", "https://restapi.amap.com/v3/geocode/regeo?location=" & location & "&extensions=base&key=" & Server.URLEncode(apiKey), False
  http.send
  If Err.Number = 0 And http.status = 200 Then AmapCityCode = ExtractString(http.responseText, "citycode")
  Err.Clear
  On Error GoTo 0
End Function

Function RoutingSecret(name)
  RoutingSecret = EnvironmentValue(name)
  If Len(RoutingSecret) > 0 Then Exit Function
  If Len(RoutingConfigText) = 0 Then Exit Function
  Dim re : Set re = New RegExp
  re.Pattern = "(?:Const\s+)?" & name & "\s*=\s*" & Q & "([^" & Q & "]*)" & Q
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(RoutingConfigText)
  If matches.Count > 0 Then RoutingSecret = Trim(matches(0).SubMatches(0))
End Function

Function EnvironmentValue(name)
  EnvironmentValue = ""
  On Error Resume Next
  Dim shell : Set shell = Server.CreateObject("WScript.Shell")
  If Err.Number = 0 Then EnvironmentValue = Trim(CStr(shell.Environment("PROCESS")(name) & ""))
  If Len(EnvironmentValue) = 0 And Err.Number = 0 Then EnvironmentValue = Trim(CStr(shell.Environment("SYSTEM")(name) & ""))
  Err.Clear
  Set shell = Nothing
  On Error GoTo 0
End Function

Function ReadUtf8File(filePath)
  ReadUtf8File = ""
  On Error Resume Next
  Dim stream : Set stream = Server.CreateObject("ADODB.Stream")
  stream.Type = 2
  stream.Charset = "utf-8"
  stream.Open
  stream.LoadFromFile filePath
  If Err.Number = 0 Then ReadUtf8File = stream.ReadText
  If Not stream Is Nothing Then stream.Close
  Set stream = Nothing
  Err.Clear
  On Error GoTo 0
End Function

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
End Function

Function ExtractString(json, key)
  ExtractString = ""
  Dim re : Set re = New RegExp
  re.Pattern = Q & key & Q & "\s*:\s*" & Q & "([^" & Q & "]*)" & Q
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(json)
  If matches.Count > 0 Then ExtractString = matches(0).SubMatches(0)
End Function

Function ExtractPointNumber(json, objectName, key)
  ExtractPointNumber = Empty
  Dim re : Set re = New RegExp
  re.Pattern = Q & objectName & Q & "\s*:\s*\{[^\}]*" & Q & key & Q & "\s*:\s*(-?[0-9]+(?:\.[0-9]+)?)"
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(json)
  If matches.Count > 0 Then ExtractPointNumber = CDbl(matches(0).SubMatches(0))
End Function

Function ExtractObjectAfter(json, marker)
  ExtractObjectAfter = ExtractBalancedAfter(json, marker, "{", "}")
End Function

Function ExtractArrayAfter(json, marker)
  ExtractArrayAfter = ExtractBalancedAfter(json, marker, "[", "]")
End Function

Function ExtractBalancedAfter(json, marker, openChar, closeChar)
  ExtractBalancedAfter = ""
  Dim markerPosition : markerPosition = InStr(1, json, marker, vbTextCompare)
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
      If depth = 0 Then
        ExtractBalancedAfter = Mid(json, startPosition, index - startPosition + 1)
        Exit Function
      End If
    End If
  Next
End Function

Function ExtractNumber(json, key)
  ExtractNumber = ""
  Dim re : Set re = New RegExp
  re.Pattern = Q & key & Q & "\s*:\s*(-?[0-9]+(?:\.[0-9]+)?)"
  re.IgnoreCase = True
  Dim matches : Set matches = re.Execute(json)
  If matches.Count > 0 Then ExtractNumber = matches(0).SubMatches(0)
End Function

Function JsonValueEquals(json, key, expected)
  Dim re : Set re = New RegExp
  re.Pattern = Q & key & Q & "\s*:\s*" & Q & "?" & expected & Q & "?"
  re.IgnoreCase = True
  JsonValueEquals = re.Test(json)
End Function

Function ValidCoordinate(lat, lng)
  ValidCoordinate = False
  If IsEmpty(lat) Or IsEmpty(lng) Then Exit Function
  ValidCoordinate = IsNumeric(lat) And IsNumeric(lng) And Abs(CDbl(lat)) <= 90 And Abs(CDbl(lng)) <= 180
End Function

Function Coordinate(first, second)
  Coordinate = JsonNumber(first) & "," & JsonNumber(second)
End Function

Function JsonNumber(value)
  JsonNumber = Replace(CStr(CDbl(value)), ",", ".")
End Function

Sub BadRequest()
  WriteError "400 Bad Request", "invalid_request", "Invalid navigation request."
End Sub

Sub NotConfigured(serviceName)
  WriteError "503 Service Unavailable", "provider_not_configured", serviceName & " is not configured."
End Sub

Sub WriteError(httpStatus, code, message)
  Response.Status = httpStatus
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "code" & Q & ":" & Q & code & Q & "," & Q & "message" & Q & ":" & Q & message & Q & "}}"
  Response.End
End Sub
%>
