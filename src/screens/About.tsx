// src/screens/About.tsx
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

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={styles.backBtn} aria-label="Retour">
      ←
    </button>
  );
}

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export default function About() {
  const navigate = useNavigate();
  const appVersion = "0.1.0-beta";

  const sections: Section[] = useMemo(
    () => [
      {
        id: "terms",
        title: "Conditions Générales d’Utilisation (CGU)",
        content: (
          <div>
            <p>
              L’utilisation d’OnlyUS implique l’acceptation des présentes CGU. Tu t’engages
              à respecter les règles de courtoisie, à ne pas publier de contenu illicite,
              et à utiliser l’app conformément aux lois applicables.
            </p>
            <ul>
              <li>Tu as au moins 18 ans.</li>
              <li>Un (1) seul compte par personne.</li>
              <li>Aucun harcèlement, contenu haineux, ni spam.</li>
              <li>OnlyUS peut suspendre/supprimer un compte en cas d’abus.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "privacy",
        title: "Politique de confidentialité",
        content: (
          <div>
            <p>
              OnlyUS collecte uniquement les données nécessaires au fonctionnement du service
              (ex. e-mail, profil, préférences). Tu peux demander l’accès, la rectification ou
              la suppression de tes données.
            </p>
            <ul>
              <li>Nous ne vendons pas tes données.</li>
              <li>Chiffrement en transit (HTTPS).</li>
              <li>Paramètres de confidentialité dans l’app.</li>
            </ul>
          </div>
        ),
      },
      {
        id: "legal",
        title: "Mentions légales",
        content: (
          <div>
            <p>
              Éditeur : <strong>OnlyUS</strong> (projet en version test).<br />
              Hébergement : <strong>Vercel/Netlify/…</strong> (à préciser).<br />
              Contact :{" "}
              <a href="mailto:support@onlyus.app" style={styles.link}>
                only.usfrapp@gmail.com
              </a>
            </p>
          </div>
        ),
      },
      {
        id: "contact",
        title: "Contact & Support",
        content: (
          <div>
            <p>Pour toute question ou signalement :</p>
            <ul>
              <li>
                E-mail :{" "}
                <a href="mailto:support@onlyus.app" style={styles.link}>
                  only.usfrapp@gmail.com
                </a>
              </li>
              <li>Dans l’app : Paramètres → Aide & Support</li>
            </ul>
          </div>
        ),
      },
      {
        id: "version",
        title: "Version de l’application",
        content: (
          <div>
            <p>
              OnlyUS <strong>{appVersion}</strong> — build bêta, destiné aux tests utilisateurs.
            </p>
            <p style={{ opacity: 0.9 }}>
              Merci pour tes retours : ils nous aident à améliorer l’app avant le lancement officiel.
            </p>
          </div>
        ),
      },
    ],
    [appVersion]
  );

  const [open, setOpen] = useState<string>("terms");
  const toggle = (id: string) => setOpen((cur) => (cur === id ? "" : id));

  const goBack = () => {
    navigate("/settings");
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <div style={styles.topbar}>
        <BackButton onClick={goBack} />
        <h1 style={styles.title}>À propos • Mentions légales</h1>
      </div>

      {/* Carte intro */}
      <div style={styles.card}>
        <p style={{ margin: 0 }}>
          OnlyUS est une application de rencontres axée sur des échanges de qualité :
          une conversation à la fois, appel vocal avant la date, et respect des règles de sécurité.
        </p>
      </div>

      {/* Sections dépliables */}
      <div style={styles.card}>
        {sections.map((s, i) => {
          const active = open === s.id;
          const panelId = `about-panel-${s.id}`;
          const headerId = `about-header-${s.id}`;
          return (
            <div key={s.id} style={styles.item}>
              <button
                id={headerId}
                onClick={() => toggle(s.id)}
                aria-expanded={active}
                aria-controls={panelId}
                style={styles.itemHeader}
              >
                <span>{s.title}</span>
                <span style={{ opacity: 0.85, fontSize: "clamp(18px,5vw,22px)" }}>
                  {active ? "−" : "+"}
                </span>
              </button>
              {active && (
                <div id={panelId} role="region" aria-labelledby={headerId} style={styles.itemBody}>
                  {s.content}
                </div>
              )}
              {i !== sections.length - 1 && <div style={styles.divider} />}
            </div>
          );
        })}
      </div>

      {/* Footer soft */}
      <div style={styles.footer}>
        <span>© {new Date().getFullYear()} OnlyUS — Tous droits réservés</span>
        <button
          type="button"
          style={styles.link as React.CSSProperties}
          onClick={() => navigate("/settings/help")}
          aria-label="Contacter le support"
        >
          Contact
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
    gap: "clamp(6px, 1.6vw, 8px)",
  },

  item: { display: "grid", gap: "clamp(6px, 1.6vw, 8px)" },
  itemHeader: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: COLORS.white,
    padding: "clamp(8px, 2.2vw, 12px) clamp(6px, 1.8vw, 10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "clamp(14px, 3.8vw, 16px)",
  },
  itemBody: {
    padding: "0 clamp(6px, 1.8vw, 10px) clamp(6px, 1.8vw, 10px)",
    opacity: 0.95,
    lineHeight: 1.5,
    fontSize: "clamp(13px, 3.2vw, 14px)",
  },
  divider: {
    height: 1,
    background: COLORS.border,
    opacity: 0.5,
    margin: "clamp(4px, 1vw, 6px) 0",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    opacity: 0.9,
    fontSize: "clamp(12px, 3.2vw, 13px)",
    padding: "0 clamp(2px, 0.6vw, 4px)",
    alignItems: "center",
  },
  link: {
    color: COLORS.textSoft,
    textDecoration: "underline",
    background: "transparent",
    border: "none",
    cursor: "pointer",
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
