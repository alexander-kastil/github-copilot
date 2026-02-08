---
name: visualize-conversation
description: Visualize and update the current conversation by generating markdown documentation from JSON data using Mermaid diagrams.
license: MIT
---

# Visualize Conversation Skill

Automatically generate markdown documentation with Mermaid diagrams from conversation history and tool usage JSON files.

## Overview

This skill generates clean, visual documentation of conversations by:
- Reading structured JSON data (automatically maintained by hooks)
- Generating sequence diagrams for tool execution flows
- Creating metrics visualizations
- Producing a unified markdown file with full conversation context

**Note**: The hooks automatically update `tool-use--{sessionId}.json` and `conversation-history--{sessionId}.json` during the session. This skill simply visualizes that collected data.

## Architecture

```
.copilot-metadata/
├── data/
│   ├── tool-use--{sessionId}.json
│   └── conversation-history--{sessionId}.json
├── generate.mjs               (generator script)
├── package.json              (npm configuration)
└── conversation--{sessionId}.md  (generated output)
```

## Data Structure

The skill reads JSON files that are automatically maintained by hooks. Understanding the format helps you create matching hook scripts.

### Tool Use JSON (`data/tool-use--{sessionId}.json`)

Populated by `track-tool-use.ps1` during tool execution:

```json
{
  "metadata": {
    "title": "Tool Use Visualization",
    "description": "Agent tool execution flow and metrics"
  },
  "sequence": {
    "actors": ["Agent", "Tools"],
    "events": [
      {
        "type": "call",
        "from": "Agent",
        "to": "Tools",
        "message": "PRE: file_search",
        "noteText": "Found 5 files",
        "responseTime": "125ms",
        "status": "Success"
      }
    ]
  },
  "metrics": {
    "totalCalls": 3,
    "successCount": 3,
    "totalTime": "220ms",
    "averageTime": "73ms",
    "tools": [
      {
        "name": "file_search",
        "duration": "125ms"
      }
    ]
  }
}
```

### Conversation History JSON (`data/conversation-history--{sessionId}.json`)

Populated by hooks during conversation (`init-conversation.ps1` creates structure, hooks update messages):

```json
{
  "sessionId": "20a336fd-507c-4b7b-b021-f35d57f7c250",
  "startTime": "2026-02-08T08:58:48.654Z",
  "metadata": {
    "initialized": true
  },
  "messages": [
    {
      "role": "user",
      "timestamp": "2026-02-08T08:58:48Z",
      "content": "Your user message here"
    },
    {
      "role": "assistant",
      "timestamp": "2026-02-08T08:59:00Z",
      "content": "Assistant response here"
    }
  ],
  "tools": []
}
```

## Usage

### Workflow

1. **Session runs**: Hooks automatically track tool usage and conversation messages, updating JSON files in `.copilot-metadata/data/`
2. **Run the skill**: Execute `generate.mjs` to visualize the collected data
3. **Review output**: Generated markdown appears in `.copilot-metadata/conversation--{sessionId}.md`

### Run from `.copilot-metadata` directory

```powershell
cd .copilot-metadata
npm run generate:metadata
```

### Output

For each session with `tool-use--{sessionId}.json` and `conversation-history--{sessionId}.json`:

```
✓ Generated conversation--{sessionId}.md
✓ All N session(s) generated successfully
```

### Generated Markdown

The skill produces a unified markdown file containing:

1. **Session Header**: Session ID and start time
2. **Conversation**: All user and assistant messages with timestamps
3. **Tool Use Section**:
   - **Execution Flow**: Sequence diagram showing tool calls
   - **Metrics**: Visualization of tool execution statistics
4. **Data Source Links**: Links to the original JSON files

## Workflow Integration

### Automatic + Manual Model

The complete workflow combines hooks + this skill:

1. **Hooks** (automatic - run during session):
   - `sessionStart`: Initialize session tracking
   - `preToolUse` / `postToolUse`: Track tool calls and metrics
   - Hooks update JSON files in `.copilot-metadata/data/`

2. **This Skill** (run on demand):
   - After session completes, run `npm run generate:metadata`
   - Reads the hook-maintained JSON files
   - Generates visualization markdown

### Manual Update

After a session ends, visualize the collected data:

```powershell
cd .copilot-metadata
npm run generate:metadata
```

### Automated Integration

To auto-run after hooks complete:

```yaml
# GitHub Actions example
- name: Visualize conversation (after hooks)
  run: |
    cd .copilot-metadata
    npm run generate:metadata
```

Or integrated in hook finalization:

```powershell
# finalize-conversation.ps1
# ... cleanup and finalization code ...
npm run generate:metadata
```

## Key Features

✅ **Hook Integration**: Works with hook-maintained JSON (no manual data entry)
✅ **Single Command**: `npm run generate:metadata` to visualize all sessions
✅ **Multi-Session**: Handles multiple concurrent sessions automatically
✅ **Auto-Discovery**: Finds all `tool-use--*.json` files in `data/` 
✅ **Consistent Format**: Same structure every regeneration
✅ **Version Control**: Clean diffs, traceable changes
✅ **Mermaid Diagrams**: Professional visualizations

## Data Collection (Hooks)

The JSON files in `.copilot-metadata/data/` are maintained automatically by hooks:

- **`init-conversation.ps1`** - Creates session files on session start
- **`track-tool-use.ps1`** - Updates tool metrics before/after each tool call
- **`finalize-conversation.ps1`** - Optional: can call `generate.mjs` on session end

This skill assumes the JSON files are already populated by these hooks.

## Troubleshooting

### No files found

```error
No tool-use files found in data directory
```

**Solution**: Ensure JSON files are in `.copilot-metadata/data/` with correct naming: `tool-use--{sessionId}.json`

### History file not found

```error
⚠ History file not found for session {sessionId}
```

**Solution**: Create a matching `conversation-history--{sessionId}.json` in the `data/` directory for each session.

### Installation issues

For the first run, ensure dependencies are installed:

```powershell
cd .copilot-metadata
npm install
npm run generate:metadata
```

## File Naming Convention

Both files must use the same `{sessionId}`:

- ✅ `tool-use--abc123.json` + `conversation-history--abc123.json`
- ❌ `tool-use--abc123.json` + `conversation-history--def456.json`

## References

- [Mermaid Diagrams](https://mermaid.js.org/) - Diagram syntax
- [Node.js Glob](https://www.npmjs.com/package/glob) - File pattern matching

## License

MIT
