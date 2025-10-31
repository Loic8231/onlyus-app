// src/screens/MatchClosedNotice.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  white: "#FFFFFF",
  coral: "#FF6B6B",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(180,205,255,0.45)",
};

export default function MatchClosedNotice() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { message?: string } };
  const message = state?.message || "Je préfère qu'on en reste là, bon courage pour la suite.";

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <main style={styles.wrap}>
        <div style={styles.card}>
          <h2 style={styles.title}>Message</h2>
          <blockquote style={styles.quote}>« {message} »</blockquote>
          <button
            onClick={() => navigate("/match-ended", { replace: true })}
            style={styles.primary}
          >
            OK
          </button>
        </div>
      </main>
      <div style={styles.homeIndicator} />
    </div>
  );
}

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
  },
  wrap: { display: "grid", placeItems: "center" },
  card: {
    width: "100%",
    maxWidth: 540,
    borderRadius: 22,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
    padding: "clamp(16px, 3vw, 22px)",
    display: "grid",
    gap: "clamp(10px, 2vw, 14px)",
  },
  title: { margin: 0, fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 800, textAlign: "center" },
  quote: {
    margin: 0,
    padding: "clamp(10px, 2.2vw, 14px)",
    borderRadius: 14,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.05)",
    fontSize: "clamp(14px, 3.6vw, 18px)",
  },
  primary: {
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 14,
    padding: "clamp(10px, 2.6vw, 14px)",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 32px rgba(255,107,107,0.35)",
    fontSize: "clamp(14px, 3.6vw, 16px)",
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
