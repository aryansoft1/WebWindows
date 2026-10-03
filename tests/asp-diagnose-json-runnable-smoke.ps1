param([Parameter(Mandatory=$true)][string]$Relative)

# Execute an .asp's JSON-assembly statements under cscript and parse the result.
#
# Why this exists, concretely: the diagnose endpoint shipped a line using IIf.
# This host's VBScript has no IIf at all (Option Explicit reports it as an
# undefined variable), and CStr(CBool(True)) would have produced "True", which
# JSON.parse rejects. Neither is a compile error, so a compile-only test passed
# and production returned HTTP 500. Only running the statements and parsing the
# output catches this class of defect.
#
# Scope, stated plainly. Only the assembly statements that do NOT read a recordset
# are executed: ADO resolves a field by name, and a VBScript function cannot be
# indexed that way, so faking csRs("x") would test the fake rather than the code.
# The readings such a statement would have consumed are supplied by the fixture.
# The recordset-backed statements are covered statically by
# tests/news-category-diagnose-smoke.ps1. That split is a real limit of this test,
# not a formality.
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Get-Content -LiteralPath (Join-Path $repo $Relative) -Raw -Encoding UTF8

$marker = 'If action = "diagnose" And method = "GET" Then'
$start = $source.IndexOf($marker)
if ($start -lt 0) { throw "${Relative} has no diagnose branch" }
$end = $source.IndexOf('If action = "reconcile-categories" And method = "POST"', $start)
if ($end -lt 0) { $end = $source.Length }
$lines = @($source.Substring($start, $end - $start) -split "`r?`n")

# Group into logical statements first. A statement continued with "_" spans several
# lines, and splitting it yields a fragment that cannot compile -- which is how an
# earlier attempt at this test broke itself.
$statements = New-Object System.Collections.Generic.List[object]
$buffer = New-Object System.Collections.Generic.List[string]
foreach ($line in $lines) {
  $trimmed = $line.Trim()
  if ($trimmed.StartsWith("'") -or $trimmed -eq '') { continue }
  # The harness declares these itself; a second Dim is a compile error
  # ("名称重定义") that would mask the behaviour under test.
  if ($trimmed -match '^Dim\b') { continue }
  $buffer.Add($line)
  if ($trimmed -match '_\s*$') { continue }
  $statements.Add($buffer.ToArray())
  $buffer.Clear()
}
if ($buffer.Count) { throw "${Relative}: the diagnose branch ends inside an unterminated statement" }

$assemblers = 'appliedJson|csJson|csRead|colJson|colRead|colCount'
$keep = New-Object System.Collections.Generic.List[string]
$inBooleanBlock = $false
$skippedRecordset = 0
foreach ($statement in $statements) {
  # Match the trimmed first line: a statement keeps its original indentation, and
  # an anchored pattern would never match it.
  $trimmed = $statement[0].Trim()

  # The boolean-to-literal conversion is the one piece of control flow that runs
  # here, and it is self-contained: If / assign / Else / assign / End If.
  if ($trimmed -match '^If jsonCharsetApplied Then$') { $inBooleanBlock = $true }
  if ($inBooleanBlock) {
    foreach ($line in $statement) { $keep.Add($line) }
    if ($trimmed -eq 'End If') { $inBooleanBlock = $false }
    continue
  }

  if ($trimmed -notmatch "^(Set\s+)?($assemblers)\s*(\+)?=") { continue }
  $text = ($statement -join ' ')
  if ($text -match '\b(csRs|colRs)\(' -and $trimmed -notmatch '^(csRead|colRead)\s*=') {
    $skippedRecordset++; continue
  }
  # The error-path branches are also recordset-dependent in effect: they set csRead
  # or colRead to a placeholder that the fixture would then have to unset. They are
  # covered statically instead.
  if ($text -match 'Err\.Description|no schema row') { $skippedRecordset++; continue }
  # Closing the object is the fixture's job: it is what supplies the readings, and
  # lifting it here would close the brace before those readings were appended.
  if ($text -match 'csJson\s*&\s*csRead\s*&\s*"\}"') { continue }
  if ($text -match 'colJson\s*=\s*"\["\s*&\s*colRead') { continue }
  foreach ($line in $statement) { $keep.Add($line) }
}
if ($keep.Count -eq 0) { throw "${Relative}: found no executable JSON-assembly statements in the diagnose branch" }

$lifted = $keep.ToArray() -join "`r`n"
$fixturePath = Join-Path $PSScriptRoot 'fixtures/asp-diagnose-json-fixture.vbs'
if (-not (Test-Path -LiteralPath $fixturePath)) { throw 'the JSON fixture is missing' }

# Coverage guard: if the endpoint ever stops emitting a recordset-backed field,
# this test would quietly stop covering anything. Say so instead.
if ($skippedRecordset -eq 0) {
  throw "${Relative}: no recordset-backed assembly statements were found, so this test is no longer covering the real code path"
}

$preamble = @(
  'Dim appliedJson, csJson, csRead, colJson, colRead, colCount',
  'Dim jsonCharsetApplied, jsonCharsetError',
  'jsonCharsetApplied = True',
  'jsonCharsetError = ""'
) -join "`r`n"

$harness = (Get-Content -LiteralPath $fixturePath -Raw -Encoding UTF8).TrimEnd() + "`r`n`r`n" +
          $preamble + "`r`n`r`n" + $lifted + "`r`n`r`n" +
          "FinishConnection()`r`nEmitConnectionOnly()`r`n"

# AdminSecurityJson lives in inc/admin-security.asp and depends on the ASP runtime;
# the fixture's Esc stands in for it.
$harness = $harness.Replace('AdminSecurityJson(', 'Esc(')
$harness = $harness.Replace('NewsJsonString(', 'Esc(')
$harness = $harness.Replace('csRs(', 'ConnectionReadings(')
$harness = $harness.Replace('colRs(', 'ColumnReadings(')

$temp = Join-Path $env:TEMP ('ww-json-' + [guid]::NewGuid().ToString('N') + '.vbs')
if ($env:WW_DUMP_JSON_HARNESS) {
  [System.IO.File]::WriteAllText((Join-Path $env:TEMP 'ww-json-dump.vbs'), $harness, (New-Object System.Text.UTF8Encoding $false))
}
$previous = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  [System.IO.File]::WriteAllText($temp, $harness, (New-Object System.Text.UTF8Encoding $false))
  $output = @(cscript.exe //nologo $temp 2>&1)
  $exit = $LASTEXITCODE
  $text = ($output | Out-String).Trim()
} finally {
  $ErrorActionPreference = $previous
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
}

if ($exit -ne 0 -or $text -notmatch '^\{') {
  throw "${Relative}: the diagnose connection assembly does not run:`n$text"
}

# Parse it for real. A missing brace or a "True" literal is caught here and nowhere
# else -- both were present in the version that shipped.
try {
  $parsed = $text | ConvertFrom-Json
} catch {
  throw "${Relative}: the diagnose connection object is not valid JSON:`n$text`n$($_.Exception.Message)"
}

if ($null -eq $parsed.connection) { throw "${Relative}: the response has no connection object" }
if ($parsed.connection.applied -isnot [bool]) {
  throw "${Relative}: connection.applied must be a JSON boolean, got '$($parsed.connection.applied)'"
}
if (-not $parsed.connection.PSObject.Properties.Name.Contains('error')) {
  throw "${Relative}: the connection object must always carry the SET NAMES error, even when empty"
}
# The readings the server would have returned, so the test also proves the six
# fields are read and emitted under the names the page expects.
$expected = @{
  client = 'utf8mb4'; connection = 'utf8mb4'; results = 'utf8mb4'
  database = 'utf8mb4'; serverVersion = '5.7.44-log'; serverDefaultCharset = 'latin1'
}
foreach ($field in $expected.Keys) {
  if (-not $parsed.connection.PSObject.Properties.Name.Contains($field)) {
    throw "${Relative}: the connection object is missing '$field'"
  }
  if ($parsed.connection.$field -ne $expected[$field]) {
    throw "${Relative}: '$field' was read as '$($parsed.connection.$field)', expected '$($expected[$field])'"
  }
}
if ($parsed.columns.Count -ne 1 -or
    $parsed.columns[0].table -ne 'webwindows_news_categories' -or
    $parsed.columns[0].charset -ne 'utf8mb4') {
  throw "${Relative}: the column metadata is not valid JSON or was assembled incorrectly"
}
Write-Output "${Relative}: connection assembly runs and parses (applied=$($parsed.connection.applied), fields=$($expected.Count))"
