param([Parameter(Mandatory=$true)][string]$Relative)

# Compile an .asp's VBScript with cscript.
#
# Added after shipping a line that IIS refused to run. The defect was a use of
# IIf, which this host's VBScript does not define; the compile-only structural
# checks all passed it through, and production returned HTTP 500.
#
# This found three endpoints that are broken in production RIGHT NOW:
#   api/me_name.asp        800a03f4 缺少 'If'   line 4
#   api/dt_conv_id.asp     800a03f4 缺少 'If'   line 14
#   api/mail_provider_test.asp               line 89
# All three use a colon-chained one-liner -- Function J(s): If ... : End Function --
# which VBScript parses as a Function whose body is only the If, leaving the
# remainder, including End Function, as stray text.
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Get-Content -LiteralPath (Join-Path $repo $Relative) -Raw -Encoding UTF8

# <%=expr%> is a response-writing expression, not a statement. Concatenating one
# into a script produces "缺少语句" on a page that IIS compiles and serves fine, so
# those blocks are dropped rather than treated as failures.
$blocks = [regex]::Matches($source, '(?s)<%(?!=|@)(.*?)%>')
if ($blocks.Count -eq 0) { throw "${Relative} contains no VBScript blocks" }
$code = ($blocks | ForEach-Object { $_.Groups[1].Value }) -join "`r`n"

# A colon-chained Function is the trap above. Say so directly rather than letting
# cscript report a confusing "missing 'If'".
#
# The colon must be followed by something that starts a statement. A comment can
# legally contain a colon -- Function IsoUtc(d) ' -> "YYYY-MM-DDThh:mm:ssZ" is
# valid, and flagging it would make this check cry wolf.
foreach ($line in ($code -split "`r?`n")) {
  $trimmed = $line.Trim()
  if ($trimmed -match '^(Function|Sub)\s+\w+\s*\(?[^)]*\)?\s*:\s*(If|Else|End\s+(If|Function|Sub)|Dim|Set|For|Next|Do|Loop|Exit|On|Call|[a-zA-Z_]\w*\s*=)') {
    throw "${Relative}: a Function/Sub body is chained with colons on one line, which VBScript misparses:`n$trimmed"
  }
}

$temp = Join-Path $env:TEMP ('ww-compile-' + [guid]::NewGuid().ToString('N') + '.vbs')
$previous = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  [System.IO.File]::WriteAllText($temp, $code, (New-Object System.Text.UTF8Encoding $false))
  $output = @(cscript.exe //nologo $temp 2>&1)
  $exit = $LASTEXITCODE
  $text = ($output | Out-String) -replace '\s+', ' '
} finally {
  $ErrorActionPreference = $previous
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
}

# cscript compiles before it runs, so a compile diagnostic appears even though the
# script then dies on the first missing COM object. Only a compile diagnostic is a
# failure; a runtime error means the syntax was fine.
if ($text -match '800a0[0-9a-f]{3}' -or $text -match '(?i)compilation error|编译器错误') {
  throw "${Relative} does not compile:`n$($text.Trim())"
}
Write-Output "${Relative} compiles ($($blocks.Count) blocks)"
