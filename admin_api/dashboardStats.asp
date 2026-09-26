<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
Response.CodePage = 65001
AdminSecurityRequireRead "system-manager", "dashboard-stats"

Function CountFiles(ByVal folder)
  Dim item, child, total
  total = 0
  For Each item In folder.Files
    If LCase(item.Name) <> ".gitkeep" Then total = total + 1
  Next
  For Each child In folder.SubFolders
    total = total + CountFiles(child)
  Next
  CountFiles = total
End Function

Dim usersRs, feedbackRs, centerRs, activityRs, fso, rootPath, fileCount
Dim fileKnown, cacheTime, activityJson, tipsJson, enabledCount, disabledCount, unhealthyCount
Set usersRs = conn.Execute("SELECT COUNT(*) AS total FROM webwindows_users WHERE username<>'admin'")
Set feedbackRs = conn.Execute("SELECT COUNT(*) AS pending FROM webwindows_feedback WHERE status='pending'")
Set centerRs = conn.Execute("SELECT COALESCE(SUM(enabled=1),0) AS enabled_count," & _
  "COALESCE(SUM(enabled=0),0) AS disabled_count," & _
  "COALESCE(SUM(enabled=1 AND status='异常'),0) AS unhealthy_count FROM webwindows_datacenters")
enabledCount = CLng(centerRs("enabled_count"))
disabledCount = CLng(centerRs("disabled_count"))
unhealthyCount = CLng(centerRs("unhealthy_count"))
fileKnown = False
fileCount = 0
cacheTime = Application("webwindows_admin_file_count_at")
If IsDate(cacheTime) Then
  If DateDiff("n", CDate(cacheTime), Now()) < 5 Then
    fileCount = CLng(Application("webwindows_admin_file_count"))
    fileKnown = True
  End If
End If
If Not fileKnown Then
  rootPath = Server.MapPath("../file")
  Set fso = Server.CreateObject("Scripting.FileSystemObject")
  If fso.FolderExists(rootPath) Then
    On Error Resume Next
    fileCount = CountFiles(fso.GetFolder(rootPath))
    If Err.Number = 0 Then
      fileKnown = True
      Application.Lock
      Application("webwindows_admin_file_count") = fileCount
      Application("webwindows_admin_file_count_at") = Now()
      Application.Unlock
    End If
    Err.Clear
    On Error GoTo 0
  End If
  Set fso = Nothing
End If
Set activityRs = conn.Execute("SELECT action_name,result_name," & _
  "DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at " & _
  "FROM webwindows_admin_audit ORDER BY id DESC LIMIT 8")
activityJson = "["
Do Until activityRs.EOF
  If Len(activityJson) > 1 Then activityJson = activityJson & ","
  activityJson = activityJson & "{""action"":""" & AdminSecurityJson(activityRs("action_name")) & _
    """,""result"":""" & AdminSecurityJson(activityRs("result_name")) & _
    """,""time"":""" & AdminSecurityJson(activityRs("created_at")) & """}"
  activityRs.MoveNext
Loop
activityRs.Close
activityJson = activityJson & "]"
tipsJson = "[]"
If unhealthyCount > 0 Then
  tipsJson = "[""有 " & unhealthyCount & " 个启用中的数据中心最近检测异常，请查看数据中心页面。""]"
End If
Dim filesJson
filesJson = "null"
If fileKnown Then filesJson = CStr(fileCount)
Response.Write "{""usersTotal"":" & CLng(usersRs("total")) & _
  ",""filesTotal"":" & filesJson & _
  ",""feedbackPending"":" & CLng(feedbackRs("pending")) & _
  ",""datacenters"":{""enabled"":" & enabledCount & _
  ",""disabled"":" & disabledCount & ",""unhealthy"":" & unhealthyCount & "}," & _
  """recentActivities"":" & activityJson & ",""systemTips"":" & tipsJson & "}"
usersRs.Close
feedbackRs.Close
centerRs.Close
%>
