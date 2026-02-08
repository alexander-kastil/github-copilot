$sessionId = [guid]::NewGuid().ToString()
$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "..\..\.copilot-metadata"

# Ensure metadata folder exists
if (-not (Test-Path -Path $metadataPath)) {
    New-Item -ItemType Directory -Path $metadataPath -Force | Out-Null
}

$conversationPath = Join-Path -Path $metadataPath -ChildPath "conversation-history--$sessionId.json"
$toolUsePath = Join-Path -Path $metadataPath -ChildPath "tool-use--$sessionId.json"

$conversationState = @{
    sessionId = $sessionId
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

# Create a simple conversation MD file
$mdPath = Join-Path -Path $metadataPath -ChildPath "conversation--$sessionId.md"
$mdContent = @"
# Conversation Session: $sessionId

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
_Session ID: $sessionId_
"@

Set-Content -Path $mdPath -Value $mdContent -Force

Write-Host "Conversation initialized with session ID: $sessionId"
