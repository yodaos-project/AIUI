# Play Several Spoken Prompts in Order

Play two spoken prompts in order with one tap. Use a runtime with speech synthesis available.

## Add Both Prompts to the Speech Queue

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Use `speak(utterance, "enqueue")` to add each prompt to the shared queue in call order. You can add the next prompt as soon as `speak()` returns. The queue takes care of playback order.

```html
<script setup>
export default {
  speakInstructions() {
    const first = new SpeechSynthesisUtterance('Step one. Pour water into the cup.');
    const second = new SpeechSynthesisUtterance('Step two. Put the lid on the cup.');
    first.voice = 'English_radiant_girl';
    second.voice = 'English_radiant_girl';

    speechSynthesis.speak(first, 'enqueue');
    speechSynthesis.speak(second, 'enqueue');
  }
};
</script>

<page>
  <button bindtap="speakInstructions">Play both prompts</button>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Play both prompts.” Listen for step one to finish before step two starts. Swap the two `speak()` calls, reload, and check that the order reverses.

See [Speech Synthesis](/AIUI/api/ai-speech-synthesis) for the API and available features.
