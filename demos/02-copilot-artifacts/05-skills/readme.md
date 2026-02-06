# Agent Skills

## What are Agent Skills?

Agent Skills are portable folders containing instructions, scripts, and resources that Copilot can load to perform specialized tasks. Skills follow an open standard that works across multiple AI agents—GitHub Copilot in VS Code, GitHub Copilot CLI, and GitHub Copilot coding agent—making them reusable and composable for complex workflows.

## Enable Agent Skills

Enable skills discovery and auto-loading in VS Code:

```json
{
  "chat.useAgentSkills": true,
  "chat.agent.enabled": true,
  "chat.detectParticipant.enabled": true
}
```

## How Skills are Loaded

Skills use progressive disclosure to efficiently load content in three levels: Copilot discovers available skills by reading their name and description from YAML frontmatter, then loads detailed instructions only when your request matches a skill's description. Additional resources like scripts and examples load on-demand, ensuring you can install many skills without consuming unnecessary context. This architecture means skills are automatically activated based on your prompt without manual selection.

## Skills in This Repository

| Skill                                           | File Path                                                                        | Description                                                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **import-pipeline**                             | [`.github/skills/import-pipeline/`](.github/skills/import-pipeline/SKILL.md)     | Automate the import and execution of Azure DevOps pipelines from YAML files using deployment metadata, including error diagnosis and fixing.                                |
| **create-workload-identity-service-connection** | [`.github/skills/create-wif/`](.github/skills/create-wif/SKILL.md)               | Automate creation and deletion of Azure DevOps workload identity federation service connections for secure OIDC-based authentication between pipelines and Azure resources. |
| **get-pipeline-logs**                           | [`.github/skills/get-pipeline-logs/`](.github/skills/get-pipeline-logs/SKILL.md) | Retrieve logs from the latest Azure DevOps pipeline runs using patterns that work reliably with deleted builds.                                                             |

## Sample Skill YAML

Skills are defined with a `SKILL.md` file containing YAML frontmatter and Markdown body:

```yaml
---
name: skill-name
description: Description of what the skill does and when to use it
---

# Skill Instructions

Your detailed instructions, guidelines, and examples go here...
```

## Links & Resources

- [VS Code Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Agent Skills Standard](https://agentskills.io/)
- [GitHub Awesome Copilot Community Skills](https://github.com/github/awesome-copilot)
