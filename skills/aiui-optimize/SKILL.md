---
name: aiui-optimize
description: Audit, measure, and optimize AIUI agent and AIX package size, including release contents, image and audio assets, and on-demand resource loading. Use for package size investigations or implementing size reductions in AIUI projects.
---

# AIUI Package Optimization

Identify what makes each package large, then implement and measure authorized optimizations. Respect the user's scope: an audit is read-only; a request to optimize includes appropriate source and build changes. Do not upload assets, publish packages, or change remote services without authorization for that action.

## Package size requirements

Each released AIX package must be **at most 2 MiB (2,097,152 bytes)**. The recommended target is **at most 1 MiB (1,048,576 bytes)**. These limits apply to the actual complete package file, including ZIP and AIX metadata, not the sum of extracted files. For resources moved out of the package, assess the package itself against these limits and report later transfer and cache storage separately.

Classify each measured package using byte values: over 2 MiB is **over the required limit**; over 1 MiB and at most 2 MiB **meets the limit but exceeds the recommended target**; at most 1 MiB **meets the recommended target**. Values exactly on either boundary satisfy that boundary. A report filter may narrow which packages are analyzed, but must not be confused with these requirements.

When executing optimization, work toward the 1 MiB recommendation while meeting the 2 MiB limit. Verify the final built artifact's bytes: a projection is not proof of compliance. If the actual package remains over 2 MiB or cannot be rebuilt or measured, report it explicitly and do not claim the size requirement is met. If it meets 2 MiB but not 1 MiB, report that distinction and the remaining gap.

## Establish the baseline

1. Identify the input: AIUI source, `.aix` package(s), or an inventory with package paths and sizes. Preserve unrelated changes. If only an inventory is available, distinguish its totals from inspected archive contents; report inaccessible or size-mismatched packages. Apply the size requirements above in bytes; respect a separately requested analysis filter and distinguish MB from MiB. For spreadsheets, use the available spreadsheet workflow.
2. Measure actual package bytes and inspect archive entries, including compressed and uncompressed sizes. AIX is ZIP-based; a raw ZIP edit is not a valid replacement for the AIX build and integrity workflow. Do not extract an untrusted archive blindly. The standard-library helper below inventories local archives without extracting them:

   ```bash
   python3 /path/to/aiui-optimize/scripts/audit_aix.py app.aix --screen 480x352 > inventory.json
   ```

   Resolve the helper path relative to this skill. `--screen` is optional; use the actual target viewport, not a universal fixed resolution. The helper reports candidate paths, image headers, and exact content duplicates; it cannot prove usage, safe removal, or runtime behavior.
3. Rank entries by compressed contribution and inspect manifests, actual references, dynamic path construction, rendering code, startup paths, and build rules. Record uncertainty, including files that are unreachable, invalid, unsupported, or larger than the duplicate hash limit. Do not expose access-bearing URLs or credentials in the report.

## Choose and execute optimizations

Prioritize release contents, then oversized assets, then optional remote resources. Put packages with suspected release-only clutter first and total their distinct removable bytes; do not count duplicates, exclusions, recompression, or remote movement twice. A matching filename or absent static reference is a lead, not proof of safe removal. Preserve application entrypoints, required runtime resources, `AGENTS.md` where required, and applicable license/attribution files. Prefer scoped `.aixignore` rules or build configuration to deleting source files.

- **Images:** compare intrinsic dimensions with the actual display container, fit/crop mode, scaling, target pixel density, and any other use. For the 480×352 target, use that size as a viewport only when applicable; icons can be much smaller. Do not blindly resize a sprite sheet, glyph atlas, tiled/scrolling image, zoomable image, or a sample used for vision. Preserve transparency and compatible formats. Measure candidate encoded bytes and validate visual quality; update atlas coordinates and references if dimensions change.
- **Audio and data:** inspect duration, channels, sample rate, encoding, usage, and device support before transcoding. Keep latency-sensitive effects and startup-critical data available locally. Consider splitting large maps, datasets, image collections, and optional music by use; retain a functional default and offline fallback where needed.
- **On-demand resources:** specify exactly what remains in the package, what is fetched, when it is fetched, and what happens without network. Verify the current AIUI version and playback path: image and Audio Player may accept network URLs, while `Sound` is documented for local files. Do not assume an OPFS file can be passed to a player. Account for cache availability and quota, timeouts, retries, versioning, integrity, cleanup, and repeated downloads. Remote code/data loading may require restructuring rather than changing a path.
- **Build and integrity:** inspect the project's AIX tooling and current `.aixignore` semantics. When available, evaluate `aix pack --optimize` or `aix optimize` against the actual inputs; they do not replace workload-specific resizing or splitting. Rebuild through the supported AIX workflow so the manifest, entry digests, identity, and any required signatures remain valid. Never present a manually modified ZIP as a verified AIX.

For media transformation, try a representative sample before changing a whole class. Preserve original formats and behavior unless the task authorizes a change and compatibility is verified. If the user requested execution, make the viable changes and run appropriate checks rather than stopping at recommendations; report anything blocked by missing source, tooling, hosting, or device access.

## Measure and report

Read [reporting.md](references/reporting.md) for multi-package reporting, estimate accounting, and validation. Present release-content cleanup first, followed by every in-scope package, with original size and size status, main contributors, proposed or completed changes, local and optional first-install size and status, and deferred transfer. Separate actual builds and measurements from theoretical estimates, and distinguish package-size savings from bytes later transferred. Validate affected functionality, resource references and package integrity; report device, visual, audio, offline, or network checks that were not run.
