// src/screens/SettingsAccount.tsx
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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.backBtn} aria-label="Retour">
      ←
    </button>
  );
}

export default function SettingsAccount() {
  const [name, setName] = useState("Alex");
  const [email, setEmail] = useState("alex@example.com");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  const save = () => {
    console.log("save account", {
      name,
      email,
      pwd: pwd ? "***" : "(unchanged)",
    });
    setPwd("");
  };

  const goBack = () => {
    navigate("/settings"); // ⬅️ renvoie à SettingsHome
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <div style={styles.topbar}>
        <BackButton onClick={goBack} />
        <h1 style={styles.title}>Compte</h1>
      </div>

      <div style={styles.card} role="form" aria-labelledby="account-form-title">
        <h2 id="account-form-title" style={styles.visuallyHidden}>
          Modifier les informations du compte
        </h2>

        <label style={styles.label}>
          <span>Nom affiché</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            aria-label="Nom affiché"
          />
        </label>

        <label style={styles.label}>
          <span>Adresse e-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            aria-label="Adresse e-mail"
          />
        </label>

        <label style={styles.label}>
          <span>Nouveau mot de passe</span>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            style={styles.input}
            aria-label="Nouveau mot de passe"
          />
        </label>
      </div>

      <button style={styles.save} onClick={save} aria-label="Enregistrer les modifications">
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
    gridTemplateRows: "auto auto auto",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
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
    padding: "clamp(12px, 2.6vw, 16px)",
    display: "grid",
    gap: "clamp(10px, 2.2vw, 14px)",
  },
  label: {
    display: "grid",
    gap: "clamp(6px, 1.4vw, 8px)",
    fontSize: "clamp(13px, 3.2vw, 14px)",
  },
  input: {
    width: "100%",
    padding: "clamp(10px, 2.4vw, 14px) clamp(12px, 2.6vw, 16px)",
    borderRadius: "clamp(12px, 2.6vw, 14px)",
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.white,
    outline: "none",
    fontSize: "clamp(14px, 3.6vw, 16px)",
  },
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
  visuallyHidden: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};
