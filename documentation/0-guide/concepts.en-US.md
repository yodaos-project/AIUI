# Concepts

When you're new to AIUI, you may encounter terms such as AI, interface, agent, and intent. This page uses a weather assistant to explain these ideas and how they relate to AI glasses.

Imagine wearing glasses and saying, “Will it rain in Hangzhou today?” A weather assistant could understand the question, check the forecast, and present the result as text or a card. You could then view more details or ask a follow-up question.

## What Are AIUI, AI, and UI?

**AIUI is a development framework for agents that combines AI with user interfaces.** It helps developers create interfaces where users can ask an agent questions and complete tasks by viewing information, making choices, and taking actions.

**AI (artificial intelligence)** can help a system understand what users say, answer questions, generate content, or recognize speech and images. In a weather assistant, AI can help understand which city's weather you're asking about. AI also has limits: a useful and reliable experience needs appropriate data, an interface, and application logic.

A **UI (user interface)** is what users see and operate, such as text, a weather card, buttons, or status messages. A good interface presents information and helps users understand what they can do next.

To see what AIUI interactions can look like, start with the [introduction](./quickstart/intro.en-US.md).

## How Do GUI and AIUI Differ?

A **GUI (graphical user interface)** lets people interact through visual elements such as icons, menus, buttons, and windows. A weather app on a phone is a familiar example.

In many traditional GUIs, completing a task means following a path designed into the application. To check the weather in Hangzhou, a user might open the weather app, find the city selector, choose Hangzhou, and then view the forecast. We can think of this as an **interface-path-driven** interaction: the user reaches the goal through a sequence of interface actions.

AIUI emphasizes an **intent-driven** approach. A user can start by asking, “Will I need an umbrella in Hangzhou today?” The agent can interpret the request, use its available capabilities to check the weather, and present a result. The user can still use a card or button to view details and continue.

The two can work together: cards, buttons, and pages in AIUI are graphical interfaces too. The distinction is the starting point and organization of the interaction: the former often starts with finding and using interface controls, while the latter starts with what the user wants to accomplish. AIUI won't always interpret a request correctly and may need to ask for clarification or confirmation.

## What Is an Agent?

An **agent** is an AI system that helps users work toward a goal. It can respond to a user's request using the capabilities available to it and provide feedback.

For example, a weather agent could check the forecast for a requested city, display the temperature and conditions, and suggest whether to bring an umbrella. If the user wants the forecast for the next few days, they can follow up.

What an agent can do depends on the capabilities and data its developer provides. It doesn't automatically have access to every service, and it may need to ask the user for more information.

## What Are Intent and Intent-Driven Design?

**Intent** is what a user is trying to accomplish. For example:

- “Is it hot in Shanghai today?” might mean the user wants to check the weather in Shanghai.
- “Book a high-speed train for tomorrow morning” expresses a desire to arrange a trip.
- “This button doesn't respond” might mean the user wants help troubleshooting or continuing a task.

A request can have more than one interpretation. When information is missing, an agent can ask a question rather than guess.

**Intent-driven design** is an approach to organizing an interaction around the user's goal. A user can start by asking “Will I need an umbrella today?” The system can then interpret the request, use available capabilities, and present an appropriate response. Pages and buttons remain useful: they help users review information, confirm choices, and continue.

AIUI emphasizes this approach because people often start with a question or a need rather than knowing which page to open. For example, “Is today a good day to run outside?” might call for checking the weather and presenting an easy-to-understand suggestion.

## What's the Difference Between an Answer and an Interaction?

When asked about the weather, an agent might simply say, “It may rain today, so bring an umbrella.” For a simple question, a short text or spoken answer may be enough.

If the user wants more, the agent could also show a weather card where they can check the temperature, select more details, or ask another question. The information in the interface can change as the interaction continues.

Both approaches can help. AIUI focuses on combining answers and interfaces as appropriate for the task, making it easier for users to continue.

## What Are AI Glasses and AR?

**AI glasses** are smart glasses with AI-related capabilities. Depending on the device and application, they may support voice interaction, display information, use a camera, or work with a phone.

**AR (augmented reality)** means presenting digital information in a real-world environment. For example, someone might see a digital navigation prompt while looking at a real street. AI glasses and AR describe different concepts; the experience depends on the device and application.

**Rokid Glasses** are smart glasses made by Rokid and are one device setting in which AIUI agents can be used. You don't need to learn every hardware detail to get started; first focus on how users see information and interact.

## What Is Different About Interacting on Glasses?

On a phone, a user might open an app, find a page, and tap a button. On glasses, they might instead speak a request, glance at a prompt, and continue using controls supported by the device. Available inputs depend on the device and application.

When designing for glasses, consider: What does the user need to see now? Should feedback use text, voice, or a card? Does the user need a complete interface, or is a short prompt enough?

For a weather assistant, showing the temperature and umbrella advice first can provide a quick answer, with more details available when needed.

## Next Steps

You don't need to memorize every concept at once. You can return to this page as you continue:

- [Overview](./overview.en-US.md): Get a broader view of AIUI.
- [Project Structure](./structure.en-US.md): See the files in an AIUI project.
- [Agent Framework Introduction](./framework/intro.en-US.md): Learn how an agent's description, interface, and logic work together.
