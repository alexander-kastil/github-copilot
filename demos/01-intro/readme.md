# GitHub Copilot Introduction​

[Visual Studio Code Updates](https://code.visualstudio.com/updates)

[GitHub Copilot Extensions](https://github.com/marketplace?type=apps&copilot_app=true)

[GitHub Blog](https://github.blog/)

## Demos

- Installation & Setup
- Using GitHub Copilot for CLI

### GitHub Copilot for CLI

- Show [Azure Cost CLI](https://github.com/mivano/azure-cost-cli/)
_
- Get the Subscription ID using the following GitHub Copilot for CLI prompt:_

    ```prompt
    using az account list get the id of a subscription who's name starts with Integrations
    ```

    >Note: The command is: az account list --query "[?starts_with(name, 'Integrations')].id" --output tsv

 az account list --query "[?starts_with(name, 'Integrations')].id" --output tsv

- Point out that you need your subscription id in order to execute the following command

    ```bash
    $id=az account list --query "[?starts_with(name, 'Integrations')].id" --output tsv
    azure-cost accumulatedCost -s $id
    ```

- Explain that you know that the required command is az account but that you are not so much familiar with [JMESPath Queries](https://jmespath.org/). Use GitHub Copilot for CLI to generate the query.