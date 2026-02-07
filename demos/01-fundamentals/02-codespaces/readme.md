# GitHub Codespaces / Dev Containers

Standardize development environments and enable instant, cloud-based coding.

## GitHub Codespaces

Cloud-hosted development environments that spin up in seconds from any repository branch. Eliminates local setup hassles and allows developers to work from any device.

**Benefits:**

- No local tools installation required
- Consistent environment across team
- Access from any browser or VS Code
- Pre-configured with project dependencies

## Dev Containers

Docker-based local development environments defined in your repository, ensuring every developer has identical tooling and dependencies. Works locally or with Codespaces.

**Benefits:**

- Version-controlled configurations
- Eliminates "works on my machine" issues
- Simple onboarding for new contributors
- Full customization of tools and extensions

**Enable Dev Containers in VS Code:**

Install the remote development extensions to use dev containers:

```json
"extensions": [
  "ms-vscode-remote.remote-containers",
  "ms-vscode-remote.remote-wsl",
  "ms-vscode-remote.remote-ssh"
]
```

## Links & Resources

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces/about-codespaces/what-are-codespaces)
- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
