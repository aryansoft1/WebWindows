<%
On Error Resume Next
Dim conn, connStr
' conn.asp - 用于数据库连接
Set conn = Server.CreateObject("ADODB.Connection")
'connStr = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" & Server.MapPath("data/webwindows_admin.mdb")
' 或改为 MySQL 连接字符串：
'（服务器运行）
connStr = "Driver={MySQL ODBC 5.1 Driver};Server=localhost;Port=3306;Database=aryansoft1;Uid=aryansoft1;Pwd=3270359;Option=3;CHARSET=utf8mb4"

'（本地测试）
'connStr = "Driver={MySQL ODBC 5.1 Driver};Server=sql.b73.vhostgo.com;Port=3306;Database=aryansoft1;Uid=aryansoft1;Pwd=3270359;Option=3;CHARSET=utf8mb4"

conn.Open connStr
If Err.Number <> 0 Then
  Response.Write "{""error"":""数据库连接失败：&quot;" & Err.Description & "&quot;""}"
  Response.End
End If
%>
