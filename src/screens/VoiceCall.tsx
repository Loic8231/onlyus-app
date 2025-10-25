// src/screens/VoiceCall.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  coral: "#FF6B6B",
  blue: "#11A7FF",
  white: "#FFFFFF",
  text: "#EAF0FF",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.18)",
};

export default function VoiceCall() {
  const navigate = useNavigate();
  const contact = useMemo(() => ({ name: "Emma", age: 27 }), []);
  const [connecting, setConnecting] = useState(true);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setConnecting(false);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    }, 1200);
    return () => {
      clearTimeout(t);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const hangUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigate("/chat", { replace: true });
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      {/* Corps */}
      <main style={styles.wrap}>
        <div style={styles.card} aria-live="polite">
          <div style={styles.avatarWrap}>
            <div style={styles.ring} className="ring" />
            <div
              style={{
                ...styles.avatar,
                background: "linear-gradient(135deg,#FBD3E9,#BB377D)",
              }}
              aria-label={`${contact.name}, ${contact.age} ans`}
            />
          </div>

          <h2 style={styles.name}>
            {contact.name}, {contact.age}
          </h2>
          <div style={styles.status}>
            {connecting ? "Connexion…" : `${mm}:${ss}`}
          </div>

          <div style={styles.controls}>
            <button
              onClick={() => setMuted((v) => !v)}
              style={{
                ...styles.ctrlBtn,
                borderColor: muted ? "transparent" : COLORS.border,
                background: muted
                  ? COLORS.coral
                  : `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
              }}
              title={muted ? "Activer le micro" : "Couper le micro"}
              aria-pressed={muted}
              aria-label={muted ? "Activer le micro" : "Couper le micro"}
            >
              {muted ? "🎙️✖︎" : "🎙️"}
            </button>

            <button
              onClick={() => setSpeaker((v) => !v)}
              style={{
                ...styles.ctrlBtn,
                borderColor: speaker ? "transparent" : COLORS.border,
                background: speaker
                  ? COLORS.coral
                  : `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
              }}
              title={speaker ? "Désactiver haut-parleur" : "Activer haut-parleur"}
              aria-pressed={speaker}
              aria-label={speaker ? "Désactiver haut-parleur" : "Activer haut-parleur"}
            >
              🔊
            </button>

            <button
              onClick={hangUp}
              style={{ ...styles.ctrlBtn, background: "#E84545", borderColor: "transparent" }}
              title="Raccrocher"
              aria-label="Raccrocher"
            >
              ⛔
            </button>
          </div>
        </div>
      </main>

      <div style={styles.homeIndicator} />

      <style>{`
  .ring { animation: pulse 1.8s ease-in-out ${connecting ? "infinite" : "none"}; }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.06); opacity: 1; }
    100% { transform: scale(1); opacity: 0.5; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ring { animation: none !important; }
  }
`}</style>

    </div>
  );
}

/* === Styles : responsive + clamp + safe areas === */
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100svh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: "grid",
    gridTemplateRows: "1fr auto",
    padding: "clamp(12px, 2.8vw, 18px)",
    paddingBottom: "max(clamp(10px,2.6vw,16px), env(safe-area-inset-bottom, 10px))",
  },
  wrap: { display: "grid", placeItems: "center" },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: "clamp(18px, 3.2vw, 24px)",
    padding: "clamp(18px, 3.2vw, 24px) clamp(14px, 2.6vw, 20px) clamp(14px, 2.6vw, 20px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 24px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
    textAlign: "center",
    display: "grid",
    gap: "clamp(8px, 1.8vw, 12px)",
  },
  avatarWrap: {
    position: "relative",
    width: "clamp(120px, 34vw, 168px)",
    height: "clamp(120px, 34vw, 168px)",
    margin: "clamp(4px, 0.8vw, 8px) auto clamp(8px, 1.6vw, 12px)",
  },
  ring: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background:
      "radial-gradient(closest-side, rgba(255,255,255,0.15), rgba(255,255,255,0) 70%)",
    filter: "blur(0.5px)",
  },
  avatar: {
    position: "absolute",
    inset: "clamp(10px, 1.8vw, 14px)",
    borderRadius: "50%",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  name: {
    margin: "clamp(6px, 1.2vw, 10px) 0 0",
    fontSize: "clamp(18px, 4.6vw, 24px)",
    fontWeight: 800,
    lineHeight: 1.1,
  },
  status: {
    fontSize: "clamp(12px, 3.2vw, 14px)",
    opacity: 0.9,
    marginBottom: "clamp(6px, 1.2vw, 10px)",
  },
  controls: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "clamp(8px, 1.8vw, 12px)",
    marginTop: "clamp(4px, 0.8vw, 8px)",
  },
  ctrlBtn: {
    borderRadius: "clamp(12px, 2.4vw, 16px)",
    padding: "clamp(10px, 2.4vw, 14px) 0",
    fontSize: "clamp(16px, 4.2vw, 22px)",
    fontWeight: 800,
    cursor: "pointer",
    border: `2px solid ${COLORS.border}`,
    color: COLORS.white,
    boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  },
  homeIndicator: {
    height: "clamp(4px, 0.8vh, 6px)",
    width: "clamp(90px, 28vw, 140px)",
    borderRadius: 999,
    justifySelf: "center",
    background: "rgba(255,255,255,0.55)",
    marginTop: "clamp(8px, 1.6vw, 12px)",
  },
};

