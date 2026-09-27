<%
' JSON 响应的字符集协商。
'
' 生产事故：后台分类名显示成「雄啰嗦」「绯荤粺鏇存柊」，而诊断接口给出的
' HEX(name) 是 E585ACE5918A —— 那是「公告」的合法 UTF-8 编码。数据库里存的是
' 正确数据，损坏发生在取数到显示之间：MySQL 连接没有声明 utf8mb4，驱动按服务器
' 默认码页（中文 Windows 上是 936）把 UTF-8 字节当成 GBK 交回给 VBScript。
'
' 只设 Response.Charset 不够：它只影响 HTML 之外的默认推断，对
' application/json 不可靠，而且无论如何也改变不了驱动已经误解码的字节。
' 必须两件事一起做：
'   1. SET NAMES utf8mb4 —— 告诉 MySQL 客户端按 utf8mb4 解释结果集；
'   2. 显式写出 charset=utf-8 的 Content-Type —— 让浏览器按 UTF-8 解析。
'
' 放在共享 include 里而不是每个接口各写一遍：漏掉一个接口就会复现同样的乱码，
' 而这种缺陷从代码上看不出来，只能靠线上字节验证。
'
' fail-open：任何一步失败都不阻断响应。字符集没配好最多是显示乱码，
' 不该让整个接口 500。
'
' 但 fail-open 不能把失败本身也吞掉。原实现只有 On Error Resume Next 加
' Err.Clear，于是「SET NAMES utf8mb4」失败和成功走的是同一条路：响应头照样
' 带上 charset=utf-8，浏览器照样按 UTF-8 解析，而驱动仍然按服务器默认码页
' （中文主机是 936）交回字节。症状就是「加了字符集协商还是乱码」，而且从
' 响应头完全看不出来 —— 这正是上一轮误判成「数据库里存的就是乱码」的原因。
'
' 所以把结果记在全局变量里，成功失败都留痕，供诊断接口读出来。
' MySQL 早于 5.5.3 不支持 utf8mb4，那一句会直接报错而不是静默降级。
Dim jsonCharsetError, jsonCharsetApplied
jsonCharsetError = ""
jsonCharsetApplied = False
On Error Resume Next
If IsObject(conn) Then
  If conn.State <> 0 Then
    conn.Execute("SET NAMES utf8mb4")
    If Err.Number <> 0 Then
      jsonCharsetError = CStr(Err.Number) & ": " & CStr(Err.Description)
      Err.Clear
    Else
      jsonCharsetApplied = True
    End If
  Else
    jsonCharsetError = "connection is closed"
  End If
Else
  jsonCharsetError = "no connection object"
End If
Err.Clear
On Error GoTo 0
Response.ContentType = "application/json; charset=utf-8"
Response.Charset = "utf-8"
%>
