// Streaming ASR pipeline: getUserMedia microphone → Web Audio PCM tap →
// SpeechRecognitionSession.
//
// Both pages share this one pipeline in two modes:
// - Dictation (default): wearer mic, no segmentation. stop() closes the audio
//   writer so the session emits its final transcript, then ends.
// - Continuous ({ vad: true }): VAD segmentation with the capture mode picked
//   in the mic-mode picker (lib/mic-mode.js). The writer stays open; every
//   finalized VAD segment fires onsegment (one utterance = one turn).
//
// PCM is tapped straight from an AnalyserNode because the device ASR only
// accepts raw `audio/pcm` input — MediaRecorder-encoded output is not an
// accepted format.
//
// Failures are locale-neutral: onerror carries a stable `key` (mapped to
// localized text via lib/i18n.js) plus an English `message` for logcat.

// ASR language: this demo ships a zh-CN voice pipeline; the UI locale
// (lib/i18n.js) is independent of it.
const SPEECH_LANGUAGE = 'zh-CN';
const TIMEOUT_MS = 15000;
const TARGET_PCM_RATE = 16000;
const TAP_FFT_SIZE = 4096;
const LOWPASS_HZ = 7200;
const PREFERRED_VAD_SILENCE_MS = 800;

// Stable error keys surfaced through onerror ({ key, message }):
// sessionUnsupported, recorderUnsupported, micUnsupported, formatUnsupported,
// startTimeout, stopTimeout, resultTimeout, notStarted, recognitionFailed —
// plus whatever error name the host session reports.
function recognizerError(key, detail) {
  return Object.assign(new Error(detail || key), { key });
}

function getMediaApi() {
  const mediaDevices = typeof navigator !== 'undefined' && navigator && navigator.mediaDevices;
  return {
    getUserMedia: mediaDevices && mediaDevices.getUserMedia
      ? mediaDevices.getUserMedia.bind(mediaDevices)
      : null,
    AudioContextCtor: typeof AudioContext !== 'undefined' ? AudioContext : null,
  };
}

// The three getUserMedia microphone modes (the `microphoneMode` constraint).
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
  const { getUserMedia } = getMediaApi();
  if (!getUserMedia) throw recognizerError('recorderUnsupported');
  let lastError = null;
  for (const audio of buildAudioConstraintChain(captureMode)) {
    try {
      const stream = await getUserMedia({ audio });
      console.log('[rvi] audio stream opened | mode =', captureMode, '| constraints =', JSON.stringify(audio));
      return stream;
    } catch (error) {
      lastError = error;
      if (!error || error.name !== 'OverconstrainedError') {
        throw recognizerError('micUnsupported', (error && (error.message || error.name)) || String(error));
      }
    }
  }
  throw recognizerError('micUnsupported', (lastError && (lastError.message || lastError.name)) || '');
}

function baseMime(value) {
  return String(value || '').trim().toLowerCase().split(';')[0];
}

function supportsPcmFormat(capabilities) {
  const formats = Array.isArray(capabilities && capabilities.audioFormats) ? capabilities.audioFormats : [];
  return formats.some((format) => baseMime(format && format.mimeType) === 'audio/pcm');
}

function buildPcmAudioFormat(sampleRate) {
  return { mimeType: 'audio/pcm', sampleRate, channelCount: 1, sampleFormat: 's16' };
}

// Negotiate the documented `segmentation` option from session capabilities:
// prefer VAD with ~800ms silence (clamped to the supported range), then plain
// 'vad', then 'auto'.
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
  if (modes.includes('auto')) return 'auto';
  return undefined;
}

// Extract the currently changed segment from a result event (resultIndex
// points at it).
function readSegment(event) {
  const results = event && event.results;
  if (!results || typeof results.length !== 'number') return { text: '', isFinal: false };
  const index = typeof event.resultIndex === 'number' ? event.resultIndex : results.length - 1;
  const result = results[index];
  const alternative = result && result[0];
  return {
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

// Audio stream → PCM pump: the getUserMedia stream (microphone or host
// playback) feeds an AudioContext (asking for 16k); an AnalyserNode is polled
// on a timer and its waveform is converted to s16 frames. When the context
// runs above 16k at an integer multiple, a lowpass precedes integer
// decimation to avoid aliasing.
function createMicPump({ captureMode, onChunk, onError } = {}) {
  let handle = null;

  async function start() {
    const stream = await openAudioStream(captureMode || 'wearer');
    const { AudioContextCtor } = getMediaApi();
    if (!AudioContextCtor) throw recognizerError('recorderUnsupported');

    const context = new AudioContextCtor({ sampleRate: TARGET_PCM_RATE });
    const source = context.createMediaStreamSource(stream);
    const contextRate = context.sampleRate;
    const factor = contextRate > TARGET_PCM_RATE && contextRate % TARGET_PCM_RATE === 0
      ? contextRate / TARGET_PCM_RATE
      : 1;

    let tapInput = source;
    if (factor > 1) {
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = LOWPASS_HZ;
      source.connect(filter);
      tapInput = filter;
    }
    const analyser = context.createAnalyser();
    analyser.fftSize = TAP_FFT_SIZE;
    tapInput.connect(analyser);
    await context.resume();

    const waveform = new Float32Array(analyser.fftSize);
    const outLength = analyser.fftSize / factor;
    const intervalMs = Math.max(40, Math.round((analyser.fftSize / contextRate) * 1000));
    const outputRate = contextRate / factor;
    let timer = setInterval(() => {
      try {
        analyser.getFloatTimeDomainData(waveform);
        const pcm = new Int16Array(outLength);
        for (let index = 0; index < outLength; index += 1) {
          const sample = Math.max(-1, Math.min(1, waveform[index * factor]));
          pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        onChunk(pcm.buffer, outputRate);
      } catch (error) {
        if (timer) { clearInterval(timer); timer = null; }
        onError && onError(error);
      }
    }, intervalMs);

    handle = { stream, context, source, timer };
    console.log('[rvi] mic pump started | ctx rate =', contextRate, '| output rate =', outputRate);
    return { outputRate };
  }

  function release() {
    if (!handle) return;
    if (handle.timer) { clearInterval(handle.timer); handle.timer = null; }
    try { handle.source.disconnect(); } catch (_) {}
    try { handle.stream.getTracks().forEach((track) => track.stop()); } catch (_) {}
    try {
      if (handle.context && handle.context.state !== 'closed') {
        Promise.resolve(handle.context.close()).catch(() => {});
      }
    } catch (_) {}
    handle = null;
  }

  return { start, release };
}

// Recognizer session lifecycle. Every async callback checks `live(run)` so a
// stale run (aborted then restarted) never leaks into the new session.
export function createRecognizer({ SpeechRecognitionSession, captureMode = 'wearer', vad = false } = {}) {
  let current = null;
  const api = { start, stop, abort };
  const live = (run) => current === run;
  const abortWriter = (run) => {
    try { if (run.writer) Promise.resolve(run.writer.abort()).catch(() => {}); } catch (_) {}
  };
  // Tear the run down; a key (stable error id) turns this into a failure.
  const endRun = (run, key, detail) => {
    if (!live(run)) return;
    current = null;
    clearTimeout(run.timer);
    if (run.pump) run.pump.release();
    if (key) {
      abortWriter(run);
      console.error('[rvi] recognizer error | key =', key, '| detail =', detail || '');
      if (api.onerror) api.onerror({ key, message: detail || '' });
    }
    if (api.onend) api.onend();
  };
  const failFrom = (run, error) => endRun(
    run,
    (error && error.key) || 'recognitionFailed',
    (error && (error.message || String(error))) || ''
  );

  async function start() {
    if (current) return;
    const { AudioContextCtor } = getMediaApi();
    const run = { queue: Promise.resolve(), stopping: false, started: false, pump: null, writer: null };
    current = run;
    run.timer = setTimeout(() => endRun(run, 'startTimeout'), TIMEOUT_MS);
    try {
      if (!SpeechRecognitionSession) throw recognizerError('sessionUnsupported');
      if (!AudioContextCtor) throw recognizerError('recorderUnsupported');

      // Open the audio stream first: the session must be created with the
      // pump's real output sample rate.
      run.pump = createMicPump({
        captureMode,
        onChunk: (buffer) => {
          if (!live(run) || !run.writer) return;
          // Serialize writes through a promise queue; the writer is a pipe,
          // not a queue, so out-of-order write() calls would interleave.
          run.queue = run.queue.then(() => (live(run) ? run.writer.write(buffer) : undefined));
          run.queue.catch((error) => failFrom(run, error));
        },
        onError: (error) => failFrom(run, error),
      });
      const { outputRate } = await run.pump.start();
      if (!live(run)) { run.pump.release(); return; }

      // Capability negotiation: PCM input support is required; segmentation
      // is only requested in VAD mode.
      const capabilities = await SpeechRecognitionSession.getCapabilities();
      if (!live(run)) return;
      if (!supportsPcmFormat(capabilities)) throw recognizerError('formatUnsupported');

      const options = {
        lang: SPEECH_LANGUAGE,
        interimResults: vad ? true : Boolean(capabilities.interimResults),
        audio: buildPcmAudioFormat(outputRate),
      };
      if (vad) {
        const segmentation = negotiateSegmentation(capabilities);
        if (segmentation !== undefined) options.segmentation = segmentation;
      }
      const session = new SpeechRecognitionSession(options);
      run.writer = session.audio.getWriter();
      session.onresult = (event) => {
        if (!live(run)) return;
        if (!vad) {
          if (api.onresult) api.onresult(event);
          return;
        }
        // VAD mode: each isFinal segment is one utterance turn; the empty
        // interim after it marks the segment boundary.
        const { text, isFinal } = readSegment(event);
        if (isFinal) {
          if (text && api.onsegment) api.onsegment({ text });
          if (api.oninterim) api.oninterim({ text: '' });
        } else if (api.oninterim) {
          api.oninterim({ text });
        }
      };
      // Host-side failures surface with their own error name as the key.
      session.onerror = (event) => endRun(
        run,
        (event && event.error) || 'recognitionFailed',
        (event && (event.message || event.error)) || ''
      );
      session.onend = () => endRun(run);

      run.started = true;
      clearTimeout(run.timer);
      if (api.onstart) api.onstart();
    } catch (error) { failFrom(run, error); }
  }

  // Stop: release the mic, drain queued audio frames, then close the writer —
  // closing signals end-of-audio and flushes the final recognition result.
  function stop() {
    const run = current;
    if (!run || run.stopping) return;
    run.stopping = true;
    clearTimeout(run.timer);
    run.timer = setTimeout(() => endRun(run, 'stopTimeout'), TIMEOUT_MS);
    if (!run.started || !run.pump) return endRun(run, 'notStarted');
    (async () => {
      try {
        run.pump.release();
        await run.queue;
        if (live(run)) {
          await run.writer.close();
          clearTimeout(run.timer);
          run.timer = setTimeout(() => endRun(run, 'resultTimeout'), TIMEOUT_MS);
        }
      } catch (error) { failFrom(run, error); }
    })();
  }

  // Abort: silent teardown without waiting for a final result.
  function abort() {
    const run = current;
    if (!run) return;
    current = null;
    clearTimeout(run.timer);
    abortWriter(run);
    if (run.pump) run.pump.release();
  }
  return api;
}
