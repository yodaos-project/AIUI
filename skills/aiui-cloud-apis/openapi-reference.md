# AIUI Cloud OpenAPI Reference

This file defines rules shared by the six app-facing Rokid OpenAPI operations. `SKILL.md` is the short routing entry. Operation-specific request, response, field, event, error, and edge-case details live in `references/` and those files are authoritative for their respective operations.

## Scope and operation map

The agent-facing operations are `getProfile`, `invokeAgentApi`, `checkUserAuth`, `saveThirdToken`, `getThirdToken`, and `getAIUICacheMessage`. Server-side `cacheAIUIMessage`, `getToken`, and `sendNotification` are documented separately under `pr_resource/cloud_integration_docs/`.

| Namespace | Operation | HTTP path | Request body | Detailed reference |
|---|---|---|---|---|
| `api.account` | `getProfile` | `GET /account/v1/profile` | None | [get-profile](references/get-profile.md) |
| `api.agent` | `invokeAgentApi` | `POST /metis/openApi/v1/invokeAgentApi` | Required | [invoke-agent-api](references/invoke-agent-api.md) |
| `api.auth` | `checkUserAuth` | `POST /metis/openApi/v1/checkUserAuth` | None | [check-user-auth](references/check-user-auth.md) |
| `api.agent` | `saveThirdToken` | `POST /metis/openApi/v1/saveThirdToken` | Required | [save-third-token](references/save-third-token.md) |
| `api.agent` | `getThirdToken` | `POST /metis/openApi/v1/getThirdToken` | None | [get-third-token](references/get-third-token.md) |
| `api.agent` | `getAIUICacheMessage` | `POST /metis/openApi/v1/getAIUICacheMessage` | None | [get-aiui-cache-message](references/get-aiui-cache-message.md) |

## Shared protocol rules

- Access OpenAPI only through the built-in Ink runtime module `'open'`:
  ```ts
  import { createOpenAPI } from 'open';
  ```
- `'open'` is a QuickJS/Ink built-in module, not an npm package.
- Always `await createOpenAPI()` before calling an OpenAPI method.
- Prefer calling OpenAPI inside page lifecycle methods or page methods. Do not wrap these calls as global methods in `app.js`.
- Guard dynamic import, `createOpenAPI()`, and every OpenAPI call with `try/catch`.
- The runtime host injects authentication. Do not manually pass, log, persist, or expose `access_token` or `x-request-agent-id`.
- Do not call `fetch('/openapi/...')` directly unless the user explicitly asks for low-level HTTP debugging.
- Do not import `createOpenAPI` from `@yodaos-pkg/ink`.
- Do not write versioned paths such as `api.openapi.account.v1.getProfile()`; use the runtime namespaces and methods shown in the operation map.
- Do not assume `api` is a global variable.
- For an operation with a `requestBody`, put every request-body field inside the required `body` wrapper: `api.method({ body: requestBody })`. Do not flatten those fields into the outer method arguments.
- For an operation without a `requestBody`, call the method without `body` or an empty placeholder object, unless its operation-specific reference documents another parameter.
- Treat credentials and personal information as sensitive. Null-check optional or restricted fields, minimize exposure, and never log secrets.
- Do not invent undocumented namespaces, methods, request fields, response fields, or authentication parameters.

## Recommended Error-Handling Template

This shared template shows how an AIUI page should handle two failure boundaries: the runtime module or OpenAPI client may be unavailable, and the specific operation may fail after initialization. In both cases, update loading and error state and stop the current flow cleanly. Replace the example operation, result state, and user-facing messages as needed; follow the corresponding file under `references/` for operation-specific result, empty-state, and event handling.

```ts
Page({
  data: {
    loading: true,
    error: ''
  },

  async onLoad() {
    await this.loadData();
  },

  async loadData() {
    let api = null;
    try {
      const { createOpenAPI } = await import('open');
      api = await createOpenAPI();
    } catch {
      this.setData({
        loading: false,
        error: 'OpenAPI 不可用'
      });
      return;
    }

    try {
      const result = await api.account.getProfile();
      this.setData({
        profile: result,
        loading: false,
        error: ''
      });
    } catch {
      this.setData({
        loading: false,
        error: '无法获取数据'
      });
    }
  }
});
```

## Do

- Use `import { createOpenAPI } from 'open'` or `await import('open')`.
- Call `await createOpenAPI()` inside page code.
- Use `try/catch` for OpenAPI unavailable cases, authentication failures, network errors, and runtime errors.
- Null-check fields before use, especially optional, restricted, or operation-specific response fields; see the corresponding reference for exact fields.
- Keep credentials and personal information confidential; do not log, persist, or expose them unnecessarily.

## Don't

- Do not use `@yodaos-pkg/ink`.
- Do not write versioned paths such as `api.openapi.account.v1.getProfile()`; use the runtime namespaces and methods shown in the operation map.
- Do not call `fetch('/openapi/...')` directly unless the user explicitly asks for low-level HTTP debugging.
- Do not manually read, concatenate, pass, or display `access_token` or other credentials.
- Do not invent undocumented OpenAPI namespaces, methods, request fields, response fields, or authentication parameters.

## How to use the references

1. Use the operation map to identify the relevant detail file.
2. Read that file before implementing the operation-specific request, response, field, event, or error handling.
3. When a shared rule and an operation-specific detail appear to conflict, preserve the shared safety rules and follow the operation reference for that operation's exact contract; report an apparent contract conflict rather than inventing a third behavior.

## Retrieval keywords

OpenAPI, Rokid OpenAPI, AIUI OpenAPI, Ink OpenAPI, createOpenAPI, import open, requestBody, body wrapper, getProfile, invokeAgentApi, checkUserAuth, saveThirdToken, getThirdToken, getAIUICacheMessage, third-party token, save third-party token, Lingzhu agent, SSE, text/event-stream, user information permission, one-time message consumption, 获取账号信息, 灵珠智能体, 用户信息权限检查, 保存第三方Token, 获取第三方Token, 获取缓存消息.
