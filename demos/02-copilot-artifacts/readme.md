# Copilot Artifacts

## Copilot Customization Overview

Copilot customization enables you to tailor AI behavior for your specific workflows, team standards, and project requirements. VS Code provides multiple layers of customization—from general repository rules to reusable prompts, model context protocols, custom agents, and specialized skills—that work together to optimize both LLM context window efficiency and consistency across your organization.

## Customization Features

| Feature                                   | Purpose                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[01-Instructions](./01-instructions/)** | Repository-wide and stack-specific guidelines that shape AI behavior. General instructions establish security policies, naming conventions, and coding philosophy, while stack-specific instructions (Angular, .NET, Azure CLI, Documentation) provide technology-focused conventions. Loaded on-demand to keep context efficient. |
| **[02-Prompts](./02-prompts/)**           | Reusable, on-demand prompt files (`.prompt.md`) for common workflows like documentation generation, code reviews, and scaffolding. Triggered explicitly in chat and can reference custom agents, tools, and models. Enables standardized development workflows across teams.                                                       |
| **[03-MCP](./03-mcp/)**                   | Model Context Protocol servers that extend Copilot's capabilities by connecting to external tools, services, and data sources. Includes local executables (npx, stdio) and remote HTTP endpoints (GitHub, Azure DevOps, Figma, Microsoft Learn). Configured via workspace-level or global `mcp.json`.                              |
| **[04-Agents](./04-agents/)**             | Custom AI personas configured with specific tools, instructions, and handoffs for targeted development tasks. Enables guided multi-step workflows (planning → implementation → code review) with context-passing handoffs, ensuring the right capabilities for each task.                                                          |
| **[05-Skills](./05-skills/)**             | Portable folders of instructions, scripts, and resources that follow the open Agent Skills standard. Load on-demand when relevant, enabling reusable capabilities across VS Code, GitHub Copilot CLI, and coding agents without manual activation.                                                                                 |

## Links & Resources

- [VS Code Copilot Customization Overview](https://code.visualstudio.com/docs/copilot/customization/overview)
- [Awesome Copilot - Community Resources](https://github.com/github/awesome-copilot)
