# Copilot Memory

## What is Copilot Memory?

Copilot Memory enables Copilot to build a persistent, repository-specific understanding by storing tightly scoped information about your codebase that it deduces through interactions. Memories are validated against current code citations, automatically deleted after 28 days if unused, and kept completely repository-scoped to ensure privacy and security. This persistent knowledge reduces the burden of repeatedly explaining coding conventions and maintaining custom instruction files, allowing Copilot to adapt to your repository's patterns and deliver increasingly better results over time.

## How to Enable Copilot Memory

Copilot Memory is turned off by default and must be enabled at the enterprise, organization, or personal level:

- **Enterprise/Organization**: Admins enable in Copilot settings; all members with a Copilot subscription gain access
- **Personal (Copilot Pro/Pro+)**: Users enable in their personal Copilot settings on GitHub
- Once enabled for a user, Copilot can use agentic memory across any repository they access

Currently, Copilot Memory is used by **Copilot coding agent**, **Copilot code review**, and **Copilot CLI** when working on pull requests and code operations on GitHub.

## Use Cases & Examples

### 1. Database Connection Patterns

When Copilot coding agent discovers your repository uses a specific connection pooling pattern (e.g., singleton managed identity for Azure SQL), it stores this as a memory with code citations. Later, Copilot code review can apply this knowledge to spot when new pull requests use inconsistent connection handling, flagging potential bugs before merge.

```
Memory: "Repository uses Azure managed identity singleton for DB connections"
Connection: Lines 42-50 in src/db/connectionPool.ts
Use: Code review flags PR with standard DriverManager connection as violation
```

### 2. Configuration File Synchronization

Copilot learns that settings in `config.json` must stay synchronized with environment variables in `.env.example`. When Copilot coding agent later modifies one file, the memory helps it automatically recognize and update the related file, preventing configuration drift.

```
Memory: "config.json settings must sync with .env.example"
Citations: Lines 15-30 in both files
Use: Coding agent auto-updates .env.example when config.json changes
```

### 3. Naming Convention Mastery

Over time, Copilot observes your repository's naming patterns (camelCase for variables, PascalCase for classes, specific prefix conventions) and stores this as operational memory. Subsequent code generation, refactoring, or reviews automatically align with your conventions without needing explicit instruction in every prompt.

```
Memory: "API endpoints use verb-noun pattern: /api/resource/action"
Examples: /api/users/create, /api/orders/cancel (from pull requests)
Use: Coding agent generates consistent endpoint names automatically
```

## Links & Resources

- [GitHub Copilot Memory Concepts](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)
- [Enabling and Curating Copilot Memory](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory)
