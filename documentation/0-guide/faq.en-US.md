# Frequently Asked Questions

This page collects common questions that come up while developing with AIUI. Before you begin, read the [Quick Start](/AIUI/guide/quickstart). For questions about a specific capability, also check the relevant component or API documentation.

## Where Should I Start Learning AIUI?

If you are new to AIUI, follow this path:

1. Read the [Introduction](/AIUI/guide/quickstart-intro) to understand where AIUI fits.
2. Complete the [Quick Start](/AIUI/guide/quickstart-quickstart) to learn the development, debugging, and publishing workflow.
3. Choose [AIUI in Chat](/AIUI/guide/quickstart-first-chat) or [Immersive AIUI](/AIUI/guide/quickstart-first-immersive) based on your product experience.
4. Read [Project Structure](/AIUI/guide/structure) to understand how project files are organized.

## What Is the Difference Between AIUI in Chat and Immersive AIUI?

AIUI in Chat is designed for lightweight, context-aware interactions inside a conversation. Immersive AIUI is designed for tasks that need a standalone page, sustained interaction, or a richer visual layout. An agent can use both, depending on how much interaction a task requires.

## Where Can I Find Component and API Usage?

- For UI elements and their properties, see [Components](/AIUI/components).
- For JavaScript, device, network, media, and AI capabilities, see the [API documentation](/AIUI/api).
- For agent organization and runtime behavior, see [Agent Framework](/AIUI/guide/framework) and [Agent Runtime](/AIUI/guide/runtime).

## How Should I Troubleshoot Runtime or Display Issues?

First confirm that the project structure and related API usage match the current documentation. Then use [Web Simulation Debugging](/AIUI/guide/debug-web_debug) to check logic and UI quickly. For device capabilities, platform differences, or issues that depend on the real runtime environment, continue with [Real-Device Debugging](/AIUI/guide/debug-real_device_debug).

## How Do I Package and Publish an Agent?

Start with the [AIX format](/AIUI/guide/bundle-aix), then follow [Submit for Review and Publish](/AIUI/guide/bundle-publish). To work with packages locally, see the [CLI guide](/AIUI/guide/bundle-cli).

## Do Full-Color Glasses Require a Separate Agent?

Full-color adaptation alone does not require a separate agent. Prefer shared business logic, Pages, Widgets, and data services in one project and one AIX. Adapt palettes and assets to display capabilities, and layouts to available space. Consider splitting agents when product positioning or core functionality needs to be independent. See the [Full-Color Glasses Adaptation Guide](/AIUI/guide/full-color).

## Which Device Do the Full-Color Guidelines Cover?

The current guidelines cover Rokid Color, whose Chinese name is 乐奇全彩眼镜. Both names refer to the same device, with a content area of width 448 and maximum height 170. Continue using [Monochrome](/AIUI/design/visual-monochrome) for the single-green displays of RokidGlasses1 / RokidGlasses2. Verify device APIs and interactions separately; full-color support does not imply identical hardware capabilities.

## Is Changing Colors Enough for Full-Color Adaptation?

Also check content space, text and icon sizes, padding, margins, focus states, and assets. Full-color text uses 14–24 dp and icons must be at least 12 × 12. Smaller monochrome text, large fills, and long page layouts need adaptation. The built-in theme supplies defaults but does not automatically correct custom layouts, images, or Canvas content. See the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color) for exact values.

## How Do I Detect Color or Monochrome Output?

On supported runtimes, use `@media (color)` / `@media (monochrome)` in styles and `window.matchMedia()` in page logic. Do not substitute device names, screen width, or `target` for capability detection. Keep an unknown state when neither query matches instead of assuming monochrome. Retain a base presentation for older runtimes. See the [Full-Color Glasses Adaptation Guide](/AIUI/guide/full-color) for examples.

## Why Are Black Backgrounds, Dark Text, or Translucent Content Hard to See?

Pure black appears transparent on the glasses and cannot block the real world. Dark colors are also unsuitable for essential content. Prefer white body text and clear bright colors, keep visible content at the recommended minimum alpha of 40%, and avoid compounding whole-card opacity. Default card outlines use 60%, selected outlines 100%, and dividers 40%. Verify against different real backgrounds and lighting conditions. See the [Full-Color Optimization Guide](/AIUI/guide/performance-full-color).

## What If Content Exceeds a Height of 170 or Switches to an Immersive Container?

Prefer summaries with details, pagination, or an operable scroll region, keeping essential actions accessible. `_blank` changes the presentation container; it does not remove the full-color content constraints of width 448 and maximum height 170. Do not solve overflow by shrinking text, reducing required spacing, or clipping content. Verify reading, scrolling, focus, and the back path on the glasses.
