<%
' News HTML is rebuilt from an explicit tag/attribute/style allowlist.
' Do not return source tags, attributes or CSS directly to the renderer.
Function NewsHtmlMatches(ByVal value, ByVal pattern)
  Dim re
  Set re = New RegExp
  re.Pattern = pattern
  re.IgnoreCase = True
  NewsHtmlMatches = re.Test(value)
End Function
Function NewsHtmlEncode(ByVal value)
  value = Replace(CStr(value), "&", "&amp;")
  value = Replace(value, "<", "&lt;")
  value = Replace(value, ">", "&gt;")
  value = Replace(value, Chr(34), "&quot;")
  NewsHtmlEncode = value
End Function
Function NewsHtmlDecodeAttribute(ByVal value)
  value = Replace(value, "&quot;", Chr(34))
  value = Replace(value, "&apos;", "'")
  value = Replace(value, "&lt;", "<")
  value = Replace(value, "&gt;", ">")
  value = Replace(value, "&amp;", "&")
  NewsHtmlDecodeAttribute = value
End Function
Function NewsHtmlUrl(ByVal value, ByVal image)
  Dim valid
  value = Trim(value)
  valid = False
  If Not NewsHtmlMatches(value, "[\x00-\x20\x7f]|&#") Then
    If image Then
      valid = NewsHtmlMatches(value, "^https://[a-z0-9.-]+(:[0-9]{1,5})?([/?#]|$)")
    Else
      valid = NewsHtmlMatches(value, "^https?://[a-z0-9.-]+(:[0-9]{1,5})?([/?#]|$)|^mailto:[a-z0-9._%+\-]+@[a-z0-9.\-]+(\?.*)?$")
    End If
  End If
  If valid Then NewsHtmlUrl = value Else NewsHtmlUrl = ""
End Function
Function NewsHtmlStyle(ByVal value)
  Dim part, pairs, key, val, valid, result, n, nums, re, matches, item, font
  result = ""
  For Each part In Split(value, ";")
    pairs = Split(part, ":", 2)
    If UBound(pairs) = 1 Then
      key = LCase(Trim(pairs(0)))
      val = Trim(pairs(1))
      valid = False
      Select Case key
        Case "color", "background-color"
          valid = NewsHtmlMatches(val, "^#[0-9a-f]{3}([0-9a-f]{3})?$")
          If NewsHtmlMatches(val, "^rgb\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\)$") Then
            valid = True
            Set re = New RegExp
            re.Pattern = "[0-9]+"
            re.Global = True
            Set matches = re.Execute(val)
            For Each item In matches
              If CLng(item.Value) > 255 Then valid = False
            Next
          End If
        Case "font-family"
          val = Replace(Replace(val, Chr(34), ""), "'", "")
          For Each font In Split("Arial|Segoe UI|Verdana|Georgia|Times New Roman|Courier New|Microsoft YaHei", "|")
            If LCase(val) = LCase(font) Then valid = True
          Next
        Case "font-size"
          If NewsHtmlMatches(val, "^[0-9]{1,2}px$") Then
            n = CLng(Left(val, Len(val)-2))
            valid = (n >= 10 And n <= 72)
          End If
        Case "margin-left"
          If NewsHtmlMatches(val, "^[0-9]{1,3}px$") Then valid = (CLng(Left(val, Len(val)-2)) <= 320)
        Case "text-align"
          valid = NewsHtmlMatches(val, "^(left|center|right|justify)$")
        Case "font-weight"
          valid = NewsHtmlMatches(val, "^(bold|normal|[1-9]00)$")
        Case "font-style"
          valid = NewsHtmlMatches(val, "^(italic|normal)$")
        Case "text-decoration"
          valid = NewsHtmlMatches(val, "^(underline|line-through|none)$")
      End Select
      If valid Then
        If result <> "" Then result = result & ";"
        result = result & key & ":" & val
      End If
    End If
  Next
  NewsHtmlStyle = result
End Function
Function NewsHtmlTag(ByVal token)
  Dim re, matches, tag, closing, attrs, item, name, value, safe, result, seen, limit, rawTag, imageReady
  NewsHtmlTag = ""
  Set re = New RegExp
  re.Pattern = "^<\s*(/?)\s*([a-z][a-z0-9]*)\b([\s\S]*?)>$"
  re.IgnoreCase = True
  Set matches = re.Execute(token)
  If matches.Count = 0 Then Exit Function
  closing = (matches(0).SubMatches(0) = "/")
  rawTag = LCase(matches(0).SubMatches(1))
  tag = rawTag
  If tag = "font" Then tag = "span"
  If tag = "strike" Then tag = "s"
  If InStr("|p|div|br|strong|b|em|i|u|s|del|h1|h2|h3|h4|h5|h6|ul|ol|li|blockquote|pre|code|a|span|hr|img|table|thead|tbody|tfoot|tr|th|td|", "|" & tag & "|") = 0 Then Exit Function
  If closing Then
    If InStr("|br|hr|img|", "|" & tag & "|") = 0 Then NewsHtmlTag = "</" & tag & ">"
    Exit Function
  End If
  attrs = matches(0).SubMatches(2)
  re.Pattern = "([a-z][a-z0-9-]*)\s*=\s*(" & Chr(34) & "([^" & Chr(34) & "]*)" & Chr(34) & "|'([^']*)')"
  re.Global = True
  Set matches = re.Execute(attrs)
  imageReady = False
  result = "<" & tag
  Set seen = CreateObject("Scripting.Dictionary")
  For Each item In matches
    name = LCase(item.SubMatches(0))
    value = item.SubMatches(2)
    If Left(item.SubMatches(1), 1) = "'" Then value = item.SubMatches(3)
    value = NewsHtmlDecodeAttribute(value)
    safe = ""
    If Not seen.Exists(name) Then
      seen.Add name, True
      If name = "style" Then safe = NewsHtmlStyle(value)
      If tag = "a" And name = "href" Then safe = NewsHtmlUrl(value, False)
      If tag = "a" And name = "title" Then safe = Left(value, 200)
      If tag = "img" And name = "src" Then
        safe = NewsHtmlUrl(value, True)
        imageReady = (safe <> "")
      End If
      If tag = "img" And name = "alt" Then safe = Left(value, 500)
      limit = 0
      If tag = "img" And (name = "width" Or name = "height") Then limit = 2000
      If (tag = "td" Or tag = "th") And (name = "colspan" Or name = "rowspan") Then limit = 20
      If limit > 0 And NewsHtmlMatches(value, "^[1-9][0-9]{0,3}$") Then
        If CLng(value) <= limit Then safe = value
      End If
      If safe <> "" Then result = result & " " & name & "=" & Chr(34) & NewsHtmlEncode(safe) & Chr(34)
    End If
  Next
  If tag = "img" Then
    If Not imageReady Then Exit Function
    If Not seen.Exists("alt") Then result = result & " alt=" & Chr(34) & Chr(34)
  End If
  If tag = "a" Then result = result & " rel=" & Chr(34) & "noopener noreferrer" & Chr(34)
  NewsHtmlTag = result & ">"
End Function
Function NewsHtmlSanitize(ByVal value)
  Dim re, startAt, endAt, pos, quote, ch, result, text
  Set re = New RegExp
  re.IgnoreCase = True
  re.Global = True
  re.Pattern = "<!--([\s\S]*?)-->|<(script|style|iframe|object|svg|math|template|form|textarea|select)\b[^>]*>[\s\S]*?</\2\s*>"
  value = re.Replace(CStr(value), "")
  result = ""
  pos = 1
  Do While pos <= Len(value)
    startAt = InStr(pos, value, "<")
    If startAt = 0 Then
      result = result & Mid(value, pos)
      Exit Do
    End If
    result = result & Mid(value, pos, startAt-pos)
    quote = ""
    endAt = startAt+1
    Do While endAt <= Len(value)
      ch = Mid(value, endAt, 1)
      If quote <> "" Then
        If ch = quote Then quote = ""
      ElseIf ch = Chr(34) Or ch = "'" Then
        quote = ch
      ElseIf ch = ">" Then
        Exit Do
      End If
      endAt = endAt+1
    Loop
    If endAt > Len(value) Then
      result = result & Replace(Mid(value, startAt), "<", "&lt;")
      Exit Do
    End If
    result = result & NewsHtmlTag(Mid(value, startAt, endAt-startAt+1))
    pos = endAt+1
  Loop
  NewsHtmlSanitize = result
End Function
Function NewsHtmlHasContent(ByVal value)
  Dim re, text
  Set re = New RegExp
  re.Pattern = "<[^>]*>"
  re.Global = True
  text = re.Replace(value, "")
  text = Replace(text, "&nbsp;", " ")
  text = Replace(Replace(Replace(text, vbCr, ""), vbLf, ""), vbTab, "")
  NewsHtmlHasContent = (Trim(text) <> "" Or InStr(value, "<img ") > 0 Or InStr(value, "<hr>") > 0)
End Function
%>
