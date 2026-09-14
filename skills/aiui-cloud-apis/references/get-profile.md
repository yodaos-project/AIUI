### `api.account.getProfile()` Get Basic Account Profile

Purpose: get the current logged-in account's basic profile for displaying the user name, avatar, account ID, bound mobile phone number, or lightweight personalization.

Call:

```ts
const api = await createOpenAPI();
const profile = await api.account.getProfile();
```

Response type:

```ts
type AccountGetProfileV1DTO = {
  accountId: string;
  headIcon: string;
  userName: string;
  mobile: string | null;
  notification: string;
};
```

Field notes:

- `accountId`: stable account ID.
- `headIcon`: avatar URL. It may be `null`; always check before rendering.
- `userName`: display name. Do not use it as a stable unique identifier.
- `mobile`: bound mobile phone number. It may be `null` or unavailable when the account has no bound phone, `api.auth.checkUserAuth()` returns `data.checkResult === false`, or the permission check throws an error. Always null-check it before use.
- `api.auth.checkUserAuth()` is informational only. A failed or unavailable check must not block `getProfile()` or other subsequent API calls; continue with the partial response and defensively check restricted fields such as `mobile` and `code` before use.
- Mask `mobile` when displayed unless the full number is required. Treat it as sensitive personal information; do not log, persist, or expose it unnecessarily.
- `notification`: warning or informational message returned with the profile. When it is non-empty, display its exact content and visibly notify the user; do not silently ignore it. When it is empty, no notification UI is needed. Check `profile.notification` after every successful profile request:

```ts
if (profile.notification) {
  showNotification(profile.notification);
}
```

- Do not invent undocumented fields such as `nickname`, `avatar`, `phone`, `email`, or `gender`.
