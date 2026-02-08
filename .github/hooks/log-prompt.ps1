# Read JSON input from Copilot hook for userPromptSubmitted event
$inputJson = [Console]::In.ReadToEnd()

$hookData = $null
try {
    $hookData = $inputJson | ConvertFrom-Json
} catch {
    @{ error = "Failed to parse input"; success = $false } | ConvertTo-Json -Compress | Write-Host
    exit 1
}

# Get session ID from latest conversation history
$metadataPath = Join-Path -Path $PSScriptRoot -ChildPath "../../.copilot-metadata"
$dataPath = Join-Path -Path $metadataPath -ChildPath "data"

if (-not (Test-Path -Path $dataPath)) {
    New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
}

$conversationFiles = Get-ChildItem -Path "$dataPath\conversation-history--*.json" -ErrorAction SilentlyContinue | Sort-Object -Property LastWriteTime -Descending
$SessionId = $null

if ($conversationFiles) {
    $SessionId = $conversationFiles[0].Name -replace '^conversation-history--', '' -replace '\.json$', ''
} else {
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

# Build user message entry
$userMessage = @{
    role = "user"
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    content = $hookData.prompt
}

# Append to conversation history
$conversationPath = Join-Path -Path $dataPath -ChildPath "conversation-history--$SessionId.json"
if (Test-Path -Path $conversationPath) {
    try {
        $conversation = Get-Content -Path $conversationPath -Raw | ConvertFrom-Json
        
        if (-not $conversation.messages) {
            $conversation | Add-Member -NotePropertyName "messages" -NotePropertyValue @() -Force
        }
        
        $conversation.messages += $userMessage
        $conversation | ConvertTo-Json -Depth 10 | Set-Content -Path $conversationPath -Force
    } catch {
        Write-Error "Failed to log prompt: $_"
    }
}

# Output success for logging
@{
    success = $true
    sessionId = $SessionId
    promptLength = $($hookData.prompt.Length)
} | ConvertTo-Json -Compress | Write-Host
