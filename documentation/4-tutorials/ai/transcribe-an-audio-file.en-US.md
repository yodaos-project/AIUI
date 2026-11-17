# Transcribe an Audio File

Transcribe an existing recording. Save a few seconds of clear speech as `assets/recording.wav`. Your speech recognition service must accept the file’s audio format.

## Write the Recording to the Recognition Session

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Import the recording and write it as a `Blob` to `session.audio`. Call `close()` to signal the end of the input. In each `result` event, read the finalized sentences from the accumulated results and display them.

```html
<script setup>
import recording from '../../assets/recording.wav';

export default {
  data: { busy: false, transcript: '', status: '' },

  async transcribe() {
    if (this.data.busy) return;
    this.setData({ busy: true, transcript: '', status: 'Transcribing' });
    let writer;

    try {
      const session = new SpeechRecognitionSession({
        lang: 'en-US',
        audio: { mimeType: 'audio/wav' }
      });
      writer = session.audio.getWriter();
      this.writer = writer;

      session.onresult = (event) => {
        if (this.writer !== writer) return;
        const sentences = [];
        for (let index = 0; index < event.results.length; index++) {
          const result = event.results[index];
          if (result.isFinal && result[0]) {
            sentences.push(result[0].transcript);
          }
        }
        this.setData({ transcript: sentences.join(' ') });
      };
      session.onerror = (event) => {
        if (this.writer === writer) {
          this.setData({ status: `Transcription failed: ${event.error}` });
        }
      };

      await writer.write(recording);
      await writer.close();

      if (this.writer === writer && this.data.status === 'Transcribing') {
        this.setData({ status: this.data.transcript ? 'Transcription complete' : 'No speech detected' });
      }
    } catch (error) {
      await writer?.abort(error).catch(() => {});
      if (!this.unloaded) this.setData({ status: 'Transcription failed. Check the audio file and service configuration.' });
    } finally {
      this.writer = null;
      if (!this.unloaded) this.setData({ busy: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    const writer = this.writer;
    this.writer = null;
    writer?.abort().catch(() => {});
  }
};
</script>

<page>
  <view>
    <button bindtap="transcribe" disabled="{{ busy }}">Transcribe recording</button>
    <text>{{ status }}</text>
    <text>{{ transcript }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Transcribe recording” and compare the displayed text with the recording. This example reads the file directly and needs no microphone access.

See [Speech Recognition](/AIUI/api/ai-speech-recognition) for events and return values.
