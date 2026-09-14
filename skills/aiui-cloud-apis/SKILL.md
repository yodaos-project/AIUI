---
name: aiui-cloud-apis
description: "English coding-agent guidance for the six AIUI app-facing Rokid OpenAPI operations: getProfile, invokeAgentApi, checkUserAuth, saveThirdToken, getThirdToken, and getAIUICacheMessage. Use this skill when code imports createOpenAPI from the built-in open module. Detailed per-API contracts are in references/."
---

# AIUI Cloud OpenAPI

Use this skill for **AIUI app/page code** that calls the agent-facing Rokid OpenAPI through the built-in `open` runtime module. Server-side integrations use separate documentation.

## Start here

```ts
import { createOpenAPI } from 'open';

const api = await createOpenAPI();
```

- `open` is a QuickJS/Ink runtime built-in, not an npm package.
- Do not import from `@yodaos-pkg/ink`, call `fetch('/openapi/...')`, or assume `api` is global.
- Guard import, initialization, and API calls with `try/catch`.
- The runtime injects authentication. Do not manually pass or log `access_token` or `x-request-agent-id`.
- Operations with a request body require the exact `{ body: requestBody }` wrapper. No-body operations receive no argument.

## Choose an API

| Need | Runtime call | Detailed reference |
|---|---|---|
| Account ID, name, avatar, or phone | `api.account.getProfile()` | [`references/get-profile.md`](references/get-profile.md) |
| Invoke a Lingzhu agent / stream output | `api.agent.invokeAgentApi({ body })` | [`references/invoke-agent-api.md`](references/invoke-agent-api.md) |
| Check sensitive-information permission | `api.auth.checkUserAuth()` | [`references/check-user-auth.md`](references/check-user-auth.md) |
| Save a third-party token | `api.agent.saveThirdToken({ body })` | [`references/save-third-token.md`](references/save-third-token.md) |
| Get the current agent's third-party token | `api.agent.getThirdToken()` | [`references/get-third-token.md`](references/get-third-token.md) |
| Consume one cached AIUI message | `api.agent.getAIUICacheMessage()` | [`references/get-aiui-cache-message.md`](references/get-aiui-cache-message.md) |

For shared protocol rules and the complete operation index, read [`openapi-reference.md`](openapi-reference.md). Before implementing a specific operation, read its corresponding file under `references/`; those files are authoritative for operation-specific request, response, field, event, and error details.

## Minimal call shapes

```ts
const profile = await api.account.getProfile();
const auth = await api.auth.checkUserAuth();
const token = await api.agent.getThirdToken();
const cached = await api.agent.getAIUICacheMessage();

const saved = await api.agent.saveThirdToken({
  body: { company: 'third-party-company', token: 'access-token-value' }
});

const stream = api.agent.invokeAgentApi({
  body: { agent_id: 'agent-id', question: 'Hello' }
});
```

`saveThirdToken` requires `{ body: { company, token, refreshToken?, meta?, expireInMs? } }`. `company` and `token` are required; success is `code === 1` with `data === null`. `expireInMs` is an optional millisecond TTL that defaults to `2592000000` (30 days) when omitted. Tokens are sensitive and are cached for the current user/company.

`invokeAgentApi` returns an `EventSource` immediately—never `await` it. Reuse one `conversation_id` for the lifetime of an open agent session. For its SSE stream, parse each `event.data`, append only non-empty `step: 'content'` `message.content`, exclude `thought`, inspect `metadata` for tools, and surface `error` event `message.content` to the user. Handle both `tool_call_finsh` and `tool_call_finish`.

## Safety rules

- Treat `mobile`, `token`, and `refreshToken` as sensitive. Null-check restricted fields, mask phone numbers, and never log/persist/expose credentials.
- `checkUserAuth` is informational, not a hard gate. Continue the flow when it is false or unavailable, while checking restricted fields defensively.
- `getThirdToken` with `code === 1` and `data === null` is a successful no-token state.
- `getAIUICacheMessage` with `code === 1` and `data === null` is an empty-cache state. Retrieval deletes atomically; do not blindly retry.
- Display a non-empty `profile.notification` verbatim and visibly.

## Common mistakes

Do not flatten request-body fields, await the SSE method, generate a new conversation ID for every message, pass arguments to no-body methods, concatenate thought output, invent undocumented response fields, or treat an informational permission failure as a transport failure.
