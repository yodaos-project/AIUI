# 如何选择媒体 API

AIUI 提供音频播放、短音效、音频处理、视频播放和媒体采集能力。先根据要完成的任务选择入口，再进入对应页面查看示例和完整 API。

## 根据需求选择

| 如果你想要 | 选择 |
| --- | --- |
| 播放一首音乐、本地音频文件或持续到达的音频数据 | [音频播放](/AIUI/api/media-audio-player) |
| 播放按钮点击声、提示音等短小且需要频繁触发的本地音效 | [短音效](/AIUI/api/media-sound) |
| 生成声音、播放 PCM 数据，或者分析麦克风音量、波形和频率 | [音频处理](/AIUI/api/media-web-audio) |
| 在页面中播放视频并控制播放状态 | [视频播放](/AIUI/api/media-video) |
| 使用麦克风或相机完成拍照、录音和录像 | [媒体采集](/AIUI/api/media-media-capture) |
| 选择麦克风拾音模式，或录制设备正在播放的系统音频 | [选择录音音源](/AIUI/api/media-media-capture#选择录音音源) |

## 继续阅读

- **[音频播放](/AIUI/api/media-audio-player)**：使用 `AudioPlayer` 播放本地音频或持续到达的音频数据。
- **[短音效](/AIUI/api/media-sound)**：使用轻量的 `Sound` 接口播放按钮点击声和提示音。
- **[音频处理](/AIUI/api/media-web-audio)**：生成声音、播放 PCM 数据、调整声音，或分析麦克风的音量、波形和频率。
- **[视频播放](/AIUI/api/media-video)**：查看 `<video>` 组件与 `VideoContext` 播放控制接口。
- **[媒体采集](/AIUI/api/media-media-capture)**：使用 `navigator.mediaDevices`、`ImageCapture`、`MediaRecorder` 以及 wx 风格接口完成拍照、录音和录像。
