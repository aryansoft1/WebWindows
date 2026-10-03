<%
' Copy this file to visitor-analytics.config.asp on the server.
' The real config file is excluded from source control (.gitignore: api/*.config.asp)
' and produces no output.
'
' geoApiBase   HTTPS endpoint template(s). "{IP}" is replaced with the visitor address.
'              **多个端点用分号分隔，按顺序尝试，第一个解析成功即采用** ——
'              单个供应商可能因出口网络/限流而不可用，降级链能显著提高成功率。
'
'              这三个端点都经过实测（HTTPS、无需 key、对中国/美国/澳洲 IP 都能返回
'              国家代码 + 省市名），并且**都带 country_code** —— 世界地图按 ISO A2 代码
'              着色，缺代码的供应商（例如某些只给国名的）会让地图仍然无色：
'                ipwho.is     https://ipwho.is/{IP}?lang=zh-CN     中文省市名
'                ip.sb        https://api.ip.sb/geoip/{IP}          英文省市名，最快
'                freeipapi    https://freeipapi.com/api/json/{IP}   英文省市名
'
'              已实测**不可用**（2026-09-26 记录，别再写回来）：
'                restapi.ip-api.com  连接失败
'                ipapi.co/json/{IP}  路径错误返回 404 HTML；正确路径 /{IP}/json/ 很快限流
'                api.ipquery.io      字段结构不同，取不到国家
'                v2.api.iphub.info   需要 key
'
'              字段别名在服务端归一，换供应商只改这里、不改代码。
'              明文 http:// 端点一律拒绝：访客地址绝不离开服务器的加密通道。
' geoApiKey    Optional provider key. Empty for keyless free tiers.
' geoDailyCap  Hard ceiling of external lookups per day, kept under the provider's
'              free quota. Repeat visitors are served from the session table and
'              never consume budget.
geoApiBase = "https://ipwho.is/{IP}?lang=zh-CN;https://api.ip.sb/geoip/{IP};https://freeipapi.com/api/json/{IP}"
geoApiKey = ""
geoDailyCap = 800
%>
