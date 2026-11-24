# create-aiui-agent

Scaffold a new AIUI Agent project from the built-in template in this package.

The generated project is ready for local development and includes:

- `AGENTS.md` for agent metadata
- `app.js` for app lifecycle logic
- `app.json` for global page configuration
- `pages/index/index.ink` as the first page entry

## Quick Start

Create a new project with `npx`:

```bash
npx @yodaos-pkg/create-aiui-agent my-agent
```

You can also run the package explicitly:

```bash
npx @yodaos-pkg/create-aiui-agent my-agent
```

Then enter the generated directory and start development:

```bash
cd my-agent
npm install
npm start
```

## What This Package Does

This package copies everything under `template/` into your target directory and replaces `{{PROJECT_NAME}}` placeholders with the folder name you provide.

For example, creating `my-agent` will:

- create a new `my-agent/` directory
- copy the template files into it
- update template placeholders to use `my-agent`

## Generated Template

The generated project currently looks like this:

```text
my-agent/
├── AGENTS.md
├── app.js
├── app.json
├── package.json
└── pages/
    └── index/
        └── index.ink
```

Use these files as your starting point:

- `AGENTS.md`: Describe the agent identity and capabilities.
- `app.json`: Register routes and global window settings.
- `app.js`: Add application lifecycle logic and shared global state.
- `pages/index/index.ink`: Build the first page with `.ink` single-file component structure.

## Typical Workflow

After the project is created, a practical first pass is:

1. Update `AGENTS.md` with your agent name, purpose, and capabilities.
2. Rename the default page title in `app.json` or `pages/index/index.ink`.
3. Replace the starter greeting and button behavior in `pages/index/index.ink`.
4. Run `npm start` and iterate on the page structure, logic, and styles.

## Develop With The AIUI Skill

After scaffolding the project, you can use the `aiui-dev` skill documentation to help an AI coding assistant generate and edit AIUI code correctly.

You can add the development skill with `npx skills add`:

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev
```

If you are working directly inside this repository, the local skill source currently lives at:

- `skills/aiui-dev/SKILL.md`
- `skills/aiui-dev/references/components.md`

Recommended usage:

1. Load `SKILL.md` into your AI coding assistant as the main development guide.
2. Also provide `references/components.md` when you need exact built-in component attributes, events, or examples.
3. Ask the assistant to follow the `.ink` single-file component format used by the generated template.
4. Keep the generated project files open so the assistant can align new code with the existing structure.

## What To Ask The Skill For

Once the skill is available to your assistant, it can help with tasks such as:

- creating new `.ink` pages
- editing `app.json` route configuration
- building layouts with built-in AIUI components
- wiring event handlers and page state
- applying the current design rules for wearable displays

## Suggested Next Steps

- Add more pages under `pages/` and register them in `app.json`.
- Expand `AGENTS.md` so the agent description matches your real use case.
- Use `skills/aiui-dev/SKILL.md` as the default reference when asking an AI assistant to generate AIUI UI code.

## Notes

- The project name is taken from the directory name you pass to the CLI.
- The package currently creates a minimal starter project on purpose, so it is easy to extend in small steps.
