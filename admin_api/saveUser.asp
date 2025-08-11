<%@LANGUAGE="VBSCRIPT" CODEPAGE="65001"%>
<!--#include file="../inc/conn.asp"-->
<%
Response.ContentType = "application/json"
Response.Charset = "UTF-8"
'On Error Resume Next

'—— 小工具：转义单引号 MD5
Function QS(s) : QS = Replace(Trim("" & s), "'", "''") : End Function

'—— 读取参数
Dim idRaw, isEdit, id
idRaw  = Trim(Request.Form("id"))
isEdit = (IsNumeric(idRaw) And idRaw <> "")
If isEdit Then id = CLng(idRaw)

Dim username, rawPwd, nickname, email, avatar, dcid, expired_at
username   = QS(Request.Form("username"))
rawPwd     = Trim(Request.Form("password")) ' 可能为空
nickname   = QS(Request.Form("nickname"))
email      = QS(Request.Form("email"))
avatar     = QS(Request.Form("avatar"))     ' 目前仅保存文本，文件上传后续再做
dcid       = Trim(Request.Form("data_center_id"))
expired_at = Trim(Request.Form("expired_at"))

If (dcid = "" Or Not IsNumeric(dcid)) Then dcid = "NULL"

'—— 新增必须有密码；编辑允许为空
If Not isEdit Then
  If rawPwd = "" Then
    Response.Write "{""success"":false,""error"":""密码不能为空""}"
    Response.End
  End If
End If

Dim sql
If Not isEdit Then
  sql = "INSERT INTO webwindows_users (username,password,nickname,avatar,email,data_center_id,expired_at) VALUES (" & _
        "'" & username & "'," & _
        "MD5('" & pwdHash  & "')," & _
        "'" & nickname & "'," & _
        "'" & avatar   & "'," & _
        "'" & email    & "'," & _
        dcid & ",NULL)"
Else
  sql = "UPDATE webwindows_users SET " & _
        "username='" & username & "'," & _
        "nickname='" & nickname & "'," & _
        "avatar='"   & avatar   & "'," & _
        "email='"    & email    & "'," & _
        "data_center_id=" & dcid
        '"expired_at=" & IIf(expired_at="","NULL","'" & QS(expired_at) & "'")
  If rawPwd <> "" Then
    sql = sql & ", password=MD5('" & rawPwd & "')"   ' 仅当输入新密码时更新
  End If
  sql = sql & " WHERE id=" & id
End If

conn.Execute sql

If Err.Number <> 0 Then
  Response.Write "{""success"":false,""sql"":""" & sql & """,""error"":""" & Err.Description & """}"
Else
  Response.Write "{""success"":true}"
End If


%>
