# Sub-Agents

Sub-agents enable one agent to delegate work to specialized agents, keeping the main agent's context window focused. By offloading research, analysis, and implementation tasks to focused sub-agents, you prevent context bloat and help the main agent stay focused on orchestrating the overall workflow.

The key advantage is parallel execution—VS Code can run multiple sub-agents simultaneously for multi-step workflows. Instead of researching authentication patterns, analyzing code structure, then reviewing documentation sequentially, you can do all three at once.

## Example Use Cases

Managing state with NgRx Signal Store

You're building a user authentication feature in Angular and want to manage client-side state with NgRx Signal Store. Delegate a Red agent to write failing tests for store actions, a Green agent to implement the store with authentication slices, and a Refactor agent to optimize selectors—all proceeding in parallel through the TDD cycle.

Create a custom TDD agent in [.github/agents/tdd-angular.md](/.github/agents/tdd-angular.md):

```markdown
---
name: TDD-Angular
tools: ['agent']
agents: ['Red', 'Green', 'Refactor']
---
Implement the following Angular component using test-driven development with Vitest. Use subagents to guide the steps:
1. Use the Red agent to write failing unit tests with Vitest
2. Use the Green agent to implement the component code to pass the tests
3. Use the Refactor agent to improve code quality while keeping tests green
```

## Key Topics Covered in This Section

- [VS Code Subagents Documentation](https://code.visualstudio.com/docs/copilot/agents/subagents)
- [Custom Agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents)
