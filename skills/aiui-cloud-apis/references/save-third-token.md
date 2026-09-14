### `api.agent.saveThirdToken({ body })` Save a Third-Party Token

Purpose: save the third-party platform token information for the current logged-in user, including the access token, refresh token, and custom metadata.

This operation defines a `requestBody`, so the call must use the `{ body: requestBody }` wrapper; omitting `body` causes the runtime error `is missing required request body`.

Call:

```ts
const api = await createOpenAPI();
const response = await api.agent.saveThirdToken({
  body: {
    company: 'third-party-company',
    token: 'access-token-value',
    refreshToken: 'refresh-token-value',
    meta: '{"scope":"user_info","expiresIn":7200}'
  }
});
```

Request type:

```ts
type SaveThirdTokenV1Request = {
  company: string;       // required, third-party company identifier used to match the third-party authorization configuration
  token: string;         // required, third-party access token
  refreshToken?: string; // optional, third-party refresh token
  meta?: string;         // optional, custom string; may contain JSON text but stays a string field
  expireInMs?: number;   // optional, token cache TTL in milliseconds
};
```

Response type:

```ts
type SaveThirdTokenV1Response = {
  code: number;
  msg: string;
  timestamp: number;
  uuid: string;
  data: null; // always null; judge success by code === 1, not by data
};
```

Usage notes:

- This operation has a `requestBody`. Put `company`, `token`, `refreshToken`, and `meta` inside `body`.
- Do not pass `accountId`; the API derives it from the current logged-in user automatically.
- Tokens are cached per current logged-in user account and `company`. The cache TTL defaults to 30 days, and repeated saves refresh the TTL.
- `token`, `refreshToken`, and `meta` are combined into one JSON value in the cache.
- `refreshToken` and `meta` are optional; they may be omitted or passed as empty values.
- `meta` may carry JSON text, but the field type stays a string.
- `expireInMs`, when provided, sets the token cache TTL in milliseconds; when omitted, the default is `2592000000` milliseconds (30 days).
- Judge success by `code === 1`, not by `data`; the endpoint returns `data === null` on success.
- When `company` or `token` is empty, validation fails with `code === 8003` and `msg` `参数不可为空`; fix the input, do not treat it as a transport failure.
- Treat `token` and `refreshToken` as sensitive credentials: do not log, display, persist, cache, or return them to the user.
