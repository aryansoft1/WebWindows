param(
  [string]$OrsKeyFile
)

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
$routingConfigRelative = "api/navigation-proxy.config.asp"
$routingConfigTemplate = Join-Path $repo "api\navigation-proxy.config.example.asp"

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

function Test-And-BackupFtpFile([string]$relative, [string]$destination) {
  try {
    Receive-FtpFile $relative $destination
    return $true
  } catch [Net.WebException] {
    $ftpResponse = $_.Exception.Response
    if ($ftpResponse -and $ftpResponse.StatusCode -eq [Net.FtpStatusCode]::ActionNotTakenFileUnavailable) {
      return $false
    }
    throw
  }
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

$routingConfigBackup = Join-Path $backupRoot ($routingConfigRelative -replace '/', '\')
$routingConfigExists = Test-And-BackupFtpFile $routingConfigRelative $routingConfigBackup
if ($routingConfigExists) {
  Write-Output "routing_config=preserved"
} else {
  Send-FtpFile $routingConfigRelative $routingConfigTemplate
  $routingConfigVerify = Join-Path $verifyRoot ($routingConfigRelative -replace '/', '\')
  Receive-FtpFile $routingConfigRelative $routingConfigVerify
  $templateHash = (Get-FileHash -LiteralPath $routingConfigTemplate -Algorithm SHA256).Hash.ToLowerInvariant()
  $remoteConfigHash = (Get-FileHash -LiteralPath $routingConfigVerify -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($templateHash -ne $remoteConfigHash) { throw "Routing config template upload verification failed." }
  Write-Output "routing_config=created"
}

if ($OrsKeyFile) {
  if (-not (Test-Path -LiteralPath $OrsKeyFile -PathType Leaf)) { throw "ORS key file is missing." }
  $orsKey = (Get-Content -LiteralPath $OrsKeyFile -Raw).Trim()
  if (-not $orsKey -or $orsKey.Contains('"') -or $orsKey.Contains("`r") -or $orsKey.Contains("`n")) { throw "ORS key is invalid." }
  $configSource = if ($routingConfigExists) { $routingConfigBackup } else { $routingConfigTemplate }
  $configText = Get-Content -LiteralPath $configSource -Raw
  $orsDeclaration = 'Const WEBWINDOWS_ORS_API_KEY = "' + $orsKey + '"'
  if ($configText -match '(?im)^\s*(?:Const\s+)?WEBWINDOWS_ORS_API_KEY\s*=\s*"[^"]*"\s*$') {
    $configText = [regex]::Replace($configText, '(?im)^\s*(?:Const\s+)?WEBWINDOWS_ORS_API_KEY\s*=\s*"[^"]*"\s*$', $orsDeclaration)
  } elseif ($configText -match '(?m)^%>\s*$') {
    $configText = [regex]::Replace($configText, '(?m)^%>\s*$', $orsDeclaration + "`r`n%>", 1)
  } else {
    $configText = $configText.TrimEnd() + "`r`n" + $orsDeclaration + "`r`n"
  }
  $routingConfigUpload = Join-Path $backupRoot ".upload\api\navigation-proxy.config.asp"
  New-Item -ItemType Directory -Path (Split-Path -Parent $routingConfigUpload) -Force | Out-Null
  [IO.File]::WriteAllText($routingConfigUpload, $configText, [Text.UTF8Encoding]::new($false))
  Send-FtpFile $routingConfigRelative $routingConfigUpload
  $routingConfigVerify = Join-Path $verifyRoot ($routingConfigRelative -replace '/', '\')
  Receive-FtpFile $routingConfigRelative $routingConfigVerify
  $uploadHash = (Get-FileHash -LiteralPath $routingConfigUpload -Algorithm SHA256).Hash.ToLowerInvariant()
  $verifyHash = (Get-FileHash -LiteralPath $routingConfigVerify -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($uploadHash -ne $verifyHash) { throw "Routing config update verification failed." }
  Write-Output "routing_config=updated"
  $orsKey = $null
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
