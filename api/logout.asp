<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<%
Response.ContentType = "application/json"
Response.CodePage = 65001
Response.CacheControl = "no-store"

Session.Abandon

Response.Cookies("webwindows_user") = ""
Response.Cookies("webwindows_user").Path = "/"
Response.Cookies("webwindows_user").Expires = DateAdd("d", -1, Now())
Response.Cookies("webwindows_user_nickname") = ""
Response.Cookies("webwindows_user_nickname").Path = "/"
Response.Cookies("webwindows_user_nickname").Expires = DateAdd("d", -1, Now())

Response.Write "{""success"":true}"
%>
