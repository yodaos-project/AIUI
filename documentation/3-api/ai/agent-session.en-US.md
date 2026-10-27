# Agent Sessions

Use `getApp().getAgent()` to publish background data, send user messages, display updatable cards, call remote tools, and read resources in the current Agent session. It does not create a model or a new conversation.

## Send a User Message

Send text from an App or Page business method. Success acknowledges receipt; it does not mean the model has replied:

```javascript
async function askAboutProduct() {
  const agent = getApp().getAgent();
  try {
    await agent.conversation.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: 'Describe product DEMO.' }],
    });
  } catch (error) {
    console.error(error.name, error.message);
  }
}
```

Read `agent.capabilities.operations` to check the operations available in the current session. For example, text messages require `conversation.sendMessage` and `text` in `capabilities.contentTypes`. Capabilities can change during connection; requests must still handle failure.

## Publish and Remove Context Explicitly

Application state and logs do not automatically become model input. Publish relevant background data as a context entry and retain its handle:

```javascript
const agent = getApp().getAgent();
const selection = await agent.provideContext({
  key: 'selection',
  description: 'The product selected by the user',
  value: { selectedSku: 'DEMO' },
});

// Replace this entry when the user changes their selection:
await selection.update({ selectedSku: 'SKU-002' });

// Remove it when the workflow ends:
selection.dispose();
```

Publishing and updating context neither sends a user message nor starts inference. Success acknowledges receipt without guaranteeing that a model has read the data. Entries are published together and updates are ordered. An entry is read-only model background, not shared two-way state.

## Send and Update a Card

A card supplies a title, description, and structured presentation data for the conversation interface. It defines no HTML, page layout, or button callbacks:

```javascript
const conversation = getApp().getAgent().conversation;
const card = await conversation.sendCard({
  title: 'Product DEMO',
  description: '100 items available',
  data: { sku: 'DEMO', available: 100 },
});
await card.update({
  title: 'Product DEMO',
  description: '99 items available',
  data: { sku: 'DEMO', available: 99 },
});
```

Updates replace the entire card; omitting `description` or `data` clears that field. Each `sendCard()` creates a new card, and there is no removal API. Cards do not automatically become model input. Publish the data separately with `provideContext()` if the model needs it.

## Use Remote Tools and Resources

Remote tool names and arguments follow the current service contract. This example assumes the service provides `check_stock`:

```javascript
const agent = getApp().getAgent();
const result = await agent.callTool('check_stock', { sku: 'DEMO' });
if (result.isError) {
  console.error(result.content);
} else {
  console.log(result.structuredContent ?? result.content);
}

const page = await agent.listResources();
const resource = page.resources[0];
if (resource) console.log(await agent.readResource(resource.uri));
```

`isError` reports a business failure while the Promise still resolves. Connection, authorization, and protocol failures reject. When `page.nextCursor` exists, continue with `listResources({ cursor: page.nextCursor })`. Resource content can be text or base64 binary and should not be executed as script.

## Connection and Lifecycle

- Available in App/Page scripts only. Standalone Agent Workers do not provide `getAgent()`.
- Obtain the current session at the start of each workflow. Rebinding the connection invalidates the old session, context entries, and card handles. Old data is not republished to the new connection automatically.
- Requests wait for connection readiness. The default 30-second timeout includes queueing and connection time. Cancellation and timeout cannot undo writes already processed; do not automatically retry operations that modify data.
- Dispose of context when the page no longer needs it, or bind it to a `lifetime`. Navigation does not delete sent cards. Cards may remain in the conversation after the App exits, but old handles become unusable.
- Sessions cannot read the entire conversation and do not modify the private history of `LanguageModelSession`. JSON payloads are limited to 1 MiB, with at most 128 pending requests.

## API Reference

### App

#### `getAgent()`

Returns the current `AgentSession`. Getting a handle neither starts inference nor creates a new conversation.

#### `environment`

Independent, read-only public environment object; see `Environment` below. Its content is not automatically published to the model.

### `AgentSession`

#### `connectionState`

Read-only state: `unavailable` (no service), `connecting`, `ready`, or `closed` (an old session has closed).

#### `capabilities`

Read-only snapshot containing `operations`, `contentTypes`, and the `toolListChanged` and `resourceListChanged` flags indicating available list-change notifications.

#### `invocation`

Read-only latest invocation information or `null`. Contains `invocationId`, `revision`, and a `type` identifying input, partial input, result, or cancellation. Partial input is not complete or validated business input.

#### `conversation`

Read-only message and card operation object providing the send methods below.

#### `provideContext(source, options?)`

Returns `Promise<ContextEntry>`. A session supports up to 128 entries. Duplicate keys reject with `InvalidStateError`. Requires `conversation.updateContext`.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `source.key` | `string` | Yes | 1–128 letters, digits, underscores, dots, or hyphens; unique in the session. |
| `source.description` | `string` | Yes | Description containing non-whitespace text. |
| `source.value` | JSON value | Yes | Background data explicitly supplied to the model. |
| `options.lifetime` | `AbortSignal` | No | Automatically removes the entry when aborted; separate from the request `signal`. |

`options` also accepts the common request options below.

#### `callTool(name, input, options?)`

Returns `Promise<ToolResult>` and requires `tools.call`. `name` is the remote tool name; `input` is a JSON object. Results contain `content` (text entries) and optional `structuredContent`, `isError`, and `uiMetadata`; `uiMetadata` is for presentation only. In addition to common request options, `options.onProgress(progress)` receives `value` and optional `total` and `message`.

#### `listResources(options?)`

Returns `Promise<{ resources, nextCursor? }>` and requires `resources.list`. Options accept `cursor: string` alongside common request options. Resource descriptors contain `uri`, `name`, and optional `description` and `mimeType`.

#### `readResource(uri, options?)`

Returns `Promise<ResourceContent[]>` and requires `resources.read`. Each item contains `uri`, optional `mimeType`, and either `text` or a base64 `blob`.

#### `connectionstatechange`

Fires when connection state changes. The new state is in read-only `event.detail`.

#### `capabilitieschange`

Fires when the capability snapshot changes, with the new snapshot in `event.detail`.

#### `toolinput`

Fires for complete invocation input. `event.detail` contains invocation information and `input`.

#### `toolinputpartial`

Fires for partial input. Do not execute `event.detail` as completed business arguments.

#### `toolresult`

Fires for an invocation result, available in `event.detail.result`.

#### `toolcancelled`

Fires for invocation cancellation. `event.detail` may include `reason`.

#### `toolschange`

Remote tool list change notification. Availability is indicated by `capabilities.toolListChanged`.

#### `resourceschange`

Remote resource list change notification. Availability is indicated by `capabilities.resourceListChanged`.

### `Conversation`

#### `sendMessage(message, options?)`

Returns `Promise<void>`. Requires `conversation.sendMessage` and text content support. Currently only `{ role: 'user', content: [{ type: 'text', text: string }] }` is supported. Completion acknowledges processing, not completed inference.

#### `sendCard(definition, options?)`

Returns `Promise<CardHandle>` and requires `conversation.sendCard`. Creation and updates share the fields below. Cards accept common request options but no `lifetime`.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | `string` | Yes | Must contain non-whitespace text. |
| `description` | `string` | No | Display description; cleared when omitted from an update. |
| `data` | JSON object | No | Presentation data; cleared when omitted from an update. |

### `ContextEntry`

#### `update(value, options?)`

Returns `Promise<void>` and replaces this entry's entire JSON value without changing other entries. Accepts common request options.

#### `dispose()`

Returns `undefined`. Removes the local entry immediately and schedules publication of remaining entries, without an awaitable acknowledgment. Removing the last entry clears the published context.

### `CardHandle`

#### `id`

Read-only, runtime-generated identifier scoped to the connection and App.

#### `update(definition, options?)`

Returns `Promise<void>` and requires `conversation.updateCard`. Preserves the id and replaces the complete presentation data. Completion acknowledges processing without guaranteeing visible presentation.

### Common Request Options and Errors

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `signal` | `AbortSignal` | None | Cancels one request without removing sent cards or established context. |
| `timeoutMs` | `number` | `30000` | 1–120000 milliseconds, including connection and queue time. |

Unsupported operations reject with `NotSupportedError`; closed sessions reject with `InvalidStateError`. Other errors include `NotAllowedError`, `AbortError`, `TimeoutError`, `NetworkError`, `DataError`, and `QuotaExceededError`.

### `Environment`

#### `theme`

Optional, read-only environment theme name. Reading it does not change rendering configuration.

#### `locale`

Optional, read-only environment locale. Does not change `navigator.language`.

#### `displayMode`

Optional, read-only name of the current display mode.

#### `availableDisplayModes`

Optional, read-only array of available display mode names. Do not modify it directly.

#### `safeAreaInsets`

Optional, read-only `{ top, right, bottom, left }` snapshot of safe-area insets.

#### `change`

Fires when the environment updates, with the new snapshot in `event.detail`. Listen through `getApp().environment.addEventListener('change', listener)`.
