[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [Parameter(Mandatory = $true)][string]$Database,
  [Parameter(Mandatory = $true)][string]$DefaultsFile,
  [Parameter(Mandatory = $true)][string]$BackupPath,
  [Parameter(Mandatory = $true)][string]$ExpectedSha256,
  [Parameter(Mandatory = $true)][switch]$ConfirmIsolatedStaging,
  [string]$MySqlExe = 'mysql.exe'
)

$ErrorActionPreference = 'Stop'
if (-not $ConfirmIsolatedStaging) { throw 'Restore is restricted to an explicitly confirmed isolated staging database.' }
if ($Database -notmatch '^[A-Za-z0-9_]+$') { throw 'Unsafe database name.' }
$defaults = (Resolve-Path -LiteralPath $DefaultsFile).Path
$backup = (Resolve-Path -LiteralPath $BackupPath).Path
$actualHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $backup).Hash.ToLowerInvariant()
if ($actualHash -ne $ExpectedSha256.ToLowerInvariant()) { throw 'Backup SHA-256 mismatch.' }

if ($PSCmdlet.ShouldProcess($Database, "restore WebWindows trust backup $backup")) {
  Get-Content -LiteralPath $backup -Raw | & $MySqlExe "--defaults-extra-file=$defaults" "--database=$Database" '--binary-mode'
  if ($LASTEXITCODE -ne 0) { throw "mysql restore exited with code $LASTEXITCODE" }
  Write-Host 'Restore completed. Run Invoke-WebWindowsTrustMigration.ps1 -Action Verify before accepting evidence.'
}
