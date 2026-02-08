param(
    [ValidateSet("pre", "post")]
    [string]$Phase = "pre"
)

# Read JSON input from Copilot hook
$inputJson = [Console]::In.ReadToEnd()

# Parse the input from Copilot
$hookData = $null
try {
    $hookData = $inputJson | ConvertFrom-Json
} catch {
    # If parsing fails, output error in proper format and exit
    @{ error = "Failed to parse input"; success = $false } | ConvertTo-Json -Compress | Write-Host
    exit 1
}

# Get sessionId from latest conversation history file
$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "../../.copilot-metadata"
$dataPath = Join-Path -Path $metadataPath -ChildPath "data"

# Ensure directories exist
if (-not (Test-Path -Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

# Find existing session or create new one
$conversationFiles = Get-ChildItem -Path "$dataPath\conversation-history--*.json" -ErrorAction SilentlyContinue | Sort-Object -Property LastWriteTime -Descending
$SessionId = $null

if ($conversationFiles) { 
    $SessionId = $conversationFiles[0].Name -replace '^conversation-history--', '' -replace '\.json$', ''
} else {
    # Create a new session if none exists
    $SessionId = [guid]::NewGuid().ToString()
    
    $conversationPath = Join-Path -Path $dataPath -ChildPath "conversation-history--$SessionId.json"
    $conversationState = @{
        sessionId = $SessionId
        startTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        tools = @()
        messages = @()
        metadata = @{ initialized = $true }
    }
    $conversationState | ConvertTo-Json -Depth 10 | Set-Content -Path $conversationPath -Force
}

# Convert Unix timestamp from Copilot to ISO string
if ($hookData.timestamp) {
    # Create epoch date (1970-01-01)
    $epoch = New-Object DateTime 1970,1,1,0,0,0,0
    $timestampUtc = $epoch.AddMilliseconds($hookData.timestamp).ToUniversalTime()
} else {
    $timestampUtc = (Get-Date).ToUniversalTime()
}

# Build the tool execution entry from Copilot's input
$toolExecution = [pscustomobject]@{
    timestamp = $timestampUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    phase = $Phase
    toolName = $hookData.toolName
    cwd = $hookData.cwd
}

# Add tool arguments if present
if ($hookData.toolArgs) {
    $toolExecution | Add-Member -NotePropertyName "toolArgs" -NotePropertyValue $hookData.toolArgs
}

# Add result info if post-tool
if ($Phase -eq "post" -and $hookData.toolResult) {
    $toolExecution | Add-Member -NotePropertyName "success" -NotePropertyValue ($hookData.toolResult.resultType -eq "success")
    $toolExecution | Add-Member -NotePropertyName "resultType" -NotePropertyValue $hookData.toolResult.resultType
    if ($hookData.toolResult.textResultForLlm) {
        $toolExecution | Add-Member -NotePropertyName "textResult" -NotePropertyValue $hookData.toolResult.textResultForLlm
    }
}

# Append to conversation history
$conversationPath = Join-Path -Path $dataPath -ChildPath "conversation-history--$SessionId.json"
if (Test-Path -Path $conversationPath) {
    try {
        $conversation = Get-Content -Path $conversationPath -Raw | ConvertFrom-Json
        
        # Append tool usage to tools array
        $conversation.tools += $toolExecution
        
        $conversation | ConvertTo-Json -Depth 10 | Set-Content -Path $conversationPath -Force
    } catch {
        Write-Error "Failed to append to conversation history: $_"
    }
}

# Append to tool-use file
$toolUsePath = Join-Path -Path $dataPath -ChildPath "tool-use--$SessionId.json"
$entries = @()
if (Test-Path -Path $toolUsePath) {
    try {
        $content = Get-Content -Path $toolUsePath -Raw
        if ($content.Trim()) {
            $entries = $content | ConvertFrom-Json
            if ($entries -isnot [array]) {
                $entries = @($entries)
            }
        }
    } catch {
        $entries = @()
    }
}

$entries += $toolExecution
$entries | ConvertTo-Json -Depth 10 | Set-Content -Path $toolUsePath -Force

# Generate updated markdown from current session data
$mdPath = Join-Path -Path $metadataPath -ChildPath "conversation--$SessionId.md"
try {
    $conversation = Get-Content -Path $conversationPath -Raw | ConvertFrom-Json
    $toolEntries = @()
    if (Test-Path -Path $toolUsePath) {
        $content = Get-Content -Path $toolUsePath -Raw
        if ($content.Trim()) {
            $toolEntries = $content | ConvertFrom-Json
            if ($toolEntries -isnot [array]) {
                $toolEntries = @($toolEntries)
            }
        }
    }
    
    # Build markdown from current state
    $mdContent = "# Conversation Session: $SessionId`n`n"
    $mdContent += "**Started:** $(if ($conversation.startTime) { $conversation.startTime } else { 'N/A' })`n`n"
    
    # Add messages section
    if ($conversation.messages -and $conversation.messages.Count -gt 0) {
        $mdContent += "## Conversation Transcript`n`n"
        foreach ($msg in $conversation.messages) {
            $role = if ($msg.role -eq 'user') { 'USER' } else { 'ASSISTANT' }
            $mdContent += "### $role - $($msg.timestamp)`n`n$($msg.content)`n`n"
        }
    }
    
    # Add tool metrics section
    if ($toolEntries.Count -gt 0) {
        $postEntries = $toolEntries | Where-Object { $_.phase -eq "post" }
        if ($postEntries.Count -gt 0) {
            $totalCalls = ($postEntries | Measure-Object).Count
            $successCalls = ($postEntries | Where-Object { $_.success -eq $true } | Measure-Object).Count
            $totalTime = 0
            foreach ($entry in $postEntries) {
                if ($entry.duration) { $totalTime += $entry.duration }
            }
            
            $mdContent += "## Tool Execution Metrics`n`n"
            $mdContent += "- **Total Calls:** $totalCalls`n"
            $mdContent += "- **Successful:** $successCalls`n"
            if ($totalTime -gt 0) {
                $mdContent += "- **Total Time:** $($totalTime)ms`n`n"
            } else {
                $mdContent += "`n"
            }
            
            # Tool breakdown
            $toolsByName = $toolEntries | Group-Object -Property toolName
            if ($toolsByName) {
                $mdContent += "### Tools Used`n`n"
                foreach ($tool in $toolsByName) {
                    $mdContent += "- **$($tool.Name)**: $($tool.Count) call(s)`n"
                }
                $mdContent += "`n"
            }
        }
    }
    
    $mdContent += "---`n`n_Session ID: $SessionId_`n"
    Set-Content -Path $mdPath -Value $mdContent -Force
} catch {
    # Continue on error
}

# Output status for logging in proper JSON format
@{
    success = $true
    phase = $Phase
    sessionId = $SessionId
    toolName = $hookData.toolName
} | ConvertTo-Json -Compress | Write-Host
