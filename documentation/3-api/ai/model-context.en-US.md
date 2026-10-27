# ModelContext

Use `ModelContext` to expose App, Page, or Agent Worker business methods as tools a model can call. Ordinary methods are not exposed automatically. Mark a method with the global `ModelContext.defineAction()`, or register it dynamically through `getApp().modelContext`.

## Let a Model Read Application State

Declare an Action on the default export in `app.js`. This example also discovers and calls the tool locally so you can verify its result before connecting a model:

```javascript
export default {
  selectedSku: 'DEMO',
  getSelection: ModelContext.defineAction({
    name: 'get_selection',
    description: 'Read the selected product',
    execute() {
      return { selectedSku: this.selectedSku };
    },
  }),
  async onLaunch() {
    const tools = await this.modelContext.getTools();
    const tool = tools.find((item) => item.name === 'get_selection');
    if (!tool) throw new Error('get_selection was not registered');
    console.log(await this.modelContext.executeTool(tool, {}));
  },
};
```

The result is JSON text: `{"selectedSku":"DEMO"}`. Inside `execute()`, `this` is the App. The method remains directly callable, such as `this.getSelection()`. Registering a tool does not start inference.

## Offer a Tool While a Page Is Visible

Declare an Action on the default export in a page `.js` file or the `<script setup>` block of an `.ink` file:

```javascript
export default {
  data: { selectedSku: 'DEMO' },
  getSelection: ModelContext.defineAction({
    name: 'get_page_selection',
    description: 'Read the current page selection',
    execute() {
      return { selectedSku: this.data.selectedSku };
    },
  }),
};
```

Here, `this` is the Page. Tools are published before `onShow`, withdrawn before `onHide`, and restored when the page returns. They are not yet published during `onLoad`. The App and current Page share a tool list, so names must be unique.

The `description` and `schema.data` in `<script def>` describe opening a page. An Action calls a method on an existing instance; no additional `tools` or `actions` mapping is needed.

## Register and Withdraw a Tool with Your Workflow

Register a tool in a business method after application startup, and retain its controller for later cleanup:

```javascript
const registration = new AbortController();
await getApp().modelContext.registerTool({
  name: 'calculate_total',
  description: 'Calculate the price for a quantity',
  inputSchema: {
    type: 'object',
    properties: { quantity: { type: 'integer', minimum: 1 } },
    required: ['quantity'],
  },
  execute(input, { signal }) {
    signal.throwIfAborted();
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new TypeError('quantity must be a positive integer');
    }
    return { total: input.quantity * 20 };
  },
}, { signal: registration.signal });

// When the tool should no longer be offered:
registration.abort();
```

The Schema describes input and does not replace business validation. Dynamic tools belong to the App even when registered from a Page; hiding or unloading that page does not remove them. The registration `signal` withdraws availability. The execution callback receives a separate `signal` for the current call; withdrawing a tool does not cancel calls already running.

## Lifecycle and Limits

- App Actions register before `onLaunch` and are removed when the App closes.
- An Agent Worker declares Actions on its own default export, with `this` bound to the Worker. Its `getApp().modelContext` has a separate registry, shares no App/Page state, and does not provide an Agent session.
- Only own methods on the default export are collected at instance creation. Nested methods and later replacements do not update the registry automatically.
- Each declaration batch is validated together; duplicate names or quota errors do not publish a partial batch. Limits are 128 available tools, 128 concurrent calls, and 1 MiB for JSON data and registry metadata.
- The scope is application tools, without browser Document/origin discovery. Use an [Agent session](/AIUI/api/ai-agent-session) to publish background data or send messages.

## API Reference

### `ModelContext`

#### `ModelContext.defineAction(definition)`

Returns a normally callable function and captures the tool definition below. Invalid definitions throw synchronously. Registration happens only when the function is an own method on the App, Page, or Agent Worker default export. `new ModelContext()` is unsupported, and registry instances have no `defineAction()` method.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Unique within the registry; 1–128 letters, digits, underscores, dots, or hyphens. |
| `description` | `string` | Yes | Explains the task the tool completes; must contain non-whitespace text. |
| `execute` | `(input, { signal }) => value \| PromiseLike<value>` | Yes | Result must be JSON serializable; business code should respond to cancellation. |
| `title` | `string` | No | Display title. |
| `inputSchema` | `object` | No | JSON Schema describing the input. |
| `annotations` | `object` | No | Boolean hints: `readOnlyHint`, `untrustedContentHint`, `consequentialHint`, `debugging`. |

Directly calling the returned function neither supplies an execution `signal` nor serializes the result to JSON text.

### `app.modelContext`

#### `app.modelContext`

Read-only application tool registry supporting `EventTarget` methods. Obtain it through `getApp().modelContext`; no module import is needed.

#### `registerTool(tool, options?)`

Returns `Promise<void>`. `tool` uses the same definition as `defineAction()`. The optional `options.signal` is an `AbortSignal` that removes the tool when aborted. Duplicate names reject with `InvalidStateError`. Nonempty `options.exposedTo` is unsupported.

#### `getTools(options?)`

Returns `Promise<RegisteredTool[]>` with names, descriptions, Schemas, and annotations, without execution callbacks. Nonempty `options.fromOrigins` is unsupported. Read the list again after tools change.

#### `executeTool(tool, input?, options?)`

Returns `Promise<string>` containing JSON text. Pass a tool object from `getTools()`; `input` is an object defaulting to `{}`. `options.signal` cancels only this call. Callback failures and results that cannot be serialized reject with `OperationError`.

#### `toolchange`

Fires when the tool list changes; call `getTools()` again. Also supports `ontoolchange`.

#### `toolactivated`

Fires when a tool starts executing. `event.toolName` identifies the tool. Also supports `ontoolactivated`.

#### `toolcancel`

Fires when a tool call is cancelled. `event.toolName` identifies the tool. Also supports `ontoolcancel`; business callbacks must still respond to their execution `signal`.
