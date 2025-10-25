// src/screens/Rules.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  bg1: "#0B2A5A",
  bg2: "#102F6A",
  coral: "#FF6B6B",
  blue: "#11A7FF",
  white: "#FFFFFF",
  bulletBg: "rgba(255, 107, 107, 0.18)",
};

function HeartsLogo({
  size = 75,
  stroke = 12,
}: {
  size?: number;
  stroke?: number;
}) {
  return (
    <svg
      width={size * 2}
      height={size * 2}
      viewBox="0 0 300 250"
      fill="none"
      aria-label="OnlyUS"
    >
      <path
        d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-19 5-25 11-6-6-16-11-25-11z"
        transform="translate(10,-28) scale(1.17)"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-19 5-25 11-6-6-16-11-25-11z"
        transform="translate(-110,-70) scale(1.5)"
        fill="none"
        stroke={COLORS.coral}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="140"
        y="210"
        textAnchor="middle"
        fontSize="60"
        fontWeight="800"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        fill={COLORS.white}
      >
        OnlyUS
      </text>
    </svg>
  );
}

function CheckBullet({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.ruleRow}>
      <div style={styles.bullet}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke={COLORS.white}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={styles.ruleText}>{children}</div>
    </div>
  );
}

export default function Rules() {
  const navigate = useNavigate();

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.header}>
          <HeartsLogo />
        </div>

        <h2 style={styles.title}>Le concept</h2>

        <div style={styles.rulesList}>
          <CheckBullet>
            Une seule conversation à la fois,
            <br /> pour connecter vraiment
          </CheckBullet>
          <CheckBullet>Appel vocal avant chaque date</CheckBullet>
          <CheckBullet>Sécurisé &amp; sans spam</CheckBullet>
        </div>

        <button style={styles.cta} onClick={() => navigate("/signup-email")}>
          Suivant
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100vh",
    background: `radial-gradient(1200px 800px at 50% -200px, #163873 0%, ${COLORS.bg2} 40%, ${COLORS.bg1} 100%)`,
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: COLORS.white,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    padding: "24px 22px 20px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    boxShadow:
      "0 14px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  header: { display: "grid", placeItems: "center", marginBottom: 6 },
  title: {
    margin: "18px 0 10px",
    fontSize: 26,
    fontWeight: 800,
    textAlign: "center",
  },
  rulesList: {
    marginTop: 16,
    marginBottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    alignItems: "flex-start",
  },
  ruleRow: { display: "flex", alignItems: "center", gap: 12 },
  bullet: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: "999px",
    background: COLORS.coral,
    display: "grid",
    placeItems: "center",
    boxShadow:
      "0 4px 12px rgba(255,107,107,0.35), inset 0 2px 0 rgba(255,255,255,0.25)",
  },
  ruleText: {
    fontSize: 16,
    lineHeight: 1.35,
    fontWeight: 500,
    textAlign: "left",
  },
  cta: {
    width: "100%",
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 24,
    padding: "12px 18px",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(255,107,107,0.35)",
    marginTop: 4,
  },
};
