param(
    [ValidateSet("pre", "post")]
    [string]$Phase = "pre"
)

$inputJson = [Console]::In.ReadToEnd()
$hookData = $null
try { $hookData = $inputJson | ConvertFrom-Json } catch { exit 0 }

$dataPath = Join-Path $PSScriptRoot "../../.copilot-metadata/data"
$sessionFile = Join-Path $dataPath "current-session.txt"

if (-not (Test-Path $sessionFile)) { exit 0 }
$sessionId = (Get-Content $sessionFile -Raw).Trim()

$toolsPath = Join-Path $dataPath "tools-$sessionId.json"
if (-not (Test-Path $toolsPath)) { exit 0 }

$epoch = [datetime]::new(1970, 1, 1, 0, 0, 0, [DateTimeKind]::Utc)
$timestamp = if ($hookData.timestamp) {
    $epoch.AddMilliseconds($hookData.timestamp).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} else {
    (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

$entry = [ordered]@{
    timestamp = $timestamp
    phase     = $Phase
    toolName  = $hookData.toolName
}

if ($Phase -eq "post" -and $hookData.toolResult) {
    $entry.resultType = $hookData.toolResult.resultType
}

$toolsData = Get-Content $toolsPath -Raw | ConvertFrom-Json
if (-not $toolsData.tools) {
    $toolsData | Add-Member -NotePropertyName tools -NotePropertyValue @() -Force
}

$toolsData.tools += [pscustomobject]$entry
$toolsData | ConvertTo-Json -Depth 10 | Set-Content $toolsPath
