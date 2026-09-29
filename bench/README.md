# AIUI Coding Benchmark

> The benchmark evaluates whether an AI coding agent can correctly build and maintain AIUI applications. It is designed both as an AI coding benchmark and as a regression suite for the `aiui-dev` skill.

`bench/` tests complete AIUI coding tasks: creating a Page, Widget, or Worker; modifying an existing project; repairing a defect; migrating configuration; and respecting platform boundaries. Unlike SWE-bench, it does not require a golden patch or use only fail-to-pass and pass-to-pass tests. A task is **RESOLVED** only when every REQUIRED and REGRESSION check passes and there are no CONSTRAINT violations. The main metric is **Resolved Rate** (resolved tasks divided by graded tasks).

The existing `evals/` visual specification, if present, is separate. This first runnable benchmark scores deterministic source and selected logic behavior. It does not claim rendered layout, packaging, hardware, or full target-runtime equivalence.

## Requirements and commands

Node.js 20 or later. No npm dependencies or Docker are required.

From the repository root:

```sh
npm run --silent bench -- list
npm run --silent bench -- inspect 002-create-counter
# Set DEEPSEEK_API_KEY in your shell/CI secret store, or pass --api-key-file PATH.
# Automatic inference with DeepSeek (a new workspace is prepared if absent):
npm run --silent bench -- infer 002-create-counter \
  --workspace /tmp/aiui-counter --model deepseek-flash \
  --output bench/results/counter-infer.json

# Manual/external-agent workflow remains available:
npm run --silent bench -- prepare 002-create-counter --workspace /tmp/aiui-counter-manual
# Give the task description and only /tmp/aiui-counter-manual to the coding agent.
npm run --silent bench -- grade 002-create-counter --workspace /tmp/aiui-counter-manual --output bench/results/counter.json
npm run --silent bench -- summary bench/results/counter.json
npm run bench:test
```

`infer` calls the DeepSeek Chat Completions API using `DEEPSEEK_API_KEY` or `--api-key-file PATH` (a local text file containing only the key); `--model` selects the model (default `deepseek-flash`, for example `deepseek-v4-pro`). It provides read/write tools for the task workspace and read-only tools for `skills/aiui-dev`, then grades the result and writes the full trace, skill SHA-256 fingerprint, token usage, and grading to `--output` (or an ignored file under `bench/results/`). Use `--skill /path/to/aiui-dev` to compare a different skill revision, and `--max-steps N` to set a turn limit (default 30). The workspace must be outside this repository. The API key is never sent to the model or saved in the result. The model only sees the task description, skill files it reads, and workspace files it requests; it cannot read hidden grading files through the supplied tools. The tool set does not provide shell execution, so it cannot run project builds or preview commands during inference.

`grade ID` without `--workspace` grades the checked-in starting fixture. Most starting fixtures intentionally fail. `grade` prints JSON and exits 0 for RESOLVED, 1 for UNRESOLVED, and 2 for a command or schema error. `prepare` requires a destination that does not yet exist, preventing accidental overwrite. `inspect` and `prepare` expose the prompt but not the task checks. Run each task in a fresh prepared directory and fresh agent session. Give the agent access only to that directory; keep `bench/tasks/*/*/task.json`, the grader, and result files outside its view.

To run the full benchmark, use `npm run --silent bench -- prepare-all --workspaces /tmp/aiui-run` to create one directory per task. Run the external coding agent for each returned description and workspace, then use `npm run --silent bench -- grade-all --workspaces /tmp/aiui-run --output-dir bench/results` to emit per-task JSON and the aggregate Resolved Rate. `summary` can also aggregate a selected set of saved result files. The built-in `infer` driver currently supports DeepSeek only. CI can also supply its own launcher and save model, harness, skill commit, Ink/AIX version, and agent trace alongside each result.

## Task schema

Every `tasks/<category>/<id>/` has `task.json` and `workspace/`. Schema version 1 includes `id`, `category`, `difficulty`, `description`, `aiuiVersion`, `workspace`, and `grading.required`, `grading.regression`, and `grading.constraints`. Each check has a stable `id`, a known `type`, and type-specific arguments. The public task handoff is the description and workspace only. Checks target observable manifest facts, template bindings/events, and state changes after invoking handlers. They do not compare a patch or require one exact implementation.

To add a task, create a starting project under `workspace/`, write a specific user-facing description and checks in `task.json`, then add a focused positive and negative grader test. Use REQUIRED for new behavior, REGRESSION for existing behavior, and CONSTRAINT for task-specific platform rules. The shared validator always contributes CONSTRAINT violations. Keep fixtures deterministic and avoid credentials, networks, and device-only behavior in checks.

## Current tasks

| Category | Tasks |
| --- | --- |
| create | `001-create-page`, `002-create-counter`, `003-create-widget`, `004-create-worker`, `012-create-multifile`, `016-create-storage`, `017-create-overlay` |
| modify | `005-modify-toggle`, `006-modify-second-page`, `013-modify-watch`, `018-modify-voice-wakeup` |
| fix | `007-fix-state`, `008-fix-event`, `014-fix-worker-open`, `015-fix-widget-lifecycle` |
| migrate | `009-migrate-worker`, `019-migrate-page` |
| constraint | `010-constraint-location`, `011-constraint-no-dom` |

The 19 tasks cover single and multi-file Pages, Widget overlays and lifecycle, Worker open timing, geolocation watch cleanup, synchronous `wx` storage, voice wakeups, and migration from removed registration functions. The validator checks `app.json` routes and sources, `.ink` blocks and Widget family, Worker declarations, registration style, known built-in tags, template tap handlers, geolocation permission, Page lifecycle misuse in Widgets/Workers, and explicit unsupported DOM/WXSS patterns. The tag set was checked against Ink's component registration; the manifest and API rules were checked against the repository framework/runtime contracts. It deliberately does not reject every unknown API, event, or WXSS property: doing so would turn uncertain coverage into false violations. The task behavior runner loads local JavaScript imports and common named/default exports, provides `wx` for the storage case, and accepts explicit mocks for other external modules. It executes selected handlers in a bounded Node VM; it is a test aid, **not a security sandbox for hostile code**. TypeScript and arbitrary ESM syntax are outside this runner's scope.

For stronger package validation, run `aix check <workspace> --format json` and `aix pack <workspace>` in the surrounding CI harness when that CLI is available. Device permissions, rendering, focus, media, sensor events, and visual quality require separate runtime/visual checks. These are future extensions, along with multi-version comparisons and more task domains. The skill is an input to the agent, never an oracle copied into the grader. Pin its commit and compare runs under identical model and harness settings.

The DeepSeek wire format, `thinking: { type: 'disabled' }`, and supported model names follow the [official Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/) and [Tool Calls guide](https://api-docs.deepseek.com/guides/tool_calls/). A provider, grading, or skill-fingerprint failure is recorded with `status: error`; an unfinished turn budget is `status: max_steps`. Grading of the files produced so far is included when available; it is `null` if grading itself fails. Exit status is 0 only when inference completed and grading resolved the task, 1 for an incomplete or unresolved task, and 2 for errors.
