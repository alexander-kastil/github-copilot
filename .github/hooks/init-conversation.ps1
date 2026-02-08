param(
    [string]$SessionId
)

# Use provided session ID or generate new one
if (-not $SessionId) {
    $SessionId = [guid]::NewGuid().ToString()
}

$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "../../.copilot-metadata"
$dataPath = Join-Path -Path $metadataPath -ChildPath "data"

# Ensure metadata and data folders exist
if (-not (Test-Path -Path $metadataPath)) {
    New-Item -ItemType Directory -Path $metadataPath -Force | Out-Null
}
if (-not (Test-Path -Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

$conversationPath = Join-Path -Path $dataPath -ChildPath "conversation-history--$SessionId.json"
$toolUsePath = Join-Path -Path $dataPath -ChildPath "tool-use--$SessionId.json"

$conversationState = @{
    sessionId = $SessionId
    startTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    tools = @()
    messages = @()
    metadata = @{
        initialized = $true
    }
}

# Save conversation state to file
$conversationState | ConvertTo-Json -Depth 10 | Set-Content -Path $conversationPath -Force

# Initialize tool-use log for this session
@() | ConvertTo-Json -Depth 10 | Set-Content -Path $toolUsePath -Force

# Store session ID in environment for later use
$env:COPILOT_SESSION_ID = $SessionId

# Create a simple conversation MD file
$mdPath = Join-Path -Path $metadataPath -ChildPath "conversation--$SessionId.md"
$mdContent = @"
# Conversation Session: $SessionId

**Started:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Tool Execution Flow

\`\`\`mermaid
sequenceDiagram
    participant Agent
    participant Tools
    Note over Agent,Tools: Conversation initialized
\`\`\`

## Tool Use Metrics
- Total Calls: 0
- Success: 0
- Total Time: 0ms

---
_Session ID: $SessionId_
"@

Set-Content -Path $mdPath -Value $mdContent -Force

Write-Host "Conversation initialized with session ID: $SessionId"
