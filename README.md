# AIUI

**Build interactive agents for display-equipped AI glasses.**

AIUI brings together documentation, a starter project, design guidance, examples, and developer skills for building agents on Rokid Glasses.

[简体中文](./README.zh-CN.md) · [Quick start](./documentation/0-guide/quickstart/quickstart.en-US.md) · [Benchmark](./bench/README.md) · [Documentation](./documentation/) · [Examples](./samples/) · [Awesome AIUI](https://github.com/jsar-project/awesome-aiui)

## Start building

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

The starter contains `app.js`, `app.json`, `AGENTS.md`, and an Ink page at `pages/index/index.ink`. Follow the [quick start](./documentation/0-guide/quickstart/quickstart.en-US.md) for the Craft, AIUI Studio, and device debugging workflow.

## AIUI Coding Benchmark

The [AIUI Coding Benchmark](./bench/README.md) measures how well an AI coding agent can **create, modify, fix, and migrate AIUI projects**. Its 50 tasks cover page state and events, Widgets, Workers, geolocation, storage, overlays, voice events, migration, and platform constraints. It also works as a regression suite for the [`aiui-dev` skill](./skills/aiui-dev/SKILL.md).

Each task provides a description and a starting workspace. The grader checks the resulting source, manifest, and selected handler behavior: a task counts as **resolved** only when all required and regression checks pass with no constraint violations. The headline score is resolved tasks divided by graded tasks. The benchmark does not verify rendering or behavior on real glasses.

With Node.js 20 or later, explore the task catalog from the repository root without installing dependencies:

```bash
npm run bench:test
npm run --silent bench -- list
npm run --silent bench -- inspect 002-create-counter
```

See the [benchmark guide](./bench/README.md) to prepare a workspace, grade an agent's output, run the full suite, and compare model results.

## Explore

| Resource | What it offers |
| --- | --- |
| [Documentation](./documentation/) | Guides, components, APIs, tutorials, tools, and release notes in English and Chinese. |
| [Samples](./samples/) | Runnable UI, device API, games, audio, scanner, and Bluetooth projects. |
| [Design system](./design/) | Monochrome display guidance and a [green display preview](./design/monochrome/preview-green.html). |
| [Developer skill](./skills/aiui-dev/SKILL.md) | AI coding guidance for Ink, components, APIs, and project structure. |
| [Cloud integration](./packages/cloud-integration/) | A Node.js package for third-party agents and Rokid Glasses notifications. |
| [Coding benchmark](./bench/README.md) | 50 tasks, grading tools, and workflows for evaluating AIUI coding agents. |

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
