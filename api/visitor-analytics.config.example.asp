<%
' Copy this file to visitor-analytics.config.asp on the server.
' The real config file is excluded from source control (.gitignore: api/*.config.asp)
' and produces no output.
'
' geoApiBase   HTTPS endpoint template. "{IP}" is replaced with the visitor address.
'              Free tiers with HTTPS, no API key and city-level accuracy:
'                ipwho.is  https://ipwho.is/{IP}?lang=zh-CN   (1,000 requests/day/client IP)
'                db-ip     https://api.db-ip.com/v2/free/{IP}
'              Field aliases are normalised server-side, so other providers
'              (ipapi.co and similar) only need the URL changed here.
'              Plain http:// endpoints are rejected: visitor addresses must never
'              leave the server unencrypted.
' geoApiKey    Optional provider key. Empty for keyless free tiers.
' geoDailyCap  Hard ceiling of external lookups per day, kept under the provider's
'              free quota. Repeat visitors are served from the session table and
'              never consume budget.
geoApiBase = "https://ipwho.is/{IP}?lang=zh-CN"
geoApiKey = ""
geoDailyCap = 800
%>
