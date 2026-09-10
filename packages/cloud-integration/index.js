/** Default endpoint used by {@link CloudIntegration.sendNotification}. */
const DEFAULT_ENDPOINT = 'https://rcs.rokid.com/metis/callback/message'

/** Path used by {@link CloudIntegration.getToken} relative to `aiuiEndpoint`. */
const GET_TOKEN_PATH = '/account/v1/token'

/** Path used by {@link CloudIntegration.saveTemporaryMessage} relative to `aiuiEndpoint`. */
const CACHE_MESSAGE_PATH = '/metis/openApi/v1/cacheAIUIMessage'

/**
 * A JSON object accepted by a notification destination page.
 *
 * @typedef {object} NotificationToolParameters
 * @property {'object'} type Must always be `"object"`.
 * @property {Record<string, unknown>} properties Values passed unchanged to the destination page.
 */

/**
 * Describes the AIUI page opened when a user selects a notification.
 *
 * @typedef {object} NotificationTool
 * @property {string} name Route registered in the agent's `app.json`.
 * @property {NotificationToolParameters} parameters Page input definition.
 */

/**
 * Notification content sent to a Rokid Glasses user.
 *
 * @typedef {object} NotificationMessage
 * @property {string} agentId ID of the AIUI agent sending the notification.
 * @property {string} content Text displayed in the notification.
 * @property {NotificationTool} [tool] Optional page to open when the notification is selected.
 */

/**
 * Common envelope returned by AIUI cloud services.
 *
 * @typedef {object} CommonResponse
 * @property {number} code Business status code. A value of `1` indicates success.
 * @property {string} msg Human-readable service message.
 * @property {number} timestamp Response time as a Unix timestamp in milliseconds.
 * @property {string} uuid Request identifier for redacted diagnostics.
 * @property {Record<string, unknown>} data Operation-specific response data.
 */

/**
 * Error raised for transport, HTTP, response parsing, or cloud business failures.
 *
 * The originating {@link Response} and parsed payload are retained when
 * available so callers can inspect status information and request UUIDs.
 * Credentials are never included in the generated error message.
 */
export class CloudIntegrationError extends Error {
  /**
   * @param {string} message Safe, credential-free error description.
   * @param {object} [details] Additional diagnostic context.
   * @param {unknown} [details.cause] Original error raised by the transport or parser.
   * @param {Response} [details.response] HTTP response, when one was received.
   * @param {unknown} [details.payload] Parsed response body, when available.
   */
  constructor(message, { cause, response, payload } = {}) {
    super(message, cause === undefined ? undefined : { cause })
    this.name = 'CloudIntegrationError'
    this.response = response
    this.payload = payload
  }
}

/** Error raised before a request when a required option or field is invalid. */
export class CloudIntegrationValidationError extends CloudIntegrationError {
  /** @param {string} message Description of the invalid input. */
  constructor(message) {
    super(message)
    this.name = 'CloudIntegrationValidationError'
  }
}

/**
 * Server-side client for AIUI account services and Rokid Glasses notifications.
 *
 * Account services use `accessToken` in the `access_token` header. Notification
 * delivery uses the separate Rokid account SK supplied as `token`. Configure
 * only the credentials required by the methods the application calls, and keep
 * both credentials in server-side environment variables or a secret manager.
 */
export class CloudIntegration {
  /**
   * @param {object} options Client configuration.
   * @param {string} [options.token] Rokid account SK used by {@link sendNotification}.
   * @param {string} [options.accessToken] Account credential used by {@link getToken} and {@link saveTemporaryMessage}.
   * @param {string} [options.endpoint=DEFAULT_ENDPOINT] Complete notification endpoint URL.
   * @param {string} [options.aiuiEndpoint] AIUI service origin for account and cache requests.
   * @param {typeof globalThis.fetch} [options.fetch=globalThis.fetch] Fetch implementation, primarily for tests or custom runtimes.
   * @throws {CloudIntegrationValidationError} If neither credential is supplied or an option has an invalid type.
   */
  constructor({ token, accessToken, endpoint = DEFAULT_ENDPOINT, aiuiEndpoint, fetch = globalThis.fetch } = {}) {
    validateOptionalString(token, 'token')
    validateOptionalString(accessToken, 'accessToken')
    if (token === undefined && accessToken === undefined) {
      throw new CloudIntegrationValidationError('token or accessToken is required')
    }
    if (typeof endpoint !== 'string' || endpoint.length === 0) {
      throw new CloudIntegrationValidationError('endpoint must be a non-empty string')
    }
    validateOptionalString(aiuiEndpoint, 'aiuiEndpoint')
    if (typeof fetch !== 'function') {
      throw new CloudIntegrationValidationError('fetch must be available')
    }

    this.token = token
    this.accessToken = accessToken
    this.endpoint = endpoint
    this.aiuiEndpoint = aiuiEndpoint
    this.fetch = fetch
  }

  /**
   * Gets account information or an account token for the authenticated account.
   *
   * This endpoint is available only to system agents. Its response
   * is an opaque JSON string; callers must not assume an undocumented internal
   * object structure.
   *
   * @returns {Promise<string>} Parsed string returned by the account service.
   * @throws {CloudIntegrationValidationError} If `accessToken` or `aiuiEndpoint` is not configured.
   * @throws {CloudIntegrationError} If transport, HTTP, JSON parsing, or response type validation fails.
   */
  async getToken() {
    const response = await this.#requestAIUI(GET_TOKEN_PATH)

    let payload
    try {
      payload = await response.json()
    } catch (error) {
      throw new CloudIntegrationError('token response was not valid JSON', {
        cause: error,
        response,
      })
    }
    if (typeof payload !== 'string') {
      throw new CloudIntegrationError('token response was not a string', {
        response,
        payload,
      })
    }
    return payload
  }

  /**
   * Caches one message for the authenticated account and an AIUI agent.
   *
   * The cached value expires after 10 minutes. A later write for the same
   * account and agent replaces the previous value. `getAIUICacheMessage`
   * atomically consumes and deletes the value, so this cache is not a queue and
   * does not support repeated reads.
   *
   * @param {string} targetAgentId AIUI agent ID used as part of the cache key.
   * @param {string} path Target AIUI page path.
   * @param {object} data Temporary message data.
   * @param {string} data.customData Application-defined message data.
   * @param {string} data.content Message content.
   * @returns {Promise<CommonResponse>} Complete service response when `code === 1`.
   * @throws {CloudIntegrationValidationError} If a request field, `accessToken`, or `aiuiEndpoint` is missing or invalid.
   * @throws {CloudIntegrationError} If transport, HTTP, JSON parsing, or business validation fails.
   */
  async saveTemporaryMessage(targetAgentId, path, { customData, content } = {}) {
    validateString(targetAgentId, 'targetAgentId')
    validateString(path, 'path')
    validateString(customData, 'customData')
    validateString(content, 'content')

    const response = await this.#requestAIUI(CACHE_MESSAGE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: targetAgentId, path, customData, content }),
    })

    let payload
    try {
      payload = await response.json()
    } catch (error) {
      throw new CloudIntegrationError('cache message response was not valid JSON', {
        cause: error,
        response,
      })
    }
    if (payload?.code !== 1) {
      throw new CloudIntegrationError(`cache message request failed: ${payload?.msg ?? 'unknown error'}`, {
        response,
        payload,
      })
    }
    return payload
  }

  /**
   * Sends one agent notification to one Rokid Glasses account.
   *
   * The promise resolves only when the HTTP request succeeds and the service
   * reports both `code === 1` and `data.success === true`.
   *
   * @param {object} options Notification request.
   * @param {string} options.messageId Caller-generated unique ID used for tracing and idempotent retries.
   * @param {string} options.accountId Target Rokid account ID.
   * @param {NotificationMessage} options.message Notification content and optional page navigation.
   * @returns {Promise<CommonResponse & {data: Record<string, unknown> & {success: true}}>} Complete service response.
   * @throws {CloudIntegrationValidationError} If `token` or a required request field is missing or invalid.
   * @throws {CloudIntegrationError} If transport, HTTP, JSON parsing, or business validation fails.
   */
  async sendNotification({ messageId, accountId, message } = {}) {
    validateString(this.token, 'token')
    validateString(messageId, 'messageId')
    validateString(accountId, 'accountId')
    validateMessage(message)

    const body = {
      message_id: messageId,
      account_id: accountId,
      message: {
        agent_id: message.agentId,
        content: message.content,
      },
    }

    if (message.tool !== undefined) {
      validateTool(message.tool)
      body.message.tool = {
        name: message.tool.name,
        parameters: {
          type: message.tool.parameters.type,
          properties: message.tool.parameters.properties,
        },
      }
    }

    let response
    try {
      response = await this.fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(body),
      })
    } catch (error) {
      throw new CloudIntegrationError('notification request failed', { cause: error })
    }

    let payload
    try {
      payload = await response.json()
    } catch (error) {
      throw new CloudIntegrationError('notification response was not valid JSON', {
        cause: error,
        response,
      })
    }

    if (!response.ok) {
      throw new CloudIntegrationError(`notification request returned HTTP ${response.status}`, {
        response,
        payload,
      })
    }
    if (payload?.code !== 1) {
      throw new CloudIntegrationError(`notification request failed: ${payload?.msg ?? 'unknown error'}`, {
        response,
        payload,
      })
    }
    if (payload?.data?.success !== true) {
      throw new CloudIntegrationError('notification was not delivered successfully', {
        response,
        payload,
      })
    }

    return payload
  }

  /**
   * Sends an authenticated request to an AIUI service path.
   *
   * @param {string} path Absolute path relative to the configured AIUI origin.
   * @param {RequestInit} [options] Additional fetch options.
   * @returns {Promise<Response>} Successful HTTP response for operation-specific parsing.
   * @throws {CloudIntegrationValidationError} If account-service configuration is incomplete.
   * @throws {CloudIntegrationError} If the request cannot be sent or returns a non-success HTTP status.
   * @private
   */
  async #requestAIUI(path, options = {}) {
    validateString(this.accessToken, 'accessToken')
    validateString(this.aiuiEndpoint, 'aiuiEndpoint')

    let response
    try {
      response = await this.fetch(`${this.aiuiEndpoint.replace(/\/$/, '')}${path}`, {
        ...options,
        headers: {
          ...options.headers,
          access_token: this.accessToken,
        },
      })
    } catch (error) {
      throw new CloudIntegrationError('AIUI cloud request failed', { cause: error })
    }
    if (!response.ok) {
      throw new CloudIntegrationError(`AIUI cloud request returned HTTP ${response.status}`, {
        response,
      })
    }
    return response
  }
}

/**
 * Validates a required string field.
 *
 * @param {unknown} value Value to validate.
 * @param {string} name Field name used in the error message.
 * @throws {CloudIntegrationValidationError} If the value is not a non-empty string.
 */
function validateString(value, name) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new CloudIntegrationValidationError(`${name} is required`)
  }
}

/**
 * Validates an optional string configuration value when present.
 *
 * @param {unknown} value Value to validate.
 * @param {string} name Option name used in the error message.
 * @throws {CloudIntegrationValidationError} If the supplied value is not a non-empty string.
 */
function validateOptionalString(value, name) {
  if (value !== undefined && (typeof value !== 'string' || value.length === 0)) {
    throw new CloudIntegrationValidationError(`${name} must be a non-empty string`)
  }
}

/**
 * @param {unknown} message Notification message to validate.
 * @throws {CloudIntegrationValidationError} If required message fields are invalid.
 */
function validateMessage(message) {
  if (!message || typeof message !== 'object') {
    throw new CloudIntegrationValidationError('message is required')
  }
  validateString(message.agentId, 'message.agentId')
  validateString(message.content, 'message.content')
}

/**
 * @param {unknown} tool Notification page-navigation definition to validate.
 * @throws {CloudIntegrationValidationError} If the route or parameter schema is invalid.
 */
function validateTool(tool) {
  if (!tool || typeof tool !== 'object') {
    throw new CloudIntegrationValidationError('message.tool must be an object')
  }
  validateString(tool.name, 'message.tool.name')
  if (!tool.parameters || typeof tool.parameters !== 'object') {
    throw new CloudIntegrationValidationError('message.tool.parameters is required')
  }
  if (tool.parameters.type !== 'object') {
    throw new CloudIntegrationValidationError('message.tool.parameters.type must be "object"')
  }
  if (!tool.parameters.properties || typeof tool.parameters.properties !== 'object' || Array.isArray(tool.parameters.properties)) {
    throw new CloudIntegrationValidationError('message.tool.parameters.properties must be an object')
  }
}

export { CACHE_MESSAGE_PATH, DEFAULT_ENDPOINT, GET_TOKEN_PATH }
