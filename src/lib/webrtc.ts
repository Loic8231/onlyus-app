// src/lib/webrtc.ts
export type SignalingMessage =
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; from: string; candidate: RTCIceCandidateInit }
  | { type: "hangup"; from: string }
  | { type: "busy"; from: string };

export function createPeerConnection(
  onTrack: (stream: MediaStream) => void,
  onIceCandidate: (c: RTCIceCandidate) => void,
  ice: RTCIceServer[] = [
    { urls: ["stun:stun.l.google.com:19302"] }, // MVP
    // PROD: { urls: "turn:turn.mondomaine.com:3478", username: "user", credential: "pass" }
  ]
) {
  const pc = new RTCPeerConnection({ iceServers: ice });

  pc.ontrack = (ev) => {
    const stream = ev.streams?.[0] ?? new MediaStream([ev.track]);
    onTrack(stream);
  };

  pc.onicecandidate = (ev) => {
    if (ev.candidate) onIceCandidate(ev.candidate);
  };

  return pc;
}
