# Skills

AIUI Skills give your coding assistant development guidance, API references, and examples for building and debugging AIUI agents, reducing AIX package size, and integrating with Rokid cloud services.

## Choose a Skill for Your Task

| Skill | Use it to |
| --- | --- |
| [`aiui-dev`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-dev/SKILL.md) | Create or modify an AIUI project, build Pages, Widgets, or Agent Workers, and look up components, WXSS, runtime APIs, and design guidelines for monochrome and full-color glasses. |
| [`aiui-debug`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-debug/SKILL.md) | Diagnose page, interaction, storage, network, or media problems using logs, project code, runtime versions, and device information. |
| [`aiui-optimize`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-optimize/SKILL.md) | Measure an actual `.aix` package, inspect its contents, optimize release files and image or audio assets, and verify the rebuilt package size. |
| [`aiui-cloud-apis`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-cloud-apis/SKILL.md) | Call cloud APIs from an AIUI app with `createOpenAPI()` from the built-in `open` module. For example, read a user profile, invoke a Lingzhu agent, or retrieve a cached message. |
| [`aiui-cloud-integration`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-cloud-integration/SKILL.md) | Use `@yodaos-pkg/cloud-integration` or HTTP on a server to cache one-time messages, send Rokid Glasses notifications, or set which AIUI page opens when a notification is tapped. |

## Install and Use a Skill

If your coding assistant supports Skills, run `npx skills` from your project root. The following command installs `aiui-dev` for everyday AIUI development.

```bash
npx skills add https://github.com/yodaos-project/AIUI --skill aiui-dev
```

For another skill, replace `aiui-dev` with its name from the table and follow the prompts to select your coding assistant. See the [Skills CLI documentation](https://github.com/vercel-labs/skills#install-a-skill) for requirements and installation options.

If you use AIUI Coding in AIUI Studio, you can download and enable the built-in `aiui-dev` in the editor. See [AIUI Editor](/AIUI/tools/editor) for the steps.

In your prompt, name the skill, share the relevant materials, and say what you want the assistant to verify.

> Use `aiui-debug` to investigate why this page stops responding after it opens on the glasses. Reconstruct the sequence of events from the attached logs and page code, and identify what still needs to be verified on the device.
