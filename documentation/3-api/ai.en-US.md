# AI

AIUI is designed for AI application development. Its most common capabilities can be grouped into three areas: understanding what the user says, speaking the result back, and directly invoking a large language model for understanding, reasoning, and generation.

If you are building a complete voice agent, you will typically combine these three capabilities:

- **Speech Recognition**: Converts what the user says into text.
- **Large Language Model**: Understands the context and generates a reply.
- **Speech Synthesis**: Reads the generated result back to the user.

## Work with the Current Agent Session

Use [Agent Sessions](/AIUI/api/ai-agent-session) to publish background context, send user messages and cards, call remote tools, and read resources.

These session capabilities are separate from directly creating a `LanguageModelSession`. Application state and cards do not automatically become model input.

## How To Choose

- Want your app to understand user input: use `Speech Recognition`
- Want your app to speak text aloud: use `Speech Synthesis`
- Want your app to perform Q&A, summarization, generation, or reasoning: use `Large Language Model`

## Simple Example

For example, first check whether the model capability is available, then send a prompt:

```javascript
const status = await LanguageModel.availability();

if (status === 'available') {
  const session = await LanguageModel.create();

  const result = await session.prompt('请用一句话介绍 AIUI');
  console.log(result);
}
```

## Continue Reading

- **[Speech Recognition](/AIUI/api/ai-speech-recognition)**: See how to capture the user's voice and receive recognition results.
- **[Speech Synthesis](/AIUI/api/ai-speech-synthesis)**: See how to synthesize text into spoken output.
- **[Large Language Model](/AIUI/api/ai-language-model)**: See how to create model sessions, request replies, and read streamed output.
- **[WeChat Mini Program Compatible APIs](/AIUI/api/weixin-compatible-apis)**: See compatible speech APIs.
