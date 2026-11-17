# Show Captions in Sync with Spoken Audio

Show captions that follow speech playback. Use a runtime that supports streamed speech synthesis with captions.

## Update the Page as the Active Caption Changes

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Request sentence-level captions with `synthesize()` and create a `SpeechAudioPlayer`. Register the `cuechange` listener before playing. Read `activeCue.text` when the cue changes, and clear the displayed text when there is no active cue.

```html
<script setup>
export default {
  data: { loading: false, caption: '', error: '' },

  async speakWithCaptions() {
    if (this.data.loading) return;
    this.releasePlayback();
    this.setData({ loading: true, caption: '', error: '' });

    const controller = new AbortController();
    this.playbackController = controller;

    try {
      const utterance = new SpeechSynthesisUtterance('Welcome to the station. The next train is arriving soon.');
      utterance.voice = 'English_radiant_girl';
      const task = await speechSynthesis.synthesize(utterance, {
        subtitles: 'sentence',
        signal: controller.signal
      });
      // Generation can fail while playback is in progress.
      const finished = task.finished.then(() => true, () => false);
      if (controller.signal.aborted) return;

      const player = new SpeechAudioPlayer(task, { trackMode: 'hidden' });
      this.player = player;
      player.textTrack.addEventListener('cuechange', () => {
        if (this.player === player) {
          this.setData({ caption: player.activeCue?.text ?? '' });
        }
      });
      player.play();

      if (!(await finished)) {
        throw new Error('Speech synthesis failed');
      }
    } catch {
      if (!controller.signal.aborted) {
        this.releasePlayback();
        this.setData({ error: 'Could not play speech with captions' });
      }
    } finally {
      if (!this.unloaded) this.setData({ loading: false });
    }
  },

  releasePlayback() {
    const player = this.player;
    this.player = null;
    player?.destroy();
    this.playbackController?.abort();
    this.playbackController = null;
  },

  onUnload() {
    this.unloaded = true;
    this.releasePlayback();
  }
};
</script>

<page>
  <view>
    <button bindtap="speakWithCaptions" disabled="{{ loading }}">Play with captions</button>
    <text>{{ caption }}</text>
    <text>{{ error }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Play with captions.” Check that the first caption appears while the first sentence plays and changes as the second sentence begins. The text on the page should follow playback.

See [Speech Synthesis](/AIUI/api/ai-speech-synthesis) for the API and available features.
