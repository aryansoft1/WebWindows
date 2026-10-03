<#
  开发者面恢复包 · 生产上传脚本 (2026-09-23)

  按 manifest.json 上传文件到生产，带备份与回读校验。
  部署模式沿用 tmp/deploy-studio-storage-hotfix.ps1 的既有做法：
    远端旧文件 -> <path>.__previous_<marker>（保留，供回滚）
    本地文件   -> <path>.__<marker>（临时） -> RNFR/RNTO 原子替换为正式路径
    上传后回读 -> SHA-256 与 manifest 比对

  用法:
    .\deploy-ftp.ps1                          # 交互输入 FTP 账密
    .\deploy-ftp.ps1 -DryRun                  # 只校验本地文件与打印计划
    .\deploy-ftp.ps1 -IncludeOptional         # 一并上传 manifest 里 optional 的文件
    $env:WEBWINDOWS_FTP_USER='u'; $env:WEBWINDOWS_FTP_PASSWORD='p'; .\deploy-ftp.ps1
#>
[CmdletBinding()]
param(
    [string]$FtpHost = "aryansofthk.gotoftp1.com",
    [string]$FtpRoot = "/wwwroot",
    [string]$FtpUser = $env:WEBWINDOWS_FTP_USER,
    [string]$WebRoot  = "https://www.y0.hk",
    [string]$ReleaseMarker = "20260923-developer-recovery",
    [switch]$IncludeOptional,
    [switch]$DryRun,
    [switch]$SkipHttpVerify
)

$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace  = (Resolve-Path (Join-Path $scriptRoot "..\..")).Path
$manifestPath = Join-Path $scriptRoot "manifest.json"

if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    throw "Missing manifest: $manifestPath"
}
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Get-FileSha256([string]$Path) {
    (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLower()
}

# ---- 1. 解析本地来源并校验 SHA-256 -------------------------------------------------
$plan = @()
foreach ($upload in $manifest.uploads) {
    $target = [string]$upload.target
    $payloadCandidate = Join-Path $scriptRoot ("payload\" + ($target -replace "/", "\"))
    $localPath = $null
    $origin = "repo"
    if ($upload.localSource) {
        $declared = Join-Path $scriptRoot ([string]$upload.localSource -replace "/", "\")
        if (Test-Path -LiteralPath $declared -PathType Leaf) {
            $localPath = $declared
            $origin = "payload"
        }
    }
    if (-not $localPath) {
        if (Test-Path -LiteralPath $payloadCandidate -PathType Leaf) {
            $localPath = $payloadCandidate
            $origin = "payload"
        } else {
            $localPath = Join-Path $workspace ($target -replace "/", "\")
        }
    }
    if (-not (Test-Path -LiteralPath $localPath -PathType Leaf)) {
        throw "Missing local file for $target (looked at $payloadCandidate and $localPath)"
    }

    $isOptional = [bool]$upload.optional
    $actual = Get-FileSha256 $localPath
    $expected = ([string]$upload.sha256).ToLower()
    if ($actual -ne $expected) {
        throw "SHA-256 mismatch for $target`n  manifest: $expected`n  local   : $actual`n  来源    : $localPath"
    }
    $plan += [pscustomobject]@{
        Target    = $target
        LocalPath = $localPath
        Sha256    = $actual
        Bytes     = [int]$upload.bytes
        Optional  = $isOptional
        FromPayload = ($origin -eq "payload")
        Origin    = $origin
    }
}

$selected = @($plan | Where-Object { -not $_.Optional -or $IncludeOptional })
$skipped  = @($plan | Where-Object { $_.Optional -and -not $IncludeOptional })

Write-Host ""
Write-Host "部署计划 (marker: $ReleaseMarker)" -ForegroundColor Cyan
foreach ($item in $selected) {
    $flag = if ($item.Optional) { " [可选]" } else { "" }
    Write-Host ("  {0,-34} <- {1} ({2} B, {3}){4}" -f $item.Target, $item.Origin, $item.Bytes, $item.Sha256.Substring(0, 12), $flag)
}
foreach ($item in $skipped) {
    Write-Host ("  跳过(可选未启用): {0}" -f $item.Target) -ForegroundColor DarkGray
}

if ($selected.Count -eq 0) { throw "没有待上传文件。" }

if ($DryRun) {
    Write-Host ""
    Write-Host "DryRun：本地 SHA-256 全部校验通过，未连接远端。" -ForegroundColor Green
    return
}

# ---- 2. 取凭据 -------------------------------------------------------------------------
$securePassword = $null
if (-not $FtpUser) { $FtpUser = Read-Host "FTP user" }
if ($env:WEBWINDOWS_FTP_PASSWORD) {
    $securePassword = ConvertTo-SecureString $env:WEBWINDOWS_FTP_PASSWORD -AsPlainText -Force
    Remove-Item Env:\WEBWINDOWS_FTP_PASSWORD -ErrorAction SilentlyContinue
} else {
    $securePassword = Read-Host "FTP password" -AsSecureString
}

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
$netrcPath = [IO.Path]::GetTempFileName()
$results = @()

try {
    [IO.File]::WriteAllText(
        $netrcPath,
        "machine $FtpHost`nlogin $FtpUser`npassword $plainPassword`n",
        [Text.UTF8Encoding]::new($false)
    )

    function Invoke-Curl([string[]]$Arguments, [switch]$AllowFailure) {
        $output = & curl.exe @Arguments 2>&1
        if (-not $AllowFailure -and $LASTEXITCODE -ne 0) {
            throw "curl 失败 (exit $LASTEXITCODE): $($output -join "`n")"
        }
        return ($output -join "`n")
    }

    function Get-RemoteCommand([string]$Target) {
        $remotePath = "$FtpRoot/$Target" -replace "//+", "/"
        $tempPath   = "$remotePath.__$ReleaseMarker"
        $prevPath   = "$remotePath.__previous_$ReleaseMarker"
        return @{ Remote = $remotePath; Temp = $tempPath; Prev = $prevPath }
    }

    foreach ($item in $selected) {
        $paths = Get-RemoteCommand $item.Target
        Write-Host ""
        Write-Host ("上传 {0}" -f $item.Target) -ForegroundColor Cyan

        # 2a. 现网旧文件 -> .__previous_ (忽略“文件不存在”)
        Invoke-Curl @(
            "--silent", "--show-error", "--netrc-file", $netrcPath,
            "--quote", "*DELE $($paths.Prev)",
            "--quote", "*RNFR $($paths.Remote)",
            "--quote", "*RNTO $($paths.Prev)",
            "--output", "NUL",
            "ftp://$FtpHost$FtpRoot/"
        )

        # 2b. 清掉可能残留的临时文件
        Invoke-Curl @(
            "--silent", "--show-error", "--netrc-file", $netrcPath,
            "--quote", "*DELE $($paths.Temp)",
            "--output", "NUL",
            "ftp://$FtpHost$FtpRoot/"
        )

        # 2c. 上传到临时路径
        Invoke-Curl @(
            "--silent", "--show-error", "--fail", "--retry", "6", "--retry-all-errors", "--retry-delay", "3",
            "--netrc-file", $netrcPath, "--ftp-create-dirs",
            "--upload-file", $item.LocalPath,
            "ftp://$FtpHost$($paths.Temp)"
        )

        # 2d. 原子替换为正式路径
        Invoke-Curl @(
            "--silent", "--show-error", "--fail", "--netrc-file", $netrcPath,
            "--quote", "*DELE $($paths.Remote)",
            "--quote", "RNFR $($paths.Temp)",
            "--quote", "RNTO $($paths.Remote)",
            "--output", "NUL",
            "ftp://$FtpHost$FtpRoot/"
        )

        Write-Host ("  已替换，备份保留在 {0}" -f $paths.Prev) -ForegroundColor DarkGray
        Start-Sleep -Milliseconds 2500

        # 2e. HTTP 回读校验
        $verified = $false
        $note = ""
        if (-not $SkipHttpVerify) {
            $probe = Join-Path $env:TEMP ("recover-" + [Guid]::NewGuid().ToString("n") + ".bin")
            try {
                Invoke-Curl @(
                    "--silent", "--show-error", "--fail", "--retry", "3", "--retry-delay", "2",
                    "--output", $probe,
                    "$WebRoot/$($item.Target)"
                )
                $remoteHash = Get-FileSha256 $probe
                $verified = ($remoteHash -eq $item.Sha256)
                $note = if ($verified) { $remoteHash.Substring(0, 12) } else { "期望 $($item.Sha256.Substring(0,12)) 实际 $remoteHash" }
                if (-not $verified) { throw "HTTP 回读 SHA-256 不一致: $($item.Target) ($note)" }
            } finally {
                if (Test-Path -LiteralPath $probe) { Remove-Item -LiteralPath $probe -Force }
            }
        }

        $results += [pscustomobject]@{
            Target   = $item.Target
            Verified = $verified
            Note     = $note
            Backup   = $paths.Prev
        }
        Write-Host ("  HTTP 回读校验: {0}" -f $(if ($verified) { "通过 " + $note } else { "跳过" })) -ForegroundColor Green
    }
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    $plainPassword = $null
    if ($netrcPath -and (Test-Path -LiteralPath $netrcPath)) {
        Remove-Item -LiteralPath $netrcPath -Force
    }
}

Write-Host ""
Write-Host "上传完成。" -ForegroundColor Green
$results | Format-Table -AutoSize

Write-Host "远端备份（回滚时可直接取回）:" -ForegroundColor Yellow
foreach ($r in $results) { Write-Host ("  " + $r.Backup) }

Write-Host ""
Write-Host "接下来必须做（否则目录接口仍返回旧 16 项）:" -ForegroundColor Yellow
Write-Host "  1. SQL: UPDATE webwindows_function_catalog_versions SET is_active=0 WHERE is_active=1;"
Write-Host "  2. GET $WebRoot/api/function-catalog.asp            (触发从新文件 Seed)"
Write-Host "  3. 后台 $WebRoot/SystemManager/functions.html -> 发布, 版本输入 2026.09.23.1"
Write-Host "  4. 用无痕窗口验证 (缓存键 webwindows.functions.catalog-cache.v1)"
Write-Host "详见 README.md 第 3、4 节。"
