# Find the latest conversation session based on file pattern
$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "../../.copilot-metadata"
$dataPath = Join-Path -Path $metadataPath -ChildPath "data"
$conversationFiles = Get-ChildItem -Path "$dataPath\conversation-history--*.json" -ErrorAction SilentlyContinue | Sort-Object -Property LastWriteTime -Descending

if ($conversationFiles) {
    $conversationPath = $conversationFiles[0].FullName
    $sessionId = $conversationFiles[0].Name -replace '^conversation-history--', '' -replace '\.json$', ''
    $toolUsePath = Join-Path -Path $dataPath -ChildPath "tool-use--$sessionId.json"
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

    # Generate final markdown with complete summary
    $mdContent = "# Conversation Session: $sessionId`n`n"
    $mdContent += "**Started:** $(if ($conversation.startTime) { $conversation.startTime } else { 'N/A' })`n"
    $mdContent += "**Ended:** $(if ($conversation.endTime) { $conversation.endTime } else { 'N/A' })`n`n"
    
    # Add messages section
    if ($conversation.messages -and $conversation.messages.Count -gt 0) {
        $mdContent += "## Conversation ($($conversation.messages.Count) messages)`n`n"
        foreach ($msg in $conversation.messages) {
            $role = if ($msg.role -eq 'user') { 'USER' } else { 'ASSISTANT' }
            $mdContent += "### $role - $($msg.timestamp)`n`n$($msg.content)`n`n"
        }
    }
    
    # Add tool metrics section
    if ($conversation.tools -and $conversation.tools.Count -gt 0) {
        $totalTools = $conversation.tools.Count
        $successTools = ($conversation.tools | Where-Object { $_.success -eq $true } | Measure-Object).Count
        $totalTime = ($conversation.tools | Where-Object { $_.duration } | Measure-Object -Property duration -Sum).Sum
        
        $mdContent += "## Tool Execution Summary`n`n"
        $mdContent += "- **Total Tool Calls:** $totalTools`n"
        $mdContent += "- **Successful:** $successTools`n"
        $mdContent += "- **Failed:** $($totalTools - $successTools)`n"
        $mdContent += "- **Total Time:** $($totalTime)ms`n`n"
        
        # Group by tool
        $toolsByName = $conversation.tools | Group-Object -Property toolName
        if ($toolsByName) {
            $mdContent += "### Tools Used`n`n"
            foreach ($tool in $toolsByName) {
                $mdContent += "- **$($tool.Name)**: $($tool.Count) call(s)`n"
            }
            $mdContent += "`n"
        }
    }
    
    $mdContent += "---`n`n_Session ID: $sessionId | Status: completed_`n"
    Set-Content -Path $mdPath -Value $mdContent -Force

    Write-Host "Conversation finalized: $conversationPath"
}

Write-Host "Conversation session ended."
