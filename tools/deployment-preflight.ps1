param(
  [switch]$AllowLegacyProductionManifest,
  [switch]$UseExistingRemoteRefs
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $repo
try {
  if (-not $UseExistingRemoteRefs) {
    git fetch origin --prune
    if ($LASTEXITCODE -ne 0) { throw "Unable to fetch origin." }
  }

  git merge-base --is-ancestor origin/main HEAD
  if ($LASTEXITCODE -ne 0) { throw "Current branch does not contain the latest origin/main." }

  $status = @(git status --porcelain)
  if ($status.Count -ne 0) { throw "Worktree is not clean. Commit and test changes before deployment." }

  $branch = (git branch --show-current).Trim()
  $upstream = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null).Trim()
  if (-not $upstream) { throw "Current branch has no upstream." }
  $localHead = (git rev-parse HEAD).Trim()
  $remoteHead = (git rev-parse $upstream).Trim()
  if ($localHead -ne $remoteHead) { throw "Current branch is not synchronized with $upstream." }

  $manifestPath = Join-Path $repo "deploy\ftp-manifest.json"
  $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
  foreach ($relative in $manifest.requiredFiles) {
    $tracked = git ls-files --error-unmatch -- $relative 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $tracked) { throw "Deployment file is not tracked: $relative" }
    $full = Join-Path $repo ($relative -replace '/', '\')
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { throw "Deployment file is missing: $relative" }
    if ($relative -eq "deploy/ftp-manifest.json") { continue }
    $integrityEntry = $manifest.integrity.PSObject.Properties[$relative]
    $expected = if ($integrityEntry) { $integrityEntry.Value.sha256 } else { $null }
    if (-not $expected) { throw "Deployment integrity is missing: $relative" }
    $actual = (Get-FileHash -LiteralPath $full -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actual -ne $expected) { throw "Deployment integrity mismatch: $relative" }
  }

  $production = Invoke-RestMethod -Uri ("https://www.y0.hk/deploy/ftp-manifest.json?v=" + [uri]::EscapeDataString([string]$manifest.releaseVersion)) -TimeoutSec 30
  if (-not $production.integrity -and -not $AllowLegacyProductionManifest) {
    throw "Production manifest has no integrity data. Use -AllowLegacyProductionManifest only for the one-time migration after making a backup."
  }
  $productionVersion = [string]$production.releaseVersion
  $expectedPrevious = [string]$manifest.previousReleaseVersion
  $expectedCurrent = [string]$manifest.releaseVersion
  if ($expectedPrevious -and $productionVersion -ne $expectedPrevious -and $productionVersion -ne $expectedCurrent) {
    throw "Production release changed since this branch was prepared: expected $expectedPrevious or $expectedCurrent, found $productionVersion."
  }

  Write-Output "preflight_ok=true"
  Write-Output "branch=$branch"
  Write-Output "commit=$localHead"
  Write-Output "release=$($manifest.releaseVersion)"
  Write-Output "production_release=$productionVersion"
  Write-Output ("already_deployed=" + ($productionVersion -eq $expectedCurrent).ToString().ToLowerInvariant())
  Write-Output "files=$($manifest.requiredFiles.Count)"
}
finally {
  Pop-Location
}
