// Streaming ASR pipeline: getUserMedia (mic mode preserved) → Ink
// MediaRecorder (16 kHz mono, Ogg/Opus) → SpeechRecognitionSession.
//
// Both pages share this one pipeline in two modes:
// - Dictation (default): wearer mic, no segmentation. stop() stops the
//   recorder, drains the audio queue and closes the writer, which triggers
//   the final transcript.
// - Continuous ({ vad: true }): VAD segmentation negotiated from session
//   capabilities; the writer stays open and every finalized VAD segment
//   fires onsegment (one utterance = one turn).
//
// Failures are locale-neutral: onerror carries a stable `key` (mapped to
// localized text via lib/i18n.js) plus an English `message` for logcat.

// ASR language: this demo ships a zh-CN voice pipeline; the UI locale
// (lib/i18n.js) is independent of it.
const SPEECH_LANGUAGE = 'zh-CN';
const OPUS_MIME = 'audio/ogg;codecs=opus';
const TIMEOUT_MS = 15000;
// MediaRecorder timeslice: one Ogg/Opus blob per tick, silence included —
// that silence is what the server-side VAD segments on.
const FRAME_MS = 250;
// Backpressure cap: encoded audio buffered ahead of the writer. If the
// upload falls further behind than this, fail instead of stalling.
const MAX_PENDING_BYTES = 128000;
const PREFERRED_VAD_SILENCE_MS = 800;

// Stable error keys surfaced through onerror ({ key, message }):
// sessionUnsupported, recorderUnsupported, micUnsupported, formatUnsupported,
// opusHeader, vadUnsupported, uploadBackpressure, startTimeout, stopTimeout,
// resultTimeout, recognitionFailed — plus whatever error name the host
// session reports.
function recognizerError(key, detail) {
  return Object.assign(new Error(detail || key), { key });
}

const MICROPHONE_MODES = Object.freeze(['wearer', 'far-field', 'omnidirectional']);

// Audio constraint fallback chain: ask for the preferred capture mode first,
// then relax step by step when the host rejects the constraints
// (OverconstrainedError). Other failures (permission denied, no device) fail
// fast. Hosts are not required to support every mode.
function buildAudioConstraintChain(captureMode) {
  // Host playback capture: captureSource only — microphoneMode does not apply
  // and echoCancellation must not be combined with system-audio.
  if (captureMode === 'system-audio') {
    return [
      { captureSource: 'system-audio' },
      { captureSource: 'microphone' },
      true,
    ];
  }
  const microphoneMode = MICROPHONE_MODES.includes(captureMode) ? captureMode : 'wearer';
  return [
    { captureSource: 'microphone', microphoneMode, echoCancellation: false },
    { captureSource: 'microphone', microphoneMode },
    { captureSource: 'microphone' },
    true,
  ];
}

async function openAudioStream(captureMode) {
  const devices = typeof navigator === 'undefined' ? null : navigator.mediaDevices;
  if (!devices?.getUserMedia) throw recognizerError('recorderUnsupported');
  let lastError = null;
  for (const audio of buildAudioConstraintChain(captureMode)) {
    try {
      // 16 kHz mono on every constraint variant: what the Opus encoder
      // records and the ASR endpoint expects.
      return await devices.getUserMedia({
        audio: { ...(audio === true ? {} : audio), sampleRate: 16000, channelCount: 1 },
      });
    } catch (error) {
      lastError = error;
      if (!error || error.name !== 'OverconstrainedError') {
        throw recognizerError('micUnsupported', (error && (error.message || error.name)) || String(error));
      }
    }
  }
  throw recognizerError('micUnsupported', (lastError && (lastError.message || lastError.name)) || '');
}

// The first blob of an Ogg/Opus recording must be an 'OggS' page whose
// second packet starts with 'OpusHead' (page header: 27 fixed bytes, segment
// table length at byte 26). Checking it turns a mis-encoded stream into an
// immediate error instead of an ASR timeout.
function isOggOpusHeader(buffer) {
  const bytes = new Uint8Array(buffer);
  const packetOffset = 27 + bytes[26];
  const matches = (offset, text) => Array.from(text)
    .every((char, index) => bytes[offset + index] === char.charCodeAt(0));
  return matches(0, 'OggS') && matches(packetOffset, 'OpusHead');
}

// Negotiate the documented `segmentation` option from session capabilities:
// prefer VAD with ~800 ms silence clamped to the supported range, then plain
// 'vad' (host default threshold). VAD mode has no silent fallback.
function negotiateSegmentation(capabilities) {
  const modes = Array.isArray(capabilities && capabilities.segmentationModes)
    ? capabilities.segmentationModes
    : [];
  if (modes.includes('vad')) {
    const timing = capabilities && capabilities.vadSilenceDuration;
    if (timing && timing.supported && typeof timing.minMs === 'number' && typeof timing.maxMs === 'number') {
      return {
        mode: 'vad',
        silenceDurationMs: Math.min(timing.maxMs, Math.max(timing.minMs, PREFERRED_VAD_SILENCE_MS)),
      };
    }
    return 'vad';
  }
  throw recognizerError('vadUnsupported');
}

// Extract the segment that changed in this result event (resultIndex points
// at it), with its index for dedupe.
function readSegment(event) {
  const results = event && event.results;
  if (!results || typeof results.length !== 'number') return { index: -1, text: '', isFinal: false };
  const index = typeof event.resultIndex === 'number' ? event.resultIndex : results.length - 1;
  const result = results[index];
  const alternative = result && result[0];
  return {
    index,
    text: alternative && alternative.transcript ? alternative.transcript : '',
    isFinal: Boolean(result && result.isFinal),
  };
}

// Concatenate every transcript received so far (dictation mode accumulates
// across the whole session).
export function collectTranscript(event) {
  const results = event && event.results ? event.results : [];
  let transcript = '';
  for (let index = 0; index < results.length; index += 1) {
    const alternative = results[index] && results[index][0];
    if (alternative && alternative.transcript) transcript += alternative.transcript;
  }
  return transcript;
}

function releaseStream(stream) {
  for (const track of stream?.getTracks() || []) track.stop();
}

// Recognizer session lifecycle. Every async callback checks `live(run)` so a
// stale run (aborted then restarted) never leaks into the new session.
export function createRecognizer({ SpeechRecognitionSession, captureMode = 'wearer', vad = false } = {}) {
  let current = null;
  const api = { start, stop, abort };
  const live = (run) => current === run;

  // Tear a run down. With abortAudio the writer pipe is aborted so the
  // session ends without waiting for a final result.
  function dispose(run, abortAudio) {
    current = null;
    clearTimeout(run.timer);
    if (abortAudio && run.writer) {
      try { Promise.resolve(run.writer.abort()).catch(() => {}); } catch (_) {}
    }
    if (run.recorder && run.recorder.state !== 'inactive') {
      try { run.recorder.stop(); } catch (_) {}
    }
    releaseStream(run.stream);
  }

  // Single exit point: teardown, then the error (if any) and onend. The
  // writer is aborted unless a graceful close is already in flight.
  function finish(run, key, message = '') {
    if (!live(run)) return;
    dispose(run, Boolean(key) || !run.closing);
    if (key) {
      console.error('[rvi] recognizer error | key =', key, '| detail =', message);
      api.onerror?.({ key, message });
    }
    api.onend?.();
  }

  function fail(run, error) {
    finish(run, error?.key || 'recognitionFailed', error?.message || String(error));
  }

  // Serialize blob writes through a promise queue — the writer is a pipe,
  // not a queue, so out-of-order write() calls would interleave. The first
  // blob must carry the Ogg/Opus header; pendingBytes caps how far the
  // writer may lag behind the recorder.
  function enqueue(run, blob) {
    if (!live(run) || !blob?.size) return;
    run.pendingBytes += blob.size;
    if (run.pendingBytes > MAX_PENDING_BYTES) {
      finish(run, 'uploadBackpressure');
      return;
    }
    run.queue = run.queue.then(async () => {
      if (!live(run)) return;
      const buffer = await blob.arrayBuffer();
      if (!live(run)) return;
      if (!run.headerSent) {
        if (!isOggOpusHeader(buffer)) throw recognizerError('opusHeader');
        run.headerSent = true;
      }
      await run.writer.write(buffer);
      run.pendingBytes -= blob.size;
    });
    run.queue.catch((error) => fail(run, error));
  }

  async function start() {
    if (current) return;
    const run = { queue: Promise.resolve(), pendingBytes: 0, lastFinalIndex: -1 };
    current = run;
    run.timer = setTimeout(() => finish(run, 'startTimeout'), TIMEOUT_MS);
    try {
      // Gate on host support: the session must expose getCapabilities,
      // MediaRecorder must exist, and both the ASR endpoint and the recorder
      // must accept Ogg/Opus.
      if (typeof SpeechRecognitionSession?.getCapabilities !== 'function') {
        throw recognizerError('sessionUnsupported');
      }
      const Recorder = typeof MediaRecorder === 'undefined' ? null : MediaRecorder;
      if (!Recorder) throw recognizerError('recorderUnsupported');
      const capabilities = await SpeechRecognitionSession.getCapabilities();
      if (!live(run)) return;
      const formats = Array.isArray(capabilities?.audioFormats) ? capabilities.audioFormats : [];
      if (!formats.some((format) => String(format?.mimeType).toLowerCase().replace(/\s/g, '') === OPUS_MIME) ||
          (typeof Recorder.isTypeSupported === 'function' && !Recorder.isTypeSupported(OPUS_MIME))) {
        throw recognizerError('formatUnsupported');
      }
      const segmentation = vad ? negotiateSegmentation(capabilities) : undefined;

      // Open the mic with the requested capture mode; the native recorder
      // encodes it to Ogg/Opus in real time.
      const stream = await openAudioStream(captureMode);
      if (!live(run)) {
        releaseStream(stream);
        return;
      }
      run.stream = stream;
      const recorder = new Recorder(stream, { mimeType: OPUS_MIME });
      run.recorder = recorder;
      const session = new SpeechRecognitionSession({
        lang: SPEECH_LANGUAGE,
        interimResults: Boolean(capabilities.interimResults),
        audio: { mimeType: OPUS_MIME },
        ...(vad ? { segmentation } : {}),
      });
      run.writer = session.audio.getWriter();
      session.onresult = (event) => {
        if (!live(run)) return;
        // Dictation mode: pass raw result events through; the page
        // accumulates transcripts itself.
        if (!vad) {
          api.onresult?.(event);
          return;
        }
        // VAD mode: hosts may re-emit a final result for the same index, so
        // only new indexes count as turns. The empty interim after a final
        // result marks the segment boundary.
        const { index, text, isFinal } = readSegment(event);
        if (isFinal) {
          if (index <= run.lastFinalIndex) return;
          run.lastFinalIndex = index;
          if (text) api.onsegment?.({ text });
          api.oninterim?.({ text: '' });
        } else {
          api.oninterim?.({ text });
        }
      };
      // Host-side failures surface with their own error name as the key.
      session.onerror = (event) => finish(run, event?.error || 'recognitionFailed', event?.message);
      session.onend = () => finish(run);

      recorder.onstart = () => {
        if (!live(run) || run.stopping) return;
        clearTimeout(run.timer);
        api.onstart?.();
      };
      recorder.ondataavailable = (event) => enqueue(run, event.data);
      recorder.onerror = (event) => finish(run, 'micUnsupported', event.error?.message || event.message);
      // Recorder stopped: release the mic, drain queued blobs, then close
      // the writer — closing signals end-of-audio and flushes the final
      // result. If no header was ever seen, nothing was encoded: just end.
      recorder.onstop = async () => {
        if (!live(run)) return;
        releaseStream(run.stream);
        run.stream = null;
        clearTimeout(run.timer);
        run.timer = setTimeout(() => finish(run, 'resultTimeout'), TIMEOUT_MS);
        try {
          await run.queue;
          if (!live(run)) return;
          if (!run.headerSent) {
            finish(run);
            return;
          }
          run.closing = true;
          await run.writer.close();
        } catch (error) { fail(run, error); }
      };
      recorder.start(FRAME_MS);
    } catch (error) { fail(run, error); }
  }

  // Stop: end the recorder; its onstop drains the queue and closes the
  // writer, which triggers the final transcript.
  function stop() {
    const run = current;
    if (!run || run.stopping) return;
    run.stopping = true;
    if (!run.recorder) {
      finish(run);
      return;
    }
    clearTimeout(run.timer);
    run.timer = setTimeout(() => finish(run, 'stopTimeout'), TIMEOUT_MS);
    try { run.recorder.stop(); } catch (error) { fail(run, error); }
  }

  // Abort: silent teardown without waiting for a final result.
  function abort() {
    if (current) dispose(current, true);
  }

  return api;
}
