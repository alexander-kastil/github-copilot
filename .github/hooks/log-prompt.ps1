$inputJson = [Console]::In.ReadToEnd()
$hookData = $null
try { $hookData = $inputJson | ConvertFrom-Json } catch { exit 0 }

$dataPath = Join-Path $PSScriptRoot "../../.copilot-metadata/data"
$sessionFile = Join-Path $dataPath "current-session.txt"

if (-not (Test-Path $sessionFile)) { exit 0 }
$sessionId = (Get-Content $sessionFile -Raw).Trim()

$historyPath = Join-Path $dataPath "history-$sessionId.json"
if (-not (Test-Path $historyPath)) { exit 0 }

$epoch = [datetime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
$timestamp = if ($hookData.timestamp) {
    $epoch.AddMilliseconds($hookData.timestamp).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} else {
    (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

$history = Get-Content $historyPath -Raw | ConvertFrom-Json
if (-not $history.messages) {
    $history | Add-Member -NotePropertyName messages -NotePropertyValue @() -Force
}

$history.messages += @{
    role      = "user"
    timestamp = $timestamp
    content   = $hookData.prompt
}

$history | ConvertTo-Json -Depth 10 | Set-Content $historyPath
