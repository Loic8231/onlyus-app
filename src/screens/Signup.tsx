// src/screens/Signup.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

// Thème + composants partagés (Jour 13)
import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";

/* Icônes */
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.2 0 6.1 1.1 8.3 3.1l-3.7 3.7c-1.2-1.1-2.8-1.7-4.6-1.7-3.9 0-7.1 3.1-7.1 7s3.2 7 7.1 7c3.6 0 6.1-2.1 6.6-4.9H24v-5h14.6c.2 1 .4 2 .4 3 0 8.3-5.7 14-14.9 14-8.5 0-15.5-6.9-15.5-15.1S15.5 9.5 24 9.5z"
      />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16.365 1.43c0 1.14-.463 2.2-1.21 2.98-.77.8-2.05 1.44-3.13 1.36-.14-1.12.414-2.24 1.15-3.02.77-.78 2.08-1.35 3.19-1.32zM20.7 17.03c-.65 1.51-1.45 2.98-2.61 4.23-1.02 1.07-2.33 2.29-3.87 2.29-1.52 0-1.93-.73-3.58-.73-1.67 0-2.11.73-3.64.73-1.54 0-2.69-1.16-3.7-2.21C1.7 19.5.54 16.6.54 13.9c0-2.74 1.78-4.21 3.54-4.21 1.5 0 2.43.77 3.59.77 1.13 0 1.98-.78 3.57-.78 1.17 0 2.41.49 3.3 1.33-.9.57-1.77 1.6-1.77 3.09 0 1.46.82 2.74 2.03 3.35.59.3 1.3.5 1.98.39.35-.07.7-.2 1.05-.38.59-.28 1.2-.69 1.76-1.25-.2.63-.43 1.21-.68 1.74z"
        fill="currentColor"
      />
    </svg>
  );
}

/* Bouton d'auth */
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  leadingIcon?: React.ReactNode;
  variant?: "outline" | "filled";
};
function AuthButton({
  children,
  onClick,
  leadingIcon,
  variant = "outline",
}: ButtonProps) {
  const base: React.CSSProperties = {
    width: "100%",
    padding: "14px 18px",
    borderRadius: 18,
    fontSize: 18,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(0,0,0,0.10)",
  };
  const outline: React.CSSProperties = {
    ...base,
    background: COLORS.white,
    color: "#0E2A52",
    border: `2px solid ${COLORS.coral}`,
  };
  const filled: React.CSSProperties = {
    ...base,
    background: COLORS.coral,
    color: COLORS.white,
    border: "2px solid transparent",
  };

  return (
    <button style={variant === "filled" ? filled : outline} onClick={onClick}>
      {leadingIcon && <span aria-hidden="true">{leadingIcon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.cardInner}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 8 }}>
          <HeartsLogo />
        </div>

        <h2 className="h2" style={styles.title}>Inscription</h2>

        <div style={styles.stack}>
          <AuthButton
            onClick={() => console.log("Google")}
            leadingIcon={<GoogleIcon />}
          >
            Continuer avec Google
          </AuthButton>

          <AuthButton
            onClick={() => console.log("Apple")}
            leadingIcon={<AppleIcon />}
          >
            Continuer avec Apple
          </AuthButton>

          {/* → redirection e-mail */}
          <AuthButton
            variant="filled"
            onClick={() => navigate("/signup-email")}
          >
            S&apos;inscrire avec votre e-mail
          </AuthButton>
        </div>
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
  // on resserre un peu l’intérieur de la Card pour cet écran
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
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginTop: 8,
  },
};
