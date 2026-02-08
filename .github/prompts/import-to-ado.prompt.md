---
name: Import to ADO
description: This prompt is used to import pipelines into Azure DevOps.
agent: AzDevOps
---

Import the attached or requested by name pipelines into Azure DevOps.

Steps to follow:

- The pipeline YAML files are correctly placed in the repository.
- The yaml is up to date and according to best practices which you check against the Microsoft Learn MCP. When planning to make changes to templates used in pipelines, check if this templates are used in other pipelines and if so, provide me a summary of the changes that will be needed in those pipelines and ask me if I want to proceed with those changes.
- Import the pipelines. If it is there, overwrite the existing pipeline with the same name.
- After importing, run the pipeline and check the log files for errors or warnings.
- When the pipelines runs wait at least 20 seconds after the run starts before checking the logs to ensure all steps are logged.
- Finally present a summary of the imported pipelines, changes applied, and a link to the last pipeline run.

Important: When troubleshooting and fixing pipeline errors, always follow best practices and the Microsoft Learn MCP guidelines for Azure DevOps. After fixing issues, commit and push the changes to the repository and run the pipeline again to verify the fixes.
