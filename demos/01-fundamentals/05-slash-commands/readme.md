# Slash Commands

Slash commands provide quick shortcuts for common tasks in GitHub Copilot Chat, allowing you to focus your questions and get targeted assistance without typing full natural language prompts. These commands enable you to perform specific operations like explaining code, generating documentation, fixing bugs, and optimizing performance with a simple forward slash followed by a command keyword.

Available in VS Code, GitHub.com, and JetBrains IDEs, slash commands streamline your workflow by routing your intent directly to the most appropriate AI capabilities. Use them in chat to complement natural language queries, or combine them with code selection for context-aware assistance.

## Enable Copilot Chat for Slash Commands

Ensure Copilot Chat is enabled in VS Code:

```json
{
  "chat.agent.enabled": true,
  "github.copilot.chat.codesearch.enabled": true
}
```

## Available Commands

| Command     | Description                                                       |
| ----------- | ----------------------------------------------------------------- |
| `/help`     | Get usage help for Copilot Chat.                                  |
| `/doc`      | Add documentation comments for the selected code (Visual Studio). |
| `/explain`  | Explain the selected or referenced code.                          |
| `/fix`      | Propose a fix for problems in the selected code.                  |
| `/tests`    | Generate unit tests for selected code.                            |
| `/optimize` | Analyze and propose performance optimizations.                    |
| `/generate` | Generate code based on user request.                              |
| `/delete`   | Delete a conversation thread.                                     |
| `/clear`    | Start a new session / clear conversation.                         |
| `/new`      | Create a new project / new chat session.                          |

## Demo

Build a working Microsoft Agent Framework application in Python 3.12 using slash commands and the #fetch tool. The #fetch tool retrieves official documentation from URLs so you can reference current docs while scaffolding code.

A solution is available in the [maf-starter-solution](maf-starter-solution) folder.

```
In demos\01-fundamentals\05-slash-commands create a folder maf-starter and use it

#fetch https://learn.microsoft.com/en-us/agent-framework/tutorials/quick-start?pivots=programming-language-python and create a hello world python 3.12 app with the prompt of "tell me about the microsoft agent framework"

Implement the following steps:

Add required packages to requirements.txt and create and activate a python .venv. No need to upgrade pip.
Add a valid .gitignore for python projects.
Create an .env with PROJECT_ENDPOINT, MODEL_DEPLOYMENT and USE MY VARIABLE NAMES
Implement the sample and run it until all errors are fixed
In the folder create a readme.md with very short instructions for beginners to run the app. Instruct them on where to get the required values for the .env from Microsoft Foundry
```

## Links & Resources

- [GitHub Copilot Slash Commands](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide#using-slash-commands)
