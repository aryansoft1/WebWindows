param([string[]]$Files)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ftpHost = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_HOST")
$ftpUser = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_USER")
$ftpPassword = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_PASSWORD")
if (-not $ftpHost -or -not $ftpUser -or -not $ftpPassword) {
  throw "Missing FTP credentials in the environment."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repo (".deployment-backups\" + $stamp + "-scoped-upload")
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$curl = @("--silent","--show-error","--fail","--noproxy","*","--retry","5","--retry-all-errors","--retry-delay","1")
$results = New-Object System.Collections.Generic.List[string]

# curl reports "no such remote file" as exit 78. That is an expected answer to
# the "does this already exist?" probe, not a failure, so the native stderr must
# not be allowed to terminate the run under ErrorActionPreference = Stop.
function Invoke-Curl {
  param([string[]]$CurlArgs, [switch]$AllowMissing)
  $previous = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & curl.exe @CurlArgs 2>&1
    $code = $LASTEXITCODE
    if ($code -ne 0 -and -not ($AllowMissing -and $code -eq 78)) {
      throw "curl failed with exit $code : $output"
    }
    return $code
  } finally { $ErrorActionPreference = $previous }
}

function Get-RemoteHash([string]$relative) {
  $tmp = Join-Path $env:TEMP ("ww-rb-" + [guid]::NewGuid().ToString("N") + ".bin")
  try {
    $code = Invoke-Curl -CurlArgs ($curl + @("--output", $tmp, "--user", "${ftpUser}:${ftpPassword}", ("ftp://" + $ftpHost + "/wwwroot/" + $relative))) -AllowMissing
    if ($code -ne 0) { return $null }
    return (Get-FileHash -LiteralPath $tmp -Algorithm SHA256).Hash.ToLowerInvariant()
  } finally { if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force } }
}

foreach ($relative in $Files) {
  $local = Join-Path $repo ($relative -replace '/', '\')
  if (-not (Test-Path -LiteralPath $local)) { throw "Local file missing: $relative" }
  $localHash = (Get-FileHash -LiteralPath $local -Algorithm SHA256).Hash.ToLowerInvariant()
  $localSize = (Get-Item -LiteralPath $local).Length

  # Back up the current production bytes before overwriting. A file that does
  # not exist yet is a new deployment and needs no backup.
  $remoteBefore = Get-RemoteHash $relative
  if ($remoteBefore) {
    $backupPath = Join-Path $backupRoot ($relative -replace '/', '\')
    New-Item -ItemType Directory -Path (Split-Path -Parent $backupPath) -Force | Out-Null
    & curl.exe @curl --output $backupPath --user "${ftpUser}:${ftpPassword}" ("ftp://" + $ftpHost + "/wwwroot/" + $relative)
    if ($LASTEXITCODE -ne 0) { throw "Backup download failed for $relative" }
  }

  Invoke-Curl -CurlArgs ($curl + @("--upload-file", $local, "--user", "${ftpUser}:${ftpPassword}", ("ftp://" + $ftpHost + "/wwwroot/" + $relative))) | Out-Null

  # The STOR return code alone proved insufficient in an earlier incident, so
  # the decision is made on the bytes that actually landed on the server.
  $remoteAfter = Get-RemoteHash $relative
  if ($remoteAfter -ne $localHash) {
    $results.Add("FAIL    $relative  local=$($localHash.Substring(0,12)) remote=$(if($remoteAfter){$remoteAfter.Substring(0,12)}else{'<none>'})")
    continue
  }
  $kind = if ($remoteBefore) { "updated" } else { "new     " }
  $results.Add("OK      $relative  $kind size=$localSize sha=$($localHash.Substring(0,12))")
}

Write-Output "backup: $backupRoot"
$results | ForEach-Object { Write-Output $_ }
if ($results | Where-Object { $_ -like "FAIL*" }) { exit 1 }
Write-Output "ALL UPLOADED AND VERIFIED"
