# WebRTC

WebRTC 用于建立实时音频连接和数据通道。当前支持音频与 `RTCDataChannel`，不支持视频传输；接口用于页面 / Widget 的 Window 环境，不在 Agent Worker 中提供。

**WebRTC 依赖设备联网。** 能通过手机蓝牙链路发送 HTTPS 请求，并不代表设备可以建立 WebRTC 连接。应用还需要自行通过 HTTPS、WebSocket 等渠道交换 SDP 与 ICE 候选；WebRTC 不提供信令服务。

## 建立数据通道

下面是发起端示例。`sendSignal()` 由应用实现，把消息交给对端；对端需要接收 offer、设置远端描述、创建 answer，并把 answer 传回。

```javascript
if (typeof RTCPeerConnection !== 'function') {
  throw new Error('WebRTC is unavailable in this environment');
}
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.example.com:3478' }],
});
const channel = pc.createDataChannel('messages');
channel.addEventListener('open', () => channel.send('hello'));
channel.addEventListener('message', event => console.log(event.data));
pc.addEventListener('icecandidate', event => {
  sendSignal({ candidate: event.candidate?.toJSON() ?? null });
});
await pc.setLocalDescription(await pc.createOffer());
sendSignal({ description: pc.localDescription.toJSON() });
```

将示例 STUN 地址替换为实际服务。跨网络连接可配置 TURN 中继及其凭据；`iceTransportPolicy: 'relay'` 只使用中继。支持 STUN / TURN 和 TURN 的 UDP、TCP、TLS 传输。

收到对端描述后，先 `await pc.setRemoteDescription(description)`，再添加已经收到的 ICE 候选。描述尚未设置时，应用应暂存候选；结束候选以 `null` 传递。双方同时发起协商时，需要在信令层处理 offer 冲突。

## 发送并播放音频

采集本地音频需要 `RECORD_AUDIO` 权限。浏览器环境还需要安全上下文（HTTPS 或 localhost）以及浏览器麦克风授权。

```javascript
const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
for (const track of localStream.getAudioTracks()) {
  pc.addTrack(track, localStream);
}

const audioContext = new AudioContext();
pc.addEventListener('track', event => {
  const remoteStream = new MediaStream([event.track]);
  const source = audioContext.createMediaStreamSource(remoteStream);
  source.connect(audioContext.destination);
});
```

先注册 `track` 监听，再设置对端描述。仅接收音频不需要麦克风权限；收到远端轨道不会自动播放，需要连接到 Web Audio 输出。浏览器可能要求用户操作后调用 `audioContext.resume()`。添加轨道后通过信令完成协商，才能实际传输音频。

## 控制发送量与释放资源

仅在数据通道为 `'open'` 时调用 `send()`。单条消息最多为 256 KiB，并且受对端协商出的 SCTP 限制约束。使用 `bufferedAmount`、`bufferedAmountLowThreshold` 和 `bufferedamountlow` 事件控制发送速度。

页面卸载或 Widget 销毁时关闭连接，并停止不再使用的本地轨道：

```javascript
channel.close();
pc.close();
localStream.getTracks().forEach(track => track.stop());
await audioContext.close();
```

`pc.close()` 结束远端轨道并释放连接资源，但不会替应用停止持有的本地轨道。信令交换成功不等于媒体已经连通；应观察连接状态与统计信息。

相关接口：[媒体采集](/AIUI/api/media-media-capture)、[Web Audio](/AIUI/api/media-web-audio)、[网络状态](/AIUI/api/weixin-compatible-apis-navigator)。

## API Reference

### `RTCPeerConnection`

#### `new RTCPeerConnection(configuration?)`

配置支持 `iceServers` 和 `iceTransportPolicy`（默认 `'all'`）。每个 ICE server 包含 `urls: string | string[]`，以及可选的 `username`、`credential`。

#### `pc.connectionState`

只读：`new`、`connecting`、`connected`、`disconnected`、`failed`、`closed`。

#### `pc.iceConnectionState`

只读：`new`、`checking`、`connected`、`completed`、`disconnected`、`failed`、`closed`。

#### `pc.iceGatheringState`

只读：`new`、`gathering`、`complete`。

#### `pc.signalingState`

只读：`stable`、`have-local-offer`、`have-remote-offer`、`have-local-pranswer`、`have-remote-pranswer`、`closed`。

#### `pc.canTrickleIceCandidates`

只读的 `boolean | null`，表示对端是否支持增量 ICE 候选；未知时为 `null`。

#### `pc.localDescription`

只读的 `RTCSessionDescription | null`。`current` 表示已完成协商的描述，`pending` 表示当前协商中的描述；无对应描述时为 `null`。

#### `pc.remoteDescription`

只读的 `RTCSessionDescription | null`。`current` 表示已完成协商的描述，`pending` 表示当前协商中的描述；无对应描述时为 `null`。

#### `pc.currentLocalDescription`

只读的 `RTCSessionDescription | null`。`current` 表示已完成协商的描述，`pending` 表示当前协商中的描述；无对应描述时为 `null`。

#### `pc.currentRemoteDescription`

只读的 `RTCSessionDescription | null`。`current` 表示已完成协商的描述，`pending` 表示当前协商中的描述；无对应描述时为 `null`。

#### `pc.pendingLocalDescription`

只读的 `RTCSessionDescription | null`。`current` 表示已完成协商的描述，`pending` 表示当前协商中的描述；无对应描述时为 `null`。

#### `pc.pendingRemoteDescription`

只读的 `RTCSessionDescription | null`。`current` 表示已完成协商的描述，`pending` 表示当前协商中的描述；无对应描述时为 `null`。

#### `pc.getConfiguration()`

返回当前连接配置。

#### `pc.createOffer(options?)`

返回 `Promise<RTCSessionDescriptionInit>`。可选 `iceRestart: true` 请求重新收集 ICE。

#### `pc.createAnswer()`

返回 `Promise<RTCSessionDescriptionInit>`，为已设置的远端 offer 创建 answer。

#### `pc.setLocalDescription(description?)`

返回 `Promise<void>`。省略描述时按当前信令状态自动生成 offer 或 answer。

#### `pc.setRemoteDescription(description)`

返回 `Promise<void>`，应用远端 `{ type, sdp }` 描述。

#### `pc.addIceCandidate(candidate?)`

返回 `Promise<void>`。接受候选对象；`null` 或省略参数表示候选收集结束。先设置远端描述。

#### `pc.restartIce()`

请求在后续协商中重启 ICE，返回 `undefined`。

#### `pc.createDataChannel(label, options?)`

返回 `RTCDataChannel`。选项为 `ordered`、`protocol`、`negotiated`、`id`、`maxRetransmits` 或 `maxPacketLifeTime`；后两者不能同时设置。手动协商通道时双方必须使用相同 ID。

#### `pc.addTrack(track, ...streams)`

添加本地音频轨道，返回 `RTCRtpSender`；可选 streams 为远端提供流关联。

#### `pc.removeTrack(sender)`

移除发送关联，返回 `undefined`；必要时重新协商。

#### `pc.addTransceiver(trackOrKind, init?)`

接受音频轨道或 `'audio'`，返回 `RTCRtpTransceiver`。`init` 支持 `direction` 和 `streams`。

#### `pc.getSenders()`

返回 `RTCRtpSender[]`。

#### `pc.getReceivers()`

返回 `RTCRtpReceiver[]`。

#### `pc.getTransceivers()`

返回 `RTCRtpTransceiver[]`。

#### `pc.getStats(selector?)`

返回 `Promise<Map<string, RTCStats>>`。可按音频轨道筛选；每项含 `id`、`type`、`timestamp` 和该类型的统计字段。

#### `pc.close()`

关闭连接，拒绝未完成操作并结束远端轨道；可重复调用，返回 `undefined`。

#### `negotiationneeded / onnegotiationneeded`

需要重新协商时触发。 支持 `addEventListener()` 与对应事件属性。

#### `icecandidate / onicecandidate`

`event.candidate` 为 `RTCIceCandidate | null`；转发给对端。 支持 `addEventListener()` 与对应事件属性。

#### `icecandidateerror / onicecandidateerror`

事件提供 `url`、`errorCode` 和 `errorText`。 支持 `addEventListener()` 与对应事件属性。

#### `signalingstatechange / onsignalingstatechange`

信令状态变化。 支持 `addEventListener()` 与对应事件属性。

#### `iceconnectionstatechange / oniceconnectionstatechange`

ICE 连接状态变化。 支持 `addEventListener()` 与对应事件属性。

#### `icegatheringstatechange / onicegatheringstatechange`

ICE 收集状态变化。 支持 `addEventListener()` 与对应事件属性。

#### `connectionstatechange / onconnectionstatechange`

连接状态变化。 支持 `addEventListener()` 与对应事件属性。

#### `datachannel / ondatachannel`

收到对端创建的通道，位于 `event.channel`。 支持 `addEventListener()` 与对应事件属性。

#### `track / ontrack`

收到远端轨道；事件包含 `track`、`receiver`、`transceiver`、`streams`。 支持 `addEventListener()` 与对应事件属性。

### `RTCDataChannel`

#### `channel.label`

只读的 `string`。

#### `channel.id`

只读的 `number | null`。

#### `channel.ordered`

只读的 `boolean`。

#### `channel.protocol`

只读的 `string`。

#### `channel.negotiated`

只读的 `boolean`。

#### `channel.maxRetransmits`

只读的 `number | null`。

#### `channel.maxPacketLifeTime`

只读的 `number | null`。

#### `channel.readyState`

只读的 `'connecting' | 'open' | 'closing' | 'closed'`。

#### `channel.bufferedAmount`

只读的 `number`。已排队但尚未发送的字节数。

#### `channel.bufferedAmountLowThreshold`

可写的字节阈值；缓冲量下降到此阈值时触发 `bufferedamountlow`。

#### `channel.binaryType`

可写，`'blob'` 或 `'arraybuffer'`，决定二进制消息的 `event.data` 类型。

#### `channel.send(data)`

接受字符串、`Blob` 或 `BufferSource`，视图仅发送自身区间，返回 `undefined`。通道未打开或超过消息 / 队列限制时失败。

#### `channel.close()`

请求关闭通道，返回 `undefined`。

#### `open / onopen`

支持 `addEventListener()` 或对应事件属性。

#### `message / onmessage`

支持 `addEventListener()` 或对应事件属性。消息内容在 `event.data`。

#### `error / onerror`

支持 `addEventListener()` 或对应事件属性。

#### `closing / onclosing`

支持 `addEventListener()` 或对应事件属性。

#### `close / onclose`

支持 `addEventListener()` 或对应事件属性。

#### `bufferedamountlow / onbufferedamountlow`

支持 `addEventListener()` 或对应事件属性。

### `RTCSessionDescription`

#### `new RTCSessionDescription(init)`

`init.type` 为 `offer`、`answer`、`pranswer` 或 `rollback`；`sdp` 为可选字符串。

#### `description.type`

只读的 `RTCSdpType`。

#### `description.sdp`

只读的 `string`。

#### `description.toJSON()`

返回 `{ type, sdp }`，用于信令序列化。

### `RTCIceCandidate`

#### `new RTCIceCandidate(init?)`

接受可选的 `candidate`、`sdpMid`、`sdpMLineIndex` 和 `usernameFragment`。

#### `candidate.candidate`

只读的 `string`，不可用的解析字段为 `null`。

#### `candidate.sdpMid`

只读的 `string | null`，不可用的解析字段为 `null`。

#### `candidate.sdpMLineIndex`

只读的 `number | null`，不可用的解析字段为 `null`。

#### `candidate.usernameFragment`

只读的 `string | null`，不可用的解析字段为 `null`。

#### `candidate.foundation`

只读的 `string | null`，不可用的解析字段为 `null`。

#### `candidate.component`

只读的 `'rtp' | 'rtcp' | null`，不可用的解析字段为 `null`。

#### `candidate.protocol`

只读的 `'udp' | 'tcp' | null`，不可用的解析字段为 `null`。

#### `candidate.priority`

只读的 `number | null`，不可用的解析字段为 `null`。

#### `candidate.address`

只读的 `string | null`，不可用的解析字段为 `null`。

#### `candidate.port`

只读的 `number | null`，不可用的解析字段为 `null`。

#### `candidate.type`

只读的 `'host' | 'srflx' | 'prflx' | 'relay' | null`，不可用的解析字段为 `null`。

#### `candidate.tcpType`

只读的 `'active' | 'passive' | 'so' | null`，不可用的解析字段为 `null`。

#### `candidate.relatedAddress`

只读的 `string | null`，不可用的解析字段为 `null`。

#### `candidate.relatedPort`

只读的 `number | null`，不可用的解析字段为 `null`。

#### `candidate.toJSON()`

返回候选的初始化字段，用于信令序列化。

### `RTCRtpSender`

#### `track`

只读的 `MediaStreamTrack | null`。实例由连接创建，不能直接构造。

#### `getStats()`

返回 `Promise<Map<string, RTCStats>>`。

#### `replaceTrack(track)`

返回 `Promise<void>`，替换音频轨道；传入 `null` 暂停发送。

### `RTCRtpReceiver`

#### `track`

只读的 `MediaStreamTrack | null`。实例由连接创建，不能直接构造。

#### `getStats()`

返回 `Promise<Map<string, RTCStats>>`。

### `RTCRtpTransceiver`

#### `sender`

只读的 `RTCRtpSender`。

#### `receiver`

只读的 `RTCRtpReceiver`。

#### `mid`

只读的 `string | null`。

#### `currentDirection`

只读的 `RTCRtpTransceiverDirection | null`。

#### `direction`

可写：`sendrecv`、`sendonly`、`recvonly` 或 `inactive`；变更后需要协商。

#### `stop()`

停止此收发器，返回 `undefined`。
