# Skills

AIUI Skills provide task-specific context, conventions, and best practices for agents, helping models produce more accurate results when writing pages, using APIs, styling interfaces, and following the design system.

## Available Skill

### aiui-dev

- Repository: <https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev>
- Local path: `/skills/aiui-dev`

`aiui-dev` is a dedicated Skill for AIUI application development. It is useful when you need to:

- write AIUI pages and interaction logic
- look up AIUI or `wx` API usage
- follow component, WXSS, and design-system constraints
- provide stable development context for agent-generated code

## Included References

`aiui-dev` currently includes the following reference documents:

- `SKILL.md`: positioning, usage scenarios, and overview of the Skill
- `apis.md`: index of AIUI runtime APIs
- `apis-wx.md`: reference for `wx` APIs
- `apis-device.md`: reference for device-related APIs
- `apis-media.md`: reference for media-related APIs
- `apis-canvas.md`: reference for Canvas APIs
- `components.md`: built-in component reference
- `wxss.md`: WXSS and styling capability reference
- `design-system-green.md`: design guidelines for green monochrome displays

## Recommendations

- Prefer `aiui-dev` when you want an agent to generate AIUI page code
- Use the Skill as the source of truth when checking whether a component, style, or API is supported
- Combine it with the design system reference when building interfaces for Rokid and similar target devices
