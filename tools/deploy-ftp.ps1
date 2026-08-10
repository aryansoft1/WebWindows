param(
  [switch]$AllowLegacyProductionManifest
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ftpHost = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_HOST")
$ftpUser = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_USER")
$ftpPassword = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_PASSWORD")
if (-not $ftpHost -or -not $ftpUser -or -not $ftpPassword) {
  throw "Set WEBWINDOWS_FTP_HOST, WEBWINDOWS_FTP_USER and WEBWINDOWS_FTP_PASSWORD for this process. Credentials must not be committed."
}

& (Join-Path $PSScriptRoot "deployment-preflight.ps1") -AllowLegacyProductionManifest:$AllowLegacyProductionManifest
if ($LASTEXITCODE -ne 0) { throw "Deployment preflight failed." }

$manifest = Get-Content -LiteralPath (Join-Path $repo "deploy\ftp-manifest.json") -Raw | ConvertFrom-Json
$production = Invoke-RestMethod -Uri ("https://www.y0.hk/deploy/ftp-manifest.json?v=" + [uri]::EscapeDataString([string]$manifest.releaseVersion)) -TimeoutSec 30
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repo ("deploy\backups\" + $stamp + "-" + [string]$production.releaseVersion)
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

function Invoke-FtpDownload([string]$relative, [string]$destination) {
  $parent = Split-Path -Parent $destination
  if ($parent) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  $url = "ftp://" + $ftpHost + "/wwwroot/" + $relative
  & curl.exe --silent --show-error --fail --retry 5 --retry-all-errors --retry-delay 1 `
    --output $destination --user "${ftpUser}:${ftpPassword}" $url
  if ($LASTEXITCODE -ne 0) { throw "Unable to back up production file: $relative" }
}

function Invoke-FtpUpload([string]$relative) {
  $source = Join-Path $repo ($relative -replace '/', '\')
  $url = "ftp://" + $ftpHost + "/wwwroot/" + $relative
  & curl.exe --silent --show-error --fail --retry 5 --retry-all-errors --retry-delay 1 `
    --ftp-create-dirs --upload-file $source --user "${ftpUser}:${ftpPassword}" $url
  if ($LASTEXITCODE -ne 0) { throw "Unable to upload production file: $relative" }
}

foreach ($relative in $manifest.requiredFiles) {
  $backup = Join-Path $backupRoot ($relative -replace '/', '\')
  Invoke-FtpDownload $relative $backup
  $productionEntry = if ($production.integrity -and $relative -ne "deploy/ftp-manifest.json") { $production.integrity.PSObject.Properties[$relative] } else { $null }
  if ($productionEntry) {
    $actual = (Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne [string]$productionEntry.Value.sha256) {
      throw "Production file changed outside the recorded release: $relative"
    }
  } elseif ($relative -ne "deploy/ftp-manifest.json" -and -not $AllowLegacyProductionManifest) {
    throw "Production integrity is unavailable for: $relative"
  }
}

$late = @("data/apps/system-apps.json", "api/function-catalog.asp", "deploy/ftp-manifest.json", "index.html")
$ordered = @($manifest.requiredFiles | Where-Object { $late -notcontains $_ }) + @($late | Where-Object { $manifest.requiredFiles -contains $_ })
foreach ($relative in $ordered) { Invoke-FtpUpload $relative }

foreach ($relative in $manifest.requiredFiles) {
  if ($relative -eq "deploy/ftp-manifest.json") { continue }
  $probe = Join-Path $env:TEMP ("webwindows-deploy-" + [guid]::NewGuid().ToString("N"))
  try {
    Invoke-FtpDownload $relative $probe
    $actual = (Get-FileHash -LiteralPath $probe -Algorithm SHA256).Hash.ToLowerInvariant()
    $expected = [string]$manifest.integrity.PSObject.Properties[$relative].Value.sha256
    if ($actual -ne $expected) { throw "Post-upload verification failed: $relative" }
  }
  finally {
    if (Test-Path -LiteralPath $probe) { Remove-Item -LiteralPath $probe -Force }
  }
}

Write-Output "deployment_ok=true"
Write-Output "release=$($manifest.releaseVersion)"
Write-Output "files=$($manifest.requiredFiles.Count)"
Write-Output "backup=$backupRoot"
