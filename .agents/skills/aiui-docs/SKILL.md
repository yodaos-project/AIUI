---
name: "aiui-docs"
description: "Write, revise, and review official AIUI documentation under documentation/. Invoke for guides, component or API references, bilingual documentation updates, toc changes, and API Style code examples. Do not use for public skills under skills/."
---

# AIUI Documentation Writer

Use this repository-local skill when changing official documentation under
`documentation/`. It defines the documentation layout, bilingual maintenance
rules, portable Markdown requirements, and the syntax for switchable Web and
`wx` examples.

This skill is for maintaining the AIUI repository itself. Do not publish it as
an installable skill, move it into the root `skills/` directory, or add it to
public skill listings.

## Before Writing

1. Read `documentation/toc.json` when adding, moving, renaming, or removing a
   page. Keep its nested IDs aligned with the file path.
2. Read the target page and nearby pages before editing. Follow the terminology,
   heading depth, link style, and amount of detail used in that section.
3. Verify API, component, configuration, and runtime behavior against current
   source, type declarations, packages, or runnable samples. Do not document
   inferred capabilities as supported behavior.
4. Check whether both the Chinese and English files exist before changing a
   page.

## Documentation Layout

- `documentation/0-guide/`: onboarding, concepts, and workflows.
- `documentation/1-framework/`: application format and framework behavior.
- `documentation/2-components/`: built-in component reference.
- `documentation/3-api/`: runtime, Web, and `wx` API reference.
- `documentation/4-tutorials/`: task-oriented, runnable example tutorials and their catalog configuration.
- `documentation/5-cloud/`: cloud services and server integration.
- `documentation/6-design/`: visual and interaction guidance.
- `documentation/7-tools/`: development tools and supporting workflows.
- `documentation/8-changelog/`: release-oriented change summaries.
- `documentation/toc.json`: navigation hierarchy shared by localized pages.

Use the existing directory that matches the reader's task. Do not reorganize
the navigation or invent a new top-level section for a single page unless the
request explicitly requires it.

## Bilingual Files

Chinese is stored in `<name>.md`; English is stored in `<name>.en-US.md` beside
it.

- Treat a documentation change as bilingual by default.
- Keep both versions aligned in meaning, heading structure, links, examples,
  warnings, and capability claims.
- Write natural text in each language instead of translating word by word.
- Keep identifiers, API names, file paths, payload fields, and executable code
  consistent across languages unless localized sample data improves clarity.
- If only one locale exists, do not silently create or remove the other without
  checking the surrounding section and the user's scope.

## Writing Style

- Start with what the feature enables, then show how to use it.
- Prefer task-oriented sections and short paragraphs.
- Use real Markdown headings for content that should appear in the page outline.
- Use backticks for identifiers, API names, paths, attributes, and literal
  values.
- Use fenced code blocks with an explicit language.
- Keep examples focused and executable. Avoid unrelated setup and placeholder
  behavior that the runtime does not support.
- Explain important defaults, errors, permissions, lifecycle constraints, and
  platform limitations close to the relevant example.
- Use root-relative AIUI documentation links such as `/AIUI/api/...` when
  linking between rendered documentation pages, following nearby pages.

## API Reference Page Structure

Detailed pages under `documentation/3-api/` are task-first documents, not
reference dumps. Organize them so a reader sees representative usage before
individual signatures and parameter tables.

Use this order for a page that documents callable APIs, constructors,
properties, methods, or events:

1. Start with a short introduction explaining what the capability enables and
   when to choose it.
2. Add a small set of task-named sections for typical scenarios. Each section
   should show a focused, runnable example, followed only by the behavioral
   explanation needed to use that example correctly.
3. Put cross-cutting guidance such as availability, lifecycle, platform limits,
   recommendations, and related links after the scenarios but before the
   reference section.
4. Make `## API Reference` the final level-two section on the page. Do not add
   another level-two section after it.

Inside `## API Reference`:

- Give each public API, constructor, object, property group, method group, or
  event group a descriptive level-three heading.
- Document exact signatures, parameters, parameter fields, defaults, return
  values, events, errors, and supported behavior as applicable.
- Use tables for structured parameters and fields. Do not bury parameter
  definitions in the earlier scenario sections.
- Keep short code fragments only when they clarify a signature or return shape;
  full workflows belong in the scenario sections above.
- Keep related APIs together under the same reference section. For Web and `wx`
  equivalents, describe both reference surfaces even when their scenario code
  uses an API Style group.

Name scenario headings after the reader's task, such as `Send a Request`,
`Read a Streamed Response`, or `Cancel or Observe a Request`. Avoid generic
headings such as `Examples`, `Basic Usage`, or numbered `Example 1` when a
specific task name is available.

This structure applies to API detail pages. Category landing pages whose only
purpose is navigation, and compact compatibility catalogs that only enumerate
supported APIs, do not need an artificial `API Reference` section. When a page
contains real signatures or parameter details, treat it as a detail page even
if it also serves as an overview.

A typical outline is:

```markdown
# Capability

Short introduction.

## Complete a Typical Task

Focused example and the explanation needed for this task.

## Handle Another Common Scenario

Focused example and the explanation needed for this task.

## Availability and Current Behavior

Cross-cutting constraints and guidance.

## API Reference

### `apiName(options?)`

Signature, parameters, return value, events, and errors.
```

## Portable Markdown

Documentation must remain understandable in GitHub, editors, and ordinary
Markdown renderers even when js.rokid.com enhancements are unavailable.

- Prefer CommonMark-compatible headings, paragraphs, lists, links, tables, and
  fenced code blocks.
- Do not wrap Markdown content in custom HTML elements; many renderers stop
  parsing Markdown inside them.
- Do not use `:::` custom containers for essential content because ordinary
  renderers expose the container markers as text.
- HTML comments may mark optional enhanced regions because they remain hidden
  while their enclosed Markdown continues to render normally.
- Enhanced rendering failure must not hide the only copy of an example or
  explanation.

## API Style Code Groups

Use an API Style group only when Web and `wx` examples perform the same task.
Keep prose outside the group style-neutral and branch only at the code level.

Use this exact structure:

````markdown
<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const response = await fetch('https://api.example.com/items');
console.log(await response.json());
```

**wx**

```javascript api-style=wx
wx.request({
  url: 'https://api.example.com/items',
  success(response) {
    console.log(response.data);
  }
});
```

<!-- /aiui-api-style -->
````

### API Style Rules

- The visible labels are exactly `Web` and `wx`.
- The stable IDs are `web` and `wx`; write them as `api-style=web` and
  `api-style=wx` in the fence info string.
- Use `default=web` unless the documented capability is explicitly centered on
  the compatibility API.
- A group must contain at least two options and must not repeat an ID.
- Put one bold-only label immediately before each fenced block.
- Keep the opening and closing comments on their own lines.
- Both examples must use equivalent endpoints, operations, payloads, and
  observable outcomes. Differences should reflect API shape, not different
  scenarios.
- Keep each code fence's first info token as the real language so ordinary
  renderers retain syntax highlighting.
- Do not add separate `### Web` or `### wx` headings around the group; the
  switch labels already identify the variants and headings would pollute the
  outline.
- When only one API style is supported, use a normal fenced code block instead
  of manufacturing a second variant.

In an ordinary Markdown renderer, the comments are hidden and both bold labels
and code blocks remain visible. On js.rokid.com, the same source becomes an
equal-width `Web` / `wx` switch with a sliding selection indicator.

## Tutorial Step Blocks

Tutorial pages may pair an explanation with its corresponding code by wrapping
one or more Markdown paragraphs and one fenced code block in these comments:

````markdown
<!-- aiui-tutorial-step -->

Explain what the reader should notice or do. Keep the explanation useful even
when it renders above the code instead of beside it.

```javascript
const message = 'Hello, AIUI!';
```

<!-- /aiui-tutorial-step -->
````

- Keep both markers on their own lines.
- Put the explanation first and exactly one fenced code block second.
- Use multiple step blocks when a tutorial needs multiple explanation and code pairs.
- Do not put essential content in marker attributes.
- In ordinary Markdown the explanation and code render vertically. On
  js.rokid.com, desktop layouts may place the explanation on the left and code
  on the right; narrow layouts must stack them in source order.

## Tables and Notes

- Use tables for compact field comparisons, not for long narrative content.
- Keep column labels and row ordering aligned between locales.
- Use the existing note syntax in the surrounding section. Do not introduce a
  new callout convention in one page.
- State unsupported or planned behavior plainly. Do not present roadmap items
  as currently available.

## Validation

Before finishing a documentation change:

1. Confirm every changed Chinese page has its corresponding English update when
   a pair exists.
2. For new or moved pages, verify `documentation/toc.json` resolves to the
   intended files in both locales.
3. Check API Style groups for matching markers, valid defaults, unique IDs,
   bold-only labels, and equivalent examples.
4. Render or inspect the Markdown without AIUI-specific enhancement and confirm
   that labels and fenced code blocks remain readable.
5. Run `git diff --check` from the repository root.
6. Review the final diff for accidental source changes, stale links, mismatched
   headings, and claims not supported by the implementation.
7. For changed `documentation/3-api/` detail pages, verify that typical
   scenario sections precede the reference material, `## API Reference` is the
   final level-two section, and all concrete parameter definitions live inside
   it.
