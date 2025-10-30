// src/screens/SettingsHelp.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  white: "#FFFFFF",
  coral: "#FF6B6B",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.18)",
  textSoft: "#EAF0FF",
};

type Faq = { q: string; a: string };

const FAQ: Faq[] = [
  { q: "Je ne reçois pas le code de vérification", a: "Vérifie ton dossier spam, attends 60 secondes puis renvoie le code. Assure-toi que l’adresse e-mail est correcte." },
  { q: "Comment supprimer mon compte ?", a: "Va dans Paramètres → Compte → Supprimer mon compte. Cette action est définitive." },
  { q: "Comment bloquer ou signaler un utilisateur ?", a: "Ouvre sa fiche profil, puis menu ⋯ → Bloquer ou Signaler. Tu peux aussi depuis la conversation." },
  { q: "Mes notifications ne s’affichent pas", a: "Vérifie Paramètres → Notifications et les autorisations de ton navigateur/appareil pour OnlyUS." },
  { q: "Quelles sont les règles de sécurité ?", a: "Ne partage jamais d’informations sensibles, rencontre dans un lieu public, préviens un proche et utilise l’appel vocal avant." },
];

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.backBtn} aria-label="Retour">
      ←
    </button>
  );
}

export default function SettingsHelp() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const canSend = subject.trim().length > 2 && message.trim().length > 5;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  // Ouvre le client e-mail local avec sujet + message
  const sendEmail = () => {
    if (!canSend) return;
    const to = "only.usfrapp@gmail.com";
    const subj = `[OnlyUS] ${subject.trim()}`;
    const body = message.trim();

    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
      subj
    )}&body=${encodeURIComponent(body)}`;

    // Redirection vers le client e-mail
    window.location.href = url;
  };

  const goBack = () => navigate("/settings");

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <div style={styles.topbar}>
        <BackButton onClick={goBack} />
        <h1 style={styles.title}>Aide & support</h1>
      </div>

      {/* FAQ + recherche */}
      <div style={styles.card}>
        <label style={styles.label}>
          <span>Rechercher dans la FAQ</span>
          <input
            placeholder="Ex. notifications, code, bloquer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.input}
            aria-label="Rechercher dans la FAQ"
          />
        </label>

        <div style={{ display: "grid", gap: "clamp(6px,1.6vw,8px)" }}>
          {results.map((item, i) => {
            const active = openIdx === i;
            const panelId = `faq-panel-${i}`;
            const headerId = `faq-header-${i}`;
            return (
              <div key={item.q} style={styles.faqItem}>
                <button
                  id={headerId}
                  onClick={() => setOpenIdx(active ? null : i)}
                  style={styles.faqHeader}
                  aria-expanded={active}
                  aria-controls={panelId}
                >
                  <span>{item.q}</span>
                  <span style={{ opacity: 0.85, fontSize: "clamp(18px,5vw,22px)" }}>
                    {active ? "−" : "+"}
                  </span>
                </button>
                {active && (
                  <div id={panelId} role="region" aria-labelledby={headerId} style={styles.faqBody}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
          {results.length === 0 && (
            <div style={styles.empty}>
              Aucun résultat pour “{query}”.
            </div>
          )}
        </div>
      </div>

      {/* Contacter le support */}
      <div style={styles.card}>
        <h2 style={styles.h2}>Contacter le support</h2>
        <label style={styles.label}>
          <span>Sujet</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Un petit résumé du problème"
            style={styles.input}
            aria-label="Sujet"
          />
        </label>
        <label style={styles.label}>
          <span>Message</span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Décris ce qui se passe, captures d’écran, étapes pour reproduire…"
            style={styles.textarea}
            aria-label="Message"
          />
        </label>

        <div style={styles.actions}>
          <button
            onClick={sendEmail}
            disabled={!canSend}
            style={{
              ...styles.primary,
              opacity: canSend ? 1 : 0.6,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
            aria-label="Envoyer un e-mail au support"
          >
            Envoyer par e-mail
          </button>
        </div>
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
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 2vw, 12px)",
    marginBottom: "clamp(2px, 0.8vw, 4px)",
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
    flex: 1,
    textAlign: "center",
    lineHeight: 1.1,
  },

  card: {
    borderRadius: "clamp(14px, 3vw, 20px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 14px 44px rgba(0,0,0,0.35)",
    padding: "clamp(12px, 2.6vw, 16px)",
    display: "grid",
    gap: "clamp(8px, 2vw, 12px)",
  },

  label: { display: "grid", gap: "clamp(6px,1.4vw,8px)", fontSize: "clamp(13px,3.2vw,14px)" },
  input: {
    width: "100%",
    padding: "clamp(10px, 2.4vw, 14px) clamp(12px, 2.6vw, 16px)",
    borderRadius: "clamp(12px, 2.6vw, 14px)",
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.textSoft,
    outline: "none",
    fontSize: "clamp(14px, 3.6vw, 16px)",
  },
  textarea: {
    width: "100%",
    padding: "clamp(10px, 2.4vw, 14px) clamp(12px, 2.6vw, 16px)",
    borderRadius: "clamp(12px, 2.6vw, 14px)",
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.textSoft,
    outline: "none",
    fontSize: "clamp(14px, 3.4vw, 15px)",
    resize: "vertical",
    minHeight: "clamp(84px, 18vh, 160px)",
  },

  faqItem: {
    borderRadius: "clamp(10px, 2.4vw, 14px)",
    border: `1px solid ${COLORS.border}`,
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
  },
  faqHeader: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: COLORS.white,
    padding: "clamp(10px, 2.4vw, 14px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "clamp(14px, 3.8vw, 16px)",
  },
  faqBody: {
    padding: "0 clamp(10px, 2.4vw, 14px) clamp(10px, 2.4vw, 14px)",
    opacity: 0.95,
    lineHeight: 1.45,
    fontSize: "clamp(13px, 3.2vw, 14px)",
  },
  empty: { opacity: 0.9, fontStyle: "italic" },

  h2: { margin: "clamp(2px,0.6vw,4px) 0 0", fontSize: "clamp(16px,4.6vw,18px)", fontWeight: 800 },

  actions: { display: "flex", gap: "clamp(8px, 2vw, 12px)", marginTop: "clamp(2px,0.6vw,4px)" },
  primary: {
    flex: 1,
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: "clamp(12px, 3vw, 14px)",
    padding: "clamp(10px, 2.6vw, 12px)",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(255,107,107,0.35)",
  },

  homeIndicator: {
    height: "clamp(4px, 0.8vh, 6px)",
    width: "clamp(90px, 28vw, 140px)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.55)",
    justifySelf: "center",
    marginTop: "clamp(4px, 1.2vw, 8px)",
  },
};
