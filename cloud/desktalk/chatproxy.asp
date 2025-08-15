<%@LANGUAGE="VBScript" CODEPAGE="65001"%>
<%
Option Explicit
Response.Charset = "utf-8"
Response.ContentType = "application/json; charset=utf-8"

' === 配置（按你的供应商文档替换） ===
Dim API_URL : API_URL = "https://api.hunyuan.cloud.tencent.com/v1/chat/completions" ' ← 改成混元兼容入口
Dim API_KEY : API_KEY = GetEnv("HUNYUAN_API_KEY")
If Len(API_KEY)=0 Then API_KEY = "sk-G8bffc2si0TGqJlXYEwxr6hZuvZEqgV3hGJihXmC3dTt9VGx" ' 测试用，务必换掉

' === 读取前端 JSON 原样转发 ===
Dim body, bytes
bytes = Request.TotalBytes
If bytes > 0 Then
  body = Request.BinaryRead(bytes)
Else
  body = "{}"
End If

On Error Resume Next
Dim http : Set http = Server.CreateObject("MSXML2.ServerXMLHTTP.6.0")
If Err.Number <> 0 Then
  Err.Clear
  Set http = Server.CreateObject("MSXML2.ServerXMLHTTP")
End If

http.open "POST", API_URL, False
http.setRequestHeader "Content-Type","application/json"
http.setRequestHeader "Authorization","Bearer " & API_KEY
http.send body

If Err.Number <> 0 Then
  Response.Status = "500 Internal Server Error"
  Response.Write("{""error"":""" & Safe(Err.Description) & """}")
  Response.End
End If

Response.StatusCode = http.status
Response.Write http.responseText

' === helpers ===
Function Safe(s) Safe = Replace(Replace(s, "\", "\\"), """", "\""") End Function
Function GetEnv(n)
  On Error Resume Next
  Dim v : v = Environ(n)
  If Len(v)=0 Then v = Request.ServerVariables(n)
  GetEnv = v
End Function
%>
