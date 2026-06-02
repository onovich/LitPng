$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Text)

    Write-Host ""
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Run-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Command
    )

    Write-Section $Name
    Write-Host $Command -ForegroundColor DarkGray
    & cmd.exe /d /c $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE"
    }
}

function Get-UrlContent {
    param([Parameter(Mandatory = $true)][string]$Url)

    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 4
    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) {
        throw "$Url returned HTTP $($response.StatusCode)"
    }

    return [string]$response.Content
}

function Wait-ForUrl {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [Parameter(Mandatory = $true)][string]$ExpectedText,
        [int]$TimeoutSeconds = 35
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $lastError = $null

    while ((Get-Date) -lt $deadline) {
        try {
            $content = Get-UrlContent -Url $Url
            if ($content -like "*$ExpectedText*") {
                return $content
            }

            $lastError = "$Url responded but did not contain '$ExpectedText'"
        }
        catch {
            $lastError = $_.Exception.Message
        }

        Start-Sleep -Milliseconds 750
    }

    throw "Timed out waiting for $Url. Last error: $lastError"
}

function Ensure-PreviewServer {
    $rootUrl = "http://127.0.0.1:4321/"

    try {
        $content = Get-UrlContent -Url $rootUrl
        if ($content -like "*LittlePNG*") {
            Write-Host "Preview server already responds on $rootUrl" -ForegroundColor Green
            return
        }

        Write-Host "Port 4321 responds, but it does not look like LittlePNG. Starting a new preview may fail if the port is occupied." -ForegroundColor Yellow
    }
    catch {
        Write-Host "No ready preview server detected on $rootUrl. Starting one in a separate window..." -ForegroundColor Yellow
    }

    $previewCommand = "cd /d `"$PSScriptRoot`" && npm.cmd --workspace @littlepng/web run preview -- --host 127.0.0.1 --port 4321"
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", $previewCommand) -WorkingDirectory $PSScriptRoot

    Wait-ForUrl -Url $rootUrl -ExpectedText "LittlePNG" | Out-Null
}

try {
    Write-Host "LittlePNG manual smoke" -ForegroundColor Cyan
    Write-Host "Project root: $PSScriptRoot"

    Run-Step "Web unit tests" "npm.cmd run test"
    Run-Step "TypeScript typecheck" "npm.cmd run typecheck"
    Run-Step "Production build" "npm.cmd run build"
    Run-Step "Rust codec check" "npm.cmd run codec:check"
    Run-Step "Rust codec tests" "npm.cmd run codec:test"
    Run-Step "Rust codec WASM build" "npm.cmd run codec:build-wasm"

    Write-Section "Preview server"
    Ensure-PreviewServer

    Write-Section "HTTP smoke"
    Wait-ForUrl -Url "http://127.0.0.1:4321/" -ExpectedText "LittlePNG" | Out-Null
    Write-Host "Root route OK" -ForegroundColor Green

    Wait-ForUrl -Url "http://127.0.0.1:4321/png-compressor/" -ExpectedText "PNG Compressor" | Out-Null
    Write-Host "PNG compressor route OK" -ForegroundColor Green

    Write-Section "Open browser"
    Start-Process "http://localhost:4321/"

    Write-Section "Manual checklist"
    Write-Host "1. Add several PNG/JPG/WebP files."
    Write-Host "2. Change rename pattern, max width, output format, and quality."
    Write-Host "3. Run the batch and confirm one file failure does not block other files."
    Write-Host "4. Download one processed file."
    Write-Host "5. Download ZIP and confirm output names match the rename pattern."
    Write-Host "6. For same-format PNG/JPG inputs without resize or crop, confirm larger encoded outputs show Kept original."
    Write-Host "7. Toggle Lossless and confirm output is constrained to PNG, with quality, resize, crop, JPG, and WebP unavailable."
    Write-Host "8. Toggle Lossy and confirm Estimated loss changes with quality, format, resize, and crop settings."
    Write-Host "9. Click the language button and confirm the UI cycles through English, Chinese, Russian, Japanese, Spanish, and Brazilian Portuguese."
    Write-Host "10. Open http://localhost:4321/png-compressor/ and confirm it routes into the same tool."

    Write-Host ""
    Write-Host "Manual smoke is ready for browser verification." -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "Manual smoke failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
