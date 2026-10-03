[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$WebRoot,
  [Parameter(Mandatory = $true)][string]$ValidatorExecutablePath,
  [Parameter(Mandatory = $true)][string]$ValidatorQuarantinePath,
  [Parameter(Mandatory = $true)][string]$IisWorkerIdentity
)

$ErrorActionPreference = 'Stop'
$web = (Resolve-Path -LiteralPath $WebRoot).Path.TrimEnd('\')
$validator = (Resolve-Path -LiteralPath $ValidatorExecutablePath).Path
$quarantine = (Resolve-Path -LiteralPath $ValidatorQuarantinePath).Path.TrimEnd('\')

function Test-Within([string]$Child, [string]$Parent) {
  return $Child.Equals($Parent, [StringComparison]::OrdinalIgnoreCase) -or
    $Child.StartsWith($Parent + '\', [StringComparison]::OrdinalIgnoreCase)
}
if (Test-Within $validator $web) { throw 'Validator executable must be outside Web root.' }
if (Test-Within $quarantine $web) { throw 'Validator quarantine must be outside Web root.' }
if (Test-Within $validator $quarantine) { throw 'Validator executable must not be inside quarantine.' }

$writeMask = [System.Security.AccessControl.FileSystemRights]::Write -bor
  [System.Security.AccessControl.FileSystemRights]::Modify -bor
  [System.Security.AccessControl.FileSystemRights]::FullControl
$executeMask = [System.Security.AccessControl.FileSystemRights]::ReadAndExecute
$modifyMask = [System.Security.AccessControl.FileSystemRights]::Modify

function Get-AllowRights([string]$Path, [string]$Identity) {
  $rights = [System.Security.AccessControl.FileSystemRights]0
  foreach ($rule in (Get-Acl -LiteralPath $Path).Access) {
    if ($rule.AccessControlType -eq 'Allow' -and $rule.IdentityReference.Value -ieq $Identity) {
      $rights = $rights -bor $rule.FileSystemRights
    }
  }
  return $rights
}

$validatorRights = Get-AllowRights $validator $IisWorkerIdentity
$quarantineRights = Get-AllowRights $quarantine $IisWorkerIdentity
$anonymousAllows = @((Get-Acl -LiteralPath $quarantine).Access | Where-Object {
  $_.AccessControlType -eq 'Allow' -and $_.IdentityReference.Value -match '(^|\\)(IUSR|Guests)$'
})

$result = [ordered]@{
  contract = 'webwindows-validator-acl-verification-v1'
  webRoot = $web
  validatorExecutablePath = $validator
  validatorQuarantinePath = $quarantine
  workerIdentity = $IisWorkerIdentity
  validatorReadExecute = (($validatorRights -band $executeMask) -eq $executeMask)
  validatorNoWriteOrModify = (($validatorRights -band $writeMask) -eq 0)
  quarantineModify = (($quarantineRights -band $modifyMask) -eq $modifyMask)
  quarantineAnonymousNoAllow = ($anonymousAllows.Count -eq 0)
}
$result['passed'] = ($result.validatorReadExecute -and $result.validatorNoWriteOrModify -and
  $result.quarantineModify -and $result.quarantineAnonymousNoAllow)
$result | ConvertTo-Json -Depth 4
if (-not $result.passed) { exit 1 }
