<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.Charset = "utf-8"
Response.ContentType = "application/json"

Dim schemaRs, hasQuotaColumn
hasQuotaColumn = False
Set schemaRs = Nothing
On Error Resume Next
Set schemaRs = conn.Execute("SHOW COLUMNS FROM webwindows_datacenters LIKE 'user_quota_mb'")
If Err.Number = 0 Then
    If Not schemaRs.EOF Then hasQuotaColumn = True
End If
If Not schemaRs Is Nothing Then schemaRs.Close
Set schemaRs = Nothing
Err.Clear
On Error GoTo 0

If hasQuotaColumn Then
    sql = "SELECT id,name,api_url,enabled,description,last_check_time,status,user_quota_mb " & _
          "FROM webwindows_datacenters ORDER BY id ASC"
Else
    ' Pre-migration databases keep the historical per-user 1 GB allocation.
    sql = "SELECT id,name,api_url,enabled,description,last_check_time,status,1024 AS user_quota_mb " & _
          "FROM webwindows_datacenters ORDER BY id ASC"
End If
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
    json = json & """enabled"":" & LCase(CStr(rs("enabled"))) & ","
    json = json & """description"":""" & Replace(rs("description") & "", """", "\""") & ""","
    json = json & """last_check_time"":""" & Replace(checkTime, """", "\""") & ""","
    json = json & """status"":""" & Replace(rs("status") & "", """", "\""") & """," & _
                """user_quota_mb"":" & CLng(rs("user_quota_mb"))
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
