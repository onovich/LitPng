param(
    [string]$Country = "us",
    [string]$OutFile = "research/keyword-results.json",
    [int]$DelayMs = 1200
)

$ErrorActionPreference = "Stop"

$keywords = @(
    "image compressor",
    "image compression",
    "online image compressor",
    "compress images online",
    "png compressor",
    "compress png",
    "jpg compressor",
    "compress jpg",
    "jpeg compressor",
    "tinypng",
    "batch image compressor",
    "bulk image compressor",
    "batch png compressor",
    "bulk png compressor"
)

function Get-KeywordMetric {
    param(
        [string]$Keyword,
        [string]$Country
    )

    $encoded = [System.Uri]::EscapeDataString($Keyword)
    $uri = "https://app.seodata.dev/v1/keyword?q=$encoded&country=$Country"

    try {
        $response = Invoke-WebRequest -Uri $uri -UseBasicParsing
        return $response.Content | ConvertFrom-Json
    }
    catch {
        return [pscustomobject]@{
            keyword = $Keyword
            country = $Country
            error = $_.Exception.Message
        }
    }
}

$results = foreach ($keyword in $keywords) {
    Start-Sleep -Milliseconds $DelayMs
    Get-KeywordMetric -Keyword $keyword -Country $Country
}

$enriched = $results | ForEach-Object {
    $volume = if ($null -ne $_.volume) { [double]$_.volume } else { 0 }
    $cpc = if ($null -ne $_.cpc) { [double]$_.cpc } else { 0 }
    $adCompetition = if ($null -ne $_.competition) { [double]$_.competition } else { 0 }

    # market_value follows the requested early formula: search volume * competition.
    # commercial_value adds CPC so high-intent paid demand is visible too.
    $_ | Add-Member -NotePropertyName market_value -NotePropertyValue ([math]::Round($volume * $adCompetition, 2)) -Force
    $_ | Add-Member -NotePropertyName commercial_value -NotePropertyValue ([math]::Round($volume * [math]::Max($cpc, 0.1) * (1 + $adCompetition), 2)) -Force
    $_
}

$dir = Split-Path -Parent $OutFile
if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

$json = $enriched | Sort-Object commercial_value -Descending | ConvertTo-Json -Depth 5
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$successCount = @($enriched | Where-Object { $null -ne $_.volume }).Count
if ($successCount -eq 0 -and (Test-Path $OutFile)) {
    Write-Warning "All keyword requests failed; keeping existing $OutFile unchanged."
}
else {
    [System.IO.File]::WriteAllText((Resolve-Path -LiteralPath ".").Path + "\" + $OutFile, $json, $utf8NoBom)
}

$enriched |
    Sort-Object commercial_value -Descending |
    Select-Object keyword, volume, cpc, competition, market_value, commercial_value, cached, cached_at, error |
    Format-Table -AutoSize
