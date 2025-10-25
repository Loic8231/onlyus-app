// src/screens/SettingsPrivacy.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  white: "#FFFFFF",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.18)",
  coral: "#FF6B6B",
};

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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.backBtn} aria-label="Retour">
      ←
    </button>
  );
}

export default function SettingsPrivacy() {
  const [hideAge, setHideAge] = useState(false);
  const [hideDistance, setHideDistance] = useState(false);
  const [preciseLocation, setPreciseLocation] = useState(true);

  const navigate = useNavigate();

  const save = () =>
    console.log("save privacy", { hideAge, hideDistance, preciseLocation });

  const goBack = () => navigate("/settings");

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <div style={styles.topbar}>
        <BackButton onClick={goBack} />
        <h1 style={styles.title}>Confidentialité & sécurité</h1>
      </div>

      <div style={styles.card}>
        <div style={styles.row}>
          <div>
            <div style={styles.rowTitle}>Masquer mon âge</div>
          </div>
          <Switch checked={hideAge} onChange={setHideAge} label="Masquer mon âge" />
        </div>

        <div style={styles.row}>
          <div>
            <div style={styles.rowTitle}>Masquer la distance</div>
          </div>
          <Switch
            checked={hideDistance}
            onChange={setHideDistance}
            label="Masquer la distance"
          />
        </div>

        <div style={styles.row}>
          <div>
            <div style={styles.rowTitle}>Localisation précise</div>
            <div style={styles.rowSub}>
              Désactive pour n’afficher qu’une zone approximative
            </div>
          </div>
          <Switch
            checked={preciseLocation}
            onChange={setPreciseLocation}
            label="Localisation précise"
          />
        </div>
      </div>

      {/* conteneur pour centrer */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "clamp(6px,1.6vw,10px)" }}>
        <button type="button" style={styles.save} onClick={save} aria-label="Enregistrer les préférences de confidentialité">
          Enregistrer
        </button>
      </div>

      <div style={styles.homeIndicator} />
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
  topbar: { display: "flex", alignItems: "center", gap: "clamp(8px,2vw,12px)" },
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
    fontSize: "clamp(18px, 5vw, 22px)",
    fontWeight: 800,
    textAlign: "center",
    flex: 1,
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
    borderRadius: "clamp(16px, 5.6vw, 22px)",
    padding: "clamp(12px, 3.4vw, 16px) clamp(16px, 4vw, 20px)",
    fontSize: "clamp(16px, 4.8vw, 20px)",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 28px rgba(255,107,107,0.35)",
    width: "min(92vw, 460px)",
    height: "clamp(44px, 7.2vh, 56px)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    justifySelf: "center",
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
