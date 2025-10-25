// src/screens/Chat.tsx
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
  inputBg: "rgba(255,255,255,0.10)",
  inputBorder: "rgba(255,255,255,0.22)",
};

function HeartsLogo({ size = 22, stroke = 4 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-label="OnlyUS">
      <path
        d="M64 41c-18 0-33 15-33 33 0 40 56 64 69 83 13-19 69-43 69-83 0-18-15-33-33-33-13 0-24 7-30 17-6-10-17-17-30-17z"
        stroke={COLORS.coral}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-16 5-20 11-4-6-11-11-20-11z"
        transform="translate(-25,0) scale(0.7)"
        stroke={COLORS.blue}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* === bouton paramètres === */
function SettingsButton() {
  const navigate = useNavigate();
  return (
    <button
      style={styles.iconBtn}
      title="Paramètres"
      aria-label="Paramètres"
      onClick={() => navigate("/settings")}
    >
      ⚙️
    </button>
  );
}

/* === bouton quitter match === */
function QuitButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      style={styles.iconBtn}
      title="Quitter le match"
      aria-label="Quitter le match"
      onClick={onClick}
    >
      🚪
    </button>
  );
}

type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  ts: number;
};

const seed: Msg[] = [
  { id: "m1", from: "them", text: "Hey 🙂 Ravie de te parler ici !", ts: Date.now() - 1000 * 60 * 7 },
  { id: "m2", from: "me", text: "Salut ! Ton profil m’a donné envie d’écrire 👋", ts: Date.now() - 1000 * 60 * 6 },
  { id: "m3", from: "them", text: "T’es plutôt café ou balade au soleil ?", ts: Date.now() - 1000 * 60 * 5 },
];

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();

  const contact = useMemo(() => ({ name: "Emma, 27", online: true }), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  // auto-grow du textarea pour garder une UX propre sur petit écran
  useEffect(() => {
    if (!areaRef.current) return;
    areaRef.current.style.height = "0px";
    areaRef.current.style.height = Math.min(areaRef.current.scrollHeight, 220) + "px";
  }, [input]);

  const quitMatch = () => {
    navigate("/end-match");
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const mine: Msg = { id: crypto.randomUUID(), from: "me", text, ts: Date.now() };
    setMsgs((arr) => [...arr, mine]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply: Msg = {
        id: crypto.randomUUID(),
        from: "them",
        text: "Ça te dit un vocal pour faire connaissance rapidement ? 🎙️",
        ts: Date.now(),
      };
      setMsgs((arr) => [...arr, reply]);
      setTyping(false);
    }, 1200);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (t: number) => {
    const d = new Date(t);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      {/* Topbar */}
      <header style={styles.topbar}>
        {/* centre : contact */}
        <div style={styles.contactWrap}>
          <div style={styles.avatar}>
            <div style={{ ...styles.avatarPhoto, background: "linear-gradient(135deg,#FBD3E9,#BB377D)" }} />
            <span style={{ ...styles.dot, background: contact.online ? "#4ADE80" : "#A3A3A3" }} />
          </div>
          <div>
            <div style={styles.contactName}>{contact.name}</div>
            <div style={styles.contactStatus}>{contact.online ? "En ligne" : "Hors ligne"}</div>
          </div>
        </div>

        {/* droite : actions + paramètres + quitter */}
        <div style={styles.actions}>
          {/* 🔗 Appel vocal -> /voice-call */}
          <button
            style={styles.iconBtn}
            title="Appel vocal"
            aria-label="Appel vocal"
            onClick={() => navigate("/voice-call")}
          >
            🎧
          </button>

          {/* 🔗 Voir profil -> /profile-details */}
          <button
            style={styles.iconBtn}
            title="Voir profil"
            aria-label="Voir profil"
            onClick={() => navigate("/profile-details")}
          >
            <HeartsLogo />
          </button>

          <SettingsButton />
          <QuitButton onClick={quitMatch} />
        </div>
      </header>

      {/* Messages */}
      <main style={styles.chatArea}>
        {msgs.map((m) => (
          <div
            key={m.id}
            style={{ ...styles.row, justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.from === "me" ? styles.mine : styles.theirs),
              }}
            >
              <div style={styles.text}>{m.text}</div>
              <div style={styles.time}>{formatTime(m.ts)}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ ...styles.row, justifyContent: "flex-start" }}>
            <div style={{ ...styles.bubble, ...styles.theirs }}>
              <Typing />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Composer */}
      <footer style={styles.composer}>
        <button
          style={styles.smallIcon}
          title="Ajouter un média"
          aria-label="Ajouter un média"
          onClick={() => console.log("Media")}
        >
          ＋
        </button>
        <textarea
          ref={areaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          style={styles.input}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: input.trim() ? 1 : 0.6,
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
          title="Envoyer"
          aria-label="Envoyer"
        >
          ➤
        </button>
      </footer>
    </div>
  );
}

function Typing() {
  const dot: React.CSSProperties = {
    width: "clamp(5px, 0.9vw, 6px)",
    height: "clamp(5px, 0.9vw, 6px)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.9)",
    display: "inline-block",
    marginRight: 4,
    animation: "blink 1.2s infinite",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ ...dot, animationDelay: "0ms" }} />
      <span style={{ ...dot, animationDelay: "200ms" }} />
      <span style={{ ...dot, animationDelay: "400ms" }} />
      <style>{`@keyframes blink{0%{opacity:.2}50%{opacity:1}100%{opacity:.2}}`}</style>
      <span style={{ fontSize: "clamp(10px, 2vw, 12px)", opacity: 0.9 }}>écrit…</span>
    </div>
  );
}

/* === Styles : responsive + clamp + safe areas === */
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100svh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    padding: "clamp(8px, 2vw, 14px)",
    paddingBottom: "max(clamp(8px,2vw,14px), env(safe-area-inset-bottom, 10px))",
    gap: "clamp(6px, 1.6vw, 12px)",
  },

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(8px, 1.8vw, 12px) clamp(10px, 2.2vw, 14px)",
    borderRadius: "clamp(12px, 2.4vw, 16px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
    gap: "clamp(6px, 1.6vw, 10px)",
  },
  contactWrap: { display: "flex", alignItems: "center", gap: "clamp(8px, 1.8vw, 12px)", flex: 1 },
  avatar: { position: "relative" as const, width: "clamp(32px, 6vw, 40px)", height: "clamp(32px, 6vw, 40px)" },
  avatarPhoto: { width: "100%", height: "100%", borderRadius: "50%" },
  dot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: "clamp(8px, 1.8vw, 12px)",
    height: "clamp(8px, 1.8vw, 12px)",
    borderRadius: 999,
    border: "2px solid #0B2A5A",
  },
  contactName: { fontWeight: 800, letterSpacing: 0.2, fontSize: "clamp(14px, 3.6vw, 16px)" },
  contactStatus: { fontSize: "clamp(11px, 2.8vw, 12px)", opacity: 0.8 },

  actions: { display: "flex", alignItems: "center", gap: "clamp(6px, 1.6vw, 10px)" },
  iconBtn: {
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    color: COLORS.white,
    borderRadius: "clamp(10px, 2vw, 12px)",
    padding: "clamp(4px, 1vw, 6px) clamp(6px, 1.4vw, 8px)",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
    fontSize: "clamp(16px, 3.6vw, 20px)",
  },

  chatArea: {
    overflowY: "auto" as const,
    padding: "clamp(4px, 1vw, 8px) clamp(2px, 0.8vw, 6px)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "clamp(6px, 1.6vw, 10px)",
  },
  row: { display: "flex" },
  bubble: {
    maxWidth: "min(78%, 620px)",
    padding: "clamp(8px, 1.8vw, 12px) clamp(10px, 2.2vw, 14px) clamp(6px, 1.6vw, 10px)",
    borderRadius: "clamp(12px, 2.6vw, 16px)",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    lineHeight: 1.45,
    position: "relative",
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    boxShadow: "0 6px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  mine: {
    background: COLORS.coral,
    borderColor: "transparent",
    color: COLORS.white,
    boxShadow: "0 10px 20px rgba(255,107,107,0.35)",
  },
  theirs: {
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
  },
  text: { whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const },
  time: {
    fontSize: "clamp(10px, 2.6vw, 12px)",
    opacity: 0.8,
    marginTop: "clamp(3px, 0.8vw, 4px)",
    textAlign: "right" as const,
  },

  composer: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "end",
    gap: "clamp(6px, 1.6vw, 10px)",
    padding: "clamp(6px, 1.6vw, 10px)",
    borderRadius: "clamp(12px, 2.4vw, 16px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  smallIcon: {
    border: "none",
    background: "transparent",
    color: COLORS.white,
    fontSize: "clamp(18px, 4.4vw, 22px)",
    cursor: "pointer",
    padding: "clamp(2px, 0.6vw, 4px)",
    lineHeight: 1,
  },
  input: {
    width: "100%",
    resize: "none" as const,
    overflow: "hidden", // ← enlève les flèches/scrollbars
    background: COLORS.inputBg,
    border: `1px solid ${COLORS.inputBorder}`,
    color: COLORS.text,
    borderRadius: "clamp(10px, 2.2vw, 12px)",
    padding: "clamp(9px, 2.2vw, 12px) clamp(10px, 2.4vw, 14px)",
    outline: "none",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    lineHeight: 1.35,
    maxHeight: "clamp(110px, 24vh, 220px)",
  },
  sendBtn: {
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: "clamp(10px, 2.2vw, 12px)",
    padding: "clamp(8px, 2vw, 10px) clamp(10px, 2.4vw, 12px)",
    fontWeight: 800,
    boxShadow: "0 10px 22px rgba(255,107,107,0.35)",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    lineHeight: 1,
  },
};