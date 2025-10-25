// src/screens/SettingsNotifications.tsx
import React, { useState } from "react";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  white: "#FFFFFF",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.18)",
  coral: "#FF6B6B",
};

/* >>> Bouton retour entouré <<< */
function BackButton({ onBack }: { onBack?: () => void }) {
  return (
    <button
      onClick={onBack ?? (() => window.history.back())}
      style={styles.backBtn}
      aria-label="Retour"
      title="Retour"
    >
      ←
    </button>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label={label ? `${label} ${checked ? "activé" : "désactivé"}` : undefined}
      style={{
        width: "clamp(44px, 9.6vw, 56px)",
        height: "clamp(24px, 5.6vw, 30px)",
        borderRadius: 999,
        border: "none",
        background: checked ? COLORS.coral : "rgba(255,255,255,0.25)",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "clamp(2px, 0.6vw, 4px)",
          left: checked
            ? "calc(100% - clamp(22px, 4.8vw, 26px) - clamp(2px, 0.6vw, 4px))"
            : "clamp(2px, 0.6vw, 4px)",
          width: "clamp(20px, 4.4vw, 26px)",
          height: "clamp(20px, 4.4vw, 26px)",
          borderRadius: "50%",
          background: COLORS.white,
          transition: "left .18s",
        }}
      />
    </button>
  );
}

function Row({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={styles.row}>
      <div>
        <div style={styles.rowTitle}>{title}</div>
        {subtitle && <div style={styles.rowSub}>{subtitle}</div>}
      </div>
      <Switch checked={value} onChange={onChange} label={title} />
    </div>
  );
}

export default function SettingsNotifications() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(false);
  const [reminder, setReminder] = useState(true);
  const [sounds, setSounds] = useState(true);

  const save = () => {
    console.log("save notifications", { push, email, reminder, sounds });
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      {/* Header avec bouton retour entouré */}
      <div style={styles.headerRow}>
        <BackButton />
        <h1 style={styles.title}>Notifications</h1>
        <div style={styles.headerSpacer} />
      </div>

      <div style={styles.card}>
        <Row
          title="Notifications push"
          subtitle="Messages, likes, matchs"
          value={push}
          onChange={setPush}
        />
        <Row
          title="E-mails"
          subtitle="Récap, infos importantes"
          value={email}
          onChange={setEmail}
        />
      </div>

      <button style={styles.save} onClick={save} aria-label="Enregistrer les préférences">
        Enregistrer
      </button>
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
    padding: "clamp(10px, 2.6vw, 18px) clamp(10px, 2.6vw, 16px)",
    paddingBottom:
      "max(clamp(10px,2.6vw,18px), env(safe-area-inset-bottom, 12px))",
    display: "grid",
    gap: "clamp(8px, 2vw, 14px)",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "clamp(6px, 1.6vw, 10px)",
  },
  backBtn: {
    display: "grid",
    placeItems: "center",
    width: "clamp(30px, 7.2vw, 40px)",
    height: "clamp(30px, 7.2vw, 40px)",
    borderRadius: "clamp(10px, 2vw, 12px)",
    cursor: "pointer",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 8px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
    color: COLORS.white,
    fontSize: "clamp(16px, 4.6vw, 20px)",
    lineHeight: 1,
  },
  headerSpacer: { width: "clamp(22px, 5vw, 28px)" },

  title: {
    margin: 0,
    fontSize: "clamp(18px, 5vw, 22px)",
    fontWeight: 800,
    textAlign: "center",
    lineHeight: 1.1,
  },

  card: {
    borderRadius: "clamp(14px, 3vw, 20px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 14px 44px rgba(0,0,0,0.35)",
    overflow: "hidden",
  },
  row: {
    padding: "clamp(10px, 2.4vw, 14px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "clamp(8px, 2vw, 12px)",
  },
  rowTitle: { fontWeight: 700, fontSize: "clamp(14px, 3.8vw, 16px)" },
  rowSub: { opacity: 0.9, fontSize: "clamp(12px, 3.4vw, 13px)", marginTop: 2 },

  save: {
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: "clamp(12px, 3vw, 16px)",
    padding: "clamp(10px, 2.6vw, 12px) clamp(16px, 3.6vw, 20px)",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(255,107,107,0.35)",
    justifySelf: "center",
    minWidth: "clamp(180px, 48vw, 240px)",
    fontSize: "clamp(14px, 3.8vw, 16px)",
  },
};
