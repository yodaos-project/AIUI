/**
 * DeepSeek tool-calling driver. Each infer run sees one task description, a
 * prepared workspace, and the selected aiui-dev skill. The trace records
 * model/tool traffic without saving or exposing the API key.
 * @module infer
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { executeTool, toolDefinitions } from './agent-tools.js';
import { grade } from './grader.js';
import { estimateRequestCost, PRICING_AS_OF, PRICING_SOURCE } from './pricing.js';

const API_URL = 'https://api.deepseek.com/chat/completions';
/** Normalize Error and non-Error throws before putting them in a result. */
const errorText = error => String(error?.message ?? error);

/**
 * Hash sorted skill-relative paths and contents, excluding symlinks. This
 * identifies the exact skill revision supplied to an infer run.
 * @returns {Promise<string>} SHA-256 fingerprint prefixed with sha256:.
 */
async function skillFingerprint(skill) {
  const hash = createHash('sha256');

  async function visit(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await visit(path.join(directory, entry.name), relative);
      } else if (entry.isFile()) {
        hash.update(relative);
        hash.update('\0');
        hash.update(await readFile(path.join(directory, entry.name)));
      }
    }
  }

  await visit(skill);
  return `sha256:${hash.digest('hex')}`;
}

/**
 * Make one non-streaming Chat Completions request with the workspace tools.
 * @param {{apiKey: string, model: string, messages: object[], fetchImpl?: typeof fetch}} options
 * @returns {Promise<{message: object, finishReason: string, usage: object | null, requestedAt: Date}>}
 * @throws {Error} On HTTP failure or an unsupported response shape.
 */
export async function deepseekCompletion({ apiKey, model, messages, fetchImpl = fetch }) {
  const requestedAt = new Date();
  const response = await fetchImpl(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      thinking: { type: 'disabled' },
      max_tokens: 4096,
      stream: false,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`DeepSeek API returned HTTP ${response.status}`);

  const body = await response.json();
  const choice = body.choices?.[0];
  if (!choice?.message || !['stop', 'tool_calls'].includes(choice.finish_reason)) {
    throw new Error(`DeepSeek returned unsupported finish reason: ${choice?.finish_reason ?? 'missing'}`);
  }
  return { message: choice.message, finishReason: choice.finish_reason, usage: body.usage || null, requestedAt };
}

/** Convert a tool exception into a response the model can inspect and repair. */
async function executeToolCall(call, context) {
  try {
    const args = JSON.parse(call.function?.arguments || '{}');
    return { ok: true, value: await executeTool(call.function?.name, args, context) };
  } catch (error) {
    return { ok: false, error: errorText(error) };
  }
}

/**
 * Run one task for at most maxSteps assistant turns, then grade the resulting
 * workspace and fingerprint its skill. Provider, grader, and fingerprint
 * failures become status:error records; reaching the limit yields max_steps.
 * Grading may be null only when grading itself fails. The API key is used only
 * in request headers and never copied into trace/result fields.
 *
 * @param {{id: string, description: string}} task Loaded task.
 * @param {string} workspace Prepared project root.
 * @param {{apiKey: string, model?: string, skill: string, maxSteps?: number, fetchImpl?: typeof fetch}} options
 * @returns {Promise<object>} Trace, token usage, status, grading, and metadata.
 */
export async function infer(task, workspace, { apiKey, model = 'deepseek-flash', skill, maxSteps = 30, fetchImpl = fetch }) {
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is required for infer');
  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 100) {
    throw new Error('maxSteps must be between 1 and 100');
  }

  const startedAt = new Date().toISOString();
  const skillRoot = await realpath(skill);
  const workspaceRoot = await realpath(workspace);
  const skillText = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const messages = [
    { role: 'system', content: 'You are an AIUI coding agent. Work only through the provided workspace and skill tools. Read relevant skill references before coding. Never assume browser or Mini Program APIs are available. You cannot see benchmark grading rules. Finish with a concise summary after editing project files.' },
    { role: 'user', content: `Task: ${task.description}\n\nAIUI skill entrypoint:\n${skillText}\n\nUse list_skill/read_skill for linked references. Use list_workspace/read_workspace/write_workspace for project files.` },
  ];
  const trace = [];
  const usage = { promptTokens: 0, completionTokens: 0, promptCacheHitTokens: 0, promptCacheMissTokens: 0 };
  const cost = {
    currency: 'USD',
    estimatedUsd: 0,
    knownUsd: 0,
    complete: true,
    pricedRequests: 0,
    unpricedRequests: 0,
    pricingSource: PRICING_SOURCE,
    pricingAsOf: PRICING_AS_OF,
  };
  let status = 'max_steps';
  let finalMessage = '';
  let errorMessage;

  for (let step = 1; step <= maxSteps; step++) {
    let completion;
    try {
      completion = await deepseekCompletion({ apiKey, model, messages, fetchImpl });
    } catch (error) {
      status = 'error';
      errorMessage = errorText(error);
      cost.complete = false;
      cost.unpricedRequests++;
      break;
    }

    usage.promptTokens += completion.usage?.prompt_tokens || 0;
    usage.completionTokens += completion.usage?.completion_tokens || 0;
    const cacheHit = completion.usage?.prompt_cache_hit_tokens
      ?? completion.usage?.prompt_tokens_details?.cached_tokens;
    const cacheMiss = completion.usage?.prompt_cache_miss_tokens
      ?? (Number.isInteger(cacheHit) ? completion.usage.prompt_tokens - cacheHit : undefined);
    usage.promptCacheHitTokens += cacheHit ?? 0;
    usage.promptCacheMissTokens += cacheMiss ?? 0;
    const requestCost = estimateRequestCost({ model, usage: completion.usage, at: completion.requestedAt });
    if (requestCost) {
      cost.knownUsd += requestCost.estimatedUsd;
      cost.pricedRequests++;
    } else {
      cost.complete = false;
      cost.unpricedRequests++;
    }
    const assistant = completion.message;
    const calls = assistant.tool_calls || [];

    trace.push({
      step,
      assistant: assistant.content || '',
      toolCalls: calls.map(call => ({
        id: call.id,
        name: call.function?.name,
        arguments: call.function?.arguments,
      })),
      usage: completion.usage,
      cost: requestCost,
    });
    messages.push({
      role: 'assistant',
      content: assistant.content || '',
      ...(calls.length ? { tool_calls: calls } : {}),
    });

    if (!calls.length) {
      if (completion.finishReason !== 'stop') {
        status = 'error';
        errorMessage = 'DeepSeek stopped without a final answer';
        break;
      }
      status = 'completed';
      finalMessage = assistant.content || '';
      break;
    }

    for (const call of calls) {
      const result = await executeToolCall(call, { workspace: workspaceRoot, skill: skillRoot });
      trace.push({ step, tool: call.function?.name, arguments: call.function?.arguments, result });
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  if (!cost.complete) cost.estimatedUsd = null;
  else cost.estimatedUsd = cost.knownUsd;

  let grading = null;
  let fingerprint = null;
  try {
    grading = await grade(task, workspaceRoot);
  } catch (error) {
    status = 'error';
    errorMessage = [errorMessage, `grading failed: ${errorText(error)}`].filter(Boolean).join('; ');
  }
  try {
    fingerprint = await skillFingerprint(skillRoot);
  } catch (error) {
    status = 'error';
    errorMessage = [errorMessage, `skill fingerprint failed: ${errorText(error)}`].filter(Boolean).join('; ');
  }

  return {
    schemaVersion: 1,
    task: task.id,
    provider: 'deepseek',
    model,
    workspace: workspaceRoot,
    startedAt,
    finishedAt: new Date().toISOString(),
    skillFingerprint: fingerprint,
    status,
    ...(errorMessage ? { error: errorMessage } : {}),
    steps: messages.filter(message => message.role === 'assistant').length,
    usage,
    cost,
    finalMessage,
    grading,
    trace,
  };
}
