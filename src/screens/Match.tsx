// src/screens/Match.tsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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

type MatchState = {
  matchId: string;
  me: { id: string; firstName: string; age: number | null };
  other: { id: string; firstName: string; age: number | null };
};

type UserMini = {
  name: string;
  age?: number | null;
  gradient?: [string, string];
  photoUrl?: string;
};

export default function Match() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as MatchState;

  // Marque le match comme "vu" pour l'utilisateur courant
  useEffect(() => {
    (async () => {
      if (!state?.matchId) return;
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) return;

      await supabase
        .from("match_participants")
        .update({ seen: true })
        .eq("match_id", state.matchId)
        .eq("user_id", userId);
    })();
  }, [state?.matchId]);

  if (!state?.matchId) {
    navigate("/discover");
    return null;
  }

  const me: UserMini = { name: state.me.firstName || "Toi", age: state.me.age, gradient: ["#5EFCE8", "#736EFE"] };
  const them: UserMini = { name: state.other.firstName || "•", age: state.other.age, gradient: ["#FBD3E9", "#BB377D"] };

  const handleStartChat = () => {
    // Si tu as un chat ciblé par userId, remplace par navigate(`/chat/${state.other.id}`)
    navigate("/chat");
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <Confetti />

      <div style={styles.card}>
        <div style={styles.titleWrap}>
          <h1 style={styles.title}>C’est un match ! 🎉</h1>
          <p style={styles.subtitle}>
            Vous vous êtes plu. Lance une conversation ou propose un appel vocal.
          </p>
        </div>

        <div style={styles.avatars}>
          <Avatar user={me} />
          <div style={styles.heart} aria-hidden>❤️</div>
          <Avatar user={them} />
        </div>

        <div style={styles.actions}>
          <button style={styles.primary} onClick={handleStartChat}>
            Démarrer la conversation
          </button>
          <button
            style={styles.secondary}
            onClick={() => navigate("/discover")}
          >
            Continuer à découvrir
          </button>
        </div>
      </div>

      <div style={styles.homeIndicator} />
    </div>
  );
}

/* --- Sub-components --- */
function Avatar({ user }: { user: UserMini }) {
  const hasPhoto = Boolean(user.photoUrl);
  return (
    <div style={styles.avatarWrap} title={user.name}>
      <div
        style={{
          ...styles.avatar,
          background: hasPhoto
            ? `url(${user.photoUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${user.gradient?.[0] ?? "#F6D365"}, ${
                user.gradient?.[1] ?? "#FDA085"
              })`,
        }}
        aria-label={`Avatar de ${user.name}${user.age ? `, ${user.age} ans` : ""}`}
      />
      <div style={styles.avatarLabel}>
        <span style={{ fontWeight: 800 }}>{user.name}</span>
        {user.age != null ? <span>&nbsp;•&nbsp;{user.age}</span> : null}
      </div>
    </div>
  );
}

function Confetti() {
  const piece = (i: number): React.CSSProperties => ({
    position: "absolute",
    top: -10,
    left: `${(i * 9) % 100}%`,
    width: 6,
    height: 12,
    borderRadius: 2,
    background: i % 3 === 0 ? COLORS.coral : i % 3 === 1 ? COLORS.blue : "#FFD166",
    opacity: 0.85,
    animation: `fall ${2.8 + (i % 5) * 0.25}s linear ${i * 0.08}s infinite`,
    transform: `rotate(${(i * 37) % 360}deg)`,
  });

  return (
    <div style={styles.confettiWrap} className="confetti-disable-anim" aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={piece(i)} />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(120vh) rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-disable-anim span { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* --- Styles --- */
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100svh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    padding: "clamp(12px, 2.5vw, 20px)",
    display: "grid",
    placeItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  confettiWrap: { position: "absolute", inset: 0, pointerEvents: "none" },
  card: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 24,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 24px 70px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
    padding: "clamp(14px, 2.6vw, 22px)",
    display: "grid",
    gap: "clamp(12px, 2.4vw, 18px)",
    position: "relative",
    zIndex: 1,
  },
  titleWrap: { textAlign: "center", display: "grid", gap: "clamp(4px, 0.8vw, 8px)" },
  title: { margin: 0, fontSize: "clamp(22px, 4.5vw, 30px)", fontWeight: 900, letterSpacing: 0.2, lineHeight: 1.1 },
  subtitle: { margin: 0, opacity: 0.95, fontSize: "clamp(13px, 2.5vw, 15px)", lineHeight: 1.35 },
  avatars: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "clamp(10px, 2.4vw, 16px)", padding: "clamp(6px, 1.2vw, 10px) clamp(4px, 1vw, 8px)" },
  heart: { fontSize: "clamp(22px, 5vw, 34px)", opacity: 0.95 },
  avatarWrap: { display: "grid", justifyItems: "center", gap: "clamp(6px, 1.2vw, 10px)" },
  avatar: {
    width: "clamp(88px, 28vw, 140px)",
    height: "clamp(88px, 28vw, 140px)",
    borderRadius: "50%",
    border: `3px solid ${COLORS.border}`,
    boxShadow: "0 16px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  avatarLabel: { fontSize: "clamp(12px, 2.2vw, 14px)", opacity: 0.95 },
  actions: { display: "grid", gap: "clamp(8px, 1.8vw, 12px)", gridTemplateColumns: "1fr" },
  primary: {
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 16,
    padding: "clamp(12px, 2.8vh, 16px) clamp(14px, 3vw, 18px)",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 32px rgba(255,107,107,0.35)",
    fontSize: "clamp(14px, 3.6vw, 16px)",
  },
  secondary: {
    border: `2px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    color: COLORS.white,
    borderRadius: 14,
    padding: "clamp(10px, 2.4vh, 14px) clamp(12px, 2.8vw, 16px)",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
    fontSize: "clamp(13px, 3.4vw, 15px)",
    backdropFilter: "saturate(120%) blur(2px)",
  },
  homeIndicator: {
    height: "clamp(4px, 0.8vh, 6px)",
    width: "clamp(90px, 28vw, 140px)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.55)",
    position: "absolute",
    bottom: "max(10px, env(safe-area-inset-bottom, 10px))",
    left: "50%",
    transform: "translateX(-50%)",
  },
};
