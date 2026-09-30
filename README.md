# AIUI

**Build interactive agents for display-equipped AI glasses.**

AIUI brings together documentation, a starter project, design guidance, examples, and developer skills for building agents on Rokid Glasses.

[简体中文](./README.zh-CN.md) · [Quick start](./documentation/0-guide/quickstart/quickstart.en-US.md) · [Documentation](./documentation/) · [Examples](./samples/) · [Awesome AIUI](https://github.com/jsar-project/awesome-aiui)

## Start building

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

The starter contains `app.js`, `app.json`, `AGENTS.md`, and an Ink page at `pages/index/index.ink`. Follow the [quick start](./documentation/0-guide/quickstart/quickstart.en-US.md) for the Craft, AIUI Studio, and device debugging workflow.

## Explore

| Resource | What it offers |
| --- | --- |
| [Documentation](./documentation/) | Guides, components, APIs, tutorials, tools, and release notes in English and Chinese. |
| [Samples](./samples/) | Runnable UI, device API, games, audio, scanner, and Bluetooth projects. |
| [Design system](./design/) | Monochrome display guidance and a [green display preview](./design/monochrome/preview-green.html). |
| [Developer skill](./skills/aiui-dev/SKILL.md) | AI coding guidance for Ink, components, APIs, and project structure. |
| [Cloud integration](./packages/cloud-integration/) | A Node.js package for third-party agents and Rokid Glasses notifications. |
| [Coding benchmark](./bench/) | Tasks and a grader for AI agents that create or modify AIUI projects. |

Start with the [capabilities showcase](./samples/capabilities/), or explore focused [gyroscope](./samples/gyroscope-test/), [device info](./samples/navigator-info/), [scanner](./samples/scanner/), and [text-to-speech](./samples/tts/) examples.

## Develop with an AI coding assistant

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev
```

The [cloud integration skill](./skills/aiui-cloud-integration/SKILL.md) covers notification workflows; the [cloud APIs skill](./skills/aiui-cloud-apis/SKILL.md) covers cloud API usage.

## Repository map

| Directory | Purpose |
| --- | --- |
| [`documentation/`](./documentation/) | Product and developer documentation |
| [`samples/`](./samples/) | Runnable example agents |
| [`design/`](./design/) | Display design guidance |
| [`packages/create-aiui-agent/`](./packages/create-aiui-agent/) | Project scaffolding CLI |
| [`packages/cloud-integration/`](./packages/cloud-integration/) | Server-side cloud integration |
| [`skills/`](./skills/) | AI coding instructions and references |
| [`bench/`](./bench/) | AIUI coding benchmark |

## Help and feedback

[Report a bug](https://github.com/jsar-project/AIUI/issues/new?template=bug_report.yml) · [Request a feature](https://github.com/jsar-project/AIUI/issues/new?template=feature_request.yml) · [Explore the ecosystem](https://github.com/jsar-project/awesome-aiui)

Licensed under Apache 2.0.
