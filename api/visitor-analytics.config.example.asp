<%
' Copy this file to visitor-analytics.config.asp on the server.
' The real config file is excluded from source control (.gitignore: api/*.config.asp)
' and produces no output.
'
' geoApiBase   HTTPS endpoint template(s). "{IP}" is replaced with the visitor address.
'              **多个端点用分号分隔，按顺序尝试，第一个解析成功即采用** ——
'              单个供应商可能因出口网络/限流而不可用，降级链能显著提高成功率。
'              Free tiers with HTTPS, no API key and city-level accuracy:
'                ipwho.is    https://ipwho.is/{IP}?lang=zh-CN
'                ip-api      https://restapi.ip-api.com/json/{IP}?lang=zh-CN
'                ipapi.co    https://ipapi.co/json/{IP}
'              Field aliases are normalised server-side, so other providers
'              only need the URL added here.
'              Plain http:// endpoints are rejected: visitor addresses must never
'              leave the server unencrypted.
' geoApiKey    Optional provider key. Empty for keyless free tiers.
' geoDailyCap  Hard ceiling of external lookups per day, kept under the provider's
'              free quota. Repeat visitors are served from the session table and
'              never consume budget.
geoApiBase = "https://ipwho.is/{IP}?lang=zh-CN;https://restapi.ip-api.com/json/{IP}?lang=zh-CN;https://ipapi.co/json/{IP}"
geoApiKey = ""
geoDailyCap = 800
%>
