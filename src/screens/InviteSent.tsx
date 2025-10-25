import React from "react";

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

type Invite = {
  to: string;
  type: string;
  place: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
};

// Démo : données factices
const DEMO: Invite = {
  to: "Emma",
  type: "Café",
  place: "Café de Flore, Paris",
  date: "2025-09-10",
  time: "19:00",
};

function HeartsLogo({ size = 56, stroke = 7 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-label="OnlyUS">
      <path d="M64 41c-18 0-33 15-33 33 0 40 56 64 69 83 13-19 69-43 69-83 0-18-15-33-33-33-13 0-24 7-30 17-6-10-17-17-30-17z"
        stroke={COLORS.coral} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-16 5-20 11-4-6-11-11-20-11z"
        transform="translate(-25,0) scale(0.7)"
        stroke={COLORS.blue} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InviteSent({ invite = DEMO }: { invite?: Invite }) {
  const d = new Date(`${invite.date}T${invite.time}:00`);
  const dateFmt = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const timeFmt = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        {/* En-tête */}
        <div style={styles.header}>
          <HeartsLogo />
          <h1 style={styles.brand}>OnlyUS</h1>
        </div>

        {/* Icône succès */}
        <div style={styles.successWrap} aria-label="Invitation envoyée">
          <div style={styles.successCircle}>
            <svg width="42" height="42" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" fill="none" stroke={COLORS.white} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Texte */}
        <h2 style={styles.title}>Invitation envoyée 🎉</h2>
        <p style={styles.subtitle}>
          Tu as invité <strong>{invite.to}</strong> à un(e) <strong>{invite.type}</strong> au{" "}
          <strong>{invite.place}</strong>, le <strong>{dateFmt}</strong> à <strong>{timeFmt}</strong>.
        </p>

        {/* Carte récap compacte */}
        <div style={styles.card}>
          <Row label="À">{invite.to}</Row>
          <Row label="Type">{invite.type}</Row>
          <Row label="Lieu">{invite.place}</Row>
          <Row label="Quand">{dateFmt} — {timeFmt}</Row>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.secondary} onClick={() => console.log("Voir l’invitation")}>
            Voir l’invitation
          </button>
          <button style={styles.primary} onClick={() => console.log("Retour à la discussion")}>
            Retour à la discussion
          </button>
        </div>

        <button style={styles.linkGhost} onClick={() => console.log("Planifier un autre rendez-vous")}>
          Planifier un autre rendez-vous
        </button>
      </div>

      <div style={styles.homeIndicator} />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{children}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: "grid",
    gridTemplateRows: "1fr auto",
    padding: "20px 16px",
  },
  container: {
    width: "100%",
    maxWidth: 560,
    justifySelf: "center",
    textAlign: "center" as const,
  },
  header: { display: "grid", placeItems: "center", gap: 6, marginBottom: 8 },
  brand: { margin: 0, fontSize: 32, fontWeight: 800 },

  successWrap: { display: "grid", placeItems: "center", marginTop: 4, marginBottom: 8 },
  successCircle: {
    width: 86, height: 86, borderRadius: "50%",
    background: COLORS.coral,
    display: "grid", placeItems: "center",
    boxShadow: "0 14px 36px rgba(255,107,107,0.45)",
  },

  title: { fontSize: 24, fontWeight: 800, margin: "10px 0 6px" },
  subtitle: { fontSize: 14, opacity: 0.95, margin: "0 0 14px" },

  card: {
    textAlign: "left" as const,
    borderRadius: 20,
    padding: "16px 16px",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 14px 50px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  row: { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 15 },
  label: { fontWeight: 700 },
  value: { flex: 1, textAlign: "right" as const },

  actions: { display: "flex", gap: 12, marginTop: 6 },
  secondary: {
    flex: 1,
    background: "transparent",
    border: `2px solid ${COLORS.border}`,
    color: COLORS.white,
    borderRadius: 16,
    padding: "12px 0",
    fontWeight: 700,
    cursor: "pointer",
  },
  primary: {
    flex: 2,
    background: COLORS.coral,
    border: "none",
    color: COLORS.white,
    borderRadius: 16,
    padding: "12px 0",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(255,107,107,0.35)",
  },

  linkGhost: {
    marginTop: 10,
    background: "transparent",
    border: "none",
    color: "#CFE7FF",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: 14,
  },

  homeIndicator: {
    height: 5, width: 120, borderRadius: 999,
    background: "rgba(255,255,255,0.55)", justifySelf: "center",
    marginTop: 10,
  },
};