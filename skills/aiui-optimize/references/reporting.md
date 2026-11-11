# Package size accounting and delivery

## Inventory and prioritization

- For a supplied spreadsheet, find the real size column and units, apply the threshold to byte values, count excluded boundary cases, and report downloads that fail or differ from recorded sizes. Inspect each selected archive before describing its contents.
- For each archive, record its original total, major files/categories, compressed and uncompressed entry sizes, and source location. ZIP entry compressed sizes determine current package contributions; category classification by extension is approximate and archive overhead is separate.
- First list each package containing suspected nested builds, backups, cache, previews, logs, test artifacts, or developer-only materials. Show each cleanup item and its current compressed bytes, the package's original and estimated cleanup-only size, plus counts and non-overlapping totals across packages and the full population. Keep this subtotal separate from image optimization and later downloads.
- For every selected package, include concrete major contributors and actions, original size, local-only outcome, first-install size if optional resources are moved, and deferred transfer for the defined scenario. If no actionable measurement was made for a package, keep its measured size unchanged and say what remains to investigate. Show actual image dimensions and target display sizes when known.
- Classify every measured package against the required **≤ 2 MiB** limit and recommended **≤ 1 MiB** target, and summarize counts in all three statuses defined in `SKILL.md`. Separately identify predicted and verified outcomes; for a package above a boundary, show the bytes that must still be saved to reach it. Use full package-file bytes and do not round before comparing.

## Size outcomes

- Prefer actual rebuilt archive bytes; identify the exact source, tool and options, and check that all required functionality and AIX metadata survived. Without a build, label an outcome as an estimate and state each assumption.
- An optimized package over 2 MiB fails the required limit even if it is much smaller than before. A package at or under 2 MiB but over 1 MiB meets the requirement and misses the recommendation. Unbuilt or unmeasured packages have unknown final status, even if their estimated sizes are below either boundary.
- A cleanup-only estimate can subtract the compressed bytes of distinct excluded entries from original archive bytes; ZIP directory/manifest changes make this approximate. For a re-encoded image, compare the entry's previous compressed contribution with the new encoded contribution under the assumed packaging method. Do not subtract an entry once for cleanup and again for resizing or deferral.
- For on-demand loading, report initial package bytes separately from the bytes of the selected remote resources downloaded once. Use actual encoded remote file bytes, or clearly state HTTP/content-encoding assumptions; compressed ZIP bytes are not automatically equal to transfer bytes. Include startup assets, added loader/index bytes, cache occupancy, HTTP overhead, repeated downloads, and offline fallback if known; mark excluded or unknown costs explicitly. First-install reduction is not necessarily a reduction in total traffic or device storage.
- Record the tested or estimated image bounds and transformations, audio codec and parameters, data partitioning, changed paths, and any quality or feature trade-offs. Do not assert a target size is achieved merely because file-level arithmetic predicts it.

## Validation

Run relevant project checks and compare old/new package inventories. Verify package metadata, generated manifest and integrity/signatures using the project's available tooling; exercise changed static and dynamic references and representative startup and deferred flows. Check offline, slow or failed downloads, fallback, cache invalidation and quota when introduced. Where applicable, validate image crop and sharpness, sprite coordinates, audio timing and quality, device decode support, and behavior on the intended device. Report precisely what was and was not tested; keep unrelated changes untouched.
