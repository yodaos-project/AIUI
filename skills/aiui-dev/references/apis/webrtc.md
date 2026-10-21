# AIUI WebRTC Reference

WebRTC supports real-time audio and text/binary data channels in Pages and
Widgets. It does not transport video and is unavailable in Agent Workers.
Check `typeof RTCPeerConnection === 'function'` before use.

The device must have network connectivity. HTTPS forwarded through a phone's
Bluetooth link does not establish WebRTC connectivity. The agent supplies SDP
and ICE signaling, for example through HTTPS or WebSocket; WebRTC provides no
signaling service. Use actual STUN/TURN services and observe connection states
and statistics after negotiation.

## Peer Connection

`new RTCPeerConnection(configuration?)` accepts:

- `iceServers: { urls: string | string[], username?: string, credential?: string }[]`
- `iceTransportPolicy: 'all' | 'relay'` (default `'all'`); `'relay'` requires TURN. TURN supports UDP, TCP, and TLS.

| Method | Result / behavior |
| --- | --- |
| `getConfiguration()` | Current configuration. |
| `createOffer(options?)` | `Promise<RTCSessionDescriptionInit>`; `iceRestart: true` requests an ICE restart. |
| `createAnswer()` | Promise of an answer to an already-set remote offer. |
| `setLocalDescription(description?)` | `Promise<void>`; omitted input creates an offer/answer according to signaling state. |
| `setRemoteDescription(description)` | `Promise<void>` for `{ type, sdp }`. |
| `addIceCandidate(candidate?)` | `Promise<void>`; remote description must be set first. `null` / omitted input ends candidates. |
| `restartIce()` | Requests restart in subsequent negotiation; returns `undefined`. |
| `createDataChannel(label, options?)` | `RTCDataChannel`. |
| `addTrack(track, ...streams)` | Adds an audio track, returns `RTCRtpSender`. |
| `removeTrack(sender)` | Removes sending association; renegotiate as needed. |
| `addTransceiver(trackOrKind, init?)` | Audio track or `'audio'`; returns `RTCRtpTransceiver`. `init` supports `direction` / `streams`. |
| `getSenders()` / `getReceivers()` / `getTransceivers()` | Arrays of the respective objects. |
| `getStats(selector?)` | `Promise<Map<string, RTCStats>>`; optional audio track filters reports. Entries have `id`, `type`, `timestamp`, and type-specific fields. |
| `close()` | Closes resources, rejects pending operations, ends remote tracks; repeatable, returns `undefined`. |

Read-only states are `connectionState` (`new`, `connecting`, `connected`,
`disconnected`, `failed`, `closed`), `iceConnectionState` (`new`, `checking`,
`connected`, `completed`, `disconnected`, `failed`, `closed`),
`iceGatheringState` (`new`, `gathering`, `complete`), and `signalingState`
(`stable`, `have-local-offer`, `have-remote-offer`, `have-local-pranswer`,
`have-remote-pranswer`, `closed`). `canTrickleIceCandidates` is `boolean | null`.

`localDescription`, `remoteDescription`, `currentLocalDescription`,
`currentRemoteDescription`, `pendingLocalDescription`, and
`pendingRemoteDescription` are read-only `RTCSessionDescription | null`.

Events support `addEventListener()` and matching `on...` properties:

- `negotiationneeded`, `signalingstatechange`, `iceconnectionstatechange`, `icegatheringstatechange`, `connectionstatechange`.
- `icecandidate`: `event.candidate` is `RTCIceCandidate | null`; forward it to the peer.
- `icecandidateerror`: `event.url`, `errorCode`, `errorText`.
- `datachannel`: incoming channel in `event.channel`.
- `track`: `event.track`, `receiver`, `transceiver`, `streams`.

## Signaling Order

The initiating peer creates a channel before its offer. Supply `sendSignal()`
with the agent's own signaling transport:

```javascript
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

Replace the example STUN address with a real service. The receiving peer sets
the remote offer, creates/sets a local answer, and sends it back. Both peers
queue incoming candidates until `setRemoteDescription()` completes, then add
them in order, including the final `null`. Handle simultaneous offers and
negotiation collisions in the signaling layer. Receiving a remote offer alone
does not establish media connectivity.

`new RTCSessionDescription({ type, sdp? })` accepts `offer`, `answer`,
`pranswer`, or `rollback`; read-only `type` / `sdp` and `toJSON()` serialize it.
`new RTCIceCandidate(init?)` accepts `candidate`, `sdpMid`, `sdpMLineIndex`,
and `usernameFragment`. `toJSON()` returns those initialization fields. Parsed
fields include `foundation`, `component` (`rtp` / `rtcp`), `protocol` (`udp` /
`tcp`), `priority`, `address`, `port`, and `type` (`host`, `srflx`, `prflx`,
`relay`), `tcpType` (`active`, `passive`, `so`), `relatedAddress`, and
`relatedPort`; unavailable parsed values are `null`.

## Data Channels and Backpressure

Channel options are `ordered`, `protocol`, `negotiated`, `id`, and either
`maxRetransmits` or `maxPacketLifeTime`, never both. Manually negotiated
channels require matching IDs on both peers.

`label`, `id: number | null`, `ordered`, `protocol`, `negotiated`,
`maxRetransmits: number | null`, `maxPacketLifeTime: number | null`,
`readyState`, and `bufferedAmount` are read-only. State is `connecting`,
`open`, `closing`, or `closed`. Set `binaryType` to `'blob'` or `'arraybuffer'`
to choose the binary message payload type.

`send(data)` accepts a string, Blob, or BufferSource (only the view's byte
range) and returns `undefined`. Send only while `readyState === 'open'`.
A message cannot exceed 256 KiB or a smaller negotiated SCTP limit. Excessive
queued data also fails. Use `bufferedAmount`, writable
`bufferedAmountLowThreshold`, and `bufferedamountlow` to pace sending.

Events are `open`, `message` (`event.data`), `error`, `closing`, `close`, and
`bufferedamountlow`, with listeners or `on...` properties. `channel.close()`
requests closure and returns `undefined`.

## Audio and Cleanup

Local capture requires `RECORD_AUDIO` and platform authorization. Browser
targets also require a secure context (HTTPS/localhost). Receiving audio alone
needs no microphone permission. Register `track` before setting the remote
description; remote tracks do not play automatically:

```javascript
const audioContext = new AudioContext();
pc.addEventListener('track', event => {
  const stream = new MediaStream([event.track]);
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(audioContext.destination);
});
const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
for (const track of localStream.getAudioTracks()) pc.addTrack(track, localStream);
// Resume from an allowed user interaction and complete SDP/ICE negotiation.
await audioContext.resume();
```

Senders expose read-only `track`, `getStats()`, and
`replaceTrack(audioTrackOrNull): Promise<void>`. Receivers expose read-only
`track` and `getStats()`. Neither is constructed directly. Transceivers expose
`sender`, `receiver`, `mid`, `currentDirection`, writable `direction`
(`sendrecv`, `sendonly`, `recvonly`, `inactive`), and `stop()`; direction changes
require negotiation.

On Page unload / Widget destruction, close data channels and the peer, stop
local tracks, disconnect playback nodes, and close the audio context.
`pc.close()` ends remote tracks but does not stop local tracks held by the
agent. See [media APIs](./media.md) and [network status](./navigator.md).
