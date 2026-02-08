# GitHub Copilot Hooks

GitHub Copilot hooks allow you to extend and customize agent behavior by executing custom shell commands at key points during agent execution. Hooks run in response to specific events in the agent lifecycle, enabling you to implement logging, validation, notifications, and custom integrations without modifying the agent code.

>Note: As of 08 Feb 2026 hooks are only available in [VS Code Insiders](https://code.visualstudio.com/insiders/).

## Hook Types

| Hook | Trigger | Description |
|------|---------|-------------|
| Session Start | When a new agent session begins or when resuming an existing session | Execute initialization logic, setup logging, or prepare your environment before the agent starts |
| User Prompt Submit | When the user submits a prompt to the agent | Log user requests, validate input, or perform pre-processing before the agent processes the prompt |
| Pre-Tool Use | Before the agent uses any tool | Validate tool parameters, log tool invocations, or conditionally block tool execution |
| Post-Tool Use | After a tool completes execution successfully | Log results, update metrics, trigger notifications, or perform cleanup operations |
| Subagent Start | When a subagent is started | Track subagent lifecycle and manage resources |
| Subagent Stop | When a subagent stops | Log subagent completion or clean up state |
| Stop | When the agent stops | Finalize logs, clean up resources, or trigger completion workflows |

## Use Cases

- Audit and Monitoring: Log all agent activities with timestamps, user information, and executed actions for compliance and debugging.
- Custom Validations: Validate tool parameters before execution or enforce security policies before the agent proceeds.
- Integration: Trigger external systems, send notifications to Slack or email, or integrate with CI/CD pipelines based on agent events.
- Performance Tracking: Measure execution time, monitor tool usage, and collect metrics for optimization.
- Conditional Execution: Block dangerous operations or prevent tools from running in certain contexts using hook validation.

## Getting Started

Create a hooks.json file in the `.github/hooks/` directory (or current working directory for Copilot CLI) with your desired hook configurations:

```json
{
  "version": 1,
  "hooks": {
    "sessionStart": [
      {
        "type": "command",
        "bash": "echo \"Session started: $(date)\" >> logs/session.log",
        "powershell": "Add-Content -Path logs/session.log -Value \"Session started: $(Get-Date)\"",
        "cwd": ".",
        "timeoutSec": 10
      }
    ]
  }
}
```

The above example logs the session start time to a file. You can also reference external scripts that capture context state. For example, this hook captures the context window state and visualizes it as a mermaid diagram:

```bash
#!/bin/bash
# scripts/capture-context.sh - Capture and visualize context window state

INPUT=$(cat)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Extract context information from input
CONTEXT_SIZE=$(echo "$INPUT" | jq '.contextWindow.size // 0' 2>/dev/null)
MESSAGES=$(echo "$INPUT" | jq '.contextWindow.messages // 0' 2>/dev/null)
FILES=$(echo "$INPUT" | jq '.contextWindow.files // 0' 2>/dev/null)
INSTRUCTIONS=$(echo "$INPUT" | jq '.contextWindow.instructions // 0' 2>/dev/null)

# Create mermaid diagram
DIAGRAM="graph TD
    A[Context Window<br/>Size: ${CONTEXT_SIZE}] --> B[Messages: ${MESSAGES}]
    A --> C[Files: ${FILES}]
    A --> D[Instructions: ${INSTRUCTIONS}]
    B --> E[Ready for Agent]
    C --> E
    D --> E"

# Log structured data with diagram
jq -n \
  --arg timestamp "$TIMESTAMP" \
  --arg diagram "$DIAGRAM" \
  --arg context_size "$CONTEXT_SIZE" \
  '{timestamp: $timestamp, context_size: $context_size, diagram: $diagram}'
```

The above script processes the hook input, extracts context window metadata, and generates a mermaid diagram visualization showing the current state.

## Links & Resources

- [Using hooks with GitHub Copilot agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks configuration reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [About GitHub Copilot hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks)
- [Customize the development environment for GitHub Copilot coding agent](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment)