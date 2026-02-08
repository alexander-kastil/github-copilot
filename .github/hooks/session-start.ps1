$inputJson = [Console]::In.ReadToEnd()
$hookData = $null
try { $hookData = $inputJson | ConvertFrom-Json } catch { exit 0 }

$sessionId = [guid]::NewGuid().ToString()

$metadataPath = Join-Path $PSScriptRoot "../../.copilot-metadata"
$dataPath = Join-Path $metadataPath "data"

if (-not (Test-Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

Set-Content -Path (Join-Path $dataPath "current-session.txt") -Value $sessionId -NoNewline

$epoch = [datetime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
$timestamp = if ($hookData.timestamp) {
    $epoch.AddMilliseconds($hookData.timestamp).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} else {
    (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

@{
    sessionId = $sessionId
    startTime = $timestamp
    endTime   = $null
    status    = "active"
    messages  = @()
} | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $dataPath "history-$sessionId.json")

@{
    sessionId = $sessionId
    tools     = @()
} | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $dataPath "tools-$sessionId.json")
