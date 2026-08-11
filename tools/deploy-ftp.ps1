param(
  [switch]$AllowLegacyProductionManifest,
  [switch]$UseExistingRemoteRefs,
  [string[]]$AdoptUnrecordedProductionFiles = @()
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ftpHost = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_HOST")
$ftpUser = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_USER")
$ftpPassword = [Environment]::GetEnvironmentVariable("WEBWINDOWS_FTP_PASSWORD")
if (-not $ftpHost -or -not $ftpUser -or -not $ftpPassword) {
  throw "Set WEBWINDOWS_FTP_HOST, WEBWINDOWS_FTP_USER and WEBWINDOWS_FTP_PASSWORD for this process. Credentials must not be committed."
}

$productionManifestProbe = Join-Path $env:TEMP ("webwindows-production-manifest-" + [guid]::NewGuid().ToString("N") + ".json")
try {
  $manifestUrl = "ftp://" + $ftpHost + "/wwwroot/deploy/ftp-manifest.json"
  & curl.exe --silent --show-error --fail --noproxy "*" --retry 5 --retry-all-errors --retry-delay 1 `
    --output $productionManifestProbe --user "${ftpUser}:${ftpPassword}" $manifestUrl
  if ($LASTEXITCODE -ne 0) { throw "Unable to read the production deployment manifest." }

  & (Join-Path $PSScriptRoot "deployment-preflight.ps1") `
    -AllowLegacyProductionManifest:$AllowLegacyProductionManifest `
    -UseExistingRemoteRefs:$UseExistingRemoteRefs `
    -ProductionManifestPath $productionManifestProbe
  if ($LASTEXITCODE -ne 0) { throw "Deployment preflight failed." }
  $production = Get-Content -LiteralPath $productionManifestProbe -Raw | ConvertFrom-Json
}
finally {
  if (Test-Path -LiteralPath $productionManifestProbe) { Remove-Item -LiteralPath $productionManifestProbe -Force }
}

$manifest = Get-Content -LiteralPath (Join-Path $repo "deploy\ftp-manifest.json") -Raw | ConvertFrom-Json
$adoptUnrecorded = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($relative in $AdoptUnrecordedProductionFiles) {
  if ($manifest.requiredFiles -notcontains $relative -or $relative -eq "deploy/ftp-manifest.json") {
    throw "Cannot adopt a file outside this release manifest: $relative"
  }
  [void]$adoptUnrecorded.Add($relative)
}
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $repo ("deploy\backups\" + $stamp + "-" + [string]$production.releaseVersion)
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

function Invoke-FtpDownload([string]$relative, [string]$destination, [switch]$AllowMissing) {
  $parent = Split-Path -Parent $destination
  if ($parent) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
  $url = "ftp://" + $ftpHost + "/wwwroot/" + $relative
  & curl.exe --silent --show-error --fail --noproxy "*" --retry 5 --retry-all-errors --retry-delay 1 `
    --output $destination --user "${ftpUser}:${ftpPassword}" $url
  if ($LASTEXITCODE -ne 0) {
    if ($AllowMissing) {
      if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Force }
      return $false
    }
    throw "Unable to back up production file: $relative"
  }
  return $true
}

function Invoke-FtpUpload([string]$relative) {
  $source = Join-Path $repo ($relative -replace '/', '\')
  $url = "ftp://" + $ftpHost + "/wwwroot/" + $relative
  & curl.exe --silent --show-error --fail --noproxy "*" --retry 5 --retry-all-errors --retry-delay 1 `
    --ftp-create-dirs --upload-file $source --user "${ftpUser}:${ftpPassword}" $url
  if ($LASTEXITCODE -ne 0) { throw "Unable to upload production file: $relative" }
}

function Test-TextEquivalent([string]$left, [string]$right, [string]$relative) {
  if ([IO.Path]::GetExtension($relative) -notin @(".asp", ".css", ".htm", ".html", ".js", ".json", ".md", ".txt", ".xml")) {
    return $false
  }
  $leftText = (Get-Content -LiteralPath $left -Raw).Replace("`r`n", "`n").Replace("`r", "`n")
  $rightText = (Get-Content -LiteralPath $right -Raw).Replace("`r`n", "`n").Replace("`r", "`n")
  return [string]::Equals($leftText.TrimEnd([char]10), $rightText.TrimEnd([char]10), [StringComparison]::Ordinal)
}

foreach ($relative in $manifest.requiredFiles) {
  $backup = Join-Path $backupRoot ($relative -replace '/', '\')
  $productionEntry = if ($production.integrity -and $relative -ne "deploy/ftp-manifest.json") { $production.integrity.PSObject.Properties[$relative] } else { $null }
  $downloaded = Invoke-FtpDownload $relative $backup -AllowMissing:(-not $productionEntry)
  if ($productionEntry) {
    $actual = (Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne [string]$productionEntry.Value.sha256) {
      throw "Production file changed outside the recorded release: $relative"
    }
  } elseif ($downloaded -and $relative -ne "deploy/ftp-manifest.json") {
    $actual = (Get-FileHash -LiteralPath $backup -Algorithm SHA256).Hash.ToLowerInvariant()
    $expected = [string]$manifest.integrity.PSObject.Properties[$relative].Value.sha256
    if ($actual -ne $expected) {
      $source = Join-Path $repo ($relative -replace '/', '\')
      if (Test-TextEquivalent $backup $source $relative) {
        Write-Output "accepting_newline_equivalent_production_file=$relative"
        continue
      }
      if (-not $adoptUnrecorded.Contains($relative)) {
        throw "Unrecorded production dependency differs from this release: $relative"
      }
      Write-Output "adopting_unrecorded_production_file=$relative"
    }
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
