$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# Generated VBScript must be pure ASCII: Windows PowerShell reads a BOM-less
# UTF-8 .ps1 as ANSI, so any non-ASCII literal would be mangled and cscript
# would report a bogus "invalid character" compile error.
$source = Get-Content -LiteralPath (Join-Path $repo 'inc/admin-security.asp') -Raw -Encoding UTF8

$startMarker = 'Function AdminSecurityJson('
$endMarker = 'Function AdminSecurityTokenShape('
$start = $source.IndexOf($startMarker)
$end = $source.IndexOf($endMarker, $start)
if ($start -lt 0 -or $end -le $start) { throw 'AdminSecurityJson is missing from inc/admin-security.asp.' }
$block = $source.Substring($start, $end - $start)
$block = (($block -split "`r?`n") | Where-Object { $_ -notmatch "^\s*'" }) -join "`r`n"

# Production incident: the admin JSON helper did IsNull(value) -> CStr(value).
# On this host IsNull does not catch the empty value the driver hands to
# VBScript, CStr raises "Invalid use of Null", and the whole endpoint 500s.
# news.asp?action=list and adminAuth.asp?action=status both died that way while
# the only surviving endpoint was the one that passes no nullable field.
# These are the exact shapes that must now degrade to "" instead of throwing.
$script = @'
__BLOCK__
' Results are reported as printable hex of the serialized string rather than the
' raw text: a NUL byte in the output would truncate the line when it reaches the
' test harness, and a stray newline would break the line-oriented parsing.
Function HexOf(text)
  Dim index, code, out
  out = ""
  For index = 1 To Len(text)
    code = AscW(Mid(text, index, 1))
    If code < 0 Then code = code + 65536
    out = out & LCase(Right("0" & Hex(code), 2))
  Next
  HexOf = out
End Function
Function Try(value, label)
  Dim result
  result = "<threw>"
  On Error Resume Next
  result = AdminSecurityJson(value)
  On Error GoTo 0
  WScript.Echo label & "=[" & HexOf(result) & "]"
End Function
Try "plain text", "string"
Try "", "empty_string"
Try 42, "number"
Try Null, "null"
Try Empty, "empty_variant"
Try DBNull, "dbnull_object"
Try "say ""hi""", "quoted"
Try "back\slash", "backslash"
' JSON forbids unescaped 0x00-0x1F inside strings. Before these were escaped a
' row containing a tab or a backspace made the whole document unparseable and the
' client could only report "Expected ',' or '}' after array element".
Try "a" & Chr(9) & "b", "tab"
Try "a" & Chr(8) & "b", "backspace"
Try "a" & Chr(11) & "b", "vertical_tab"
Try "a" & Chr(12) & "b", "form_feed"
Try "a" & Chr(1) & "b", "soh"
Try "a" & Chr(127) & "b", "delete"
Try "a" & Chr(0) & "b", "nul"
WScript.Echo "done"
'@
$script = $script.Replace('__BLOCK__', $block)

$temp = Join-Path $env:TEMP ('webwindows-adminjson-' + [guid]::NewGuid().ToString('N') + '.vbs')
try {
  [System.IO.File]::WriteAllText($temp, $script, (New-Object System.Text.UTF8Encoding $false))
  $output = @(cscript.exe //nologo $temp)
  if ($LASTEXITCODE -ne 0) { throw 'AdminSecurityJson VBScript execution failed.' }
  # Values arrive as lowercase hex of the serialized string.
  $map = @{}
  foreach ($line in $output) {
    $index = $line.IndexOf('=')
    $closing = $line.LastIndexOf(']')
    if ($index -lt 0 -or $closing -lt $index) { continue }
    $map[$line.Substring(0, $index)] = $line.Substring($index + 2, $closing - $index - 2)
  }
  function HexOf([string]$text) {
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($text)
    return (($bytes | ForEach-Object { $_.ToString('x2') }) -join '')
  }
  function Check([string]$key, [string]$expectedText, [string]$why) {
    if (-not $map.ContainsKey($key)) { throw "$key input did not return; the helper still throws." }
    $actual = $map[$key]
    $expected = HexOf $expectedText
    if ($actual -ne $expected) { throw "$why expected '$expected' but got '$actual'" }
  }
  Check 'string' 'plain text' 'plain text was mangled'
  Check 'empty_string' '' 'empty string was mangled'
  Check 'number' '42' 'number was mangled'
  # These three are the ones that used to take the whole endpoint down.
  Check 'null' '' 'Null should degrade to an empty string'
  Check 'empty_variant' '' 'Empty should degrade to an empty string'
  Check 'dbnull_object' '' 'DBNull should degrade to an empty string'
  Check 'quoted' 'say \"hi\"' 'quote escaping regressed'
  Check 'backslash' 'back\\slash' 'backslash escaping regressed'
  # JSON forbids unescaped control characters; each must be escaped or dropped.
  Check 'tab' "a\tb" 'tab must be escaped'
  Check 'backspace' "a\bb" 'backspace must be escaped'
  Check 'vertical_tab' 'a\u000bb' 'vertical tab must use a valid JSON escape'
  Check 'form_feed' "a\fb" 'form feed must be escaped'
  Check 'soh' 'a b' 'other control characters must be neutralised'
  Check 'delete' 'ab' 'DEL must be removed'
  # NUL becomes a space rather than being deleted: deleting it would silently
  # change the character count of the value.
  Check 'nul' 'a b' 'NUL must be neutralised'
  Write-Output 'admin JSON helper null-safety smoke test passed'
}
finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
}
