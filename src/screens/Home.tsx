// src/screens/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient"; // ✅ ajouté ici

// Thème + composants partagés
import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

export default function Home() {
  const navigate = useNavigate();

  const goNext = () => {
    navigate("/rules");
  };

  // 🔹 Déconnexion complète (retour à l’écran d’accueil)
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={{ textAlign: "center" }}>
        <div style={styles.logoWrap}>
          <HeartsLogo />
        </div>

        <h2 className="h2" style={styles.title}>
          Bienvenue
        </h2>

        <p className="p" style={styles.subtitle}>
          Prêt(e) à faire une
          <br />
          vraie rencontre&nbsp;?
        </p>

        <PrimaryButton onClick={goNext}>Continuer</PrimaryButton>

        {/* 🔹 Bouton déconnexion temporaire pour les tests */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 16,
            background: COLORS.coral,
            color: COLORS.white,
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Se déconnecter
        </button>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${COLORS.bg1}, ${COLORS.bg2})`,
    display: "grid",
    placeItems: "center",
    padding: 16,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: COLORS.white,
  },
  logoWrap: {
    display: "grid",
    placeItems: "center",
    marginBottom: 24,
  },
  title: {
    margin: "6px 0 6px",
    fontWeight: 800,
  },
  subtitle: {
    margin: "0 0 28px",
    lineHeight: 1.35,
    opacity: 0.95,
  },
};
