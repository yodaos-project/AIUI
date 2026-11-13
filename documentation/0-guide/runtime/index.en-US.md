# Agent Runtime

You've written a weather assistant. When someone opens it, a weather page appears on their glasses. They tap “View details”, and the page shows more information. How do the code and interface come to life?

They need an environment to run in. The **AIUI runtime** runs the agent's code, displays its interface, and helps its code respond to user actions.

## What Does the Runtime Do?

Think of an agent project as a prepared plan: the project describes the agent, its pages, and its interaction logic; the runtime makes those parts work in a device or development environment.

For example, when a user opens the weather assistant, the runtime starts the agent according to its configuration, runs the page code, and displays the page. When the user interacts, the page logic can handle the action and update data, and the interface can show the result.

The runtime also provides APIs that an agent can use for tasks such as network requests and data storage. Check each API's documentation for availability and requirements. Developers still need to provide the weather data, application logic, and interactions their project requires.

## How Does an Interaction Happen?

Take a “View details” button on a weather page:

1. **Display the interface**: The runtime loads the page, and the user sees weather information and a button.
2. **Respond to the action**: The user taps the button, and the page's corresponding handler runs.
3. **Show the result**: The page logic updates data, and the interface displays the details.

If an action needs a network request, the page can show a loading state while it waits, then display the result. If the request fails, it can offer a retry. This helps the user understand what's happening.

For more about how page data and the interface work together, continue to [Runtime Mechanism](./mechanism.en-US.md).

## Where Can You Run and Debug an Agent?

During development, you can preview the interface and controls in AIUI Studio's web simulator to check changes quickly. When you're ready, test on the target device, such as Rokid Glasses, to experience the actual display, interaction, and performance.

Preview and device testing serve different purposes: preview helps you iterate quickly, while the final experience needs to be verified on the target device. For steps and guidance, see [Runtime Environment](./env.en-US.md).

## What Should You Consider When Writing Code?

AIUI uses JavaScript for agent interaction logic and also supports importing TypeScript modules. You can use common modern JavaScript syntax, but don't assume every browser API is available; check the relevant API documentation.

Also avoid keeping the runtime busy with long-running synchronous code, which can prevent the interface from responding promptly. See [JavaScript Compatibility](./js.en-US.md) for common language features, TypeScript, and execution limits.

## Continue Reading

- [Runtime Environment](./env.en-US.md): Learn about simulation and device testing.
- [JavaScript Compatibility](./js.en-US.md): Explore common language features, TypeScript, and execution limits.
- [Runtime Mechanism](./mechanism.en-US.md): See how a page displays, responds to actions, and updates.
