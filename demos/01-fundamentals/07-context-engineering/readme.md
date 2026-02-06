# Context Engineering

Context engineering is the practice of strategically providing information to GitHub Copilot to improve the quality, accuracy, and relevance of its responses. By carefully selecting what code, files, and instructions you include in your prompts, you can guide Copilot to produce results that precisely match your needs and codebase conventions.

The primary techniques for effective context engineering include file context (referencing specific files with `#file`), conversation history (building on previous exchanges), system instructions (defined in `.github/copilot-instructions.md`), and artifact references (linking to examples and patterns). Combining these approaches ensures Copilot understands your project structure, coding standards, and specific requirements, resulting in more accurate suggestions and fewer revisions.

Context engineering becomes essential when working with complex architectures, domain-specific code, or when integrating Copilot into team workflows. Well-engineered context reduces iteration time, minimizes off-topic suggestions, and helps maintain code quality and consistency across your project.

## Enable Instructions Files for Context

Ensure Copilot reads your project instructions automatically:

```json
{
  "chat.instructionsFilesLocations": {
    ".github/instructions": true,
    ".github/copilot-instructions.md": true
  }
}
```

## Links & Resources

- [Context Engineering Guide](https://code.visualstudio.com/docs/copilot/guides/context-engineering-guide)
