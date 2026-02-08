# Copilot Metadata

Session-based storage for conversation history, tool usage, and generated documentation.

## Structure

```
.copilot-metadata/
├── data/
│   ├── tool-use--{sessionId}.json          # Tool execution data (calls, metrics)
│   └── conversation-history--{sessionId}.json  # Conversation messages
├── conversation--{sessionId}.md        # Generated markdown (auto-generated)
├── generate.mjs                        # Generator script
└── README.md                           # Documentation
```

## Files

### `data/tool-use--{sessionId}.json`
Contains structured data about tool calls and performance metrics:
- Sequence of tool calls with actors and events
- Execution metrics (count, success rate, timings)
- Per-tool performance data

### `data/conversation-history--{sessionId}.json`
Stores conversation metadata and messages:
- Session ID and start time
- All user and assistant messages with timestamps
- Tool usage tracking

### `conversation--{sessionId}.md`
**Auto-generated markdown** combining:
- Session info and conversation history
- Mermaid diagrams for tool execution flow
- Tool execution metrics visualization
- Links to source JSON files in `data/`

## Workflow

1. **Update data**: Edit `tool-use--*.json` and/or `conversation-history--*.json`
2. **Generate markdown**: Run `npm run generate:metadata`
3. **Version control**: Commit all files (data + generated markdown)

## Usage

Regenerate all session markdowns:
```bash
npm run generate:metadata
```

## Multiple Sessions

The generator auto-detects all sessions and regenerates:
- `tool-use--session1.json` → `conversation--session1.md`
- `tool-use--session2.json` → `conversation--session2.md`
- etc.

## Benefits

✅ **Session-based organization** - Each conversation is isolated with its own files  
✅ **Data-driven** - Mermaid diagrams generated from JSON data  
✅ **Version control friendly** - Clean diff history, no AI-generated artifacts  
✅ **Auto-discovery** - Generator finds all sessions automatically  
✅ **Consistent format** - Same markdown structure every regeneration
