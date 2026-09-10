# AIUI Developer Tools & Skills

[简体中文](./README.zh-CN.md)

This repository provides developer tools, CLIs, and AI agent skills for building applications on **AIUI** (Artificial Intelligence User Interface) — an agentic runtime designed for AI glasses with displays.

Explore the broader AIUI ecosystem through [Awesome AIUI](https://github.com/jsar-project/awesome-aiui), a curated collection of related resources, projects, tools, and examples.

## 🚀 Quick Start

### Create a new AIUI Agent

You can quickly scaffold a new AIUI Agent project using our official CLI tool. Run the following command and follow the prompts:

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

This will generate a ready-to-use AIUI project template including:
- `app.js` and `app.json` for global configuration.
- `AGENTS.md` for agent capability manifestation.
- A modern Single File Component (SFC) `index.ink` page setup.

For the complete workflow, including Craft development, uploading to AIUI Studio, and debugging on glasses, see the [`Quick Start guide`](./documentation/0-guide/quickstart/quickstart.en-US.md).

## 🧪 Samples

The [`samples/`](./samples/) directory contains runnable example projects that demonstrate AIUI features and provide reference implementations for common UI patterns.

The repository currently provides these samples:

- [`samples/capabilities/`](./samples/capabilities/): A complete capability showcase covering page structure, static assets, helper modules, and feature demos.
- [`samples/gyroscope-test/`](./samples/gyroscope-test/): A device diagnostic named “Gyroscope Test” that uses `AbsoluteOrientationSensor` to validate pose quaternions, sampling frequency, axis mapping, and recentering error.

The main directories in the [`samples/capabilities/`](./samples/capabilities/) sample are:

- `pages/`: Example pages covering a range of AIUI capabilities and UI patterns.
- `assets/`: Static resources used by the demos, such as images, SVGs, and audio files.
- `lib/`: Helper modules shared by sample pages.

Representative demos inside[`samples/capabilities/pages/`](./samples/capabilities/pages/)  include:
- `layout`, `grid`, `position`: Layout and positioning patterns.
- `image`, `list`, `input_textarea`: Common UI building blocks.
- `canvas`, `canvas_api`, `chart`, `lottie`: Rendering and visual content examples.
- `media_query`, `css_vars`, `filter`, `transform`: Styling and responsive behavior examples.

## 📚 Documentation

The [`documentation/`](./documentation/) directory contains the official AIUI docs in both Chinese and English. It covers onboarding, framework concepts, built-in components, runtime and Web-style APIs, design guidance, developer tools, and release notes.

- `0-guide/`: Getting started, runtime basics, configuration, debugging, performance, and AIUI app structure.
- `1-framework/`: Framework fundamentals including project structure, config, WXML, and WXSS.
- `2-components/`: Built-in component references such as `view`, `text`, `image`, `input`, `swiper`, `canvas`, and more.
- `3-api/`: API references for framework, AI, media, device, network, storage, and compatible Web/Weixin APIs.
- `4-tutorials/`: Categorized introductory tutorials and their `tutorials.json` catalog.
- `5-cloud/`: Cloud integration for third-party agents and Rokid Glasses notifications.
- `6-design/`: Interaction and visual design guidance.
- `7-tools/`: CLI, Craft, and debugging tool documentation.
- `8-changelog/`: Latest release notes and change history.

## 🎨 Design System

The [`design/`](./design/) directory holds AIUI's visual design language specs, organized by **display type**:

- [`design/monochrome/`](./design/monochrome/) — specs for **single-color display** hardware. The active [`green`](./design/monochrome/design-system-green.md) variant targets RokidGlasses1 / RokidGlasses2, whose hardware can only reproduce one luminous green channel over pure black. Covers colors (one green across four opacity tiers), typography, spacing, radii, border widths, component chrome, and Do's & Don'ts.
  - [`design-system-green.md`](./design/monochrome/design-system-green.md) — full token spec.
  - [`preview-green.html`](./design/monochrome/preview-green.html) — self-contained, browsable visual showcase (no build step).
- `design/fullcolor/` — **planned**, for full-RGB display hardware. Not yet authored.

> The design system **currently applies only to single-green monochrome display devices**. The `design/` layout keeps the current green spec stable and leaves room for the planned full-color variant.

The same monochrome-green spec is also bundled inside the `aiui-dev` skill (see below), so AI agents generating AIUI code align with these tokens automatically.

## 🤖 AI Agent Skills

We provide built-in instructions and context files to help LLMs (Large Language Models) or AI coding assistants write AIUI code effectively.

### Install via CLI

You can easily install the AIUI developer skill into your project using the `npx skills add` command. This will fetch the necessary context files and make them available to your AI coding assistant:

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev
```

If you want to install a specific released version of the skill instead of the latest `main` branch, replace `main` with the desired tag name:

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/v0.1.0/skills/aiui-dev
```

- **`aiui-dev` Skill**: Located in [`skills/aiui-dev/SKILL.md`](./skills/aiui-dev/SKILL.md), this document contains comprehensive API references, project structure guidelines, and `.ink` SFC specifications. You can feed this file to your AI assistant to grant it the "skill" of developing AIUI applications.
- **`aiui-cloud-integration` Skill**: Located in [`skills/aiui-cloud-integration/SKILL.md`](./skills/aiui-cloud-integration/SKILL.md), this guide helps integrate third-party agents with Rokid Glasses cloud notifications through the npm package or direct HTTP/`curl` requests.

## Feedback

If you'd like to request a feature or report a bug, please use the GitHub issue templates:

- [Feature Request](https://github.com/jsar-project/AIUI/issues/new?template=feature_request.yml)
- [Bug Report](https://github.com/jsar-project/AIUI/issues/new?template=bug_report.yml)

## Repository Structure

```text
.
├── documentation/                  # official AIUI documentation (zh-CN / en-US)
├── design/
│   ├── README.md                       # design language index (by display type)
│   ├── monochrome/                     # single-color display specs
│   │   ├── README.md                   # monochrome variants (currently green)
│   │   ├── design-system-green.md      # AIUI monochrome-green token spec
│   │   └── preview-green.html          # browsable visual showcase (green)
│   └── fullcolor/                      # planned — full-RGB display specs
├── packages/
│   ├── cloud-integration/    # npm client for Rokid Glasses notifications
│   └── create-aiui-agent/    # npm CLI for scaffolding AIUI agent projects
├── samples/
│   ├── capabilities/         # runnable AIUI capabilities app and feature demos
│   └── gyroscope-test/       # device diagnostic for orientation sensor behavior
├── skills/
│   ├── aiui-cloud-integration/ # Rokid Glasses cloud notification integration skill
│   └── aiui-dev/               # AI Agent skill documentation (SKILL.md)
└── .github/workflows/        # Automated daily build and publish workflows
```

## 📄 License

Apache License 2.0
