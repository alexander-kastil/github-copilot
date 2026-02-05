# Register Azure DevOps Organization

Go to [https://azure.microsoft.com/de-de/products/devops](https://azure.microsoft.com/de-de/products/devops) to register your Azure DevOps Organization

![register-1](_images/register-1.png)

Create your DevOps organization. This will also the name of your first project:

![register-orga](_images/register-orga.png)

In order to be able to use the Microsoft Hosted Agents you have two options:

1. Use your Azure Credits to purchase Parallel Jobs for the Microsoft Hosted Agents
2. Request your free 1.800 minutes of Microsoft Hosted Agents

The first option works immediately, the second option takes a few days. Even if you choose the first option, you can still request the free minutes and remove the purchased parallel jobs once the free minutes are available.

## Use your Azure Credits to purchase Parallel Jobs for the Microsoft Hosted Agents

- Go to your organization settings

- Go to `Parallel Jobs`. 

    ![free-jobs](_images/free-jobs.png)

- Chose `Purchase parallel jobs`

- Set up billing.

    ![billing](_images/billing.jpg)

- Choose your Azure Subscription that will be used for billing. Very likley is it the "Azure Pass Sponsorship" subscription.    

    ![subscription](_images/subscription.jpg)

- Setup at least one MS Hosted job

    ![job](_images/job.jpg)

## Request your free 1.800 minutes of Microsoft Hosted Agents

Fill out the [request](https://aka.ms/azpipelines-parallelism-request) to get the grant for free agent build minutes:

![free-grants](_images/free-grants.png)

You can check the grant at: `https://dev.azure.com/<DEVOPS-ORGA>/_settings/buildqueue?_a=concurrentJobs`
