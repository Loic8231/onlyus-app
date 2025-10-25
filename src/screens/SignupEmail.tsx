// src/screens/SignupEmail.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Thème + composants partagés
import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

export default function SignupEmail() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;

    try {
      setLoading(true);
      setStatus("Envoi du code...");
      // ✅ Envoie d'un OTP à 6 chiffres par email
      const { error } = await supabase.auth.signInWithOtp({
        email: clean,
        options: {
          shouldCreateUser: true, // crée le user si inexistant
          emailRedirectTo: window.location.origin, // pas utilisé ici mais propre
        },
      });

      if (error) {
        setStatus("Erreur : " + error.message);
        setLoading(false);
        return;
      }

      // On garde l'email pour l'étape suivante (vérification)
      sessionStorage.setItem("onlyus:pendingEmail", clean);
      setStatus("✅ Code envoyé ! Vérifie ta boîte mail.");
      navigate("/verify-code");
    } catch (err: any) {
      setStatus("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const canContinue = email.trim().length > 0 && !loading;

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.cardInner}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}>
          <HeartsLogo />
        </div>

        <h2 className="h2" style={styles.title}>Ton e-mail</h2>

        <form onSubmit={submit} style={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemple@email.com"
            style={styles.input}
            autoComplete="email"
            disabled={loading}
          />

          <PrimaryButton
            type="submit"
            disabled={!canContinue}
            style={{
              opacity: canContinue ? 1 : 0.6,
              cursor: canContinue ? "pointer" : "not-allowed",
            }}
          >
            S’inscrire avec votre e-mail
          </PrimaryButton>

          <div style={{ minHeight: 20, fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            {status}
          </div>
        </form>
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
  cardInner: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "28px 22px 22px",
  },
  title: {
    margin: "6px 0 24px",
    fontWeight: 800,
    textAlign: "center",
  },
  form: { display: "grid", gap: 16 },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.10)",
    color: COLORS.text,
    outline: "none",
    fontSize: 16,
  },
};
