# Prompting Techniques

Master the art of writing effective prompts to get better code suggestions, explanations, and fixes from GitHub Copilot. Effective prompting combines context, specificity, and clear intent to guide the AI toward producing precisely what you need.

## Prompting Approaches

- Inline Suggestions: Leverage real-time code completions while typing by providing meaningful context through comments and clear patterns
- Chat-Based Prompting: Use natural language in Copilot Chat with slash commands and context variables for targeted assistance
- Prompt Engineering: Combine samples, instructions, and project context to improve response quality and consistency
- Database-Driven Prompts: Reference existing patterns and queries to help Copilot understand your architecture

## Enable Inline Suggestions

Inline suggestions appear as you type, offering code completions tailored to your context. They're essential for rapid development workflows.

Add to your VS Code settings:

```json
{
  "editor.inlineSuggest.enabled": true,
  "github.copilot.enable": {
    "*": true,
    "markdown": false,
    "plaintext": false
  }
}
```

## Key Topics Covered in This Section

- [Inline Suggestions](./01-inline-suggestions/): Real-time code completion with comments and patterns
- [Prompt Samples](./02-prompt-with-samples/): Write prompts that reference code examples for better results
- [Database Patterns](./03-database/): Use query and schema patterns to improve AI understanding
