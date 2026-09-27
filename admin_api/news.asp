<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<!--#include file="../inc/json-charset.asp"-->
<!--#include file="../inc/admin-security.asp"-->
<%
Response.CodePage = 65001
Function NewsJsonString(ByVal value)
  NewsJsonString = Chr(34) & AdminSecurityJson(value) & Chr(34)
End Function
Dim action, method, cmd, rs, json, idText, newsId, affected
action = LCase(Trim(CStr(Request("action"))))
method = UCase(CStr(Request.ServerVariables("REQUEST_METHOD")))
If method = "GET" Then
  AdminSecurityRequireRead "system-manager", "news-" & action
Else
  AdminSecurityRequireMutation "system-manager", "news-" & action
  If Not jsonCharsetApplied Then
    AdminSecurityFail 503, "DB_CHARSET_UNAVAILABLE", "数据库字符集不可用，未保存更改。", "valid", "same-origin"
  End If
  Set rs = conn.Execute("SELECT COUNT(*) AS ready FROM information_schema.COLUMNS " & _
    "WHERE TABLE_SCHEMA=DATABASE() AND (" & _
    "(TABLE_NAME='webwindows_news_categories' AND COLUMN_NAME='name' AND CHARACTER_SET_NAME='utf8mb4') OR " & _
    "(TABLE_NAME='webwindows_news' AND COLUMN_NAME='category' AND CHARACTER_SET_NAME IN ('utf8','utf8mb3','utf8mb4')))")
  If CLng(rs("ready")) <> 2 Then
    rs.Close
    AdminSecurityFail 503, "NEWS_SCHEMA_CHARSET_REQUIRED", "新闻分类数据库字符集不符合要求，未保存更改。", "valid", "same-origin"
  End If
  rs.Close
  Set rs = Nothing
End If

' 列表接口过去一旦出错，返回的是 ASP 默认的 HTML 错误页：前端 JSON.parse 直接
' 抛异常，管理员只看到「HTTP 500」，而如果错误被静默吞掉就会变成一个空的 []，
' 和「真的没有新闻」长得一模一样。现在查询失败时返回可解析的 JSON 错误，并带上
' COUNT(*) 作为对照，让行数与返回条数不再可能各说各话。
' content/category 等列一律 IFNULL 后再交给 JSON 拼接：这些列在库里是 NULL，
' 而驱动可能把它交给 VBScript 的 DBNull —— IsNull(DBNull) 是 False，
' CStr(DBNull) 却抛「无效使用 Null」，只靠 IsNull 判断挡不住。
If action = "list" And method = "GET" Then
  Dim listRs, countRs, rowTotal, queryError
  queryError = ""
  rowTotal = -1
  On Error Resume Next
  Set countRs = conn.Execute("SELECT COUNT(*) AS total FROM webwindows_news")
  If Err.Number = 0 Then
    rowTotal = CLng(countRs("total"))
  Else
    Err.Clear
  End If
  If IsObject(countRs) Then
    countRs.Close
    Set countRs = Nothing
  End If
  ' 别名取 publish_label 而不是 publish_at：结果集里出现一个和真实列同名的
  ' 输出列，ADO 按名字取值时永远是个需要额外提防的坑。JSON 里的键仍然是
  ' publish_at，接口契约不变。
  ' 真正让这个接口 500 的是 AdminSecurityJson 里的 CStr：SQL 层已经 IFNULL
  ' 过了，值仍会变成 IsNull 判不出、CStr 会抛的形态，所以助手改成尝试转换。
  Set listRs = conn.Execute("SELECT id,IFNULL(title,'') AS title," & _
    "IFNULL(category,'') AS category,IFNULL(content,'') AS content," & _
    "IFNULL(DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i'),'') AS publish_label " & _
    "FROM webwindows_news ORDER BY COALESCE(publish_at,created_at) DESC,id DESC LIMIT 500")
  If Err.Number <> 0 Then
    queryError = "Err " & CStr(Err.Number) & ": " & CStr(Err.Description)
    Err.Clear
  End If
  On Error GoTo 0
  If queryError <> "" Then
    AdminSecurityAudit "news-list", "failed", "valid", AdminSecurityOriginCategory()
    Response.Status = "500 Internal Server Error"
    Response.Write "{""ok"":false,""success"":false,""code"":""NEWS_LIST_FAILED""," & _
      """message"":""读取新闻列表失败。"",""error"":""" & AdminSecurityJson(queryError) & """," & _
      """diagnostics"":{""rowCount"":" & CStr(rowTotal) & "}}"
    Response.End
  End If
  json = "["
  Do Until listRs.EOF
    If Len(json) > 1 Then json = json & ","
    json = json & "{""id"":" & CLng(listRs("id")) & _
      ",""title"":""" & AdminSecurityJson(listRs("title")) & _
      """,""category"":""" & AdminSecurityJson(listRs("category")) & _
      """,""content"":""" & AdminSecurityJson(listRs("content")) & _
      """,""publish_at"":""" & AdminSecurityJson(listRs("publish_label")) & """}"
    listRs.MoveNext
  Loop
  listRs.Close
  Set listRs = Nothing
  Response.Write json
  Response.Write "]"
  Response.End
End If

' 分类列表带上「有多少条新闻在用」。分类名和新闻里的 category 字段是
' 两份独立数据，历史上一旦不同步，筛选下拉里就只剩没人用的分类，
' 界面看起来像“没有新闻”，实际是筛选项和新闻对不上。
If action = "categories" And method = "GET" Then
  ' 生产数据库中 news.category 是 utf8，分类表 name 是 utf8mb4；旧 ADO 驱动只把
  ' 后者解码成乱码。读取时投影到 utf8，与已正常显示的新闻分类使用同一种列编码。
  Set rs = conn.Execute("SELECT c.id,IFNULL(CONVERT(c.name USING utf8),'') AS name," & _
    "COALESCE(n.uses_count,0) AS uses_count FROM webwindows_news_categories c " & _
    "LEFT JOIN (SELECT category,COUNT(*) AS uses_count FROM webwindows_news " & _
    "WHERE category IS NOT NULL AND TRIM(category)<>'' GROUP BY category) n " & _
    "ON n.category=c.name ORDER BY c.name ASC")
  json = "["
  Do Until rs.EOF
    If Len(json) > 1 Then json = json & ","
    json = json & "{""id"":" & CLng(rs("id")) & _
      ",""name"":""" & AdminSecurityJson(rs("name")) & """" & _
      ",""newsCount"":" & CLng(rs("uses_count")) & "}"
    rs.MoveNext
  Loop
  rs.Close
  Set rs = Nothing
  Response.Write json
  Response.Write "]"
  Response.End
End If

' 只读诊断：把分类表与新闻表按分类名对齐的真实行全部列出来，含发布时间是否已到。
'
' 分类乱码是**读取**环节的问题，不是库里存了乱码。判定依据是 name_hex：
' HEX() 由 MySQL 服务端计算，不经过驱动解码，所以它给出的是库里真实的字节。
' 「鍏憡」正是 E585ACE5918A（=「公告」的合法 UTF-8）被按 GBK 读出来的结果，
' 「绯荤粺鏇存柊」正是「系统更新」的 UTF-8 被按 GBK 读出来的结果。两条都能
' 逐字节对上，所以数据是对的，坏在驱动交回给 VBScript 的那一步。
'
' 上一轮把页面上显示的乱码当成存储字面值，据此写了改名修复，方向反了：驱动只
' 误读、从不重编码，显示值不是存储值。那个修复已撤销。
'
' 因此这里额外报告连接字符集和列字符集：只有 @@character_set_results 真的是
' utf8mb4，驱动才会把结果集按 UTF-8 解释。响应头带 charset=utf-8 并不能说明
' 这一件事 —— 上一轮就是这样误判的。
If action = "diagnose" And method = "GET" Then
  Dim diagRs, diagJson, diagRow
  Dim csRs, csJson, appliedJson, csRead
  ' 注意：这里刻意不把单引号写进 VBScript 字符串字面量。VBScript 用两个单引号
  ' 表示字符串里的一个单引号，但拼 JSON 时连续引号会被解析成两段，marker 永远
  ' 匹配不到；直接内联 COALESCE(...,'') 拼进 SQL 更稳。
  ' news_total 用 COALESCE 包一层：空集下相关子查询在部分 MySQL 配置上返回 NULL，
  ' 而 CLng(NULL) 会抛错，那正是这个接口要避免的那类失败。
  ' 名字里的控制字符会让这份 JSON 无法解析（前端报 "Expected ',' or '}' after
  ' array element"），而 AdminSecurityJson 现在会转义它们，所以这里给的是转义后
  ' 的值：诊断要能显示「真实存了什么」，又不能自己把响应写坏。
  Set diagRs = conn.Execute("SELECT c.id AS category_id,CONVERT(c.name USING utf8) AS category_name," & _
    "COALESCE(CHAR_LENGTH(c.name),0) AS name_chars," & _
    "COALESCE(HEX(c.name),'') AS name_hex," & _
    "COALESCE((SELECT COUNT(*) FROM webwindows_news n WHERE n.category=c.name),0) AS news_total," & _
    "COALESCE((SELECT COUNT(*) FROM webwindows_news n WHERE n.category=c.name " & _
    " AND COALESCE(n.publish_at,n.created_at)<=NOW()),0) AS news_published," & _
    "(SELECT MIN(DATE_FORMAT(COALESCE(n.publish_at,n.created_at),'%Y-%m-%d %H:%i')) " & _
    " FROM webwindows_news n WHERE n.category=c.name) AS earliest " & _
    "FROM webwindows_news_categories c ORDER BY c.name ASC")
  diagJson = "["
  Do Until diagRs.EOF
    If Len(diagJson) > 1 Then diagJson = diagJson & ","
    diagJson = diagJson & "{""categoryId"":" & CLng(diagRs("category_id")) & _
      ",""name"":""" & AdminSecurityJson(diagRs("category_name")) & """" & _
      ",""nameChars"":" & CLng(diagRs("name_chars")) & _
      ",""nameHex"":""" & AdminSecurityJson(diagRs("name_hex")) & """" & _
      ",""newsTotal"":" & CLng(diagRs("news_total")) & _
      ",""newsPublished"":" & CLng(diagRs("news_published")) & _
      ",""earliest"":""" & AdminSecurityJson(diagRs("earliest")) & """}"
    diagRs.MoveNext
  Loop
  diagRs.Close
  Set diagRs = Nothing
  diagJson = diagJson & "]"
  Dim newsRs, newsJson
  Set newsRs = conn.Execute("SELECT id,IFNULL(title,'') AS title," & _
    "IFNULL(category,'') AS category," & _
    "IFNULL(DATE_FORMAT(COALESCE(publish_at,created_at),'%Y-%m-%d %H:%i'),'') AS publish_label," & _
    "IF(COALESCE(publish_at,created_at)<=NOW(),1,0) AS is_published," & _
    "IFNULL(CHAR_LENGTH(content),0) AS content_chars " & _
    "FROM webwindows_news ORDER BY id ASC LIMIT 200")
  newsJson = "["
  Do Until newsRs.EOF
    If Len(newsJson) > 1 Then newsJson = newsJson & ","
    newsJson = newsJson & "{""id"":" & CLng(newsRs("id")) & _
      ",""title"":""" & AdminSecurityJson(newsRs("title")) & """" & _
      ",""category"":""" & AdminSecurityJson(newsRs("category")) & """" & _
      ",""publishAt"":""" & AdminSecurityJson(newsRs("publish_label")) & """" & _
      ",""published"":" & CLng(newsRs("is_published")) & _
      ",""contentChars"":" & CLng(newsRs("content_chars")) & "}"
    newsRs.MoveNext
  Loop
  newsRs.Close
  Set newsRs = Nothing

  ' 连接与列的字符集。@@character_set_results 决定驱动怎么解释结果集字节，
  ' 它不是 utf8mb4 就一定会乱码，哪怕响应头已经写了 charset=utf-8。
  ' jsonCharsetError 是 include 里 SET NAMES 的实际结果，失败原因就在里面
  ' （最常见的是 MySQL 早于 5.5.3，不支持 utf8mb4）。
  ' 这里刻意不用 IIf，也不靠 CStr(CBool(...))。IIf 在部分主机的 VBScript 里根本
  ' 不存在（Option Explicit 下报「变量未定义」），而 CStr(CBool(True)) 产出的是
  ' "True"，JSON.parse 只认小写的 true。这类诊断代码一抛错就什么都读不到，
  ' 所以只用最基础的分支和字面量。
  '
  ' 另外每个键都写成 "值" 形式而不是 "值": 键名后面不接引号，四个连续引号就
  ' 不可能出现。上一版在 readError 分支里漏了收尾的 }，产出的 JSON 解析不了 ——
  ' 而这正是这个接口存在的意义：它坏掉时管理员什么都看不到。
  If jsonCharsetApplied Then
    appliedJson = "true"
  Else
    appliedJson = "false"
  End If
  csJson = "{""applied"":" & appliedJson & _
    ",""error"":" & NewsJsonString(jsonCharsetError)

  ' csRead 累积附加字段，最后统一收口。这样任何一条错误分支都不会漏花括号。
  csRead = ""
  On Error Resume Next
  Set csRs = conn.Execute("SELECT @@character_set_client AS cs_client," & _
    "@@character_set_connection AS cs_conn," & _
    "@@character_set_results AS cs_results," & _
    "@@character_set_database AS cs_db," & _
    "VERSION() AS version," & _
    "DEFAULT_CHARACTER_SET_NAME AS cs_default " & _
    "FROM information_schema.SCHEMATA WHERE SCHEMA_NAME=DATABASE()")
  If Err.Number <> 0 Then
    csRead = ",""readError"":" & NewsJsonString(CStr(Err.Description))
    Err.Clear
  ElseIf IsObject(csRs) Then
    If Not csRs.EOF Then
      csRead = ",""client"":" & NewsJsonString(csRs("cs_client")) & _
        ",""connection"":" & NewsJsonString(csRs("cs_conn")) & _
        ",""results"":" & NewsJsonString(csRs("cs_results")) & _
        ",""database"":" & NewsJsonString(csRs("cs_db")) & _
        ",""serverVersion"":" & NewsJsonString(csRs("version")) & _
        ",""serverDefaultCharset"":" & NewsJsonString(csRs("cs_default"))
    Else
      csRead = ",""readError"":" & NewsJsonString("no schema row")
    End If
    csRs.Close
    Set csRs = Nothing
  End If
  Err.Clear
  On Error GoTo 0
  csJson = csJson & csRead & "}"

  ' 列字符集。连接字符集正确却仍然乱码时，唯一剩下的解释就是某一列自身的
  ' 字符集声明与实际存储字节不一致：HEX() 按原始字节返回所以看着正常，驱动
  ' 按列字符集转换之后才变成乱码。webwindows_news.category 显示正常而
  ' webwindows_news_categories.name 乱码，正是这个形状。两张表的列必须一起看，
  ' 只看其中一张会得出「连接坏了」的错误结论。
  ' 和 csJson 同样的收口方式：错误分支只填内容，方括号统一在最后加。否则
  ' readError 分支自己写了一对方括号，收尾再补一次就成了 [[...]]。
  Dim colRs, colJson, colCount, colRead
  colRead = ""
  On Error Resume Next
  Set colRs = conn.Execute("SELECT TABLE_NAME AS t,COLUMN_NAME AS c," & _
    "COALESCE(CHARACTER_SET_NAME,'') AS cs,COALESCE(COLLATION_NAME,'') AS co," & _
    "COALESCE(DATA_TYPE,'') AS dt " & _
    "FROM information_schema.COLUMNS " & _
    "WHERE TABLE_SCHEMA=DATABASE() AND (" & _
    "(TABLE_NAME='webwindows_news_categories' AND COLUMN_NAME='name') " & _
    "OR (TABLE_NAME='webwindows_news' AND COLUMN_NAME='category')) " & _
    "ORDER BY TABLE_NAME ASC")
  If Err.Number <> 0 Then
    colRead = "{""readError"":" & NewsJsonString(CStr(Err.Description)) & "}"
    Err.Clear
  ElseIf IsObject(colRs) Then
    ' 用计数而不是长度判断是否要补逗号：长度判断在第一行时恰好成立、第二行
    ' 时也成立，但一旦首行走的是 readError 分支就全乱。
    colCount = 0
    Do Until colRs.EOF
      If colCount > 0 Then colRead = colRead & ","
      colCount = colCount + 1
      colRead = colRead & "{""table"":" & NewsJsonString(colRs("t")) & _
        ",""column"":" & NewsJsonString(colRs("c")) & _
        ",""charset"":" & NewsJsonString(colRs("cs")) & _
        ",""collation"":" & NewsJsonString(colRs("co")) & _
        ",""type"":" & NewsJsonString(colRs("dt")) & "}"
      colRs.MoveNext
    Loop
    colRs.Close
    Set colRs = Nothing
  End If
  Err.Clear
  On Error GoTo 0
  colJson = "[" & colRead & "]"

  AdminSecurityAudit "news-diagnose", "success", "not-needed", AdminSecurityOriginCategory()
  Response.Write "{""categories"":" & diagJson & ",""news"":" & newsJson & _
    ",""connection"":" & csJson & ",""columns"":" & colJson & "}"
  Response.End
End If

' 幂等修复：把新闻里已经出现、但分类表里没有的分类补进来。
' 只新增，不改写也不删除管理员已经命名的分类。
If action = "reconcile-categories" And method = "POST" Then
  Dim beforeRs, afterRs, beforeCount, afterCount
  Set beforeRs = conn.Execute("SELECT COUNT(*) AS total FROM webwindows_news_categories")
  beforeCount = CLng(beforeRs("total"))
  beforeRs.Close
  Set beforeRs = Nothing
  renameError = ""
  On Error Resume Next
  conn.BeginTrans
  If Err.Number <> 0 Then renameError = CStr(Err.Number)
  Err.Clear
  On Error GoTo 0
  If renameError <> "" Then
    AdminSecurityFail 503, "NEWS_TRANSACTION_UNAVAILABLE", "数据库事务不可用，未保存更改。", "valid", "same-origin"
  End If
  On Error Resume Next
  conn.Execute("INSERT IGNORE INTO webwindows_news_categories(name) " & _
    "SELECT DISTINCT category FROM webwindows_news " & _
    "WHERE category IS NOT NULL AND TRIM(category)<>''")
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    conn.RollbackTrans
    AdminSecurityFail 500, "CATEGORY_RECONCILE_FAILED", "分类补齐失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  conn.CommitTrans
  Set afterRs = conn.Execute("SELECT COUNT(*) AS total FROM webwindows_news_categories")
  afterCount = CLng(afterRs("total"))
  afterRs.Close
  Set afterRs = Nothing
  AdminSecurityAudit "category-reconcile", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true,""addedCount"":" & CStr(afterCount - beforeCount) & "}"
  Response.End
End If

If action = "save" And method = "POST" Then
  Dim title, category, content, publishAt, dateRegex
  title = Trim(CStr(Request.Form("title")))
  category = Trim(CStr(Request.Form("category")))
  content = Trim(CStr(Request.Form("content")))
  publishAt = Replace(Trim(CStr(Request.Form("publish_at"))), "T", " ")
  idText = Trim(CStr(Request.Form("id")))
  newsId = 0
  If idText <> "" Then
    If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
    On Error Resume Next
    newsId = CLng(idText)
    If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
    On Error GoTo 0
    If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  End If
  If title = "" Or category = "" Or content = "" Or _
     Len(title) > 200 Or Len(category) > 100 Or Len(content) > 20000 Then
    AdminSecurityFail 400, "INVALID_NEWS", "标题、分类和内容必填，且不能超过长度限制。", "valid", "same-origin"
  End If
  Set dateRegex = New RegExp
  dateRegex.Pattern = "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$"
  If publishAt <> "" Then
    If Not dateRegex.Test(publishAt) Or Not IsDate(publishAt) Then
      AdminSecurityFail 400, "INVALID_PUBLISH_AT", "发布时间无效。", "valid", "same-origin"
    End If
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT id FROM webwindows_news_categories WHERE name=? LIMIT 1"
  cmd.Parameters.Append cmd.CreateParameter("category", 201, 1, 100, category)
  Set rs = cmd.Execute
  If rs.EOF Then AdminSecurityFail 400, "CATEGORY_NOT_FOUND", "请先创建新闻分类。", "valid", "same-origin"
  rs.Close
  Set rs = Nothing
  Set cmd = Nothing
  If publishAt = "" Then publishAt = Year(Now()) & "-" & Right("0" & Month(Now()), 2) & _
    "-" & Right("0" & Day(Now()), 2) & " " & Right("0" & Hour(Now()), 2) & _
    ":" & Right("0" & Minute(Now()), 2)
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  If newsId = 0 Then
    cmd.CommandText = "INSERT INTO webwindows_news(title,category,content,publish_at) " & _
      "VALUES (?,?,?,STR_TO_DATE(?,'%Y-%m-%d %H:%i'))"
  Else
    cmd.CommandText = "UPDATE webwindows_news SET title=?,category=?,content=?," & _
      "publish_at=STR_TO_DATE(?,'%Y-%m-%d %H:%i') WHERE id=?"
  End If
  cmd.Parameters.Append cmd.CreateParameter("title", 201, 1, 200, title)
  cmd.Parameters.Append cmd.CreateParameter("category", 201, 1, 100, category)
  cmd.Parameters.Append cmd.CreateParameter("content", 201, 1, Len(content), content)
  cmd.Parameters.Append cmd.CreateParameter("publish_at", 200, 1, 16, publishAt)
  If newsId > 0 Then cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  On Error Resume Next
  cmd.Execute affected
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 500, "NEWS_SAVE_FAILED", "新闻保存失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  AdminSecurityAudit "news-save", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "delete" And method = "POST" Then
  idText = Trim(CStr(Request.Form("id")))
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  On Error Resume Next
  newsId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "新闻编号无效。", "valid", "same-origin"
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "DELETE FROM webwindows_news WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  cmd.Execute
  AdminSecurityAudit "news-delete", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "add-category" And method = "POST" Then
  Dim categoryName
  categoryName = Trim(CStr(Request.Form("name")))
  If categoryName = "" Or Len(categoryName) > 100 Then
    AdminSecurityFail 400, "INVALID_CATEGORY", "分类名称无效。", "valid", "same-origin"
  End If
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "INSERT INTO webwindows_news_categories(name) VALUES (?)"
  cmd.Parameters.Append cmd.CreateParameter("name", 201, 1, 100, categoryName)
  On Error Resume Next
  cmd.Execute
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 400, "CATEGORY_EXISTS", "分类已存在或保存失败。", "valid", "same-origin"
  End If
  On Error GoTo 0
  AdminSecurityAudit "category-add", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "rename-category" And method = "POST" Then
  Dim newName, oldName, renameError
  idText = Trim(CStr(Request.Form("id")))
  newName = Trim(CStr(Request.Form("name")))
  If Not IsNumeric(idText) Or newName = "" Or Len(newName) > 100 Then
    AdminSecurityFail 400, "INVALID_CATEGORY", "分类编号或名称无效。", "valid", "same-origin"
  End If
  On Error Resume Next
  newsId = CLng(idText)
  If Err.Number <> 0 Then
    Err.Clear
    On Error GoTo 0
    AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  End If
  On Error GoTo 0
  If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"

  conn.BeginTrans
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT CONVERT(name USING utf8) AS name FROM webwindows_news_categories WHERE id=? FOR UPDATE"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  Set rs = cmd.Execute
  If rs.EOF Then
    rs.Close
    conn.RollbackTrans
    AdminSecurityFail 404, "CATEGORY_NOT_FOUND", "分类不存在。", "valid", "same-origin"
  End If
  oldName = CStr(rs("name"))
  rs.Close
  Set rs = Nothing
  Set cmd = Nothing
  If oldName <> newName Then
    renameError = ""
    On Error Resume Next
    Set cmd = Server.CreateObject("ADODB.Command")
    Set cmd.ActiveConnection = conn
    cmd.CommandType = 1
    cmd.CommandText = "UPDATE webwindows_news SET category=? WHERE category=?"
    cmd.Parameters.Append cmd.CreateParameter("new_name", 201, 1, 100, newName)
    cmd.Parameters.Append cmd.CreateParameter("old_name", 201, 1, 100, oldName)
    cmd.Execute
    If Err.Number <> 0 Then renameError = CStr(Err.Number)
    Err.Clear
    If renameError = "" Then
      Set cmd = Server.CreateObject("ADODB.Command")
      Set cmd.ActiveConnection = conn
      cmd.CommandType = 1
      cmd.CommandText = "UPDATE webwindows_news_categories SET name=? WHERE id=?"
      cmd.Parameters.Append cmd.CreateParameter("new_name", 201, 1, 100, newName)
      cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
      cmd.Execute
      If Err.Number <> 0 Then renameError = CStr(Err.Number)
      Err.Clear
    End If
    On Error GoTo 0
    If renameError <> "" Then
      conn.RollbackTrans
      AdminSecurityFail 400, "CATEGORY_RENAME_FAILED", "分类改名失败，请检查是否与现有分类重名。", "valid", "same-origin"
    End If
  End If
  conn.CommitTrans
  AdminSecurityAudit "category-rename", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

If action = "delete-category" And method = "POST" Then
  idText = Trim(CStr(Request.Form("id")))
  If Not IsNumeric(idText) Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  On Error Resume Next
  newsId = CLng(idText)
  If Err.Number <> 0 Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  On Error GoTo 0
  If newsId <= 0 Then AdminSecurityFail 400, "INVALID_ID", "分类编号无效。", "valid", "same-origin"
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "SELECT COUNT(*) AS uses_count FROM webwindows_news n " & _
    "JOIN webwindows_news_categories c ON n.category=c.name WHERE c.id=?"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  Set rs = cmd.Execute
  If CLng(rs("uses_count")) > 0 Then
    AdminSecurityFail 400, "CATEGORY_IN_USE", "此分类仍有新闻，不能删除。", "valid", "same-origin"
  End If
  rs.Close
  Set cmd = Nothing
  Set cmd = Server.CreateObject("ADODB.Command")
  Set cmd.ActiveConnection = conn
  cmd.CommandType = 1
  cmd.CommandText = "DELETE FROM webwindows_news_categories WHERE id=?"
  cmd.Parameters.Append cmd.CreateParameter("id", 3, 1, , newsId)
  cmd.Execute
  AdminSecurityAudit "category-delete", "success", "valid", AdminSecurityOriginCategory()
  Response.Write "{""success"":true}"
  Response.End
End If

AdminSecurityFail 400, "INVALID_ACTION", "不支持的新闻操作。", "not-checked", "not-checked"
%>
