# Context Variables

Context variables enable you to explicitly reference files, code, documentation, and other workspace elements in your GitHub Copilot Chat conversations. By using special symbols like `#` and `@`, you provide Copilot with precise context about what you want assistance with, reducing ambiguity and improving response accuracy. Context variables integrate seamlessly with your codebase, allowing Copilot to understand relationships between files, track dependencies, and generate more contextually relevant solutions. Use context variables to ground your questions in specific code, documentation, or terminal output for targeted, intelligent assistance.

## Available Context Variables

| Variable               | Description                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| `#file`                | Reference a specific file in your workspace for focused analysis.          |
| `#selection`           | Reference the currently selected code in your editor.                      |
| `#codebase`            | Provide codebase-wide context for understanding architecture and patterns. |
| `#agent`               | Access Copilot Agents and specialized AI capabilities for advanced tasks.  |
| `#terminalLastCommand` | Reference the last command executed in the terminal.                       |
| `#fetch`               | Fetch and include content from URLs or external sources.                   |
| `#repository`          | Include repository metadata, commits, or branch information.               |
| `#docs`                | Reference documentation files in your workspace.                           |
| `@terminal`            | Include terminal output or errors from your active terminal session.       |
| `@vscode`              | Reference VS Code settings, extensions, or configuration context.          |
| `@recent`              | Access recent files or conversations for continuity.                       |

## Links & Resources

- [GitHub Copilot Context Variables](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide#using-context-variables)
