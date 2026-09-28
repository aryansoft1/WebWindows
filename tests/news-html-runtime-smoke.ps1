$ErrorActionPreference = 'Stop'
$runtimeTest = Join-Path $env:TEMP ('ww-news-html-' + [guid]::NewGuid().ToString('N') + '.vbs')
$runtimeOutput = $runtimeTest + '.txt'
try {
  node (Join-Path $PSScriptRoot 'news-html-runtime-smoke.mjs') --emit $runtimeTest
  if ($LASTEXITCODE -ne 0) { throw 'Failed to emit test' }
  $lines = & cscript.exe //nologo $runtimeTest
  if ($LASTEXITCODE -ne 0) { throw 'VBScript runtime failed' }
  $lines | Set-Content -LiteralPath $runtimeOutput -Encoding UTF8
  node (Join-Path $PSScriptRoot 'news-html-runtime-smoke.mjs') --verify $runtimeOutput
  if ($LASTEXITCODE -ne 0) { throw 'HTML runtime assertions failed' }
} finally {
  Remove-Item -LiteralPath $runtimeTest,$runtimeOutput -Force -ErrorAction SilentlyContinue
}
