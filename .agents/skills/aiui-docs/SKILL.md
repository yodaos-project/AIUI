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

1. Identify what the reader wants to accomplish or look up. Check both
   navigation files and nearby pages to find the entry point and the page
   that already owns the relevant instructions or reference.
2. Read the target page and nearby pages before editing. Follow the terminology,
   heading depth, link style, and amount of detail used in that section.
3. Verify claims against the intended release. Use implementation or tests for
   runtime behavior, the scaffold or installed CLI for setup commands, and the
   product interface for UI steps. Do not document inferred capabilities as
   supported behavior.
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
- `documentation/toc.json` and `documentation/toc.en-US.json`: Chinese and
  English navigation, respectively.

Keep the existing numbered directories and top-level navigation sections unless
the user asks to change them. Improve discoverability through ordering, labels,
and cross-links inside the existing sections. Preserve published route IDs when
changing labels or order. If a node's route differs from its file path, follow
the existing explicit `sourcePath` or `docPath` convention.

Use one page as the reference for each API or CLI contract. A task guide can
include the commands or calls needed for its workflow and link to that
reference for exact options and behavior. For example, the AIX packaging
tutorial shows how to produce and inspect an archive, while the CLI reference
owns the command options.

Make every page under `documentation/0-guide/`, especially
`0-guide/quickstart/`, usable on its own for the task it promises. State the
starting state and prerequisites, include the commands or UI steps needed to
finish, and show how to verify the result. Include a short recovery step when
a common failure would stop the reader. Keep the first preview before device
debugging or publishing.

Repeat the necessary setup, steps, examples, and limits across guides when
that saves readers a trip to another page. Write for someone who lands
directly on the page, including a section reached through search. Keep full
API and CLI option lists in their reference pages. Use links for optional
background, advanced variants, or a next task, after the current text gives
the reader enough to proceed.

## Audience and Abstraction Boundary

Official AIUI documentation is written for agent developers using AIUI,
not for developers implementing the runtime integration.

- Describe capabilities as unified AIUI contracts: supported inputs, defaults,
  outputs, errors, lifecycle requirements, availability, and other behavior an
  agent can observe.
- Do not expose implementation delegation with phrases such as "the host
  decides", "mapped by the host", or "when the host provides the capability".
  Present the AIUI-defined behavior directly.
- When behavior has a real platform or environment boundary, state that
  boundary precisely in developer-facing terms, such as an unsupported target,
  an unavailable capability, or a documented difference between platforms.
  Do not use "host behavior" as a catch-all for an unspecified contract.
- Keep internal adapters, device routing, lens mapping, and runtime integration
  details out of public documentation unless an agent developer must act
  on that detail to use the API correctly.
- Do not name `Ink` in public AIUI documentation. Source code from that
  implementation may be used to verify behavior, but the published text must
  describe the product-level contract. When an implementation layer genuinely
  needs to be named, use `运行时` or `AIUI 运行时` in Chinese and `runtime` or
  `AIUI runtime` in English.

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

Write for a developer who can read code but may be new to AIUI. Open with
what they can build, do, or look up. Give the action, its prerequisites, and
the expected result close together.

- Use direct verbs and name the actor when it matters: the developer, the
  API, or the runtime. Replace broad promises about simplicity or performance
  with concrete behavior. Omit phrases like “just” and “simply” in English
  and “只需” and “轻松” in Chinese when they gloss over a step or prerequisite.
- Keep public names such as Page, Widget, and Agent Worker. Explain unfamiliar
  terms and abbreviations at first use when the reader needs them. Use natural
  Chinese and US English. Preserve exact code identifiers and UI labels.
- Write pages that make sense on their own. State relevant versions,
  permissions, and environment limits near the affected step. Link to stable
  documentation for background. Keep chat, PR discussion, and editing history
  out of reader-facing pages.
- Use short, task-named headings and the shallowest outline that serves the
  page. Prefer sentence case for new English prose headings. Preserve
  existing anchors and the API reference hierarchy described below. Use bold
  for UI labels or important distinctions. Skip decorative headings and symbols.
- Use backticks for identifiers, paths, attributes, and literal values. Put
  commands the reader should run and multi-line examples in language-tagged
  fences. Include the working directory when it affects the outcome.
- Keep examples focused and executable. Show the default, failure behavior,
  or cleanup step where it affects the reader's next action.
- Follow nearby documentation link conventions. Use links whose text tells
  readers what they will find.

For example, write “From the project directory, run `aix preview .`. Open the
URL printed in the terminal.” In Chinese, “在项目目录运行 `aix preview .`，
然后打开终端打印的地址。” For a permission boundary, write
“`navigator.permissions.query()` reads the current state without opening a
permission dialog.”

Adapt the voice and word-choice guidance from the
[Cloudflare Computer prose skill](https://github.com/cloudflare/computer/blob/main/.agents/skills/prose/SKILL.md).
Keep AIUI's functional Markdown markers and reference conventions.

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

- Give each public API or object a descriptive level-three heading.
- Give every public constructor, property, method, and event its own
  level-four heading under the relevant API or object. Do not collapse multiple
  members into a summary table or a prose list.
- Document exact signatures, parameters, parameter fields, defaults, return
  values, events, errors, and supported behavior in the corresponding member
  section as applicable.
- Do not leave member sections as one-line restatements of their names or
  types. Explain the developer-relevant contract: mutability, state and
  lifecycle effects, how related values differ, failure conditions, and when
  the member should be used. Include only details supported by the current
  implementation or declarations.
- Add a short, focused call example to important, stateful, or easily misused
  methods. Examples should demonstrate a meaningful operation or decision,
  such as selecting a device, releasing resources, handling streamed data, or
  choosing a supported format. Trivial accessors do not each need an example.
- Use tables for the structured parameters or fields of one member, not as an
  index that replaces individual member sections. Do not bury parameter
  definitions in the earlier scenario sections.
- When equivalent Web and `wx` methods share the same option fields and
  semantics, define that option contract once in a shared section and link to
  it from both methods. Keep API-specific parameter names, return shapes,
  preconditions, and errors in their respective method sections.
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
2. For navigation changes, follow the affected entry points in both locales.
   Check targets, link fragments, and related tutorial catalog entries. Keep
   public routes stable and confirm any intentional locale differences against
   product availability.
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
8. Check changed public documentation for `Ink` references and replace them
   with product-level wording or the locale-appropriate runtime term.
9. Run changed first-run commands in a fresh project and test examples with
   the target runtime or tool where available. Check the expected result.
   Report what was verified and note any browser, account, or device steps
   that still require validation.
10. Read changed prose in each language as a first-time reader. Check that
    headings make sense on their own, the reader can identify the next action
    and its result, and every claim is as specific as the evidence allows.
    For `0-guide/`, read the page without opening its links and check that
    the reader can complete the stated task and confirm the result.
