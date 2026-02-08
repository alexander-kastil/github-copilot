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

## Copilot Conversation Tracker



```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Bot as GH Copilot

    Note over User,Bot: Conversation starts

    User->>Bot: Navigate to src/ and execute: dotnet new webapit -n copilot-...
    Bot-->>User: Executed 30 actions: 8× run in terminal, 4× readFile, 3× replaceString
    User->>Bot: whilee the terminal runs use chrome mcp
    Bot-->>User: Executed 13 actions: 3× readFile, 3× chrome-devtoo take snapshot, 2× chrome-devtoo new page
    User->>Bot: questions. do this mermaids support making the tool call lay...
    Bot-->>User: Executed 2 actions: get-syntax-docs-mermaid, readFile
    User->>Bot: question 2. couldnt we asign more meaning to the tool call w...
    User->>Bot: ok then wouldnt it make more sense to process the 3 json fil...
    Bot-->>User: Executed 21 actions: 9× readFile, 7× replaceString, 2× listDirectory
    User->>Bot: that is already great progress! my initial request was havin...
    Bot-->>User: Executed 18 actions: 11× replaceString, 4× readFile, 3× run in terminal
    User->>Bot: yes ... but i meant as a mermaid ... no need to have 1.5 ......
    Bot-->>User: Executed 7 actions: 5× replaceString, run in terminal, readFile

    Note over User,Bot: Conversation ends
```

## Links & Resources

- [Using hooks with GitHub Copilot agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/use-hooks)
- [Hooks configuration reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [About GitHub Copilot hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks)