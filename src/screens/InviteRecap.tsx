import React, { useState } from "react";

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
  date: string;
  time: string;
  note?: string;
  callBefore: boolean;
  reminder: boolean;
};

// données démo
const DEMO: Invite = {
  to: "Emma",
  type: "Café",
  place: "Café de Flore, Paris",
  date: "2025-09-10",
  time: "19:00",
  note: "On se retrouve devant l’entrée principale 😊",
  callBefore: true,
  reminder: true,
};

export default function InviteRecap({ invite = DEMO }: { invite?: Invite }) {
  const [sending, setSending] = useState(false);

  const send = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      console.log("Invitation envoyée:", invite);
      // aller vers écran "Invitation envoyée"
    }, 1200);
  };

  const d = new Date(`${invite.date}T${invite.time}:00`);
  const dateFmt = d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const timeFmt = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <h1 style={styles.title}>Récapitulatif de l’invitation</h1>

        <div style={styles.card}>
          <div style={styles.row}>
            <span style={styles.label}>À :</span>
            <span style={styles.value}>{invite.to}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Type :</span>
            <span style={styles.value}>{invite.type}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Lieu :</span>
            <span style={styles.value}>{invite.place}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Date :</span>
            <span style={styles.value}>{dateFmt} à {timeFmt}</span>
          </div>
          {invite.note && (
            <div style={styles.note}>
              <span style={styles.label}>Message :</span>
              <p style={styles.value}>{invite.note}</p>
            </div>
          )}
          <div style={styles.options}>
            {invite.callBefore && <span>📞 Appel avant</span>}
            {invite.reminder && <span>⏰ Rappel 1h avant</span>}
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.secondary} onClick={() => console.log("Modifier")}>Modifier</button>
          <button
            style={{ ...styles.primary, opacity: sending ? 0.7 : 1 }}
            onClick={send}
            disabled={sending}
          >
            {sending ? "Envoi…" : "Envoyer l’invitation"}
          </button>
        </div>
      </div>

      <div style={styles.homeIndicator} />
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
  container: { maxWidth: 580, justifySelf: "center", width: "100%" },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 16, textAlign: "center" },

  card: {
    borderRadius: 20,
    padding: "18px 16px",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 14px 50px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 18,
  },
  row: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 15 },
  label: { fontWeight: 700 },
  value: { flex: 1, textAlign: "right" as const },
  note: { display: "flex", flexDirection: "column", gap: 4, marginTop: 6 },
  options: { display: "flex", gap: 12, fontSize: 14, opacity: 0.9, marginTop: 6 },

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

  homeIndicator: {
    height: 5,
    width: 120,
    borderRadius: 999,
    background: "rgba(255,255,255,0.55)",
    marginTop: 10,
    justifySelf: "center",
  },
};
