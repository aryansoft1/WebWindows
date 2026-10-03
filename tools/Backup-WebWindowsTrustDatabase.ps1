[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Database,
  [Parameter(Mandatory = $true)][string]$DefaultsFile,
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [string]$MySqlDumpExe = 'mysqldump.exe'
)

$ErrorActionPreference = 'Stop'
if ($Database -notmatch '^[A-Za-z0-9_]+$') { throw 'Unsafe database name.' }
$defaults = (Resolve-Path -LiteralPath $DefaultsFile).Path
$output = (Resolve-Path -LiteralPath $OutputDirectory).Path
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$backupPath = Join-Path $output "webwindows-trust-$stamp.sql"
$tables = @(
  'webwindows_schema_migrations', 'webwindows_developers', 'webwindows_function_submissions',
  'webwindows_function_packages', 'webwindows_function_ownership', 'webwindows_submission_validations',
  'webwindows_review_decisions', 'webwindows_published_releases', 'webwindows_published_release_events',
  'webwindows_function_catalog_versions', 'webwindows_catalog_release_bindings'
)

& $MySqlDumpExe "--defaults-extra-file=$defaults" '--single-transaction' '--quick' '--hex-blob' '--no-tablespaces' "--result-file=$backupPath" $Database $tables
if ($LASTEXITCODE -ne 0) { throw "mysqldump exited with code $LASTEXITCODE" }
if ((Get-Item -LiteralPath $backupPath).Length -eq 0) { throw 'Backup artifact is empty.' }
$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $backupPath).Hash.ToLowerInvariant()
Set-Content -LiteralPath "$backupPath.sha256" -Value "$hash  $([IO.Path]::GetFileName($backupPath))" -Encoding ascii
[ordered]@{ backup = $backupPath; sha256 = $hash; tables = $tables.Count } | ConvertTo-Json
