# Local Agents akn Agent Mode

Local agents execute within your current VS Code session with real-time feedback and full integration with your editor, terminal, and files. Execution is synchronous and blocking, making them ideal for focused single-task workflows. There is no additional infrastructure setup required.

| Aspect           | Details                                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Best For         | Single focused tasks, debugging, iterative exploration, immediate feedback, and rapid iteration cycles. Strengths: real-time feedback, tight developer loop, no configuration overhead |
| Integration      | Direct access to workspace files, terminal, editor state, npm scripts                                                                                                                  |
| Parallelism      | Single sequential task only                                                                                                                                                            |
| Auth Context     | Full access to local authentication: Azure CLI credentials, Git tokens, SSH keys, environment variables                                                                                |
| Online Resources | Yes, can interact with online resources through local tools: Azure DevOps MCP, GitHub API, cloud CLIs                                                                                  |
| Limitations      | Blocks editor; limited by local resources; cannot parallelize                                                                                                                          |
