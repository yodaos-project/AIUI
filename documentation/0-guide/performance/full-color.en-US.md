# Full-Color Optimization Guide

Full-color optimization makes results easier to read and actions easier to complete within a content area of width 448 and maximum height 352, while keeping the agent responsive. First establish compatibility with the [Full-Color Glasses Adaptation Guide](/AIUI/guide/full-color), then refine the experience using the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color).

## Reduce Information Before Adjusting Typography

Let each view answer one main question, such as the current status, the next direction, or whether a task succeeded. Put the primary result and essential actions first, and move supporting detail into a detail view or later steps.

- Show a summary of a long response before offering details or scrolling.
- Show the most relevant list entries first, with pagination or scrolling for the rest.
- Show key metrics or a small number of chart series, with labels and units.
- Make empty, loading, and error states understandable and actionable within the same area.

Monochrome and full-color content share a maximum height of 352. Reflow a 480-wide monochrome layout for the full-color width of 448. Keep text at 14–24 dp, icons at least 12 × 12, and reserve space for card margins, padding, and strokes.

## Use Bright Colors for Emphasis

Prefer `--color-text-primary` for body text, `--color-text-secondary` for supporting content, and theme accents for a few important elements. Keep status color meanings consistent and pair them with text or icons.

Avoid coloring everything with an accent or adding large fills to improve contrast. Pure black is transparent, and dark details can disappear. If content is difficult to read, reduce clutter and increase foreground brightness and alpha, then verify on the glasses.

Set alpha separately for borders, dividers, and text to avoid compounding whole-card opacity. Keep the outermost card borderless. Internal cards use a 1px white border at 30% alpha by default and 100% when selected or focused, without changing its width. Dividers remain 1px at 40% alpha. Keep muted text, icons, and other content at or above the recommended 40% alpha.

## Inspect Images, Charts, and Canvas Separately

Theme tokens cannot directly replace image pixels or hardcoded Canvas drawing colors. Inspect these resources individually:

| Content | Optimization |
| --- | --- |
| Images | Prepare assets for their display size; reduce irrelevant backgrounds, dark details, and embedded small text |
| Icons | Use clear silhouettes and sufficient size; retain readable assets for monochrome and unknown capabilities |
| Charts | Reduce series, grid lines, and labels; prefer lines and outlines, and do not rely only on color for critical distinctions |
| Canvas | Reflow for available space; explicitly set readable fonts, line widths, and bright colors, and inspect clipping and labels |
| Maps | Retain essential routes, positions, and labels while reducing filled surfaces and unrelated details |

Arrange covers, titles, body content, charts, and footers within the available inner space. The borderless outermost card has an inner height of 284, shared by headings, charts, actions, and their spacing. Deduct internal card borders and padding from this space as well. Split summary and detail when needed, or choose the presentation that best supports the current task.

## Keep Actions and Focus Visible

Make internal card focus visible with a clear white outline at 100% alpha, with more than a color change alone; the outermost layout card stays borderless. Verify confirmation, back navigation, and scrolling through the core task, including access to actions in long content.

Do not assume that temple input mappings match another model. Verify interaction on the target device. Understand default actions before handling custom keys to avoid duplicate confirmation or lost back navigation. See the [Focus System](/AIUI/framework/open-agent-format-page-focus) and [Page Events](/AIUI/framework/open-agent-format-page-events).

## Control Assets and Update Frequency

Full color does not require more animation, images, or continuous refresh. Show useful results first and load decorative assets as needed. Avoid loading every palette variant together.

Coalesce state updates when newer values replace older ones, and avoid relaying out an entire page for every streamed character. Bound lists and caches. Pause unnecessary refresh, animation, and media when hidden, and release listeners and resources on unload. See [Runtime Performance](/AIUI/guide/performance-runtime) and [Startup Performance](/AIUI/guide/performance-startup).

## Verify Improvements with the Same Inputs

Record the target model, system and runtime versions, agent package version, input data, and test scenario. Keep these conditions consistent when comparing first content, reading, repeated interaction, and extended use.

| Scenario | What to Check |
| --- | --- |
| Bright and complex real backgrounds | Readability of primary and secondary text, lines, and focus |
| Long titles, long text, and multiple results | Fit within 448 × 352 and access to essential content and actions |
| Empty, loading, failure, and retry states | Clear explanations and next actions, with more than color alone |
| Repeated scrolling, navigation, and back actions | Stable focus, smooth interaction, and no unnecessary background work |
| Monochrome, full color, and unknown-capability fallback | Consistent shared flows, readable assets, and essential actions |

Use simulation to investigate layout and logic quickly. Confirm color, see-through readability, actual interaction, and performance through [Real-Device Debugging](/AIUI/guide/debug-real_device_debug). A single desktop preview or successful package build does not establish that optimization is complete.
