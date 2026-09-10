# 使用语言模型生成文本

先检查 `LanguageModel.availability()`，仅在能力可用时创建会话并发送提示。会话使用完毕后应释放相关资源。

## 完成示例

<!-- aiui-tutorial-step -->

先检查 `LanguageModel.availability()`，仅在能力可用时创建会话并发送提示。会话使用完毕后应释放相关资源。

```javascript
const status = await LanguageModel.availability();

if (status === 'available') {
  const session = await LanguageModel.create();
  const answer = await session.prompt('用一句话介绍 AIUI');
  console.log(answer);
} else {
  console.warn('Language model is unavailable');
}
```

<!-- /aiui-tutorial-step -->

不同运行环境的能力状态参见[生成式 AI](/AIUI/api/ai)。

