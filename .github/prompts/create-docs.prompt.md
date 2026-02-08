# Documentation Generation Template

## Overview

This template provides a structured approach for generating comprehensive documentation across different levels of the project. The documentation should be created in a bottom-up approach, starting with detailed service-level documentation and building up to the project overview.

When creating markdown make sure you follow the structure and guidelines provided in this template. The goal is to ensure that all documentation is consistent, clear, and easy to navigate. Use MD040/fenced-code-languages to ensure that code blocks are properly formatted.

## Documentation Structure

### 1. Top Level Documentation (root readme.md)

Create a concise project overview including:

- Project purpose and objectives
- High-level architecture diagram
- Key technologies and frameworks
- Project structure overview
- Utility folder structure

  ```
  .
  ├── .ado/          # Azure DevOps pipeline configurations
  ├── infra/         # Infrastructure as Code and deployment scripts
  ├── .devontainer/  # DevContainer configurations
  ├── .github/       # GitHub Copilot related settings
        ├── prompts/ # Prompt templates for GitHub Copilot
  ├── .vscode/       # Visual Studio Code configurations
  └── src/           # Source code and services
      ├── service1/
      └── plugins/
  ```

- Quick start guide
- Prerequisites
- Development setup instructions

### 2. Azure DevOps Pipeline Documentation (.ado/readme.md)

Document each pipeline with:

- Pipeline Name and Description
- Pipeline Details Table. Example:

| Pipeline Name | Purpose | Trigger Points |
| ------------- | ------- | -------------- |
| {name}.yml    | {desc}  | {triggers}     |

- Document each pipeline's required configuration:

| Variable Name | Purpose |
| ------------- | ------- |
| {name}        | {desc}  |

Repeat for each pipeline

### 3. Infrastructure Documentation (infra/readme.md)

- A general description of the subfolders and their purpose

#### Bicep Components (infra/bicep/readme.md)

For each Bicep file:

- Purpose
- Resources created
- Parameters and variables

#### CLI Scripts (infra/cli/readme.md)

For each script:

- Purpose
- Required parameters
- Usage examples

### 4. Service / Component Documentation (src/readme.md)

- Overall description of the application.
- Purpose of each service and a very high-level description of its stack. Keep together for each service and component
- All configuration keys at all levels of json used in the application like appsettings.json, environment.ts or local.settings.json. This should be a table with the following columns:

  - Config Key: The key name used in the configuration files.
  - Description: A brief description of what the key does.
  - Required: Yes/No indicating if the key is mandatory.
  - Current Prod Value: The value currently used in production.

### 5. Detailed Service / Component / Plugin Documentation (src/{service}/readme.md)

Each service documentation should include:

#### Service Overview

- Purpose and functionality
- Key features
- Architecture diagram
- Tech stack breakdown

#### Development Guide

- Prerequisites
- DevContainer configuration
- Build and execution instructions
- Dependencies on other running services. Just mention the service name, not the details.

#### Configuration Reference

| Config Key | Description | Required | Default | Example |
| ---------- | ----------- | -------- | ------- | ------- |
| {key}      | {desc}      | {y/n}    | {value} | {ex}    |

## Documentation Guidelines

0. Start from bottom-up, and build up to the project overview to ensure that you understand the project well.
1. Use clear, concise language
2. Keep configuration tables up-to-date
3. Add diagrams for complex architectures
4. Do not include anything that you are not asked for
5. Do not start with reading existing readme.md as it might be outdated or not relevant. Start with the code and understand the purpose of each service and component.

## Template Variables

Replace the following placeholders with actual content:

- `{service}`: Service or component name
- `{desc}`: Description text
- `{key}`: Configuration key
- `{value}`: Default value
- `{y/n}`: Yes/No for required fields
- `{ex}`: Example value
