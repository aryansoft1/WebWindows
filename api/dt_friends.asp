<%@LANGUAGE="VBScript" CODEPAGE="65001" EnableSessionState=True %>
<%
Option Explicit
%>
<!--#include file="../inc/conn.asp"-->
<%
Response.CodePage = 65001
Response.Charset = "utf-8"
Response.ContentType = "application/json"
Response.CacheControl = "no-cache"
Dim meId, action, targetId, rs, ids, first
meId = Trim(CStr(Session("webwindows_user_id")))
If meId = "" Or Not IsNumeric(meId) Then
  Response.Status = "401 Unauthorized"
  Response.Write "{""ok"":false,""error"":""login_required""}"
  Response.End
End If
On Error Resume Next
conn.Execute "CREATE TABLE IF NOT EXISTS webwindows_desktalk_friends (user_id BIGINT UNSIGNED NOT NULL,friend_user_id BIGINT UNSIGNED NOT NULL,created_at DATETIME NOT NULL,PRIMARY KEY (user_id,friend_user_id),KEY idx_dt_friend_target (friend_user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
If Err.Number <> 0 Then
  Response.Status = "503 Service Unavailable"
  Response.Write "{""ok"":false,""error"":""friend_store_unavailable""}"
  Response.End
End If
action = LCase(Trim(Request("action")))
If action = "add" Or action = "remove" Then
  If UCase(Request.ServerVariables("REQUEST_METHOD")) <> "POST" Then
    Response.Status = "405 Method Not Allowed"
    Response.Write "{""ok"":false,""error"":""post_required""}"
    Response.End
  End If
  targetId = Trim(CStr(Request.Form("friendId")))
  If Not IsNumeric(targetId) Or CLng(targetId) = CLng(meId) Then
    Response.Status = "400 Bad Request"
    Response.Write "{""ok"":false,""error"":""invalid_friend_id""}"
    Response.End
  End If
  If action = "add" Then
    conn.Execute "INSERT IGNORE INTO webwindows_desktalk_friends (user_id,friend_user_id,created_at) VALUES (" & CLng(meId) & "," & CLng(targetId) & ",NOW())"
  Else
    conn.Execute "DELETE FROM webwindows_desktalk_friends WHERE user_id=" & CLng(meId) & " AND friend_user_id=" & CLng(targetId)
  End If
  If Err.Number <> 0 Then
    Err.Clear
    Response.Status = "503 Service Unavailable"
    Response.Write "{""ok"":false,""error"":""friend_store_unavailable""}"
  Else
    Response.Write "{""ok"":true}"
  End If
  Response.End
End If
Set rs = conn.Execute("SELECT friend_user_id FROM webwindows_desktalk_friends WHERE user_id=" & CLng(meId) & " ORDER BY created_at")
If Err.Number <> 0 Then
  Err.Clear
  Response.Status = "503 Service Unavailable"
  Response.Write "{""ok"":false,""error"":""friend_store_unavailable""}"
  Response.End
End If
ids = "" : first = True
Do Until rs.EOF
  If Not first Then ids = ids & ","
  ids = ids & """" & CStr(rs("friend_user_id")) & """"
  first = False
  rs.MoveNext
Loop
rs.Close
Response.Write "{""ok"":true,""friends"":[" & ids & "]}"
%>
