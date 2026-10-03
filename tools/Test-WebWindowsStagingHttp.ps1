[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][uri]$HttpsOrigin,
  [Parameter(Mandatory = $true)][uri]$HttpOrigin
)

$ErrorActionPreference = 'Stop'
if ($HttpsOrigin.Scheme -ne 'https' -or $HttpOrigin.Scheme -ne 'http') { throw 'Explicit HTTPS and HTTP origins are required.' }
if ($HttpsOrigin.AbsolutePath -ne '/' -or $HttpOrigin.AbsolutePath -ne '/') { throw 'Origins must not contain paths.' }

function Invoke-Probe([string]$Method, [uri]$Uri, [hashtable]$Headers = @{}, [string]$Body = $null) {
  $parameters = @{ Uri = $Uri; Method = $Method; Headers = $Headers; MaximumRedirection = 0; SkipHttpErrorCheck = $true }
  if ($null -ne $Body) { $parameters.Body = $Body; $parameters.ContentType = 'application/x-www-form-urlencoded' }
  return Invoke-WebRequest @parameters
}

$httpLogin = Invoke-Probe 'GET' ([uri]::new($HttpOrigin, 'SystemManager/login.html'))
$httpMutation = Invoke-Probe 'POST' ([uri]::new($HttpOrigin, 'admin_api/adminAuth.asp?action=login')) @{
  'X-WebWindows-Admin-Request' = 'admin-auth'
} 'username=probe'
$httpRuntime = Invoke-Probe 'GET' ([uri]::new($HttpOrigin, 'api/runtime-release.asp?release=rel_00000000000000000000000000000000'))
$httpsLogin = Invoke-Probe 'GET' ([uri]::new($HttpsOrigin, 'SystemManager/login.html'))
$captcha = Invoke-Probe 'GET' ([uri]::new($HttpsOrigin, 'admin_api/adminAuth.asp?action=captcha')) @{
  'X-WebWindows-Admin-Request' = 'admin-auth'
}

$setCookie = @($captcha.Headers['Set-Cookie']) -join '; '
$checks = [ordered]@{
  httpLoginRedirect = ($httpLogin.StatusCode -in 301, 308 -and $httpLogin.Headers.Location -like "$($HttpsOrigin.GetLeftPart('Authority'))/*")
  httpMutationRejected = ($httpMutation.StatusCode -eq 403)
  httpRuntimeRejected = ($httpRuntime.StatusCode -eq 403)
  httpsLoginAvailable = ($httpsLogin.StatusCode -eq 200)
  hstsPresent = ([string]$httpsLogin.Headers['Strict-Transport-Security'] -match 'max-age=')
  framePolicyPresent = ([string]$httpsLogin.Headers['Content-Security-Policy'] -match 'frame-ancestors')
  sessionCookieObserved = ($setCookie -match 'ASPSESSIONID')
  sessionCookieSecure = ($setCookie -match '(?i);\s*Secure(?:;|$)')
  sessionCookieHttpOnly = ($setCookie -match '(?i);\s*HttpOnly(?:;|$)')
  sessionCookieSameSite = ($setCookie -match '(?i);\s*SameSite=(Strict|Lax)(?:;|$)')
}
$result = [ordered]@{
  contract = 'webwindows-staging-http-verification-v1'
  httpsOrigin = $HttpsOrigin.GetLeftPart('Authority')
  httpOrigin = $HttpOrigin.GetLeftPart('Authority')
  checks = $checks
  fixationLogoutAndCrossSessionCsrf = 'manual-browser-protocol-required'
  passed = (@($checks.Values | Where-Object { -not $_ }).Count -eq 0)
}
$result | ConvertTo-Json -Depth 5
if (-not $result.passed) { exit 1 }
