---
name: aiui-debug
description: Diagnose AIUI agent failures using logs, project code, runtime versions, and device evidence. Use for page, interaction, storage, network, media, and capability troubleshooting; use aiui-optimize for package size audits.
---

# AIUI Debugging

Trace the reported symptom to the earliest supported failure and a practical verification. Analyze the evidence the user supplied first; an attached log or source tree is enough to begin. Adapt to the user's scope: diagnose when asked to analyze, and implement and validate a fix when requested. Preserve unrelated work.

## Investigation

1. Identify the symptom, target surface and environment, approximate reproduction time, and available inputs. Establish the AIUI agent and host process, runtime and app versions, and whether evidence is from simulation or a real device when available. Do not assume the target is a separate Android process or that the current local source matches the device build.
2. Reconstruct the relevant sequence across lifecycle, input, application messages, API calls, and side effects. Correlate by timestamp, PID, instance, page and operation where available. Trace application-defined errors and decisions back to the underlying failure: an event can reach a handler while a later save, request, or state update fails. Determine whether a visible response was intentionally suppressed after an error. Look for the same underlying failure in other operations, distinguishing confirmed impacts from possible ones.
3. Investigate the highest-evidence explanation first. Compare relevant agent code and the actual API contract with the matching Ink/host implementation and version when accessible. Search current project documentation, source, history or verified release information for candidate fixes, using both the underlying error and the affected subsystem as search leads. If only newer source is available, compare relevant historical code and fix descriptions where possible. Distinguish a matching error from proof that a particular device build contains or lacks a fix; do not infer a fixed version or commit ancestry from a version string, timestamp, or unrelated branch.
4. Narrow unresolved possibilities with the cheapest relevant checks. If connected hardware is available, inspect it and capture the reproduction; if it is not, explain what the provided evidence can and cannot establish. Ask only for information that changes the next diagnosis. A successful simulator run, command acceptance, network validation, or local build is not proof of the target-device outcome.
5. Report the conclusion first, with evidence locations and timestamps, the causal chain, affected behavior, uncertainty, and the next concrete fix or test. Separate observed facts, source-based inferences, and unverified hypotheses. Correct an earlier conclusion when new evidence changes it. Redact credentials, personal data, access-bearing URLs, device identifiers and app data from output.

## Load when needed

- For logcat, device capture, missing logs, and evidence limitations, read [device-and-logs.md](references/device-and-logs.md).
- For common AIUI failure paths and relevant source checks, read [diagnostic-paths.md](references/diagnostic-paths.md).
- Use the project's actual documentation and source as the authority for the deployed version. If available, consult the relevant `aiui-dev` references for API and event contracts; do not assume that sibling skills or an Ink checkout are installed.

Do not clear logs, alter device configuration, install an app, restart a service, or publish an artifact merely to investigate. Perform a mutation only when it is within the user's authorized task, and explain material verification limits.
