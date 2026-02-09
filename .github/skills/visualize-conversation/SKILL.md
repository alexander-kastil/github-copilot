---
name: visualize-conversation
description: Generate, update or delete Copilot conversation visualization markdown from session JSON data collected by Copilot hooks
license: MIT
---

# Visualize Conversation Skill

Generate a Mermaid sequence diagram from conversation session data collected by Copilot hooks, showing user prompts, tool calls, and sub-agent activity.

## Usage

Run from the `.copilot-conversation` directory:

```powershell
cd .copilot-conversation

# Process all sessions → conversations/
npm run visualize

# Process specific session → conversations/ (level 1)
node ./scripts/visualize.mjs --session <id>

# Process specific session at level 2 (with tools)
node ./scripts/visualize.mjs --session <id> --level 2

# Delete session (shows available sessions with summaries)
node ./scripts/visualize.mjs --delete

# Delete specific session
node ./scripts/visualize.mjs --delete --session <id>

# Delete all sessions
node ./scripts/visualize.mjs --delete --session all
```

## What It Does

**Visualization:**
1. Reads `history-{sessionId}.json`, `tools-{sessionId}.json`, and `agents-{name}-{sessionId}.json` from `.copilot-conversation/data/`
2. Merges all events chronologically
3. Generates a Mermaid sequence diagram showing:
   - **User → GH Copilot**: conversation prompts
   - **GH Copilot → Tool Use**: tool calls and responses
   - **GH Copilot → Sub-Agent**: sub-agent lifecycle
4. Writes `conv-{sessionId}.md` to `.copilot-conversation/conversations/`

**Deletion:**
- Removes all session files: `history-{id}.json`, `tools-{id}.json`, `debug-{id}.log`, `conv-{id}.json`, `conv-{id}.md`, and any `agents-*-{id}.json` files
- Lists all available sessions with first prompt summaries when no session ID is provided
- Supports deleting individual sessions or all sessions at once

## When To Use

**Visualization:**
- Manually regenerate a diagram after viewing or editing session data
- Visualize older sessions that weren't auto-generated
- The `sessionEnd` hook runs this automatically — use this skill if you need to re-run it

**Deletion:**
- Clean up old or unwanted conversation sessions and their associated files
- Remove test conversations to keep the conversation history clean
- Delete all sessions at once to start fresh

## Output Format

The generated `.copilot-conversation/conversations/conv-{sessionId}.md` contains:
- Session metadata (start/end time, status)
- Mermaid sequence diagram
- Tool execution metrics table
