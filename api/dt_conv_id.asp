<%@ LANGUAGE="VBScript" CODEPAGE="65001" %>
<%
Response.Buffer=True: Response.Clear
Response.CodePage=65001: Response.Charset="utf-8"
Response.ContentType="application/json"
Function Utf8NoBomBytes(t)
  Dim s:Set s=Server.CreateObject("ADODB.Stream")
  s.Type=2:s.Charset="utf-8":s.Open:s.WriteText CStr(t)
  s.Position=0:s.Type=1: Dim b:b=s.Read: s.Close:Set s=Nothing
  If IsArray(b) Then If UBound(b)>=2 Then If b(0)=239 And b(1)=187 And b(2)=191 Then Dim i,c():ReDim c(UBound(b)-3):For i=3 To UBound(b):c(i-3)=b(i):Next:Utf8NoBomBytes=c:Exit Function
  Utf8NoBomBytes=b
End Function
Sub WriteJSON(t): Response.BinaryWrite Utf8NoBomBytes(t): Response.End: End Sub
Function J(s): If IsNull(s) Then s="": s=CStr(s): s=Replace(s,"\","\\"): s=Replace(s,"""","\"""): s=Replace(s,vbCrLf,"\n"): J=s: End Function
Function SafeId(s): Dim x,i,ch,o: x=LCase(CStr(s)): o="": For i=1 To Len(x): ch=Mid(x,i,1): If (ch>="a" And ch<="z") Or (ch>="0" And ch<="9") Or ch="-" Or ch="_" Then o=o&ch: End If: Next: If Len(o)=0 Then o="guest": SafeId=o: End Function
Function GetUser(): Dim u: u=Session("username"): If Len(u)=0 Then u=Request("u"): If Len(u)>0 Then u=SafeId(u): Session("username")=u: Response.Cookies("DT_USER")=u: Response.Cookies("DT_USER").Path="/": Response.Cookies("DT_USER").Expires=DateAdd("d",30,Now()): End If: If Len(u)=0 Then u=Request.Cookies("DT_USER"): If Len(u)=0 Then Randomize: u="guest_"&CStr(Int(Rnd()*1000000)): u=SafeId(u): Session("username")=u: Response.Cookies("DT_USER")=u: Response.Cookies("DT_USER").Path="/": Response.Cookies("DT_USER").Expires=DateAdd("d",30,Now()): GetUser=SafeId(u): End Function

Dim uname: uname=GetUser()
Dim peer: peer=SafeId(Request("peer"))
If Len(peer)=0 Then WriteJSON("{""ok"":false,""error"":""bad_peer""}")

Dim a0,a1,tmp: a0=uname: a1=peer: If a0>a1 Then tmp=a0: a0=a1: a1=tmp
WriteJSON "{""ok"":true,""convId"":"""&a0&"__"&a1&"""}"
%>
