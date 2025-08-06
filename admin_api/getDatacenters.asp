<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.Charset = "utf-8"
Response.ContentType = "application/json"

If Err.Number <> 0 Then
    Response.Write "{""error"":""连接数据库失败：" & Replace(Err.Description, """", "'") & """}"
    Response.End
End If

sql = "SELECT * FROM webwindows_datacenters ORDER BY id ASC"
Set rs = conn.Execute(sql)

If Err.Number <> 0 Then
    If conn Is Nothing Then
        Response.Write "{""error"":""数据库连接对象 conn 缺失""}"
        Response.End
    End If
    Response.Write "{""error"":""SQL 查询失败：" & Replace(Err.Description, """", "'") & """}"
    Response.End
End If

Dim json : json = "["
Do Until rs.EOF
    Dim checkTime
    If IsNull(rs("last_check_time")) Then
        checkTime = ""
    Else
        checkTime = FormatDateTime(rs("last_check_time"), 1)
    End If

    json = json & "{"
    json = json & """id"":" & rs("id") & ","
    json = json & """name"":""" & Replace(rs("name"), """", "\""") & ""","
    json = json & """api_url"":""" & Replace(rs("api_url"), """", "\""") & ""","
    json = json & """api_key"":""" & Replace(rs("api_key"), """", "\""") & ""","
    json = json & """enabled"":" & LCase(CStr(rs("enabled"))) & ","
    json = json & """description"":""" & Replace(rs("description") & "", """", "\""") & ""","
    json = json & """last_check_time"":""" & Replace(checkTime, """", "\""") & ""","
    json = json & """status"":""" & Replace(rs("status") & "", """", "\""") & """"
    json = json & "},"
    rs.MoveNext
Loop

If Right(json, 1) = "," Then json = Left(json, Len(json) - 1)
json = json & "]"

rs.Close
Set rs = Nothing
conn.Close
Set conn = Nothing

Response.Write json
%>
