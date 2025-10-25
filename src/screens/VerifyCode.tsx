// src/screens/VerifyCode.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// Thème + composants partagés
import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Récupère l'email stocké à l'étape précédente
  useEffect(() => {
    const pending = sessionStorage.getItem("onlyus:pendingEmail");
    setEmail(pending);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.trim().replace(/\s/g, "");
    if (!email || token.length < 6) {
      setStatus("Code incomplet.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Vérification en cours...");

      // ✅ Vérification OTP email (6 chiffres)
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email", // important : vérifie un code envoyé par e-mail
      });

      if (error) {
        setStatus("Code incorrect. Réessaie.");
        setLoading(false);
        return;
      }

      // Succès : on efface l'email temporaire et on continue
      sessionStorage.removeItem("onlyus:pendingEmail");
      setStatus("✅ Code validé !");
      // Enchaîner vers la suite de l’onboarding (CreateProfile)
      navigate("/create-profile");
    } catch (err: any) {
      setStatus("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const canValidate = code.trim().length >= 6 && !!email && !loading;

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.cardInner}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}>
          <HeartsLogo />
        </div>

        <h2 className="h2" style={styles.title}>Vérifie ton e-mail</h2>
        <p className="p" style={styles.subtitle}>
          Entre le code à 6 chiffres envoyé à <b>{email ?? "ton e-mail"}</b>.
        </p>

        <form onSubmit={submit} style={styles.form}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code à 6 chiffres"
            style={styles.input}
            inputMode="numeric"
            autoFocus
            disabled={loading}
          />

          <PrimaryButton
            type="submit"
            disabled={!canValidate}
            style={{
              opacity: canValidate ? 1 : 0.6,
              cursor: canValidate ? "pointer" : "not-allowed",
            }}
          >
            Valider
          </PrimaryButton>

          <div style={{ minHeight: 20, fontSize: 13, opacity: 0.95, marginTop: 6 }}>
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
    margin: "6px 0 8px",
    fontWeight: 800,
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 24px",
    opacity: 0.9,
    textAlign: "center",
    fontSize: 14,
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
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
  },
};
