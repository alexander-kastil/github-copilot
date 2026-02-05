FROM mcr.microsoft.com/devcontainers/python:3.12

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG DEBIAN_FRONTEND=noninteractive
ARG NODE_VERSION="22.14.10"
ARG ANGULAR_CLI_VERSION="21.1.2"

# Install .NET 10 SDK on top of .NET 9 base image
RUN curl -sSL https://dot.net/v1/dotnet-install.sh -o dotnet-install.sh \
    && chmod +x dotnet-install.sh \
    && ./dotnet-install.sh --channel 10.0 --install-dir /usr/share/dotnet \
    && rm dotnet-install.sh \
    && export DOTNET_ROOT=/usr/share/dotnet \
    && export PATH="$PATH:/usr/share/dotnet" \
    && dotnet --list-sdks \
    && dotnet --list-runtimes

# Set .NET environment variables globally
ENV DOTNET_ROOT=/usr/share/dotnet
ENV PATH="${PATH}:/usr/share/dotnet"

# Install Node.js, GitHub CLI, and essential tools
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    ARCH="$(dpkg --print-architecture)" \
    && case "${ARCH}" in \
        amd64) NODE_DISTRO="linux-x64" ;; \
        arm64) NODE_DISTRO="linux-arm64" ;; \
        *) echo "Unsupported architecture: ${ARCH}" && exit 1 ;; \
    esac \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg status=none \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends git gh xz-utils wget apt-transport-https ca-certificates curl gnupg \
    && curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${NODE_DISTRO}.tar.xz" -o node.tar.xz \
    && mkdir -p /usr/local/lib/nodejs \
    && tar -xJf node.tar.xz -C /usr/local/lib/nodejs \
    && rm node.tar.xz \
    && ln -sf /usr/local/lib/nodejs/node-v${NODE_VERSION}-${NODE_DISTRO}/bin/node /usr/local/bin/node \
    && ln -sf /usr/local/lib/nodejs/node-v${NODE_VERSION}-${NODE_DISTRO}/bin/npm /usr/local/bin/npm \
    && ln -sf /usr/local/lib/nodejs/node-v${NODE_VERSION}-${NODE_DISTRO}/bin/npx /usr/local/bin/npx \
    && [ -e /usr/local/bin/python ] || ln -s /usr/bin/python3 /usr/local/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/*

# Install Azure CLI with DevOps extension
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/microsoft.gpg > /dev/null \
    && AZ_REPO=$(. /etc/os-release && echo $VERSION_CODENAME) \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/trusted.gpg.d/microsoft.gpg] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | tee /etc/apt/sources.list.d/azure-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends azure-cli \
    && az extension add --name azure-devops \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/*

# Install Angular CLI globally
ENV PATH="/usr/local/lib/nodejs/node-v${NODE_VERSION}-linux-x64/bin:$PATH"
RUN npm install -g @angular/cli@${ANGULAR_CLI_VERSION}

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Configure PATH for vscode user
RUN echo 'export PATH="$HOME/.local/bin:$PATH:$HOME/.dotnet/tools"' >> /home/vscode/.bashrc \
    && echo 'export PATH="$HOME/.local/bin:$PATH:$HOME/.dotnet/tools"' >> /home/vscode/.profile

# Set the working directory
WORKDIR /workspace

# Switch to vscode user by default
USER vscode