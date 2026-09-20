param()

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ftpHost = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_HOST", "User")
$ftpUser = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_USER", "User")
$ftpPassword = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_PASSWORD", "User")
if (-not $ftpHost -or -not $ftpUser -or -not $ftpPassword) { throw "FTP environment is incomplete." }
$credential = [Net.NetworkCredential]::new($ftpUser, $ftpPassword)
$manifestPath = Join-Path $repo "deploy\ftp-manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$files = @($manifest.uploadFiles)
if ($files[-1] -ne "deploy/ftp-manifest.json") { throw "Deployment manifest must be uploaded last." }
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repo ("deploy\backups\" + $stamp + "-wendao-scoped")
$verifyRoot = Join-Path $backupRoot ".verify"

function Get-FtpUri([string]$relative) {
  return "ftp://" + $ftpHost + "/wwwroot/" + $relative
}

function Receive-FtpFile([string]$relative, [string]$destination) {
  $parent = Split-Path -Parent $destination
  if ($parent) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  $request = [Net.FtpWebRequest]::Create((Get-FtpUri $relative))
  $request.Method = [Net.WebRequestMethods+Ftp]::DownloadFile
  $request.Credentials = $credential
  $request.UseBinary = $true
  $request.UsePassive = $true
  $request.KeepAlive = $false
  $request.Timeout = 60000
  $response = $request.GetResponse()
  try {
    $input = $response.GetResponseStream()
    $output = [IO.File]::Open($destination, [IO.FileMode]::Create, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
  } finally { $response.Dispose() }
}

function Send-FtpFile([string]$relative, [string]$source) {
  $request = [Net.FtpWebRequest]::Create((Get-FtpUri $relative))
  $request.Method = [Net.WebRequestMethods+Ftp]::UploadFile
  $request.Credentials = $credential
  $request.UseBinary = $true
  $request.UsePassive = $true
  $request.KeepAlive = $false
  $request.Timeout = 60000
  $bytes = [IO.File]::ReadAllBytes($source)
  $request.ContentLength = $bytes.Length
  $stream = $request.GetRequestStream()
  try { $stream.Write($bytes, 0, $bytes.Length) } finally { $stream.Dispose() }
  $response = $request.GetResponse()
  try { } finally { $response.Dispose() }
}

$manifestBackup = Join-Path $backupRoot "deploy\ftp-manifest.json"
Receive-FtpFile "deploy/ftp-manifest.json" $manifestBackup
$productionManifest = Get-Content -LiteralPath $manifestBackup -Raw | ConvertFrom-Json
foreach ($relative in $files) {
  if ($relative -eq "deploy/ftp-manifest.json") { continue }
  $entry = $productionManifest.integrity.PSObject.Properties[$relative]
  if (-not $entry) {
    Write-Output "new=$relative"
    continue
  }
  $backup = Join-Path $backupRoot ($relative -replace '/', '\')
  Receive-FtpFile $relative $backup
  $actual = (Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actual -ne [string]$entry.Value.sha256) { throw "Production file changed outside its manifest: $relative" }
}

foreach ($relative in $files) {
  $source = Join-Path $repo ($relative -replace '/', '\')
  Send-FtpFile $relative $source
  $verify = Join-Path $verifyRoot ($relative -replace '/', '\')
  Receive-FtpFile $relative $verify
  $localHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()
  $remoteHash = (Get-FileHash -LiteralPath $verify -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($localHash -ne $remoteHash) { throw "Uploaded file verification failed: $relative" }
  Write-Output "uploaded=$relative"
}

Write-Output "deployment_ok=true"
Write-Output ("release=" + [string]$manifest.releaseVersion)
Write-Output ("backup=" + $backupRoot)
