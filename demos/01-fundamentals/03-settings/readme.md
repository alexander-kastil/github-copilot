# Settings

Configure VS Code and development environments to optimize GitHub Copilot workflows. Settings control Copilot behavior, inline suggestions, model selection, and workspace consistency across teams.

## Essential Copilot Settings

Enable core Copilot features in your VS Code `settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "plaintext": false,
    "yaml": true
  },
  "editor.inlineSuggest.enabled": true,
  "github.copilot.chat.codesearch.enabled": true,
  "github.copilot.chat.generateTests.codeLens": true,
  "github.copilot.chat.claudeAgent.enabled": true
}
```

## Configuration Locations

- **User-level settings** (`.json`): Personal preferences applied across all workspaces
- **Workspace settings** (`.vscode/settings.json`): Project-specific overrides for team consistency
- **Dev Container settings** (`.devcontainer/devcontainer.json`): Standardized environments with pre-configured extensions and tools
