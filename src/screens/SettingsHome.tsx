// src/screens/SettingsHome.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  white: "#FFFFFF",
  coral: "#FF6B6B",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.18)",
};

function Row({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick} style={styles.row} aria-label={subtitle ? `${title} — ${subtitle}` : title}>
      <div>
        <div style={styles.rowTitle}>{title}</div>
        {subtitle && <div style={styles.rowSub}>{subtitle}</div>}
      </div>
      <div style={styles.chev} aria-hidden>
        ›
      </div>
    </button>
  );
}

export default function SettingsHome() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/discover"); // ⬅️ renvoie toujours vers Discover
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <div style={styles.header}>
        <button onClick={goBack} style={styles.backBtn} aria-label="Retour">
          ←
        </button>
        <h1 style={styles.title}>Paramètres</h1>
      </div>

      <div style={styles.card}>
        <Row
          title="Compte"
          subtitle="Nom, e-mail, mot de passe"
          onClick={() => navigate("/user-profile")}
        />
        <Row
          title="Notifications"
          subtitle="Push, e-mails, rappels"
          onClick={() => navigate("/settings/notifications")}
        />
      </div>

      <div style={styles.card}>
        <Row
          title="Aide & support"
          subtitle="FAQ, contacter"
          onClick={() => navigate("/settings/help")}
        />
        <Row
          title="À propos"
          subtitle="Version, mentions"
          onClick={() => navigate("/about")}
        />
      </div>
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
    padding: "clamp(10px, 2.4vw, 18px) clamp(10px, 2.4vw, 16px)",
    paddingBottom:
      "max(clamp(10px,2.4vw,18px), env(safe-area-inset-bottom, 12px))",
    display: "grid",
    gridTemplateRows: "auto auto auto auto 1fr auto",
    gap: "clamp(8px, 2vw, 14px)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(8px, 2vw, 12px)",
  },
  backBtn: {
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    borderRadius: "clamp(10px, 2vw, 12px)",
    padding: "clamp(4px, 1vw, 6px) clamp(8px, 1.8vw, 10px)",
    fontSize: "clamp(16px, 4vw, 18px)",
    cursor: "pointer",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
    color: COLORS.white,
  },
  title: {
    margin: 0,
    fontSize: "clamp(18px, 5vw, 24px)",
    fontWeight: 800,
    flex: 1,
    textAlign: "center",
  },

  card: {
    borderRadius: "clamp(14px, 3vw, 20px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 14px 44px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  row: {
    width: "100%",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "clamp(8px, 2vw, 12px)",
    padding: "clamp(10px, 2.4vw, 14px)",
    background: "transparent",
    border: "none",
    color: COLORS.white,
    cursor: "pointer",
  },
  rowTitle: { fontWeight: 700, fontSize: "clamp(14px, 3.8vw, 16px)" },
  rowSub: { opacity: 0.9, fontSize: "clamp(12px, 3.4vw, 13px)", marginTop: 2 },
  chev: { opacity: 0.8, fontSize: "clamp(18px, 5vw, 22px)" },

  logout: {
    border: `2px solid ${COLORS.border}`,
    background: "transparent",
    color: COLORS.white,
    borderRadius: "clamp(12px, 3vw, 14px)",
    padding: "clamp(10px, 2.6vw, 12px)",
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
  },
  danger: {
    border: "none",
    background: "#E84545",
    color: COLORS.white,
    borderRadius: "clamp(12px, 3vw, 14px)",
    padding: "clamp(10px, 2.6vw, 12px)",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(232,69,69,0.35)",
    width: "100%",
  },

  homeIndicator: {
    height: "clamp(4px, 0.8vh, 6px)",
    width: "clamp(90px, 28vw, 140px)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.55)",
    justifySelf: "center",
    marginTop: "clamp(6px, 1.6vw, 10px)",
  },
};
