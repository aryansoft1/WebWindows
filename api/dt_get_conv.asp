<%@ LANGUAGE="VBScript" EnableSessionState=False %>
<%
' ===== 必须最前：统一 UTF-8 =====
Response.CodePage = 65001
Response.Charset  = "utf-8"
Response.ContentType = "application/json; charset=utf-8"
Response.Buffer = True
On Error Resume Next

' ===== 工具 =====
Function J(s)
  If IsNull(s) Then s = ""
  Dim t0
  t0 = CStr(s)
  t0 = Replace(t0, "\", "\\")
  t0 = Replace(t0, """", "\""")
  t0 = Replace(t0, vbCrLf, "\n")
  t0 = Replace(t0, vbCr,   "\n")
  t0 = Replace(t0, vbLf,   "\n")
  J = t0
End Function

Function SafeId(s)
  Dim x0, i0, ch0, o0
  x0 = LCase(CStr(s))
  o0 = ""
  For i0 = 1 To Len(x0)
    ch0 = Mid(x0, i0, 1)
    If (ch0>="a" And ch0<="z") Or (ch0>="0" And ch0<="9") Or ch0="-" Or ch0="_" Then
      o0 = o0 & ch0
    End If
  Next
  If Len(o0)=0 Then o0="guest"
  SafeId = o0
End Function

Sub SaveUtf8NoBom(path, txt)
  Dim st, b0, i0, c0(), o1
  Set st = Server.CreateObject("ADODB.Stream")
  st.Type = 2
  st.Charset = "utf-8"
  st.Open
  st.WriteText CStr(txt)
  st.Position = 0
  st.Type = 1
  b0 = st.Read
  st.Close
  Set st = Nothing

  If IsArray(b0) Then
    If UBound(b0) >= 2 Then
      If b0(0)=239 And b0(1)=187 And b0(2)=191 Then
        ReDim c0(UBound(b0)-3)
        For i0 = 3 To UBound(b0)
          c0(i0-3) = b0(i0)
        Next
        b0 = c0
      End If
    End If
  End If

  Set o1 = Server.CreateObject("ADODB.Stream")
  o1.Type = 1
  o1.Open
  o1.Write b0
  o1.SaveToFile path, 2
  o1.Close
  Set o1 = Nothing
End Sub

Function ReadAs(path, charset)
  On Error Resume Next
  Dim s0, txt0
  Set s0 = Server.CreateObject("ADODB.Stream")
  s0.Type = 1
  s0.Open
  s0.LoadFromFile path
  s0.Position = 0
  s0.Type = 2
  s0.Charset = charset
  txt0 = s0.ReadText
  s0.Close
  Set s0 = Nothing
  ReadAs = txt0
End Function

' 智能读取并必要时“就地”转为 UTF-8 无 BOM
Function ReadNormalized(path)
  On Error Resume Next
  Dim s0, raw0, enc0, hasBom, z0, zeros0, txt0
  Set s0 = Server.CreateObject("ADODB.Stream")
  s0.Type = 1
  s0.Open
  s0.LoadFromFile path
  raw0 = s0.Read
  s0.Close
  Set s0 = Nothing

  enc0   = "utf-8"
  hasBom = False
  If IsArray(raw0) Then
    If UBound(raw0)>=2 Then
      If raw0(0)=239 And raw0(1)=187 And raw0(2)=191 Then enc0="utf-8": hasBom=True
    End If
    If UBound(raw0)>=1 Then
      If (raw0(0)=255 And raw0(1)=254) Or (raw0(0)=254 And raw0(1)=255) Then enc0="unicode"
    End If
    If enc0="utf-8" Then
      zeros0 = 0
      For z0 = 0 To UBound(raw0)
        If z0>800 Then Exit For
        If raw0(z0)=0 Then zeros0 = zeros0 + 1
      Next
      If zeros0>0 Then enc0="unicode"
    End If
  End If

  txt0 = ""
  If enc0="unicode" Then
    txt0 = ReadAs(path, "unicode")
  Else
    txt0 = ReadAs(path, "utf-8")
  End If
  If Len(txt0)=0 Then txt0 = ReadAs(path, "gb2312")
  If Len(txt0)>0 Then
    If AscW(Left(txt0,1))=&HFEFF Then txt0 = Mid(txt0,2)
  End If

  If Not (enc0="utf-8" And Not hasBom) Then
    Call SaveUtf8NoBom(path, txt0)
  End If

  ReadNormalized = Trim(txt0)
End Function

' ===== 主逻辑（所有过程级变量只声明一次） =====
Dim convIdStr, limitN, sinceN, fso, basePath, convDir
Dim dbgOut, dbgFirst, fileObj
Dim itemsArr(), itemsCnt, fileName, dashPosN, tsN
Dim sortI, sortJ, swapVal
Dim startIdxN, arrJson, idxN, filePath, txtStr

convIdStr = SafeId(Request("convId"))
If Len(convIdStr)=0 Then Response.Write "{""ok"":false,""error"":""bad_convId""}": Response.End

limitN = CLng(0 & Request("limit"))
If limitN<=0 Then limitN = 100
sinceN = CLng(0 & Request("since"))

Set fso     = Server.CreateObject("Scripting.FileSystemObject")
basePath    = Server.MapPath("../data")
convDir     = basePath & "\chat\conversations\" & convIdStr

' —— 目录自检 —— 
If LCase(Request("debug"))="1" Then
  If Not fso.FolderExists(convDir) Then
    Response.Write "{""convDir"":""" & J(convDir) & """,""exists"":false,""files"":[]}"
    Response.End
  End If
  dbgOut = "{""convDir"":""" & J(convDir) & """,""exists"":true,""files"":["
  dbgFirst = True
  For Each fileObj In fso.GetFolder(convDir).Files
    If LCase(Right(fileObj.Name,5)) = ".json" Then
      If Not dbgFirst Then
        dbgOut = dbgOut & ","
      Else
        dbgFirst = False
      End If
      dbgOut = dbgOut & "{""name"":""" & J(fileObj.Name) & """,""size"":" & fileObj.Size & "}"
    End If
  Next
  dbgOut = dbgOut & "]}"
  Response.Write dbgOut
  Response.End
End If

If Not fso.FolderExists(convDir) Then
  Response.Write "{""ok"":true,""convId"":""" & J(convIdStr) & """,""messages"":[]}"
  Response.End
End If

' 收集 {ts|path}
ReDim itemsArr(0)
itemsCnt = 0
For Each fileObj In fso.GetFolder(convDir).Files
  fileName = fileObj.Name
  If LCase(Right(fileName,5)) = ".json" Then
    dashPosN = InStr(1, fileName, "-")
    If dashPosN > 1 Then
      tsN = CLng(0 & Mid(fileName, 1, dashPosN-1))
      If sinceN = 0 Or tsN > sinceN Then
        If itemsCnt = UBound(itemsArr) + 1 Then ReDim Preserve itemsArr(itemsCnt*2+1)
        itemsArr(itemsCnt) = CStr(tsN) & "|" & fileObj.Path
        itemsCnt = itemsCnt + 1
      End If
    End If
  End If
Next

If itemsCnt = 0 Then
  Response.Write "{""ok"":true,""convId"":""" & J(convIdStr) & """,""messages"":[]}"
  Response.End
End If
ReDim Preserve itemsArr(itemsCnt-1)

' 升序排序
For sortI = 0 To itemsCnt-2
  For sortJ = sortI+1 To itemsCnt-1
    If CLng(Split(itemsArr(sortI),"|")(0)) > CLng(Split(itemsArr(sortJ),"|")(0)) Then
      swapVal = itemsArr(sortI)
      itemsArr(sortI) = itemsArr(sortJ)
      itemsArr(sortJ) = swapVal
    End If
  Next
Next

' 取最后 limitN 条
startIdxN = 0
If itemsCnt > limitN Then startIdxN = itemsCnt - limitN

' 拼装
arrJson = "["
For idxN = startIdxN To itemsCnt-1
  filePath = Split(itemsArr(idxN), "|")(1)
  txtStr = ReadNormalized(filePath)
  If Len(txtStr)>0 And Left(txtStr,1)="{" And Right(txtStr,1)="}" Then
    arrJson = arrJson & txtStr & ","
  Else
    arrJson = arrJson & "{""raw"":""" & J(txtStr) & """},"
  End If
Next
If Right(arrJson,1) = "," Then arrJson = Left(arrJson, Len(arrJson)-1)
arrJson = arrJson & "]"

Response.Write "{""ok"":true,""convId"":""" & J(convIdStr) & """,""messages"":" & arrJson & "}"
Response.End
%>
