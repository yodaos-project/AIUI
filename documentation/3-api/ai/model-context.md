# ModelContext

通过 `ModelContext` 把 App、Page 或 Agent Worker 的业务方法提供为模型可调用的工具。普通方法不会自动成为工具；使用全局 `ModelContext.defineAction()` 标记方法，或通过 `getApp().modelContext` 动态注册。

## 让模型读取应用状态

在 `app.js` 默认导出对象上声明 Action。下面同时演示本地发现和调用，便于在连接模型前验证结果：

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

结果是 JSON 文本 `{"selectedSku":"DEMO"}`。`execute()` 的 `this` 指向 App；方法仍可在应用内直接调用，如 `this.getSelection()`。工具注册不会自动开始推理。

## 只在页面可见时提供工具

在页面 `.js` 或 `.ink` 的 `<script setup>` 默认导出对象上声明 Action：

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

这里的 `this` 是 Page。工具在 `onShow` 前发布，在 `onHide` 前撤下；返回页面时恢复。`onLoad` 时尚未发布。App 和当前 Page 共用工具列表，工具名必须唯一。

`<script def>` 的 `description` 和 `schema.data` 描述打开页面的入口；Action 调用的是已存在实例的方法，不需要另建 `tools` 或 `actions` 映射。

## 按业务生命周期注册和撤销工具

在应用启动后的业务方法中动态注册工具，并保留控制器供后续撤销：

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

// 不再需要提供工具时：
registration.abort();
```

Schema 描述输入结构，不替代业务校验。动态工具属于整个 App，即使在 Page 中注册也不会随页面隐藏或卸载移除。注册用的 `signal` 撤销工具可用性；执行回调收到的 `signal` 只取消当前调用，撤销注册不会取消已开始的调用。

## 生命周期与限制

- App Action 在 `onLaunch` 前注册，App 关闭时移除。
- Agent Worker 在自己的默认导出对象上声明 Action，`this` 指向 Worker。其 `getApp().modelContext` 使用独立注册表，不共享 App/Page 状态，也不提供 Agent 会话。
- 只收集实例创建时默认导出对象的自有方法；嵌套方法及之后替换的方法不会自动更新注册表。
- 同批声明整体校验；重名或超限不会只发布部分工具。最多 128 个可用工具和 128 个并发调用；JSON 数据和注册表元数据上限为 1 MiB。
- 当前范围是应用内工具注册，不提供浏览器 Document/origin 发现。需要发布背景数据或发送消息时，使用 [Agent 会话](/AIUI/api/ai-agent-session)。

## API Reference

### `ModelContext`

#### `ModelContext.defineAction(definition)`

返回保留普通调用方式的函数，并捕获下表中的工具定义。定义错误会同步抛错；把函数放到 App、Page 或 Agent Worker 默认导出的自有方法上才会注册。不能 `new ModelContext()`，注册表实例上也没有 `defineAction()`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 同一注册表内唯一，1–128 个字母、数字、下划线、点或连字符。 |
| `description` | `string` | 是 | 告诉模型工具能完成什么任务，不得全为空白。 |
| `execute` | `(input, { signal }) => value \| PromiseLike<value>` | 是 | 结果必须可 JSON 序列化；业务代码应响应取消。 |
| `title` | `string` | 否 | 展示标题。 |
| `inputSchema` | `object` | 否 | 描述输入的 JSON Schema。 |
| `annotations` | `object` | 否 | 布尔提示 `readOnlyHint`、`untrustedContentHint`、`consequentialHint`、`debugging`。 |

直接调用返回的函数不会自动补充执行 `signal`，也不会将结果转成 JSON 文本。

### `app.modelContext`

#### `app.modelContext`

只读的应用工具注册表，支持 `EventTarget` 方法。注册表实例通过 `getApp().modelContext` 获取，无需导入模块。

#### `registerTool(tool, options?)`

返回 `Promise<void>`；`tool` 使用与 `defineAction()` 相同的定义。`options.signal` 为可选 `AbortSignal`，中止后移除该工具。同名注册以 `InvalidStateError` 拒绝；非空 `options.exposedTo` 不受支持。

#### `getTools(options?)`

返回 `Promise<RegisteredTool[]>`，条目包含名称、说明、Schema 和注解，不含执行回调。非空 `options.fromOrigins` 不受支持；工具变化后应重新读取列表。

#### `executeTool(tool, input?, options?)`

返回 `Promise<string>`，结果为 JSON 文本。`tool` 使用 `getTools()` 返回的对象；`input` 是对象，默认 `{}`；`options.signal` 只取消本次调用。回调失败或结果不可序列化时，以 `OperationError` 拒绝。

#### `toolchange`

工具列表改变时触发，可重新调用 `getTools()`。也支持 `ontoolchange`。

#### `toolactivated`

工具开始执行时触发，`event.toolName` 为工具名。也支持 `ontoolactivated`。

#### `toolcancel`

工具调用被取消时触发，`event.toolName` 为工具名。也支持 `ontoolcancel`；业务回调仍需响应执行 `signal`。
