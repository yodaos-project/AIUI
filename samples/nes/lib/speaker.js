import { AudioPlayer } from 'audio';

const SAMPLE_RATE = 48000;

// ink-open supplies its host CPU architecture. Web previews can omit host metadata.
export const hasNativeAudio = /;\s*(?:aarch64|arm[\w-]*|x86[\w-]*|i[3-6]86)\)/i.test(navigator.userAgent);

class PcmSpeaker {
  constructor() {
    this.player = new AudioPlayer({
      format: 'pcm', sample_rate: SAMPLE_RATE, number_of_channels: 1, sample_format: 's16',
    });
    this.started = false;
  }

  start(onError) {
    this.player.onError(onError);
  }

  append(samples) {
    this.player.append(new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength));
    if (!this.started) {
      this.player.play();
      this.started = true;
    }
  }

  close() {
    this.player.destroy();
  }
}

class WebSpeaker {
  constructor() {
    this.context = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.chunk = new Float32Array(2048);
    this.used = 0;
    this.nextTime = 0;
  }

  start(onError) {
    this.context.resume().catch(onError);
  }

  close() {
    this.context.close().catch(() => {});
  }

  append(samples) {
    if (this.context.state !== 'running') return;
    for (const sample of samples) {
      this.chunk[this.used++] = sample / 32768;
      if (this.used === this.chunk.length) {
        this.playChunk();
        this.used = 0;
      }
    }
  }

  playChunk() {
    const ctx = this.context;
    const buffer = ctx.createBuffer(1, this.chunk.length, SAMPLE_RATE);
    buffer.copyToChannel(this.chunk, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => source.disconnect();
    const now = ctx.currentTime;
    const start = this.nextTime > now ? this.nextTime : now + 0.04;
    source.start(start);
    this.nextTime = start + buffer.duration;
  }
}

export const Speaker = hasNativeAudio ? PcmSpeaker : WebSpeaker;
