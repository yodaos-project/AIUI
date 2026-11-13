# AIX Format

An agent can contain more than instructions: it may also include pages, images, and other resources. During development, you need a clear way to organize them; when sharing or installing the agent, you need a way to deliver them together to a compatible runtime.

**AIX (AI eXecutable) is a portable package format for AI agents.** It extends Open Agent Format so agent resources and interactive interfaces can be packaged, inspected, and distributed together.

## Start with Open Agent Format

Open Agent Format (OAF) uses files and directories to organize an agent. A minimal OAF agent can consist of a root `AGENTS.md` file describing its identity and instructions. A project can also include resources such as skills, MCP configurations, and sub-agents when needed.

OAF focuses on describing and organizing an agent. It is not tied to one runtime and does not prescribe a specific interactive interface. AIX **extends OAF**: it can preserve those agent files while adding application configuration, pages, page input descriptions, and a distributable package.

AIX preserves OAF instructions and resources. Their presence in a package does not automatically install skills, start services, or execute the instructions.

## What Does AIX Add?

In AIUI, AIX can bring an agent description and interface together in a distributable `.aix` file:

- **Application configuration**: `app.json` declares pages and other entry points and settings.
- **Interactive interfaces**: Pages and Widgets can display content and receive user actions.
- **Page input**: A page can describe the data it needs when opened; AIX can also derive agent-callable tool descriptions from page information.
- **Resources and metadata**: A package can carry images, code, and other resources, along with metadata for inspecting its contents.

Developers still need to write application logic, connect services, and verify behavior in the actual runtime. AIX is a **package format**, not a model or a runtime itself.

## How Is a Development Project Different from an `.aix` Package?

During development, you usually edit files in a project directory. For example:

```text
my-agent/
├── AGENTS.md
├── app.json
├── app.js
├── package.json
└── pages/
    └── index/
        └── index.ink
```

`AGENTS.md` describes the agent, `app.json` declares pages, and `app.js` and page files implement logic and interfaces. A project can also include Widgets, Agent Workers, components, and image assets when needed. See [Project Structure](/AIUI/guide/structure) for common directories and examples.

When you're ready to distribute the project, you can package it as a single **`.aix` file**. It is a ZIP-based archive that compatible tools can inspect and read. A generated AIX package must include `app.json` and a `VERSION` identifying the build; tools can also generate package metadata under `META-INF/aix/`. The project's `AGENTS.md` and other OAF resources can be preserved in the package.

`VERSION` identifies a build; it is not the AIX format version. You normally don't need to create it manually in the source directory.

## From Project to Distributable Agent

A typical path is:

1. **Describe the agent**: Write its responsibilities, capabilities, and instructions in `AGENTS.md`.
2. **Create an interface**: Declare pages in `app.json`, then write their content and interactions.
3. **Preview and verify**: Check the experience in development and test on the target device.
4. **Package**: Generate an `.aix` file, then inspect, install, or distribute it with compatible tools.

A readable `.aix` file does not guarantee that its services or device capabilities are available everywhere. Check the runtime, permissions, and required services for the intended use; follow the specification when verifying package integrity or trust. **A valid format does not imply a trusted signature.**

## Continue Reading

- [AIX Format Spec](https://yodaos-project.github.io/aix/spec?lang=en): Read the complete format, package structure, and verification rules.
- [Project Structure](/AIUI/guide/structure): Explore common files and directories in an AIUI project.
- [AGENTS.md](/AIUI/framework/config-agents) and [app.json](/AIUI/framework/open-agent-format-app-json): Learn about agent descriptions and application configuration.
- [Pages](/AIUI/framework/open-agent-format-page), [Widgets](/AIUI/framework/open-agent-format-widget), and [Agent Workers](/AIUI/framework/open-agent-format-agent-worker): Learn about project interfaces and background tasks.
- [Components](/AIUI/framework/open-agent-format-custom-components), [Modules](/AIUI/framework/open-agent-format-module), [Assets](/AIUI/framework/open-agent-format-assets), and [Packages](/AIUI/framework/open-agent-format-packages): Organize and reuse project content.
- [Packaging and Publishing](/AIUI/guide/bundle-publish): Learn about submitting and publishing an agent.
