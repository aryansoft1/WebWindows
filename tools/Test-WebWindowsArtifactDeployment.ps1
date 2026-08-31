[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$SiteRoot,

  [Parameter(Mandatory = $true)]
  [string]$TrustedValidatorRoot,

  [string]$ManifestPath = (Join-Path (Split-Path -Parent $PSScriptRoot) 'data\deploy\production-rehearsal-manifest-v1.json')
)

$ErrorActionPreference = 'Stop'
$resolvedRoot = (Resolve-Path -LiteralPath $SiteRoot).Path
$resolvedValidatorRoot = (Resolve-Path -LiteralPath $TrustedValidatorRoot).Path
$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
$results = @()

foreach ($artifact in $manifest.artifacts) {
  if ($artifact.target -like 'site-root:/*') {
    $targetRoot = $resolvedRoot
    $relative = $artifact.target.Substring('site-root:/'.Length)
  } elseif ($artifact.target -like 'trusted-validator:/*') {
    $targetRoot = $resolvedValidatorRoot
    $relative = $artifact.target.Substring('trusted-validator:/'.Length)
  } else {
    continue
  }
  $relative = $relative.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
  $candidate = [System.IO.Path]::GetFullPath((Join-Path $targetRoot $relative))
  if (-not $candidate.StartsWith($targetRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Artifact escapes site root: $($artifact.path)"
  }
  $exists = Test-Path -LiteralPath $candidate -PathType Leaf
  $actualHash = if ($exists) { (Get-FileHash -Algorithm SHA256 -LiteralPath $candidate).Hash.ToLowerInvariant() } else { $null }
  $actualBytes = if ($exists) { (Get-Item -LiteralPath $candidate).Length } else { $null }
  $results += [ordered]@{
    path = $artifact.path
    exists = $exists
    expectedBytes = [long]$artifact.bytes
    actualBytes = $actualBytes
    expectedSha256 = $artifact.sha256
    actualSha256 = $actualHash
    matches = ($exists -and $actualBytes -eq [long]$artifact.bytes -and $actualHash -eq $artifact.sha256)
  }
}

$failed = @($results | Where-Object { -not $_.matches })
[ordered]@{
  contract = 'webwindows-artifact-deployment-verification-v1'
  siteRoot = $resolvedRoot
  trustedValidatorRoot = $resolvedValidatorRoot
  checked = $results.Count
  passed = ($failed.Count -eq 0)
  mismatches = $failed
} | ConvertTo-Json -Depth 6

if ($failed.Count -ne 0) { exit 1 }
