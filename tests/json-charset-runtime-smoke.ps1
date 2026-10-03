$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Get-Content (Join-Path $repo 'inc/json-charset.asp') -Raw -Encoding UTF8
if ($source -match 'conn\.Execute\("SET NAMES') { throw 'ODBC must not receive SET NAMES' }
$code = ($source -replace '^<%\s*|\s*%>$', '') -split "`r?`n"
$code = ($code | Where-Object { $_ -notmatch "^\s*'|^Response\." }) -join "`r`n"
$fixture = @'
Dim testCharset, testFails, conn
testCharset = "__CHARSET__"
testFails = __FAILS__
Class CharsetRow
  Public Property Get EOF
    EOF = False
  End Property
  Public Default Property Get Item(key)
    Item = testCharset
  End Property
  Public Sub Close
  End Sub
End Class
Class CharsetConnection
  Public Property Get State
    State = 1
  End Property
  Public Function Execute(sql)
    If InStr(UCase(sql), "SET NAMES") > 0 Then Err.Raise 5
    If testFails Then Err.Raise 5
    Set Execute = New CharsetRow
  End Function
End Class
Set conn = New CharsetConnection
__CODE__
WScript.Echo CStr(jsonCharsetApplied)
'@
$path = Join-Path $env:TEMP ('news-charset-' + [guid]::NewGuid().ToString('N') + '.vbs')
try {
  foreach ($case in @(@('utf8','False','True'), @('utf8mb3','False','True'), @('utf8mb4','False','True'), @('latin1','False','False'), @('utf8','True','False'))) {
    $script = $fixture.Replace('__CHARSET__',$case[0]).Replace('__FAILS__',$case[1]).Replace('__CODE__',$code)
    [IO.File]::WriteAllText($path, $script, [Text.Encoding]::ASCII)
    $output = & cscript.exe //nologo $path 2>&1
    if ($LASTEXITCODE -ne 0 -or (($output -join '').Trim() -ne $case[2])) { throw "Charset scenario failed: $($case -join ',') => $output" }
  }
  Write-Output 'JSON charset runtime passed: ODBC-compatible UTF-8 sessions and fail-closed reads'
} finally {
  if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path }
}
