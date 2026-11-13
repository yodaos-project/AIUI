# Agent Framework

The AIUI agent framework defines how to organize an agent description, project configuration, pages, and background tasks into a runnable project. Understanding how they relate helps you decide **where a feature belongs and what happens when a user opens an interface**.

This page introduces the main parts of the framework and how they work together. The following sections cover each part in more detail.

## How Does the Framework Organize an Agent?

An AIUI project typically contains these parts:

| Part | Purpose | Common location |
| --- | --- | --- |
| Agent description | Describes the agent's identity, capabilities, and behavioral instructions | `AGENTS.md` |
| Application configuration | Declares pages, optional entry points, and global window settings | `app.json` |
| Application logic | Handles application-level lifecycle and shared data | `app.js` |
| Page | Holds page data, interface, and user interactions | `pages/` |
| Widget | Provides a small independent interface | Usually in `widgets/` |
| Agent Worker | Performs a background task without an interface | Usually in `workers/` |

The parts have different responsibilities: `AGENTS.md` describes the agent, `app.json` declares the project's entry points, and pages and other code implement the behavior. **Describing a capability does not implement it**; developers still need to provide the data, services, and logic it requires.

You don't need a Page, Widget, and Agent Worker for every project. Start with one page and add other entry points as needed.

## How Are Agents and Pages Opened?

AIUI supports different interaction forms, with different ways to design their entry points:

- **Conversational page**: A page can use `description` to explain what it does and `schema.data` to describe the data needed to open it. The page can then be invoked in an appropriate conversational context to show a card or other interface.
- **Immersive agent**: When a user enters the agent, it typically starts with the first page declared in `app.json`, then continues in a standalone interface.

For example, a conversational page can declare that it accepts `city`. When the page opens, it reads that input in `onLoad(query)`; its own `data` holds the current state for display. They serve different purposes: **input describes what the page needs; page data records what the interface currently shows**.

For interaction choices and details, continue to [Categories](./category.en-US.md) and [Page Definition](/AIUI/framework/open-agent-format-page-definition).

## How Do Page Logic and Interface Work Together?

An `.ink` page can hold its configuration, logic, interface structure, and styles. A typical interaction works like this:

1. Set initial state in the page's `data` and bind it to the interface using `{{ }}`.
2. Connect user actions to handlers with event bindings such as `bindtap`.
3. Call `this.setData()` in a handler to update the data; the affected interface content then updates.

A page can also use lifecycle functions, such as `onLoad()` to read input and `onUnload()` to clean up resources. Logic should account for the page being hidden, shown again, or unloaded.

Pages and Widgets both support data binding, components, events, and styles, but they are different entry points with different lifecycles. See [Logic Development](./logic.en-US.md) and [UI Development](./ui.en-US.md) for examples, or [Runtime Mechanism](../runtime/mechanism.en-US.md) for a page update walkthrough.

## When Should I Use a Widget or Agent Worker?

A **Widget** is suited to a small interface for information or actions at a glance, such as device status. It has its own entry point declared in `app.json` and its own lifecycle. See [Widget Development](/AIUI/framework/open-agent-format-widget) for configuration and a complete example.

An **Agent Worker** is suited to work without an interface, such as one-time initialization or a shared task while multiple Pages and Widgets are open. It is declared in `app.json` and has its own execution environment; don't assume page interface objects or every page API are available there. See [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker) for lifetime and capability limits.

If a feature belongs only to the current page, start with page logic. Add a Widget or Worker when you need a small independent interface or a shared background task.

## What Do the Framework and Runtime Each Do?

The framework provides conventions for organizing projects and writing agents, including page configuration, data binding, events, and lifecycle functions. The runtime loads the project, runs code, handles events, and displays the interface. An application can use APIs for capabilities such as networking and storage; check each API's documentation for availability and requirements.

During development, check the experience in a simulator and then verify display, input, and performance on the target device. For different display capabilities, see [Full-Color Adaptation](./full-color.en-US.md).

## Continue Reading

- [Framework Introduction](./intro.en-US.md): See how the parts work together around a user's need.
- [Categories](./category.en-US.md): Choose conversational or immersive interaction.
- [Logic Development](./logic.en-US.md): Write application, page, and background task logic.
- [UI Development](./ui.en-US.md): Create an interface, bind data, and add styles.
- [Project Structure](../structure.en-US.md): Explore common files and folders.
