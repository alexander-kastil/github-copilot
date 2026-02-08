param(
    [ValidateSet("pre", "post")]
    [string]$Phase = "pre"
)

$inputJson = [Console]::In.ReadToEnd()
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

# Parse the input
$toolData = $null
try {
    $toolData = $inputJson | ConvertFrom-Json
} catch {
    $toolData = @{ rawInput = $inputJson }
}

# Build the log entry
$logEntry = [pscustomobject]@{
    timestamp = $timestamp
    phase = $Phase
    toolName = $toolData.toolName
    toolId = $toolData.toolId
    sessionId = $toolData.sessionId
    input = $toolData.input
    output = $toolData.output
    success = $toolData.success
    errorMessage = $toolData.errorMessage
    duration = $toolData.duration
    rawPayload = $toolData
}

# Get sessionId from latest conversation history file
$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "..\..\.copilot-metadata"
$dataPath = Join-Path -Path $metadataPath -ChildPath "data"
$conversationFiles = Get-ChildItem -Path "$dataPath\conversation-history--*.json" -ErrorAction SilentlyContinue | Sort-Object -Property LastWriteTime -Descending
$sessionId = if ($conversationFiles) { 
    $conversationFiles[0].Name -replace '^conversation-history--', '' -replace '\.json$', ''
} else { 
    "unknown" 
}

# Path to the session-specific tool-use file
$toolUsePath = Join-Path -Path $dataPath -ChildPath "tool-use--$sessionId.json"

# Read existing entries or create new array
$entries = @()
if (Test-Path -Path $toolUsePath) {
    try {
        $content = Get-Content -Path $toolUsePath -Raw
        $entries = $content | ConvertFrom-Json
        if ($entries -isnot [array]) {
            $entries = @($entries)
        }
    } catch {
        $entries = @()
    }
}

# Append the new entry
$entries += $logEntry

# Write back to session-specific file
$entries | ConvertTo-Json -Depth 10 | Set-Content -Path $toolUsePath -Force

# Generate conversation.md from current session data
$mdPath = Join-Path -Path $metadataPath -ChildPath "conversation--$sessionId.md"

# Use entries from current session
$postEntries = $entries | Where-Object { $_.phase -eq "post" }

# Calculate metrics
$totalCalls = ($postEntries | Measure-Object).Count
$successCalls = ($postEntries | Where-Object { $_.success -eq $true } | Measure-Object).Count
$totalTime = ($postEntries | Where-Object { $_.duration } | Measure-Object -Property duration -Sum).Sum
$avgTime = if ($totalCalls -gt 0) { [math]::Round($totalTime / $totalCalls) } else { 0 }

# Group by tool and get metrics
$toolMetrics = $postEntries | 
    Group-Object -Property toolName | 
    Select-Object @{Name='Tool'; Expression={$_.Name}}, @{Name='Count'; Expression={$_.Count}}, @{Name='Duration'; Expression={($_.Group | Where-Object { $_.duration } | Measure-Object -Property duration -Sum).Sum}} |
    Sort-Object -Property Count -Descending

# Build sequence diagram from entries
$sequenceDiagram = "sequenceDiagram`n    participant Agent`n    participant Tools`n"
$prePhaseEntries = $entries | Where-Object { $_.phase -eq "pre" } | Sort-Object { [datetime]$_.timestamp }

foreach ($entry in $prePhaseEntries) {
    $toolName = $entry.toolName ?? "unknown"
    $sequenceDiagram += "    `n    Agent->>Tools: PRE: $toolName`n"
    
    # Find corresponding post entry
    $postEntry = $entries | Where-Object { $_.phase -eq "post" -and $_.toolName -eq $toolName -and [datetime]$_.timestamp -gt [datetime]$entry.timestamp } | Select-Object -First 1
    if ($postEntry) {
        $sequenceDiagram += "    activate Tools`n"
        if ($postEntry.duration) {
            $sequenceDiagram += "    Note right of Tools: Completed in $($postEntry.duration)ms`n"
        } else {
            $sequenceDiagram += "    Note right of Tools: Completed`n"
        }
        $sequenceDiagram += "    Tools->>Agent: POST: $(if ($postEntry.success) { 'Success' } else { 'Failed' })`n"
        $sequenceDiagram += "    deactivate Tools`n"
    }
}

# Build tool metrics graph
$graphDiagram = "graph TD`n    ROOT[`"Tool Execution Metrics`"]`n"
$graphDiagram += "    ROOT --> TOTAL[`"Total Calls: $totalCalls`"]`n"
$graphDiagram += "    ROOT --> SUCCESS[`"Success: $successCalls`"]`n"
$graphDiagram += "    ROOT --> TIME[`"Total: $($totalTime)ms`"]`n"
$graphDiagram += "    ROOT --> AVG[`"Avg: $($avgTime)ms`"]`n"
$graphDiagram += "    `n    ROOT --> TOOLS[`"Tools`"]`n"

$toolCount = 0
foreach ($metric in $toolMetrics) {
    $toolCount++
    $graphDiagram += "    TOOLS --> T$toolCount[`"$($metric.Tool) - Count: $($metric.Count), Duration: $($metric.Duration)ms`"]`n"
}

$graphDiagram += "    `n    style SUCCESS fill:#90EE90`n    style TIME fill:#87CEEB`n"

# Build markdown content with both conversation and tool metrics
$mdContent = @"
# Conversation Session: $sessionId

**Duration:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Tool Execution Flow

\`\`\`mermaid
$sequenceDiagram
\`\`\`

## Tool Use Metrics

\`\`\`mermaid
$graphDiagram
\`\`\`

## Summary
- **Total Tool Calls:** $totalCalls
- **Successful:** $successCalls
- **Total Time:** $($totalTime)ms
- **Average Time:** $($avgTime)ms

---
_Session ID: $sessionId_
"@

# Write markdown file
Set-Content -Path $mdPath -Value $mdContent -Force

# Append to conversation history if it exists
$conversationPath = Join-Path -Path $dataPath -ChildPath "conversation-history--$sessionId.json"
if (Test-Path -Path $conversationPath) {
    try {
        $conversation = Get-Content -Path $conversationPath -Raw | ConvertFrom-Json
        
        # Append the tool execution to conversation
        $toolRecord = [pscustomobject]@{
            timestamp = $logEntry.timestamp
            phase = $logEntry.phase
            toolName = $logEntry.toolName
            success = $logEntry.success
            duration = $logEntry.duration
        }
        
        $conversation.tools += $toolRecord
        $conversation | ConvertTo-Json -Depth 10 | Set-Content -Path $conversationPath -Force
    } catch {
        # Silently fail if conversation state doesn't exist yet
    }
}

# Output the entry for logging
$logEntry | ConvertTo-Json -Compress
