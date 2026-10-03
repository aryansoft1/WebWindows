$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Get-Content -LiteralPath (Join-Path $repo 'admin_api/dashboardStats.asp') -Raw
$start = $source.IndexOf('activityJson = "["')
$endMarker = 'tipsJson = "[]"'
$end = $source.IndexOf($endMarker, $start)
if ($start -lt 0 -or $end -le $start) { throw 'Dashboard activity serializer is missing.' }
$serializer = $source.Substring($start, $end + $endMarker.Length - $start)
$script = @'
Class FakeRecordset
  Public RowCount
  Private Position
  Private Sub Class_Initialize()
    Position = 0
  End Sub
  Public Property Get EOF
    EOF = Position >= RowCount
  End Property
  Public Default Property Get Item(name)
    Select Case name
      Case "action_name": Item = "action" & Position
      Case "result_name": Item = "ok"
      Case "created_at": Item = "2026-09-27 12:00"
    End Select
  End Property
  Public Sub MoveNext()
    Position = Position + 1
  End Sub
  Public Sub Close()
  End Sub
End Class
Function AdminSecurityJson(value)
  AdminSecurityJson = value
End Function
Dim activityRs, activityJson, rowCount
For rowCount = 0 To 2
  Set activityRs = New FakeRecordset
  activityRs.RowCount = rowCount
__SERIALIZER__
  WScript.Echo activityJson
Next
'@.Replace('__SERIALIZER__', $serializer)
$temp = Join-Path $env:TEMP ("webwindows-dashboard-json-" + [guid]::NewGuid().ToString('N') + '.vbs')
try {
  Set-Content -LiteralPath $temp -Value $script -Encoding ASCII
  $output = @(cscript.exe //nologo $temp)
  if ($LASTEXITCODE -ne 0) { throw 'Dashboard VBScript execution failed.' }
  if ($output.Count -ne 3) { throw "Expected three JSON arrays, got $($output.Count)." }
  $arrays = @($output | ForEach-Object { ConvertFrom-Json -InputObject $_ -NoEnumerate })
  for ($i = 0; $i -le 2; $i++) {
    if (@($arrays[$i]).Count -ne $i) { throw "Activity count $i produced invalid JSON." }
  }
  if ($arrays[2][1].action -ne 'action1') { throw 'The second activity was not serialized.' }
  Write-Output 'dashboard activity JSON smoke test passed'
}
finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Force }
}
