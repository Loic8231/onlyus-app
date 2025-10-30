// src/hooks/useCall.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { createPeerConnection, SignalingMessage } from "../lib/webrtc";

type UseCallOpts = {
  matchId: string;
  meId: string;
  otherId: string;
};

export function useCall({ matchId, meId, otherId }: UseCallOpts) {
  const channel = useMemo(
    () => supabase.channel(`call:${matchId}`),
    [matchId]
  );

  const [incoming, setIncoming] = useState<boolean>(false); // appel entrant ?
  const [ringing, setRinging] = useState<boolean>(false);   // j'appelle ?
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Souscription au canal
  useEffect(() => {
    channel.subscribe((status) => {
      // console.debug("realtime status", status);
    });

    const handler = (payload: { event: string; payload: any }) => {
      const msg = payload.payload as SignalingMessage;
      if (!msg || (msg as any).from === meId) return;

      switch (msg.type) {
        case "offer":
          setIncoming(true);
          handleRemoteOffer(msg.sdp).catch(console.error);
          break;
        case "answer":
          handleRemoteAnswer(msg.sdp).catch(console.error);
          break;
        case "ice-candidate":
          handleRemoteCandidate(msg.candidate).catch(console.error);
          break;
        case "busy":
          setRinging(false);
          setError("L'utilisateur est occupé");
          cleanupKeepStream();
          break;
        case "hangup":
          hangup();
          break;
      }
    };

    channel.on("broadcast", { event: "signal" }, handler);

    return () => {
      channel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, meId]);

  async function getLocalStream() {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  }

  function send(msg: SignalingMessage) {
    channel.send({ type: "broadcast", event: "signal", payload: msg });
  }

  async function ensurePC() {
    if (pcRef.current) return pcRef.current;

    const pc = createPeerConnection(
      (remote) => {
        remoteStreamRef.current = remote;
        setConnected(true);
      },
      (cand) => send({ type: "ice-candidate", from: meId, candidate: cand.toJSON() })
    );

    // ajoute la piste locale
    const local = await getLocalStream();
    local.getTracks().forEach((t) => pc.addTrack(t, local));

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        hangup();
      }
    };

    pcRef.current = pc;
    return pc;
  }

  async function call() {
    try {
      setRinging(true);
      const pc = await ensurePC();
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);
      send({ type: "offer", from: meId, sdp: offer });
    } catch (e: any) {
      setError(e?.message ?? "Erreur appel");
      setRinging(false);
      cleanupAll();
    }
  }

  async function accept() {
    setIncoming(false);
    // rien à faire ici, le setRemoteDescription s’est fait dans handleRemoteOffer,
    // mais on s’assure que le micro est allumé
    await ensurePC();
  }

  function reject() {
    setIncoming(false);
    send({ type: "busy", from: meId });
    cleanupKeepStream();
  }

  async function handleRemoteOffer(sdp: RTCSessionDescriptionInit) {
    const pc = await ensurePC();
    await pc.setRemoteDescription(sdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    send({ type: "answer", from: meId, sdp: answer });
  }

  async function handleRemoteAnswer(sdp: RTCSessionDescriptionInit) {
    const pc = await ensurePC();
    await pc.setRemoteDescription(sdp);
  }

  async function handleRemoteCandidate(candidate: RTCIceCandidateInit) {
    const pc = await ensurePC();
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      // ignore ice race
    }
  }

  function cleanupAll() {
    pcRef.current?.getSenders().forEach((s) => {
      try { s.track?.stop(); } catch {}
    });
    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    // remote: sera redonnée lors d’un prochain ontrack
    remoteStreamRef.current = null;

    setConnected(false);
    setRinging(false);
    setIncoming(false);
  }

  // garde le micro prêt si on veut relancer vite
  function cleanupKeepStream() {
    pcRef.current?.close();
    pcRef.current = null;
    remoteStreamRef.current = null;
    setConnected(false);
  }

  function hangup() {
    send({ type: "hangup", from: meId });
    cleanupAll();
  }

  return {
    state: { incoming, ringing, connected, error },
    streams: { local: localStreamRef, remote: remoteStreamRef },
    actions: { call, accept, reject, hangup },
  };
}
