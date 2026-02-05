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

| Agent                  | Purpose                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Angular**            | Angular expert that scaffolds projects strictly under angular-cli MCP while coordinating Playwright workflows for verification.                       |
| **AzDevOps**           | Azure DevOps pipeline specialist that writes, imports, and runs pipelines using Microsoft Learn guidance and manages service connections.             |
| **AzureDeployment**    | Deploys and provisions Azure resources using Azure CLI operations, orchestrating infrastructure and analyzing deployment logs.                        |
| **Codespaces**         | Auto-detects language/frameworks in repositories and scaffolds optimized GitHub Codespaces + Devcontainer setups with recommended VS Code extensions. |
| **GH Actions**         | GitHub Actions workflow specialist that authors, optimizes, and troubleshoots pipelines using Microsoft Learn best practices.                         |
| **RaspiExpert**        | Expert assistant for Raspberry Pi development, configuration, and remote management via SSH.                                                          |
| **SmokeTester**        | Automated smoke testing agent that executes validation workflows for deployed applications through REST APIs and browser automation.                  |
| **AIAgentExpert**      | Develops, enhances, traces, evaluates, and deploys AI agent applications using Microsoft Agent Framework and Microsoft Foundry.                       |
| **DataAnalysisExpert** | Analyzes data files using Data Viewer, explores data structure, reads specific rows/cells, and provides insights.                                     |
| **Plan**               | Researches and outlines multi-step implementation plans and strategies for complex development initiatives.                                           |

## Links & Resources

- [VS Code Custom Agents Documentation](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
