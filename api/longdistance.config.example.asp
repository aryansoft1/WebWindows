<%
' Copy this file to longdistance.config.asp on the server and set the key.
' The real config file is excluded from source control and produces no output.
'
' Global long-distance transit source (shinkansen / ICE / long-distance coach).
' Until this file exists with a key, api/longdistance-proxy.asp reports
' enabled=false and the client never calls it.
'
' Obtain a key from the Rome2Rio team (paid, no public trial).
' After the key is in place, run the self-test first:
'   /api/longdistance-proxy.asp?action=selftest
' It reports whether Shinkansen is covered and whether the response shape
' matches what the client parser expects. It never returns the key.
longDistanceApiKey = ""

' Optional. Must be an https://rome2rio.com/... URL; anything else is ignored.
' longDistanceBase = "https://rome2rio.com/api/1.4/json"
%>
