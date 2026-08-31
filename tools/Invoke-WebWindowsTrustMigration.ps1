[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Check', 'Apply', 'Verify')]
  [string]$Action,

  [Parameter(Mandatory = $true)]
  [string]$Database,

  [string]$MySqlExe = 'mysql.exe',

  [Parameter(Mandatory = $true)]
  [string]$DefaultsFile
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$migrationRoot = Join-Path $repoRoot 'database\migrations'
$verifyFile = Join-Path $migrationRoot 'verify_webwindows_trust_schema.sql'

if ($Database -notmatch '^[A-Za-z0-9_]+$') {
  throw 'Database must contain only letters, digits, and underscore.'
}
$resolvedDefaults = (Resolve-Path -LiteralPath $DefaultsFile).Path
if (-not [System.IO.Path]::IsPathRooted($resolvedDefaults)) {
  throw 'DefaultsFile must be absolute.'
}

function Invoke-MySqlText {
  param([Parameter(Mandatory = $true)][string]$Sql)
  $output = $Sql | & $MySqlExe "--defaults-extra-file=$resolvedDefaults" "--database=$Database" '--batch' '--skip-column-names'
  if ($LASTEXITCODE -ne 0) { throw "mysql exited with code $LASTEXITCODE" }
  return @($output)
}

function Test-HistoryTable {
  $rows = Invoke-MySqlText "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='webwindows_schema_migrations';"
  return (($rows | Select-Object -First 1) -eq '1')
}

function Get-MigrationRecord {
  param([string]$MigrationId)
  if (-not (Test-HistoryTable)) { return $null }
  $rows = Invoke-MySqlText "SELECT CONCAT(checksum_sha256,':',success) FROM webwindows_schema_migrations WHERE migration_id='$MigrationId' LIMIT 1;"
  return ($rows | Select-Object -First 1)
}

function Test-TrustSchema {
  $verificationSql = Get-Content -LiteralPath $verifyFile -Raw
  $missing = @(Invoke-MySqlText $verificationSql | Where-Object { $_ -and $_.Trim() })
  if ($missing.Count -gt 0) {
    throw "Trust schema verification failed: $($missing -join ', ')"
  }
}

$migrations = @(Get-ChildItem -LiteralPath $migrationRoot -Filter '*.sql' |
  Where-Object { $_.Name -match '^\d{3}_[a-z0-9_]+\.sql$' } |
  Sort-Object Name)
if ($migrations.Count -eq 0) { throw 'No ordered trust-schema migrations found.' }

foreach ($migration in $migrations) {
  $migrationId = [System.IO.Path]::GetFileNameWithoutExtension($migration.Name)
  $checksum = (Get-FileHash -Algorithm SHA256 -LiteralPath $migration.FullName).Hash.ToLowerInvariant()
  $record = Get-MigrationRecord $migrationId
  if ($record) {
    if ($record -ne "$checksum`:1") {
      throw "Migration checksum/success drift: $migrationId"
    }
    Write-Host "APPLIED $migrationId $checksum"
    continue
  }
  if ($Action -ne 'Apply') {
    Write-Host "PENDING $migrationId $checksum"
    continue
  }

  Write-Host "APPLYING $migrationId"
  $migrationSql = Get-Content -LiteralPath $migration.FullName -Raw
  [void](Invoke-MySqlText $migrationSql)
  Test-TrustSchema
  [void](Invoke-MySqlText "INSERT INTO webwindows_schema_migrations(migration_id,checksum_sha256,success) VALUES('$migrationId','$checksum',1);")
  Write-Host "APPLIED $migrationId $checksum"
}

if ($Action -eq 'Verify') {
  Test-TrustSchema
  foreach ($migration in $migrations) {
    $migrationId = [System.IO.Path]::GetFileNameWithoutExtension($migration.Name)
    $checksum = (Get-FileHash -Algorithm SHA256 -LiteralPath $migration.FullName).Hash.ToLowerInvariant()
    if ((Get-MigrationRecord $migrationId) -ne "$checksum`:1") {
      throw "Migration history is incomplete or drifted: $migrationId"
    }
  }
  Write-Host 'VERIFIED WebWindows trust schema and migration history.'
}
