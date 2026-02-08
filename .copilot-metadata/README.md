# Copilot Conversation Visualization

Logs and visualizes GitHub Copilot conversations using event hooks.

## Structure

```
.copilot-metadata/
├── data/
│   ├── history-{sessionId}.json          # User prompts
│   ├── tools-{sessionId}.json            # Tool call tracking
│   ├── agents-{name}-{sessionId}.json    # Sub-agent lifecycle
│   └── current-session.txt               # Active session ID
├── conv-{sessionId}.md                   # Generated visualization
├── visualize.mjs                         # Diagram generator
├── test.mjs                              # Tests
└── package.json

.github/hooks/
├── hooks.json              # Hook configuration
├── session-start.ps1       # sessionStart → creates session files
├── log-prompt.ps1          # userPromptSubmitted → logs user prompts
├── track-tool.ps1          # preToolUse/postToolUse → logs tool calls
├── track-agent.ps1         # subagentStarted/subagentStopped → logs sub-agents
└── session-stop.ps1        # sessionEnd → finalizes and runs visualization
```

## Hook Flow

1. **sessionStart** — generates sessionId, creates `history-` and `tools-` JSON files
2. **userPromptSubmitted** — appends user prompt to `history-{sessionId}.json`
3. **preToolUse** — appends pre-call entry to `tools-{sessionId}.json`
4. **postToolUse** — appends post-call entry with result to `tools-{sessionId}.json`
5. **subagentStarted/Stopped** — creates/updates `agents-{name}-{sessionId}.json`
6. **sessionEnd** — finalizes history, runs `visualize.mjs`, generates `conv-{sessionId}.md`

## Manual Visualization

```powershell
cd .copilot-metadata
npm run visualize              # all sessions
npm run visualize -- {id}      # specific session
```

## Testing

```powershell
cd .copilot-metadata
npm test
```
