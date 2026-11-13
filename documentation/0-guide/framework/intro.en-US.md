# Introduction to the Agent Framework

AIUI helps developers create agents around users' needs. A user can express a goal in a sentence, and an agent can use the capabilities its developer provides to respond with text or an interface.

For example, someone asks “Will I need an umbrella in Hangzhou today?” A weather assistant can receive the city, check the weather, and show a result in a card. The user can then view more details. The developer provides the weather data and specific query logic.

## What Are the Parts of an Agent?

- **Describe the agent**: `AGENTS.md` explains its identity, capabilities, and instructions.
- **Declare project entries**: `app.json` declares the Pages, Widgets, and Agent Workers the project needs.
- **Write logic**: Handle data, user actions, and API calls. For example, query the weather after receiving a city, then update the state.
- **Create an interface**: Use a Page or a small independent Widget to present information and let the user interact.

Pages work well for complete interactions; Widgets are useful for information and actions at a glance. A project can also use an Agent Worker for a shared background task without an interface. Not every project needs all three.

## How Do They Work Together?

After a user expresses a need, an agent can use its description and available capabilities to handle the request. Project logic performs the specific work, while the interface shows status and results. As the user continues, the logic and interface can update.

The interactive explanation below shows the path from a user's intent to interface feedback, and how a Page or Widget updates:

<framework-runtime-explorer></framework-runtime-explorer>

You don't need to understand every detail at once. Read [Categories](./category.en-US.md) to choose an interaction for your scenario, or see [Runtime Mechanism](../runtime/mechanism.en-US.md) for how a page updates.
