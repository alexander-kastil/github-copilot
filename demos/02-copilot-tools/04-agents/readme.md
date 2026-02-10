# Custom Agents

## What are Custom Agents?

Custom agents are specialized AI personas configured with specific tools, instructions, and handoffs to handle targeted development tasks. Instead of manually selecting tools and switching context for each workflow, you define an agent once with the exact capabilities and behavior needed, then seamlessly switch to it in chat.

Agents can work independently or orchestrate multi-step workflows using handoffs—guided transitions that pass context and pre-filled prompts between agents.

## Why Use Custom Agents?

Different tasks require different capabilities and behaviors. A planning agent might only need read-only tools to research architecture without risking accidental code changes, while an implementation agent needs full editing power. Custom agents ensure the AI has exactly the right tools and instructions for each task, delivering consistent, task-appropriate responses. Handoffs enable guided sequential workflows—for example, planning → implementation → code review—giving developers control to review and approve each step before moving forward.

## Sample agent configuration

```yaml
---
description: Generate an implementation plan
tools: ['search', 'fetch']
handoffs:
  - label: Start Implementation
    agent: implementation
    prompt: Now implement the plan outlined above.
    send: false
    model: GPT-5.2 (copilot)
---
...
```

## Handoffs

Handoffs enable guided sequential workflows that transition between agents with suggested next steps and pre-filled prompts. After a chat response completes, handoff buttons let users switch to the next agent in multi-step workflows like planning → implementation → code review.

Define handoffs in the agent file frontmatter (YAML) with the following properties:

- **label**: The display text shown on the handoff button
- **agent**: The target agent identifier to switch to
- **prompt**: The prompt text to send to the target agent
- **send** (optional): Boolean flag to auto-submit the prompt (default is `false`)
- **model** (optional): The language model to use when the handoff executes

## Available Agents in This Repository

| Agent               | Purpose                                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Angular**         | Angular expert that scaffolds projects strictly under angular-cli MCP while coordinating Playwright workflows for verification.                       |
| **AzDevOps**        | Azure DevOps pipeline specialist that writes, imports, and runs pipelines using Microsoft Learn guidance and manages service connections.             |
| **AzureDeployment** | Deploys and provisions Azure resources using Azure CLI operations, orchestrating infrastructure and analyzing deployment logs.                        |
| **Codespaces**      | Auto-detects language/frameworks in repositories and scaffolds optimized GitHub Codespaces + Devcontainer setups with recommended VS Code extensions. |
| **GH Actions**      | GitHub Actions workflow specialist that authors, optimizes, and troubleshoots pipelines using Microsoft Learn best practices.                         |
| **RaspiExpert**     | Expert assistant for Raspberry Pi development, configuration, and remote management via SSH.                                                          |
| **SmokeTester**     | Automated smoke testing agent that executes validation workflows for deployed applications through REST APIs and browser automation.                  |
| **AIAgentExpert**   | Develops, enhances, traces, evaluates, and deploys AI agent applications using Microsoft Agent Framework and Microsoft Foundry.                       |

## Claude Agents

Claude agents are third-party AI agents powered by Anthropic's Claude that run directly in VS Code. Unlike custom agents defined in your repository, Claude agents are cloud-based (or local) sessions that provide autonomous agentic capabilities with built-in tools.

### Enable Claude Agents

**Option 1: Via Settings UI**

1. Press `Ctrl+,` to open Settings
2. Search for `claudeAgent.enabled`
3. Enable `github.copilot.chat.claudeAgent.enabled`

**Option 2: Edit settings.json directly**
Add this setting to your VS Code user settings:

```json
"github.copilot.chat.claudeAgent.enabled": true
```

### Start a Claude Agent Session

1. Press `Ctrl+Alt+I` to open Chat
2. Click **New Chat** (+)
3. Select Claude from the **Session Type** dropdown
4. Choose between:
   - **Local session**: Runs Claude agent locally (default)
   - **Cloud session**: Select Cloud session type, then Claude from Partner Agent dropdown

### Features

- **Autonomous execution**: Claude agents work independently on tasks using their own tool set
- **Slash commands**: Use `/agents`, `/hooks`, `/memory`, `/pr-comments`, `/review`, `/security-review`
- **Permission modes**:
  - Edit automatically (default)
  - Request approval for each change
  - Plan-only mode (no execution)

### Billing

Claude agents are included in your **GitHub Copilot Pro+ subscription** — no additional setup or billing required.

## Key Topics Covered in This Section

- [VS Code Custom Agents Documentation](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
- [Third-party agents in Visual Studio Code](https://code.visualstudio.com/docs/copilot/agents/third-party-agents)
