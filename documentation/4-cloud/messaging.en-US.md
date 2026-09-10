# Messaging

The message cache endpoint lets a server store one message for the current account and a specific AIUI agent. A later page or process consumes it once through `getAIUICacheMessage`. This endpoint is not part of the AIUI OpenAPI.

## Use the npm package

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const cloud = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

await cloud.saveTemporaryMessage('7665068936018264064', '/pages/agent/message', {
  customData: 'custom-data',
  content: 'You have a new agent message.',
})
```

`targetAgentId`, `path`, `data.customData`, and `data.content` are required non-empty strings. The SDK maps `targetAgentId` to `agentId` in the HTTP request body. Authentication determines the current account; do not send `accountId` or place `access_token` in the JSON body.

## Use HTTP

```text
POST https://<aiui-host>/metis/openApi/v1/cacheAIUIMessage
```

```bash
curl --location 'https://<aiui-host>/metis/openApi/v1/cacheAIUIMessage' \
  --header 'Content-Type: application/json' \
  --header 'access_token: <ACCOUNT_ACCESS_TOKEN>' \
  --data '{
    "agentId": "7665068936018264064",
    "path": "/pages/agent/message",
    "customData": "custom-data",
    "content": "You have a new agent message."
  }'
```

## Cache and response semantics

- The cache is isolated by the current account ID and `agentId`, and expires after 10 minutes.
- A later write for the same account and agent replaces the previous message; this endpoint is not a queue.
- `getAIUICacheMessage` atomically deletes the cached message after reading it, so callers must not expect repeated reads.
- The common success response contains `code`, `msg`, a millisecond `timestamp`, request `uuid`, and object-valued `data`.
- Only `code === 1` indicates business success. Diagnose other values with redacted `msg` and `uuid` data.

Validate the length, format, and business route of `path`, `customData`, and `content`; never use untrusted values directly for navigation or rendering. Credentials must come from environment variables or a secret manager.
