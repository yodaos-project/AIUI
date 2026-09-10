# @yodaos-pkg/cloud-integration

Use server-side AIUI account services and send agent notifications to Rokid
Glasses users through Rokid cloud APIs.

## Installation

```bash
npm install @yodaos-pkg/cloud-integration
```

## Usage

The package requires Node.js 20 or later and uses the built-in `fetch` API.

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const client = new CloudIntegration({
  token: process.env.ROKID_SK,
})

const response = await client.sendNotification({
  messageId: '1776425100446',
  accountId: 'B5EC1E268B134EBEA857BBA35CFC7C5C',
  message: {
    agentId: 'c57ea6a751af4610b64251c9cb367b44',
    content: '咋说？',
  },
})

console.log(response.data.success)
```

The notification SK and the AIUI account access token are separate
credentials. Configure only the credentials and endpoints needed by the
methods your service calls.

## Account token

`getToken()` calls the official-agent-only account endpoint. Its
`application/json` response has a string schema, and the method resolves with
that string. The protocol does not define JSON fields inside it.

```js
const aiui = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

const accountInformation = await aiui.getToken()
```

## AIUI message cache

```js
await aiui.saveTemporaryMessage('agent-id', '/pages/agent/message', {
  customData: 'custom-data',
  content: 'You have a new agent message.',
})
```

Messages are isolated by the authenticated account and `agentId`, expire after
10 minutes, and are replaced by a later write for the same pair. A subsequent
`getAIUICacheMessage` call atomically consumes and deletes the cached message.

## Page navigation

Add a `tool` object to open a registered Glasses page and pass parameters when
the user selects the notification:

```js
await client.sendNotification({
  messageId: '1776425100446',
  accountId: 'B5EC1E268B134EBEA857BBA35CFC7C5C',
  message: {
    agentId: 'c57ea6a751af4610b64251c9cb367b44',
    content: '查看穿搭建议',
    tool: {
      name: 'pages/cloth/index',
      parameters: {
        type: 'object',
        properties: {
          field: 'value',
        },
      },
    },
  },
})
```

## API

### `new CloudIntegration(options)`

- `options.token` (`string`, optional): Rokid account SK used as the Bearer
  token by `sendNotification()`.
- `options.accessToken` (`string`, optional): Account-center credential sent in
  the `access_token` header by `getToken()` and `saveTemporaryMessage()`.
- `options.endpoint` (`string`, optional): Custom API endpoint. Defaults to
  `https://rcs.rokid.com/metis/callback/message`.
- `options.aiuiEndpoint` (`string`, optional): AIUI service origin, such as
  `https://<aiui-host>`. Required by the account and cache methods because the
  protocol does not define one universal host.
- `options.fetch` (`Function`, optional): Fetch implementation, primarily
  useful for tests or custom runtimes.

### `client.sendNotification(options)`

- `messageId` (`string`): Caller-generated unique message ID.
- `accountId` (`string`): Target user's account ID.
- `message.agentId` (`string`): Agent ID that sent the notification.
- `message.content` (`string`): Notification text.
- `message.tool` (`object`, optional): Page navigation configuration with
  `name` and `parameters` (`{ type: 'object', properties: object }`).

The method resolves with the complete API response when `code` is `1` and
`data.success` is `true`. It throws `CloudIntegrationValidationError` for
invalid input and `CloudIntegrationError` for transport, HTTP, parsing, or
server-side business failures.

### `client.getToken()`

Calls `GET /account/v1/token` and resolves with the response body as a string.
The endpoint is available only to system agents. It requires
`accessToken` and `aiuiEndpoint`.

### `client.saveTemporaryMessage(targetAgentId, path, data)`

- `targetAgentId` (`string`): Target AIUI agent ID.
- `path` (`string`): Target AIUI page path.
- `data.customData` (`string`): Application-defined message data.
- `data.content` (`string`): Message content.

Calls `POST /metis/openApi/v1/cacheAIUIMessage` and resolves with the common
response only when `code === 1`. It requires `accessToken` and `aiuiEndpoint`.

Keep both credentials private and provide them through a secret manager or
server-side environment variables. Never log either credential.
