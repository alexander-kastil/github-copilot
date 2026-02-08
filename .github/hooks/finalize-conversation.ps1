# Find the latest conversation session based on file pattern
$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "..\..\.copilot-metadata"
$conversationFiles = Get-ChildItem -Path "$metadataPath\conversation-history--*.json" -ErrorAction SilentlyContinue | Sort-Object -Property LastWriteTime -Descending

if ($conversationFiles) {
    $conversationPath = $conversationFiles[0].FullName
    $sessionId = $conversationFiles[0].Name -replace '^conversation-history--', '' -replace '\.json$', ''
    $toolUsePath = Join-Path -Path $metadataPath -ChildPath "tool-use--$sessionId.json"
    $mdPath = Join-Path -Path $metadataPath -ChildPath "conversation--$sessionId.md"
} else {
    exit 0
}

# Read current conversation and session metadata
$conversation = @{}

if (Test-Path -Path $conversationPath) {
    $conversation = Get-Content -Path $conversationPath -Raw | ConvertFrom-Json
}

if ($conversation -and $sessionId) {
    # Add end time and finalize
    $conversation | Add-Member -NotePropertyName "endTime" -NotePropertyValue (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ") -Force
    $conversation | Add-Member -NotePropertyName "status" -NotePropertyValue "completed" -Force

    # Update the conversation history file with finalized state
    $conversation | ConvertTo-Json -Depth 10 | Set-Content -Path $conversationPath -Force

    Write-Host "Conversation finalized: $conversationPath"
}

Write-Host "Conversation session ended."
