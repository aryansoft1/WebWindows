$ErrorActionPreference = "Stop"

$aiRoot = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $aiRoot "knowledge\index.inc.asp"
$casesPath = Join-Path $PSScriptRoot "knowledge-questions.json"
$indexText = [System.IO.File]::ReadAllText($indexPath)
$pattern = 'RegisterKnowledge\s+"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"'
$topics = [regex]::Matches($indexText, $pattern) | ForEach-Object {
  [pscustomobject]@{
    Id = $_.Groups[1].Value
    Keywords = $_.Groups[2].Value.Split("|")
    File = $_.Groups[3].Value
  }
}

if (-not $topics.Count) { throw "No knowledge topics were registered." }

$cases = Get-Content -Raw -LiteralPath $casesPath | ConvertFrom-Json
$failed = 0
foreach ($case in $cases) {
  $selected = $topics | ForEach-Object {
    $score = 0
    foreach ($keyword in $_.Keywords) {
      if ($keyword -and $case.question.IndexOf($keyword, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
        $score += $keyword.Length
      }
    }
    [pscustomobject]@{ Id = $_.Id; Score = $score }
  } | Where-Object Score -gt 0 | Sort-Object Score -Descending | Select-Object -First 3

  $selectedIds = @($selected.Id)
  $missing = @($case.topics | Where-Object { $_ -notin $selectedIds })
  $ok = $missing.Count -eq 0
  if (-not $ok) { $failed += 1 }
  $status = if ($ok) { "PASS" } else { "FAIL" }
  Write-Output ("{0} | {1} | {2}" -f $status, $case.question, ($selectedIds -join ","))
}

if ($failed) { throw "$failed knowledge routing test(s) failed." }
Write-Output "Knowledge routing tests passed: $($cases.Count)"
