# WebRTC

WebRTC establishes real-time audio connections and data channels. Currently supports audio and `RTCDataChannel`, without video transport. APIs are provided in the Window environment for pages / Widgets, not Agent Workers.

**WebRTC depends on device network connectivity.** HTTPS access through a phone's Bluetooth link does not establish that the device can make WebRTC connections. Applications must exchange SDP and ICE candidates through their own signaling channel, such as HTTPS or WebSocket. WebRTC does not provide a signaling service.

## Establish a data channel

This example creates the initiating peer. Implement `sendSignal()` to deliver messages to the remote peer. The peer must receive the offer, set its remote description, create an answer, and send that answer back.

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

Replace the example STUN address with a real service. Configure TURN relays and credentials for connectivity across networks; `iceTransportPolicy: 'relay'` uses relays only. STUN / TURN and TURN over UDP, TCP, and TLS are supported.

When a remote description arrives, first `await pc.setRemoteDescription(description)`, then add queued ICE candidates. Queue candidates until the description is set; forward `null` to signal the end of candidates. Handle simultaneous offers and negotiation collisions in your signaling layer.

## Send and play audio

Local capture requires the `RECORD_AUDIO` permission. Browser environments also require a secure context (HTTPS or localhost) and browser microphone authorization.

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

Register `track` listeners before setting the remote description. Receiving audio alone needs no microphone permission. Remote tracks do not play automatically; connect them to Web Audio output. Browsers may require a user interaction followed by `audioContext.resume()`. After adding tracks, complete signaling negotiation before audio can flow.

## Limit queued data and release resources

Call `send()` only while a channel is `'open'`. A message is limited to 256 KiB and to any smaller negotiated SCTP limit. Use `bufferedAmount`, `bufferedAmountLowThreshold`, and `bufferedamountlow` to regulate sending.

Close connections and stop unused local tracks when a page unloads or a Widget is destroyed:

```javascript
channel.close();
pc.close();
localStream.getTracks().forEach(track => track.stop());
await audioContext.close();
```

`pc.close()` ends remote tracks and releases connection resources, but does not stop local tracks held by the application. Successful signaling does not establish media connectivity; observe connection states and statistics.

Related APIs: [Media capture](/AIUI/api/media-media-capture), [Web Audio](/AIUI/api/media-web-audio), and [Network status](/AIUI/api/weixin-compatible-apis-navigator).

## API Reference

### `RTCPeerConnection`

#### `new RTCPeerConnection(configuration?)`

Configuration accepts `iceServers` and `iceTransportPolicy` (default `'all'`). Each ICE server contains `urls: string | string[]` and optional `username` / `credential`.

#### `pc.connectionState`

Read-only: `new`, `connecting`, `connected`, `disconnected`, `failed`, or `closed`.

#### `pc.iceConnectionState`

Read-only: `new`, `checking`, `connected`, `completed`, `disconnected`, `failed`, or `closed`.

#### `pc.iceGatheringState`

Read-only: `new`, `gathering`, or `complete`.

#### `pc.signalingState`

Read-only: `stable`, `have-local-offer`, `have-remote-offer`, `have-local-pranswer`, `have-remote-pranswer`, or `closed`.

#### `pc.canTrickleIceCandidates`

Read-only `boolean | null`, indicating remote support for trickle ICE; `null` when unknown.

#### `pc.localDescription`

Read-only `RTCSessionDescription | null`. `current` holds a negotiated description; `pending` holds a description under negotiation. Returns `null` if absent.

#### `pc.remoteDescription`

Read-only `RTCSessionDescription | null`. `current` holds a negotiated description; `pending` holds a description under negotiation. Returns `null` if absent.

#### `pc.currentLocalDescription`

Read-only `RTCSessionDescription | null`. `current` holds a negotiated description; `pending` holds a description under negotiation. Returns `null` if absent.

#### `pc.currentRemoteDescription`

Read-only `RTCSessionDescription | null`. `current` holds a negotiated description; `pending` holds a description under negotiation. Returns `null` if absent.

#### `pc.pendingLocalDescription`

Read-only `RTCSessionDescription | null`. `current` holds a negotiated description; `pending` holds a description under negotiation. Returns `null` if absent.

#### `pc.pendingRemoteDescription`

Read-only `RTCSessionDescription | null`. `current` holds a negotiated description; `pending` holds a description under negotiation. Returns `null` if absent.

#### `pc.getConfiguration()`

Returns the current connection configuration.

#### `pc.createOffer(options?)`

Returns `Promise<RTCSessionDescriptionInit>`. Optional `iceRestart: true` requests an ICE restart.

#### `pc.createAnswer()`

Returns `Promise<RTCSessionDescriptionInit>`, answering an already-set remote offer.

#### `pc.setLocalDescription(description?)`

Returns `Promise<void>`. Omitting the description creates an offer or answer according to the signaling state.

#### `pc.setRemoteDescription(description)`

Returns `Promise<void>`, applying a remote `{ type, sdp }` description.

#### `pc.addIceCandidate(candidate?)`

Returns `Promise<void>`. Accepts a candidate object; `null` or omitted input ends candidates. Set the remote description first.

#### `pc.restartIce()`

Requests an ICE restart in subsequent negotiation; returns `undefined`.

#### `pc.createDataChannel(label, options?)`

Returns `RTCDataChannel`. Options are `ordered`, `protocol`, `negotiated`, `id`, and either `maxRetransmits` or `maxPacketLifeTime`, never both. Manually negotiated channels need matching IDs on both peers.

#### `pc.addTrack(track, ...streams)`

Adds a local audio track and returns `RTCRtpSender`; optional streams associate the track with remote streams.

#### `pc.removeTrack(sender)`

Removes the sending association, returning `undefined`; renegotiate as needed.

#### `pc.addTransceiver(trackOrKind, init?)`

Accepts an audio track or `'audio'` and returns `RTCRtpTransceiver`. `init` supports `direction` and `streams`.

#### `pc.getSenders()`

Returns `RTCRtpSender[]`.

#### `pc.getReceivers()`

Returns `RTCRtpReceiver[]`.

#### `pc.getTransceivers()`

Returns `RTCRtpTransceiver[]`.

#### `pc.getStats(selector?)`

Returns `Promise<Map<string, RTCStats>>`. An optional audio track filters the report; entries contain `id`, `type`, `timestamp`, and type-specific statistics.

#### `pc.close()`

Closes the connection, rejects pending operations, and ends remote tracks. Repeated calls are allowed; returns `undefined`.

#### `negotiationneeded / onnegotiationneeded`

Fires when renegotiation is needed. Supports `addEventListener()` and the corresponding handler property.

#### `icecandidate / onicecandidate`

`event.candidate` is `RTCIceCandidate | null`; forward it to the peer. Supports `addEventListener()` and the corresponding handler property.

#### `icecandidateerror / onicecandidateerror`

The event contains `url`, `errorCode`, and `errorText`. Supports `addEventListener()` and the corresponding handler property.

#### `signalingstatechange / onsignalingstatechange`

Signaling state changed. Supports `addEventListener()` and the corresponding handler property.

#### `iceconnectionstatechange / oniceconnectionstatechange`

ICE connection state changed. Supports `addEventListener()` and the corresponding handler property.

#### `icegatheringstatechange / onicegatheringstatechange`

ICE gathering state changed. Supports `addEventListener()` and the corresponding handler property.

#### `connectionstatechange / onconnectionstatechange`

Connection state changed. Supports `addEventListener()` and the corresponding handler property.

#### `datachannel / ondatachannel`

Receives a peer-created channel in `event.channel`. Supports `addEventListener()` and the corresponding handler property.

#### `track / ontrack`

Receives a remote track; the event contains `track`, `receiver`, `transceiver`, and `streams`. Supports `addEventListener()` and the corresponding handler property.

### `RTCDataChannel`

#### `channel.label`

Read-only `string`.

#### `channel.id`

Read-only `number | null`.

#### `channel.ordered`

Read-only `boolean`.

#### `channel.protocol`

Read-only `string`.

#### `channel.negotiated`

Read-only `boolean`.

#### `channel.maxRetransmits`

Read-only `number | null`.

#### `channel.maxPacketLifeTime`

Read-only `number | null`.

#### `channel.readyState`

Read-only `'connecting' | 'open' | 'closing' | 'closed'`.

#### `channel.bufferedAmount`

Read-only `number`. Bytes queued but not yet sent.

#### `channel.bufferedAmountLowThreshold`

Writable byte threshold; falling to this threshold fires `bufferedamountlow`.

#### `channel.binaryType`

Writable: `'blob'` or `'arraybuffer'`, selecting the binary `event.data` type.

#### `channel.send(data)`

Accepts strings, `Blob`, or `BufferSource`, sending only the view range; returns `undefined`. Fails if the channel is not open or message / queue limits are exceeded.

#### `channel.close()`

Requests channel closure; returns `undefined`.

#### `open / onopen`

Use `addEventListener()` or the matching handler property.

#### `message / onmessage`

Use `addEventListener()` or the matching handler property. Message content is in `event.data`.

#### `error / onerror`

Use `addEventListener()` or the matching handler property.

#### `closing / onclosing`

Use `addEventListener()` or the matching handler property.

#### `close / onclose`

Use `addEventListener()` or the matching handler property.

#### `bufferedamountlow / onbufferedamountlow`

Use `addEventListener()` or the matching handler property.

### `RTCSessionDescription`

#### `new RTCSessionDescription(init)`

`init.type` is `offer`, `answer`, `pranswer`, or `rollback`; `sdp` is optional.

#### `description.type`

Read-only `RTCSdpType`.

#### `description.sdp`

Read-only `string`.

#### `description.toJSON()`

Returns `{ type, sdp }` for signaling serialization.

### `RTCIceCandidate`

#### `new RTCIceCandidate(init?)`

Accepts optional `candidate`, `sdpMid`, `sdpMLineIndex`, and `usernameFragment`.

#### `candidate.candidate`

Read-only `string`; unavailable parsed fields are `null`.

#### `candidate.sdpMid`

Read-only `string | null`; unavailable parsed fields are `null`.

#### `candidate.sdpMLineIndex`

Read-only `number | null`; unavailable parsed fields are `null`.

#### `candidate.usernameFragment`

Read-only `string | null`; unavailable parsed fields are `null`.

#### `candidate.foundation`

Read-only `string | null`; unavailable parsed fields are `null`.

#### `candidate.component`

Read-only `'rtp' | 'rtcp' | null`; unavailable parsed fields are `null`.

#### `candidate.protocol`

Read-only `'udp' | 'tcp' | null`; unavailable parsed fields are `null`.

#### `candidate.priority`

Read-only `number | null`; unavailable parsed fields are `null`.

#### `candidate.address`

Read-only `string | null`; unavailable parsed fields are `null`.

#### `candidate.port`

Read-only `number | null`; unavailable parsed fields are `null`.

#### `candidate.type`

Read-only `'host' | 'srflx' | 'prflx' | 'relay' | null`; unavailable parsed fields are `null`.

#### `candidate.tcpType`

Read-only `'active' | 'passive' | 'so' | null`; unavailable parsed fields are `null`.

#### `candidate.relatedAddress`

Read-only `string | null`; unavailable parsed fields are `null`.

#### `candidate.relatedPort`

Read-only `number | null`; unavailable parsed fields are `null`.

#### `candidate.toJSON()`

Returns candidate initialization fields for signaling serialization.

### `RTCRtpSender`

#### `track`

Read-only `MediaStreamTrack | null`. Instances are created by the connection and cannot be constructed directly.

#### `getStats()`

Returns `Promise<Map<string, RTCStats>>`.

#### `replaceTrack(track)`

Returns `Promise<void>`, replacing the audio track; `null` stops sending.

### `RTCRtpReceiver`

#### `track`

Read-only `MediaStreamTrack | null`. Instances are created by the connection and cannot be constructed directly.

#### `getStats()`

Returns `Promise<Map<string, RTCStats>>`.

### `RTCRtpTransceiver`

#### `sender`

Read-only `RTCRtpSender`.

#### `receiver`

Read-only `RTCRtpReceiver`.

#### `mid`

Read-only `string | null`.

#### `currentDirection`

Read-only `RTCRtpTransceiverDirection | null`.

#### `direction`

Writable: `sendrecv`, `sendonly`, `recvonly`, or `inactive`; changes require negotiation.

#### `stop()`

Stops the transceiver; returns `undefined`.
