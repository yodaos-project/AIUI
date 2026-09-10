# Rokid Account Information Authorization

An AIUI agent can read the basic information of the current Rokid account and pass the user identity to your server through a one-time verification code. Before the code is called, the developer must declare the permission and the user must grant authorization; otherwise restricted fields such as the mobile number and the account code may be empty or unavailable.

> **Regional availability**: This capability is currently open only on the China platform (AIUI Studio China and Rokid AI App China). It is not yet available on the Overseas platform, where the "Rokid Account Information" permission cannot be declared and users cannot complete third-party service authorization, so restricted fields such as `mobile` and `code` are not obtainable. The server-side verification described in this document therefore does not apply on the Overseas platform.

## 1. Authorization and Call Flow

```latex
Developer selects the "Rokid Account Information" permission in AIUI Studio
                     ↓
Developer fills in the usage purpose, user agreement, and privacy policy, then saves
                     ↓
User completes authorization in "Third-Party Service Authorization" in the Rokid AI App
                     ↓
Agent calls checkUserAuth() to check the authorization status
                     ↓
Agent calls getProfile() to get basic account information and the one-time code
                     ↓
Developer server calls checkAccountCode to verify the account and agent ownership
```

![image.png](../../image/account-auth/1.png)

> **Every link in the authorization chain is required**
> + The developer must select the "Rokid Account Information" permission in AIUI Studio and save the information.
> + The user must complete third-party service authorization in the Rokid AI App.

| Role | Action | Result |
| --- | --- | --- |
| Developer | Declares the "Rokid Account Information" permission in AIUI Studio | The platform knows why the agent needs account information |
| User | Completes third-party service authorization in the Rokid AI App | Allows this developer's agents to read restricted account fields |
| Agent | Checks the authorization status and gets account information | Gets usable account fields and authorization prompts |
| Developer server | Verifies `accountId` and `code` as needed | Confirms the user identity and agent ownership |

The whole chain exists only on the China platform. On the Overseas platform the permission entry and the authorization entry are not yet available, so the chain cannot be completed.

## 2. Declare the Permission Dependency

1. Open the agent that needs to read account information in AIUI Studio.
2. Open "Build and Submit" on the right and select "Permission Dependencies".
3. Select "Rokid Account Information" and describe the specific usage purpose.
4. Provide the user agreement and privacy policy, then save.
5. Build and deploy a new version of the agent so that the new permission configuration takes effect.

![image.png](../../image/account-auth/2.png)

The declared purpose must match the code behavior. Apply only for the information your business actually needs. If the permission is not selected, the information is not saved, or the privacy materials are incomplete, the user authorization chain may fail to be established.

> The "Rokid Account Information" permission is currently offered only by AIUI Studio on the China platform. It is not yet available on AIUI Studio for the Overseas platform.

## 3. User Completes Third-Party Service Authorization

1. The user signs in to the Rokid AI App with the same Rokid account used on the glasses.
2. On the "Home" page, tap "Third-Party Service Authorization" in the recommended settings area.
3. On the authorization page, find the developer or service, select the permissions to grant, read the authorization description, and confirm.
4. Return to the agent and trigger the feature that needs account information again.

![image.png](../../image/account-auth/3.png)

If the user has not authorized, has revoked authorization, or the authorization relationship is no longer valid, the agent may still receive some non-sensitive information, but restricted fields such as `mobile` and `code` may be empty. In that case, follow `notification` to guide the user through authorization (when `notification` is not empty).

> The "Third-Party Service Authorization" entry is currently available only in the Rokid AI App on the China platform.

## 4. Agent Checks Authorization and Retrieves Account Information

### 4.1 Check the User Authorization Status

Call `checkUserAuth()` to check whether the current user has completed authorization. Use the result for logs, page prompts, and troubleshooting; do not use it as a hard gate for later calls. Even when the check fails, you can still call `getProfile()` to obtain the currently available non-sensitive fields.

```typescript
import { createOpenAPI } from 'open';

const api = await createOpenAPI();
const authResult = await api.auth.checkUserAuth();

if (!authResult?.data?.checkResult) {
  console.warn(authResult?.data?.msg || 'The user has not completed account authorization');
}
```

Example response when the user has not authorized:

```json
{
  "code": 1,
  "msg": "success",
  "timestamp": 1762760038068,
  "uuid": "trace-id",
  "data": {
    "checkResult": false,
    "msg": "用户未与开发者签约"
  }
}
```

### 4.2 Retrieve Basic Account Information

Get the basic information of the currently signed-in account and generate an account code that is valid for 5 minutes.

#### Request

Call it in the AIUI agent code:

```typescript
import { createOpenAPI } from 'open';

const api = await createOpenAPI();
const profile = await api.account.getProfile();
```

#### Response Parameters

This API returns the account information object directly.

| Parameter | Type | Description |
| --- | --- | --- |
| `accountId` | `string` | Account ID of the current user |
| `headIcon` | `string` | Avatar URL; may be empty when no avatar is set |
| `userName` | `string` | User nickname |
| `mobile` | `string` | Mobile phone number; may be empty when the user has not authorized or has not bound a number |
| `code` | `string` | One-time account code, valid for 5 minutes; may be empty when the user has not authorized |
| `notification` | `string` | Authorization prompt to show to the user; may be empty when no prompt is needed |

#### Successful Response Example

```json
{
  "accountId": "123456789",
  "headIcon": "https://example.com/avatar.png",
  "userName": "张三",
  "mobile": "138****8888",
  "code": "6d9b691ec18a4690bd43cf53df4d49d2",
  "notification": null
}
```

#### Unauthorized Prompt Example

When the agent asks the user for authorization but the user has not completed it, `notification` returns a prompt message:

```json
{
  "accountId": "123456789",
  "headIcon": "https://example.com/avatar.png",
  "userName": "张三",
  "mobile": null,
  "code": null,
  "notification": "若需要使用当前功能，请前往Rokid AI APP-主页-三方服务授权进行账号授权"
}
```

When `notification` is not empty, show or repeat the prompt to the user. Do not keep assuming that restricted fields exist.

#### Notes

1. Every request generates a new account code.
2. An account code is valid for 5 minutes.
3. The code is bound to the current account and the corresponding agent.
4. If your server needs to confirm the user identity, submit the returned `accountId` and `code` to the account verification API.

## 5. Verify the Account Code on Your Server

When your server needs to establish a trusted account session, call this API to check whether the account code is valid and whether the agent that generated the code belongs to the specified developer. You can skip this step when the agent only displays basic account information in its interface.

> `developerSk` is a developer credential. Keep it on the server only. Never write it into AIUI agent code, client packages, or front-end logs.
>
> Get the SK from Rokid Account Center - Credentials.

![image.png](../../image/account-auth/4.png)

### Request Information

+ **Endpoint**: `https://rcs.rokid.com/metis/openApi/v1/checkAccountCode`
+ **Method**: `POST`
+ **Content-Type**: `application/json`

> If you access the Metis service directly without going through the gateway, the path is `/openApi/v1/checkAccountCode`.

### Request Headers

No business headers are required besides `Content-Type: application/json`.

### Request Body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `accountId` | String | Yes | Account ID returned by the profile API |
| `code` | String | Yes | Account code returned by the profile API |
| `developerSk` | String | Yes | Developer SK used to verify the developer that owns the agent; obtained from Credentials in the developer account center |

### Request Example

```bash
curl --location --request POST 'https://rcs.rokid.com/metis/openApi/v1/checkAccountCode' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "accountId": "123456789",
    "code": "6d9b691ec18a4690bd43cf53df4d49d2",
    "developerSk": "developer-sk"
  }'
```

### Response Parameters

#### Common Response Structure

| Parameter | Type | Description |
| --- | --- | --- |
| `code` | Integer | Business status code. `1` means the call succeeded |
| `msg` | String | Response message |
| `timestamp` | Long | Response timestamp in milliseconds |
| `uuid` | String | Request trace ID |
| `data` | Object | Verification result |

#### `data` Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `checkResult` | Boolean | `true` means the verification passed, `false` means it failed |
| `mobile` | String | Mobile phone number returned after the verification passes |

### Successful Verification Response

```json
{
  "code": 1,
  "msg": "success",
  "timestamp": 1787760000000,
  "uuid": "trace-id",
  "data": {
    "checkResult": true,
    "mobile":"13888888888"
  }
}
```

### Failed Verification Response

```json
{
  "code": 1,
  "msg": "success",
  "timestamp": 1787760000000,
  "uuid": "trace-id",
  "data": {
    "checkResult": false
  }
}
```

### Failure Conditions

`checkResult = false` is returned when any of the following is true:

1. `accountId`, `code`, or `developerSk` is empty.
2. The account code does not exist or has expired beyond the 5-minute lifetime.
3. The agent that generated the code does not exist or has been deleted.
4. `developerSk` is invalid.
5. The developer of `developerSk` is not the creator of the agent.
6. An exception occurs while the account center verifies the developer SK.

### Notes

1. An account code is deleted immediately after it is verified successfully and cannot be reused.
2. When verification fails, the code is not deleted; you can submit the correct `developerSk` again before it expires.
3. `checkResult = false` is a business verification failure. The common `code` in the response is still `1`.
4. Complete the verification within 5 minutes after receiving the `getProfile()` result.

## 6. Troubleshooting

| Symptom | Possible cause | What to do |
| --- | --- | --- |
| `checkUserAuth()` returns `false` | The permission is not declared in AIUI Studio, or the user has not authorized | Check whether the "Rokid Account Information" permission has been saved, then guide the user to authorize in the Rokid AI App |
| `notification` returns an authorization prompt | The user authorization is incomplete, revoked, or no longer valid | Show the prompt to the user and call the API again after authorization completes |
| `mobile` or `code` is empty | The user has not authorized, has not bound a phone number, or the permission configuration has not taken effect | Null-check the fields, then check the developer configuration and the user authorization one by one |
| "User ticket expired" is returned | The Rokid account sign-in state has expired | Ask the user to sign in to the Rokid AI App again or re-enter the agent |
| `checkResult = false` | The code has expired, `developerSk` is wrong, or the agent ownership does not match | Get a new code and check the developer SK used on the server |
| The code cannot be reused | The code was verified successfully and deleted | Call `getProfile()` again to get a new code |
| Account authorization cannot be completed on the Overseas platform, or `mobile` and `code` are always empty there | The capability is not yet open on the Overseas platform | Use the China platform. Do not assume that this flow works on the Overseas platform |

## 7. Data and Credential Security

+ Request and process only the account information your business needs, and describe the purpose accurately in the user agreement and privacy policy.
+ Store `developerSk` only in server-side environment variables or a secret management service.
+ An account code is valid for 5 minutes and becomes invalid immediately after a successful verification. Do not cache or reuse it.
+ Do not log full phone numbers, account codes, developer SKs, or other sensitive information.
+ Always null-check `mobile`, `code`, and `notification` so that an unauthorized state is not mistaken for an API failure.
