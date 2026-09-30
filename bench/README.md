# AIUI Coding Benchmark

[简体中文](README.zh-CN.md)

`bench/` measures whether an AI coding agent can create, modify, fix, migrate, and align AIUI projects with design specifications. It also serves as a regression suite for the `aiui-dev` skill. A task is **resolved** only when every `required` and `regression` check passes and there are no `constraints` violations. The aggregate metric is resolved tasks divided by graded tasks.

The grader checks source, manifest facts, and selected handler behavior. It does not compare a golden patch or verify device rendering. Keep task checks hidden from the agent: only the description and a prepared workspace are public inputs.

## Run locally

Use Node.js 20 or later. The benchmark needs no npm install or Docker. All commands below run from the AIUI repository root.

### Check the harness

```sh
npm run bench:test
npm run --silent bench -- list
npm run --silent bench -- inspect 002-create-counter
```

`list` and `inspect` return public task information. To inspect a task's private grading rules while authoring it, open its `bench/tasks/<category>/<id>/task.json` directly.

### Run one task with a human or external agent

```sh
npm run --silent bench -- prepare 002-create-counter --workspace /tmp/aiui-counter
# Edit /tmp/aiui-counter, or give only that directory and the printed description to an agent.
npm run --silent bench -- grade 002-create-counter \
  --workspace /tmp/aiui-counter --output bench/results/counter.grade.json
npm run --silent bench -- summary bench/results/counter.grade.json
```

`prepare` copies the starting fixture and refuses an existing destination. Use a fresh directory for each attempt. `grade ID` without `--workspace` grades the checked-in starting fixture, which is normally expected to be unresolved.

### Run one task with DeepSeek

Set `DEEPSEEK_API_KEY` in your local environment or store the key in a local text file outside this repository. Never put a key in a task fixture or result file.

```sh
npm run --silent bench -- infer 002-create-counter \
  --workspace /tmp/aiui-counter-infer \
  --api-key-file /path/to/deepseek.key \
  --model deepseek-flash \
  --output bench/results/counter.infer.json
npm run --silent bench -- summary bench/results/counter.infer.json
```

`infer` prepares the workspace if it does not exist, then runs the model and grades its files. An existing workspace is reused, so choose a new path for a clean run. The workspace must be outside the AIUI repository. `--model` defaults to `deepseek-flash`; `--skill` selects an alternative `aiui-dev` skill directory; `--max-steps` defaults to 30 (range 1–100). The output contains the trace, token usage, skill fingerprint, status, and grading. The key is used only for the API request.

### Run every task

For an external agent, prepare every fixture, run the agent once per returned description/workspace, and then grade the collection:

```sh
npm run --silent bench -- prepare-all --workspaces /tmp/aiui-bench-manual
# Run your agent in each prepared directory.
npm run --silent bench -- grade-all \
  --workspaces /tmp/aiui-bench-manual --output-dir bench/results/manual
```

For DeepSeek, the batch runner invokes `infer` once per task in a fresh workspace, then writes `summary.json`, `report.md`, individual infer traces, and the generated workspaces. Set `DEEPSEEK_API_KEY` in the environment before running it:

```sh
node bench/scripts/run-all.js \
  --model deepseek-flash --max-steps 30 --concurrency 4 \
  --output-dir bench/results/local-run
```

`--concurrency` defaults to 4 and accepts 1–32; set it to 1 for serial execution. Reports retain catalog order, and model turns within each task remain sequential. Concurrency increases simultaneous API requests; lower it if you encounter rate limits or resource pressure.

Choose a new output directory for each run. The batch runner continues after an unresolved task or CLI error, records every catalog entry in `summary.json`, and exits nonzero if any task is unresolved. The ordinary `summary` command accepts plain `grade` and `infer` result files, counting an infer run as resolved only when its status is `completed` and its grading resolved. For stronger local package checks, run `aix check <workspace> --format json` and `aix pack <workspace> --output <file.aix>` when the AIX CLI is available.

Exit codes: `grade` and `infer` return 0 for a resolved result, 1 for an unresolved or unfinished result, and 2 for a command/provider error. `grade-all` returns 1 if any task is unresolved. An `infer` result uses `status: completed`, `max_steps`, or `error`; grading can be `null` if the grader itself failed.

### Run the complete suite in GitHub Actions

Add a repository Actions secret named `DEEPSEEK_API_KEY`. In the repository's **Actions** tab, select **AIUI Coding Benchmark**, click **Run workflow**, check one or both model boxes, and set the maximum steps and task concurrency (default 4). Selected models run sequentially, with parallel tasks within each model. GitHub's `choice` input supports only one selection, so each supported model has its own checkbox. The workflow runs only when manually dispatched, executes the harness tests, then runs every task once per selected model. The workflow file must be on the repository's default branch for the **Run workflow** button to appear.

The workflow run's **Summary** page starts with a table comparing the selected models' resolved scores and estimated average USD cost per task (total cost divided by all tasks). Expand **Details** to see each model's per-task results and costs. If any task lacks a cost estimate, that model's average is `N/A`. Download the `aiui-bench-<run-id>-<attempt>` artifact for each model's `summary.json`, `report.md`, infer traces, and generated workspaces. The Actions job succeeds once every selected model has produced complete reports, even when some tasks are unresolved or have per-task errors. A missing report or a batch setup failure still fails the job. Results do not include the API key. The workflow name and report format are provider-neutral; the current inference CLI supports DeepSeek models only.

Costs are estimates from the API's per-request cache-hit, cache-miss, and output token counts, using the [published DeepSeek USD prices](https://api-docs.deepseek.com/quick_start/pricing/) and each request's UTC peak/off-peak period. The rate table in `src/pricing.js` is dated 2026-09-30 and must be updated when prices change. A task with missing usage or a failed API request shows `N/A` rather than a misleading zero; the report and `bench summary` keep a known-cost subtotal. The provider's billing record remains authoritative.

## Add a new task

### 1. Choose an ID and starting project

Create `bench/tasks/<category>/<id>/task.json` and `bench/tasks/<category>/<id>/workspace/`. Supported categories are `create`, `modify`, `fix`, `migrate`, `constraint`, and `design`; difficulties are `easy`, `medium`, and `hard`. Use a globally unique, leading three-digit ID such as `080-create-greeting`. The directory name, JSON `id`, and parent category must agree. Put a minimal runnable AIUI project in `workspace/` (for example `app.json` and `app.js`), with the requested work still undone. Do not include symlinks, credentials, grading files, or model outputs.

Keep the description specific enough to tell the solver what to build and preserve. Refer only to files actually present in the fixture. Describe observable behavior and platform constraints; avoid prescribing one exact implementation unless the runtime requires it.

### 2. Define hidden checks

Here is a small `task.json` for a Page creation task. Its `workspace/` would start with an `app.json` declaring `pages/index/index` and an `app.js`; the solver must create the `.ink` file.

```json
{
  "schemaVersion": 1,
  "id": "080-create-greeting",
  "category": "create",
  "difficulty": "easy",
  "description": "Create a Page at pages/index/index that displays Hello AIUI from bound data. Use AIUI APIs, not browser DOM APIs.",
  "aiuiVersion": "current",
  "workspace": "./workspace",
  "grading": {
    "required": [
      { "id": "route", "type": "route", "value": "pages/index/index" },
      { "id": "page", "type": "file", "path": "pages/index/index.ink" },
      { "id": "message", "type": "template", "path": "pages/index/index.ink", "tag": "text", "binding": "message" },
      { "id": "initial-message", "type": "behavior", "path": "pages/index/index.ink", "expect": { "message": "Hello AIUI" } }
    ],
    "regression": [],
    "constraints": [{ "id": "no-dom", "type": "noDom" }]
  }
}
```

`required` checks the requested new behavior; `regression` protects behavior already present in the starting fixture; `constraints` covers task-specific restrictions. The shared validator also contributes constraint violations for every task. Each check needs a stable `id` and a known `type`. Path fields must be workspace-relative and cannot traverse upward.

| Check family | Types | What they observe |
| --- | --- | --- |
| Files and manifest | `file`, `route`, `widget`, `worker`, `permission`, `manifestField`, `routeOrder` | Files, app declarations, permissions, ordering |
| Template and layout | `template`, `widgetLayout`, `style`, `noDom` | Tags, text, bindings, tap labels, simple layout or DOM restrictions |
| Handler behavior | `scenario`, `behavior`, `workerBehavior`, `locationBehavior`, `watchBehavior`, `storageBehavior`, `overlayBehavior`, `voiceBehavior` | State after invoking handlers with deterministic mocks |

For `behavior`, supply `path`, optional `calls` (`method` or visible `button`, plus optional `arg`), `expect`, and optionally `minPatches`. For multi-file Pages, use the `.js` logic `path` and a `templatePath` pointing to `.wxml` when a check looks up a button. The behavior runner supports a limited JavaScript/ESM subset and explicit runtime mocks; it does not execute TypeScript or arbitrary modules. See existing tasks in the same category for the exact fields of specialized checks.

### Design tasks and style checks

`design` measures display-appropriate design and layout. Its initial five tasks implement the [monochrome-green specification](../design/monochrome/design-system-green.md); additional tasks cover adaptive Widget sizing and preservation of a supplied full-RGB theme. Task descriptions state the target hardware, product goals, and behavior to preserve; they do not name skill references, prescribe design tokens, or reveal grading syntax. The agent must discover and apply the appropriate design guidance through the provided `aiui-dev` skill. The inference runner already exposes these through its skill tools. When using a human or external agent, provide the task workspace, description, and `skills/aiui-dev/` directory (or an equivalent skill selected with `--skill`), including its linked references. Record the skill revision when comparing runs; task workspaces do not duplicate the guide. The first five tasks cover canvas/safe insets, typography, outlined buttons, open list rows, and redundant error semantics. Required checks verify design properties; regression checks preserve bound data and button behavior.

A `style` check supplies `path` (an `.ink` file), `className`, and a nonempty `declarations` object mapping CSS property names to literal strings. Optional positive integer `minCount` requires a minimum number of matching nodes; `tag`, `text`, and `binding` constrain the content node carrying the class. For example:

```json
{ "id": "body-copy", "type": "style", "path": "pages/index/index.ink", "className": "title", "tag": "text", "binding": "title", "declarations": { "font-size": "14px", "color": "rgba(64,255,94,0.72)" } }
```

The bounded checker reads inline `.ink` style blocks and requires the class on real Page/Widget template nodes. All nodes with that class must meet the check. It supports tag/class/ID, compound and descendant selectors, `:root`, comma lists, specificity and source order, inline declarations, `!important`, static custom properties and `var()`, inherited text properties, and common padding/margin/border/radius/font/solid-background shorthands. It ignores comments/scripts, normalizes token formatting, and checks text/binding on the selected node. These alternatives allow the agent to apply the skill without prompt instructions about CSS syntax. At-rules/imports, dynamic styles, other pseudo-classes, and unsupported syntax remain ungraded; this is not a complete CSS cascade, layout, device-rendering, or perceptual-quality check. Grading still targets fixture content classes and does not recognize arbitrary structural rewrites. This is a deterministic source benchmark, not a full CSS engine or visual comparison.

### Multi-stage scenario checks

Tasks `056`–`079` add 24 distinct scenarios: live filtering and form validation, list/detail navigation, persistence, input/switch/dataset/component contracts, location/storage/network recovery, out-of-order responses, debouncing, Page/Widget timers, location watch ownership, durable Worker updates, shared Page/Widget helpers, multi-file and routing migration, adaptive Widget sizing, full-RGB theme preservation, overlay dismissal, and key/default-action handling. Descriptions state product requirements and observable behavior, without directing the agent to skill references or prescribing implementation syntax.

`scenario` checks require `path` and a nonempty `steps` array containing at least one `expect`. Optional `templatePath` supports multi-file Pages. `instances` maps names to separate logic/template paths sharing mocked services. Actions are:

- `call`: choose one of `button` (visible label), `event` (`tag`, `name`, optional attribute/value selector), or `method` (lifecycle); pass optional `arg`. `instance` selects another declared instance. `preventDefault` supplies a tracked host event, and `waitUntil` requires synchronous Worker registration.
- `seed`: update data for varied inputs; `reload`: recreate an instance while preserving mock storage.
- `expect`: compare selected `data` keys and/or `effects` (navigation, storage, request URLs, active timers/watches, opened overlays, closes, prevented defaults).
- `advance`: move the virtual clock by `ms`; `respond`: settle numbered requests with `body`, optional HTTP `status` or network `error`; `location`: deliver `coords` or `error` to a numbered location request; `storageFailure`: toggle simulated write/read failures with `enabled`.

Mocks provide `fetch`, callback-based `wx.request`, navigation, synchronous and callback storage, geolocation, Window overlay/close, timers, URL helpers, and AbortController. Calls start asynchronous work without waiting for real I/O; controlled responses and bounded microtask draining advance it. Each check gets fresh services and instances. Timer and handler execution are bounded, and unsettled requests cannot block grading. These mocks test documented contracts, not hardware or complete host behavior. Template `attributes` checks require the requested attributes on the same real element and ignore script/comment decoys.

```json
{
  "id": "timer-cleanup", "type": "scenario", "path": "pages/index/index.ink",
  "steps": [
    { "action": "call", "method": "onShow" },
    { "action": "advance", "ms": 1000 },
    { "action": "expect", "data": { "ticks": 1 }, "effects": { "activeTimers": 1 } },
    { "action": "call", "method": "onUnload" },
    { "action": "advance", "ms": 1000 },
    { "action": "expect", "data": { "ticks": 1 }, "effects": { "activeTimers": 0 } }
  ]
}
```

### 3. Add positive and negative tests

Add a focused test under `bench/tests/` that prepares the fixture, confirms the starting state is unresolved, writes a valid solution, and confirms it resolves. Add a negative variant for the important constraint or regression so the check cannot pass accidentally. Update the catalog count and numbered-ID expectation in `bench/tests/expanded.test.js` when adding the next ID.

```sh
npm run bench:test
npm run --silent bench -- inspect 080-create-greeting
npm run --silent bench -- grade 080-create-greeting
npm run --silent bench -- prepare 080-create-greeting --workspace /tmp/aiui-greeting
# Write a solution into /tmp/aiui-greeting, then:
npm run --silent bench -- grade 080-create-greeting --workspace /tmp/aiui-greeting
```

The first `grade` should report unresolved; the second should report resolved. Verify that `inspect` and `prepare` expose only the description and workspace, not checks. Keep the task deterministic: no network calls, real device state, credentials, or checks that require one golden patch. If the new task needs a new check type, add its schema validation in `src/schema.js`, evaluator in `src/grader.js`, and focused tests before using it in `task.json`.

## Current tasks

| Category | Tasks |
| --- | --- |
| create | `001-create-page`, `002-create-counter`, `003-create-widget`, `004-create-worker`, `012-create-multifile`, `016-create-storage`, `017-create-overlay`, `020-counter-step`, `021-decrement`, `022-reset-score`, `023-toggle-light`, `024-advance-level`, `025-double-total`, `026-cycle-page`, `027-append-dot`, `057-validate-form`, `059-persist-preference`, `072-worker-storage`, `078-overlay-dismiss` |
| modify | `005-modify-toggle`, `006-modify-second-page`, `013-modify-watch`, `018-modify-voice-wakeup`, `028-increment-badge`, `029-dismiss-alert`, `030-resume-timer`, `031-increase-volume`, `032-cap-progress`, `033-cycle-mode`, `034-mark-read`, `035-add-item`, `036-subtract-credit`, `037-flip-muted`, `056-filter-results`, `058-detail-navigation`, `062-textarea-draft`, `068-debounce-search`, `073-shared-formatting`, `079-key-navigation` |
| fix | `007-fix-state`, `008-fix-event`, `014-fix-worker-open`, `015-fix-widget-lifecycle`, `038-broken-like`, `039-broken-pause`, `040-broken-retry`, `041-broken-clear`, `042-broken-zoom`, `043-broken-select`, `044-broken-skip`, `045-broken-unlock`, `060-switch-setting`, `061-dataset-selection`, `063-swiper-controls`, `064-location-retry`, `065-storage-recovery`, `066-network-retry`, `067-latest-search`, `069-page-timer-cleanup`, `070-widget-timer-lifecycle`, `071-watch-resume` |
| migrate | `009-migrate-worker`, `019-migrate-page`, `046-legacy-heart`, `047-legacy-next`, `048-legacy-finish`, `074-multifile-migration`, `075-browser-routing` |
| constraint | `010-constraint-location`, `011-constraint-no-dom`, `049-no-dom-activate`, `050-no-dom-refresh` |
| design | `051-design-canvas`, `052-design-typography`, `053-design-button`, `054-design-list`, `055-design-error-state`, `076-widget-relative-layout`, `077-fullcolor-theme` |

These 79 tasks cover Page state and event handling, Widgets, Workers, geolocation, storage, overlays, voice events, migration, platform boundaries, design selection, multi-stage user flows, asynchronous races, lifecycle cleanup, recovery paths, and multi-file regressions. The validator checks known manifest/source relationships and supported AIUI rules; it intentionally does not reject every unknown API, event, or WXSS property. Device permissions, rendering, focus, media, sensors, and visual quality require separate runtime checks. Pin the model, skill revision, and harness version when comparing benchmark runs.

The DeepSeek request format and model IDs follow the [Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/) and [Tool Calls guide](https://api-docs.deepseek.com/guides/tool_calls/).
