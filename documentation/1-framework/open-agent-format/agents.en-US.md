# AGENTS.md

`AGENTS.md` describes an agent: its identity, what it helps users do, and the guidance it should follow when responding or handling a task. Developers and agent systems can read it to understand the project's purpose and behavioral boundaries.

In an Open Agent Format (OAF) agent project, it usually sits at the project root. AIX packaging can preserve this file, but AIX does not execute its instructions by itself.

## Write a Simple Description

Here's an example `AGENTS.md` for a weather assistant:

```markdown
# Weather Assistant

Help users understand the weather in a requested city and offer concise travel advice.

## How to Work

- If the user doesn't specify a city, ask which city to check.
- Use weather data provided by the project; do not invent live weather.
- If the query fails, explain that the result is unavailable and suggest trying again later.
```

This file explains the assistant's purpose, what to do when information is missing, and how to respond to failure. The body is ordinary Markdown; the headings above help readers, but do not enable features by themselves.

## What Should You Include?

Start with the actual requirements and answer questions such as:

- **Responsibilities**: What tasks should the agent help with? What is outside its scope?
- **Working approach**: What should it ask when information is missing? When should it ask for confirmation?
- **Response style**: Should answers be brief or detailed? How should it explain missing data or failures?
- **Dependencies and constraints**: Which services or other resources does it need? What must it not assume has already been done?

Be specific and keep the description consistent with the project's real capabilities. For example, only provide live weather from a service that the project actually connects to.

## Structured Information and OAF Resources

An OAF `AGENTS.md` can use YAML front matter before its Markdown body for agent identity and composition metadata. It can also be used alongside resources such as skills, MCP configurations, and sub-agents. For fields, resource structure, and constraints, see the OAF baseline and field definitions in the [AIX Format Spec](https://yodaos-project.github.io/aix/spec?lang=en).

AIX can carry these files unchanged, but does not automatically install skills, start MCP services, or execute model policies. How the descriptions and resources are used depends on the agent runtime and application integration.

## How Does It Differ from `app.json`?

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Describes the agent's responsibilities, capability boundaries, and behavioral guidance |
| `app.json` | Declares pages, Widgets, background tasks, and application permissions |

**Writing a capability or permission in `AGENTS.md` does not implement a feature or grant access.** For example, camera use also requires declaring the appropriate permission in `app.json`, calling the relevant API, and handling device authorization or unavailability. Similarly, mentioning a configuration item or dependency does not create an environment variable or install a service.

## Continue Reading

- [AIX Format](/AIUI/framework/open-agent-format): Understand the relationship between OAF, AIX, and project files.
- [app.json](/AIUI/framework/open-agent-format-app-json): Configure application entries and permissions.
- [Project Structure](/AIUI/guide/structure): Explore the other files in an AIUI project.
