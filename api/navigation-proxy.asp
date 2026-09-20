<%@ Language=VBScript EnableSessionState=False CodePage=65001 %>
<%
Option Explicit
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.CacheControl = "no-store"

Const MAX_REQUEST_BYTES = 16384
Dim Q : Q = Chr(34)

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
  ProxyGoogle mode, startLat, startLng, endLat, endLng
Else
  BadRequest
End If

Sub ProxyChina(travelMode, originLat, originLng, destinationLat, destinationLng)
  Dim amapKey : amapKey = EnvironmentValue("WEBWINDOWS_AMAP_KEY")
  Dim baiduKey : baiduKey = EnvironmentValue("WEBWINDOWS_BAIDU_MAP_AK")
  If Len(amapKey) > 0 Then
    ProxyAmap travelMode, originLat, originLng, destinationLat, destinationLng, amapKey
  ElseIf Len(baiduKey) > 0 Then
    ProxyBaidu travelMode, originLat, originLng, destinationLat, destinationLng, baiduKey
  Else
    NotConfigured "Mainland China routing"
  End If
End Sub

Sub ProxyAmap(travelMode, originLat, originLng, destinationLat, destinationLng, apiKey)
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
      If Len(city1) = 0 Or Len(city2) = 0 Then UpstreamFailure "Unable to resolve transit cities."
      extra = extra & "&city1=" & Server.URLEncode(city1) & "&city2=" & Server.URLEncode(city2)
  End Select
  Dim url : url = endpoint & "?origin=" & origin & "&destination=" & destination & "&key=" & Server.URLEncode(apiKey) & extra
  SendWrapped "GET", url, "", "amap", "GCJ02", "", ""
End Sub

Sub ProxyBaidu(travelMode, originLat, originLng, destinationLat, destinationLng, apiKey)
  Dim profile
  Select Case travelMode
    Case "driving" : profile = "driving"
    Case "walking" : profile = "walking"
    Case "cycling" : profile = "riding"
    Case "transit" : profile = "transit"
  End Select
  Dim url : url = "https://api.map.baidu.com/directionlite/v1/" & profile & _
    "?origin=" & Coordinate(originLat, originLng) & "&destination=" & Coordinate(destinationLat, destinationLng) & _
    "&coord_type=gcj02&ret_coordtype=gcj02&ak=" & Server.URLEncode(apiKey)
  SendWrapped "GET", url, "", "baidu", "GCJ02", "", ""
End Sub

Sub ProxyGoogle(travelMode, originLat, originLng, destinationLat, destinationLng)
  Dim apiKey : apiKey = EnvironmentValue("WEBWINDOWS_GOOGLE_ROUTES_API_KEY")
  If Len(apiKey) = 0 Then NotConfigured "Global routing"
  Dim googleMode
  Select Case travelMode
    Case "driving" : googleMode = "DRIVE"
    Case "walking" : googleMode = "WALK"
    Case "cycling" : googleMode = "BICYCLE"
    Case "transit" : googleMode = "TRANSIT"
  End Select
  Dim payload : payload = "{" & Q & "origin" & Q & ":{" & Q & "location" & Q & ":{" & Q & "latLng" & Q & ":{" & Q & "latitude" & Q & ":" & JsonNumber(originLat) & _
    "," & Q & "longitude" & Q & ":" & JsonNumber(originLng) & "}}}," & Q & "destination" & Q & ":{" & Q & "location" & Q & ":{" & Q & "latLng" & Q & ":{" & Q & "latitude" & Q & ":" & _
    JsonNumber(destinationLat) & "," & Q & "longitude" & Q & ":" & JsonNumber(destinationLng) & "}}}," & Q & "travelMode" & Q & ":" & Q & googleMode & Q & _
    "," & Q & "computeAlternativeRoutes" & Q & ":false," & Q & "languageCode" & Q & ":" & Q & "zh-CN" & Q & "," & Q & "units" & Q & ":" & Q & "METRIC" & Q & "}"
  Dim fieldMask : fieldMask = "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.distanceMeters,routes.legs.steps.navigationInstruction.instructions,routes.travelAdvisory.tollInfo.estimatedPrice,routes.localizedValues.transitFare"
  SendWrapped "POST", "https://routes.googleapis.com/directions/v2:computeRoutes", payload, "google", "WGS84", apiKey, fieldMask
End Sub

Sub SendWrapped(method, url, payload, providerName, coordinateSystem, apiKey, fieldMask)
  On Error Resume Next
  Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
  If Err.Number <> 0 Then
    Err.Clear
    Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
  End If
  If Err.Number <> 0 Then UpstreamFailure "Routing service is unavailable."
  http.setTimeouts 10000, 10000, 30000, 45000
  http.open method, url, False
  http.setRequestHeader "Accept", "application/json"
  If method = "POST" Then http.setRequestHeader "Content-Type", "application/json"
  If Len(apiKey) > 0 Then http.setRequestHeader "X-Goog-Api-Key", apiKey
  If Len(fieldMask) > 0 Then http.setRequestHeader "X-Goog-FieldMask", fieldMask
  http.send payload
  If Err.Number <> 0 Then UpstreamFailure "Routing provider request failed."
  Dim status : status = http.status
  If status = 429 Then
    Response.Status = "429 Too Many Requests"
    Response.AddHeader "Retry-After", "5"
    Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & "Routing service is busy." & Q & "}}"
    Response.End
  End If
  If status < 200 Or status >= 300 Then UpstreamFailure "Routing provider returned an error."
  Response.Status = "200 OK"
  Response.Write "{" & Q & "provider" & Q & ":" & Q & providerName & Q & "," & Q & "coordinateSystem" & Q & ":" & Q & coordinateSystem & Q & "," & Q & "raw" & Q & ":" & http.responseText & "}"
  Response.End
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

Function EnvironmentValue(name)
  EnvironmentValue = ""
  On Error Resume Next
  Dim shell : Set shell = Server.CreateObject("WScript.Shell")
  EnvironmentValue = Trim(shell.Environment("PROCESS")(name) & "")
  If Len(EnvironmentValue) = 0 Then EnvironmentValue = Trim(shell.Environment("SYSTEM")(name) & "")
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
  Response.Status = "400 Bad Request"
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & "Invalid navigation request." & Q & "}}"
  Response.End
End Sub

Sub NotConfigured(serviceName)
  Response.Status = "503 Service Unavailable"
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & serviceName & " is not configured." & Q & "}}"
  Response.End
End Sub

Sub UpstreamFailure(message)
  Err.Clear
  On Error GoTo 0
  Response.Status = "502 Bad Gateway"
  Response.Write "{" & Q & "error" & Q & ":{" & Q & "message" & Q & ":" & Q & message & Q & "}}"
  Response.End
End Sub
%>
