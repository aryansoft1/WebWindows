<%@ Language=VBScript EnableSessionState=False CodePage=65001%>
<%
Option Explicit
Response.ContentType = "application/json"

Dim cityName, lang, apiUrl, xmlHttp, responseText

' 获取查询参数
cityName = Request.QueryString("city")
If cityName = "" Then cityName = "Chengdu" ' 默认查询成都

' 动态设置语言（优先从查询参数获取，否则默认中文）
lang = Request.QueryString("lang")
If lang = "" Then lang = "zh" ' 默认中文

' 构建 Geonames API 请求 URL
apiUrl = "http://api.geonames.org/searchJSON?q=" & Server.URLEncode(cityName) & "&maxRows=1&lang=" & lang & "&username=aryansoft"

' 创建 HTTP 请求对象
Set xmlHttp = Server.CreateObject("MSXML2.XMLHTTP")
xmlHttp.Open "GET", apiUrl, False
xmlHttp.Send

' 返回 Geonames API 的响应
responseText = xmlHttp.responseText
Response.Write responseText

' 清理对象
Set xmlHttp = Nothing
%>
