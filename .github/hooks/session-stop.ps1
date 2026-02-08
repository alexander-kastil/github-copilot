$inputJson = [Console]::In.ReadToEnd()
$hookData = $null
try { $hookData = $inputJson | ConvertFrom-Json } catch { exit 0 }

$metadataPath = Join-Path $PSScriptRoot "../../.copilot-metadata"
$dataPath = Join-Path $metadataPath "data"
$sessionFile = Join-Path $dataPath "current-session.txt"

if (-not (Test-Path $sessionFile)) { exit 0 }
$sessionId = (Get-Content $sessionFile -Raw).Trim()

$epoch = [datetime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
$timestamp = if ($hookData.timestamp) {
    $epoch.AddMilliseconds($hookData.timestamp).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} else {
    (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

$historyPath = Join-Path $dataPath "history-$sessionId.json"
if (Test-Path $historyPath) {
    $history = Get-Content $historyPath -Raw | ConvertFrom-Json
    $history | Add-Member -NotePropertyName endTime -NotePropertyValue $timestamp -Force
    $history | Add-Member -NotePropertyName status -NotePropertyValue "completed" -Force
    if ($hookData.reason) {
        $history | Add-Member -NotePropertyName reason -NotePropertyValue $hookData.reason -Force
    }
    $history | ConvertTo-Json -Depth 10 | Set-Content $historyPath
}

Push-Location $metadataPath
try {
    node visualize.mjs $sessionId 2>&1 | Out-Null
} finally {
    Pop-Location
}

Remove-Item $sessionFile -ErrorAction SilentlyContinue
