# Update package lists
sudo apt update

# Install Visual Studio Code
sudo apt install -y code

# Install Git
sudo apt install -y git

# Install GitHub CLI
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-key C99B11DEB97541F0
sudo apt-add-repository https://cli.github.com/packages
sudo apt update
sudo apt install gh

# Install .NET SDK
wget https://dotnet.microsoft.com/download/dotnet/6.0/dotnet-sdk-6.0.101-linux-x64.tar.gz
mkdir -p $HOME/dotnet && tar zxf dotnet-sdk-6.0.101-linux-x64.tar.gz -C $HOME/dotnet
export DOTNET_ROOT=$HOME/dotnet
export PATH=$PATH:$HOME/dotnet

# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Install Python
sudo apt install -y python3.11

# Install Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh

# Install OpenJDK
sudo apt install -y openjdk-17-jdk

# Install Gradle
sudo apt install -y gradle

# Install Maven
sudo apt install -y maven

# Install VS Code extensions
code --install-extension github.copilot 
code --install-extension github.copilot-chat
code --install-extension ms-dotnettools.csharp
code --install-extension ms-toolsai.jupyter
code --install-extension ms-dotnettools.dotnet-interactive-vscode
code --install-extension donjayamanne.python-environment-manager
code --install-extension kevinrose.vsc-python-indent
code --install-extension ms-python.python
code --install-extension ms-python.debugpy
code --install-extension ms-python.vscode-pylance
code --install-extension redhat.java
code --install-extension vscjava.vscode-maven
code --install-extension vscjava.vscode-gradle