# Types of Agent Interaction

Imagine building a weather assistant. After a user asks about the weather, is a card in the conversation enough, or do they need a separate interface for ongoing actions? Two common AIUI interaction forms help you make that choice.

## Conversational AIUI: Continue in the Chat

A conversational interface appears in the conversation. After a user asks a question, the agent can show a card, form, or result in the same conversation. The user can then read information, tap a button, or provide more input there.

For example, an agent can answer a weather question with a card where the user can view details:

<in-chat-interaction-demo></in-chat-interaction-demo>

This works well for shorter tasks such as weather queries, search results, and itinerary confirmations. When building one, describe what the page does, when to use it, and what input it needs so it can receive and display the relevant content.

## Immersive AIUI: Work in a Standalone Interface

An immersive interface provides a separate space for the main interaction. Users can view state and perform multiple actions in one interface, and work with AI through the methods the application supports.

For example, a Landlord game interface can keep the cards and game state visible while the user plays or asks for a hint:

<standalone-interaction-demo></standalone-interaction-demo>

This works well for games, device controls, and task panels that need ongoing feedback. When building one, organize the interface state and action flow; if you need voice or model capabilities, connect the services those features require.

## Which Should You Choose?

- Want users to quickly view or confirm a result in the current conversation? Start with **conversational AIUI**.
- Want users to follow state and perform multiple actions in one interface? Start with **immersive AIUI**.

The two can also work together in one product. Once you've chosen a direction, try the examples in [Conversational AIUI](../quickstart/first-chat.en-US.md) or [Immersive AIUI](../quickstart/first-immersive.en-US.md).
