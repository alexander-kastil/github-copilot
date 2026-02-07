# Model Context Protocol

![manage-mcp](_images/manage-mcp.png)

## What is Model Context Protocol?

Model Context Protocol (MCP) is a standardized framework that enables GitHub Copilot to connect to external tools, services, and data sources. It acts as a bridge between Copilot and specialized systems—allowing Copilot to access real-time information, execute commands, and interact with platforms like Azure DevOps, GitHub, or deployment services. MCPs extend Copilot's capabilities beyond code generation to include infrastructure management, testing automation, and domain-specific tooling.

## Enable MCP Discovery and Auto-Start

Configure VS Code to auto-discover and start MCP servers:

```json
{
  "chat.mcp.discovery.enabled": {
    "claude-desktop": true,
    "windsurf": true,
    "cursor-global": true,
    "cursor-workspace": true
  },
  "chat.mcp.autostart": "newAndOutdated",
  "chat.mcp.gallery.enabled": true
}
```

## MCP Server Types & Integration

MCP servers can be integrated in multiple ways depending on their nature: **local executables** (via `npx` or `stdio` commands), **remote HTTP endpoints** for cloud services, or **browser extensions** that bundle MCPs automatically. You can configure MCPs globally via the **user-level `~/.copilot/mcp.json`** for persistent access across all workspaces, or locally in a **workspace-level `.vscode/mcp.json`** to isolate tools for specific projects. The MCPs can come from VS Code extensions, npm packages, or custom implementations.

## MCP Configuration

The `mcp.json` file contains server definitions organized by name, with each server specifying its type (`stdio`, `http`), command/URL, and optional arguments. For sensitive data (API keys, passwords, organization names), MCPs support **input parameters** that prompt for values at runtime and pass them securely via environment or URL variables, preventing hardcoding of credentials.

### Structure Example

```json
{
  "servers": {
    "server-name": {
      "command": "npx",
      "args": ["@package/mcp", "--option=value"],
      "type": "stdio"
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "API_KEY",
      "description": "Your API key",
      "password": true
    }
  ]
}
```

## Available MCPs

| MCP                 | Type            | Purpose                                                                                                  |
| ------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| **Microsoft Learn** | Remote (HTTP)   | Official Microsoft documentation and code samples for Azure, .NET, and Microsoft 365 services.           |
| **Azure DevOps**    | Local (`npx`)   | Programmatic access to Azure DevOps pipelines, repos, work items, and service connections via REST API.  |
| **Azure Deploy**    | Local (`npx`)   | Infrastructure deployment and management for Azure resources with CLI-based orchestration.               |
| **GitHub**          | Remote (HTTP)   | GitHub API integration for repositories, issues, pull requests, and project management.                  |
| **WorkIQ**          | Local (`npx`)   | Microsoft 365 integration for accessing emails, meetings, files, and work context across Microsoft apps. |
| **Figma**           | Remote (HTTP)   | Design system integration for extracting UI components, diagrams, and design metadata.                   |
| **SSH MCP**         | Local (`stdio`) | Remote server management via SSH for infrastructure provisioning, diagnostics, and system configuration. |
| **Playwright**      | Local (`npx`)   | Browser automation with vision support for visual testing and screenshot capture during E2E tests.       |

## Links & Resources

- [VS Code MCP Servers Documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
