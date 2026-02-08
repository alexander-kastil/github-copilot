---
name: update-diagram
description: Generate or update conversation visualization markdown from session JSON data collected by hooks.
license: MIT
---

# Update Diagram Skill

Generate a Mermaid sequence diagram from conversation session data.

## Usage

Run from the `.copilot-metadata` directory:

```powershell
cd .copilot-metadata
node visualize.mjs              # Process all sessions
node visualize.mjs {sessionId}  # Process specific session
```

Or use npm:

```powershell
cd .copilot-metadata
npm run visualize
npm run visualize -- {sessionId}
```

## What It Does

1. Reads `history-{sessionId}.json`, `tools-{sessionId}.json`, and `agents-{name}-{sessionId}.json` from `.copilot-metadata/data/`
2. Merges all events chronologically
3. Generates a Mermaid sequence diagram showing:
   - **User → GH Copilot**: conversation prompts
   - **GH Copilot → Tool Use**: tool calls and responses
   - **GH Copilot → Sub-Agent**: sub-agent lifecycle
4. Writes `conv-{sessionId}.md` to `.copilot-metadata/`

## When To Use

- Manually regenerate a diagram after viewing or editing session data
- Visualize older sessions that weren't auto-generated
- The `sessionEnd` hook runs this automatically — use this skill if you need to re-run it

## Output Format

The generated `conv-{sessionId}.md` contains:
- Session metadata (start/end time, status)
- Mermaid sequence diagram
- Tool execution metrics table
