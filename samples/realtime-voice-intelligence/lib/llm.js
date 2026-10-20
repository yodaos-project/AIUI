// LanguageModel wrapper following the capabilities/chat sample pattern:
// availability() precheck → create({ initialPrompts }) → promptStreaming()
// with a read() poll loop.

const STREAM_POLL_MS = 16;

export function getErrorMessage(error) {
  if (!error) return 'unknown error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.errMsg) return error.errMsg;
  return String(error);
}

// Locale-neutral failure: a stable `key` (mapped to localized text by the
// page via lib/i18n.js) plus an English message for logs.
function keyedError(key, message) {
  return Object.assign(new Error(message || key), { key });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createChat() {
  let session = null;
  let askQueue = Promise.resolve();

  // The system prompt is fixed for the session lifetime via initialPrompts;
  // subsequent asks accumulate context automatically.
  async function start(systemPrompt) {
    if (session) return session;
    const availability = await LanguageModel.availability();
    if (availability !== 'available') throw keyedError('llmUnavailable', 'LanguageModel not available');
    session = await LanguageModel.create({
      initialPrompts: [{ role: 'system', content: systemPrompt }],
    });
    return session;
  }

  // Drain a streaming response; onDelta receives the accumulated text so far.
  async function readAllText(stream, onDelta) {
    const chunks = [];
    while (true) {
      const { done, value } = await stream.read();
      if (done) break;
      if (typeof value === 'string' && value.length > 0) {
        chunks.push(value);
        if (onDelta) onDelta(chunks.join(''));
      } else {
        await sleep(STREAM_POLL_MS);
      }
    }
    return chunks.join('');
  }

  // There is no streaming-cancel API, so asks are serialized: each turn waits
  // for the previous stream to finish before starting.
  function ask(text, { onDelta } = {}) {
    const run = async () => {
      if (!session) throw keyedError('llmNotStarted', 'chat session not created; call start() first');
      const stream = session.promptStreaming(text);
      return readAllText(stream, onDelta);
    };
    const result = askQueue.then(run, run);
    askQueue = result.catch(() => {});
    return result;
  }

  function destroy() {
    if (session) {
      try { session.destroy(); } catch (_) {}
      session = null;
    }
    askQueue = Promise.resolve();
  }

  return { start, ask, destroy };
}
