# Temporary Messaging

Use this capability when a server needs to temporarily store one message for a
specific agent and a later page or process will consume it once. It uses an
account-center credential in the `access_token` header and is not an AIUI-side
OpenAPI method.

With the npm package, configure `accessToken` and an explicit `aiuiEndpoint`;
the contract does not specify a universal AIUI host:

```js
const cloud = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

await cloud.saveTemporaryMessage('agent-id', '/pages/agent/message', {
  customData: 'custom-data',
  content: 'You have a new agent message.',
})
```

The equivalent direct request is:

```bash
curl --location "${AIUI_ENDPOINT}/metis/openApi/v1/cacheAIUIMessage" \
  --header 'Content-Type: application/json' \
  --header "access_token: ${ACCOUNT_ACCESS_TOKEN}" \
  --data '{
    "agentId": "agent-id",
    "path": "/pages/agent/message",
    "customData": "custom-data",
    "content": "You have a new agent message."
  }'
```

The HTTP form is `POST /metis/openApi/v1/cacheAIUIMessage`, with
`Content-Type: application/json` and `access_token`. The SDK maps
`targetAgentId` to the HTTP body's `agentId`; `targetAgentId`, `path`,
`data.customData`, and `data.content` are required non-empty strings.
Authentication determines the account; never add `accountId` or `access_token`
to the JSON body.

The stored message is isolated by authenticated account ID and `agentId`,
expires after 10 minutes, and is replaced by a later value for the same pair.
It is not a queue. `getAIUICacheMessage` atomically consumes and deletes the
value, so do not design for repeated reads.

The common response contains numeric `code`, string `msg`, millisecond
`timestamp`, request `uuid`, and object `data`. Only `code === 1` is success.
Validate `path`, `customData`, and `content` before using them for navigation or
rendering. Redact credentials and sensitive payloads from diagnostics.
