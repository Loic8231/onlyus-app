// src/screens/EndMatchModal.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  white: "#FFFFFF",
  coral: "#FF6B6B",
  border: "rgba(180,205,255,0.45)",
  glassTop: "rgba(255,255,255,0.06)",
  glassBottom: "rgba(255,255,255,0.02)",
};

type NavState = { matchId?: string };

export default function EndMatchModal() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { matchId: matchIdFromNav } = (state || {}) as NavState;

  const [matchId, setMatchId] = useState<string | null>(matchIdFromNav ?? null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Sécurise: si matchId non fourni par la nav, on tente de récupérer le dernier match actif
  useEffect(() => {
    (async () => {
      if (matchId) return;
      const { data: auth } = await supabase.auth.getUser();
      const meId = auth?.user?.id;
      if (!meId) return;
      const { data: row, error } = await supabase
        .from("match_participants")
        .select("match_id")
        .eq("user_id", meId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && row?.match_id) setMatchId(row.match_id);
    })();
  }, [matchId]);

  const handleCancel = () => navigate("/chat");

  const handleConfirm = async () => {
    setErrMsg(null);
    const msg = "Je préfère qu'on en reste là, bon courage pour la suite.";
    if (!matchId) {
      // si on ne peut pas déterminer le match → fallback UX
      navigate("/match-ended");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc("end_match", {
        p_match_id: matchId,
        p_message: msg,
      });
      if (error) {
        console.warn("[end_match] error:", error);
        setErrMsg(error.message ?? "Erreur inconnue");
        // on n’arrête pas l’UX, mais on informe
      }
    } catch (e: any) {
      console.warn("[end_match] threw:", e);
      setErrMsg(e?.message ?? String(e));
    } finally {
      setLoading(false);
      // côté « auteur », on va sur la confirmation
      navigate("/match-ended", { replace: true });
    }
  };

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      <div style={styles.pageBg} />
      <div style={styles.overlay}>
        <div
          style={styles.card}
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-title"
          aria-describedby="end-desc"
        >
          <h2 id="end-title" style={styles.title}>Quitter ce match</h2>
          <p id="end-desc" style={styles.text}>
            Voulez-vous mettre fin à ce match ?
          </p>

          <p style={styles.subtext}>Cela enverra le message suivant :</p>
          <blockquote style={styles.quote}>
            « Je préfère qu'on en reste là, bon courage pour la suite. »
          </blockquote>

          {errMsg && (
            <div style={styles.error}>
              ⚠️ {errMsg}
            </div>
          )}

          <div style={styles.actions}>
            <button
              style={{ ...styles.btnGhost, opacity: loading ? 0.6 : 1 }}
              onClick={handleCancel}
              disabled={loading}
            >
              Annuler
            </button>

            <button
              style={{ ...styles.btnPrimary, opacity: matchId ? 1 : 0.6, cursor: matchId ? "pointer" : "not-allowed" }}
              onClick={handleConfirm}
              disabled={!matchId || loading}
            >
              {loading ? "…" : "Envoyer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Styles */
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100svh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: COLORS.white,
    position: "relative",
  },
  pageBg: { position: "absolute", inset: 0 },
  overlay: {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    padding: "clamp(12px, 3vw, 24px)",
    paddingBottom: "max(clamp(12px,3vw,24px), env(safe-area-inset-bottom, 12px))",
    background: "linear-gradient(180deg, rgba(10,20,50,0.10), rgba(10,20,50,0.10))",
    backdropFilter: "blur(2px)",
  },
  card: {
    width: "100%", maxWidth: 560,
    borderRadius: "clamp(18px, 3.2vw, 28px)",
    padding: "clamp(16px, 3.2vw, 24px) clamp(16px, 3.2vw, 22px) clamp(14px, 2.6vw, 20px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `2px solid ${COLORS.border}`,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  title: { margin: 0, fontSize: "clamp(20px, 5.4vw, 32px)", fontWeight: 800, textAlign: "center", lineHeight: 1.1 },
  text: { margin: "clamp(10px, 2vw, 14px) 0 clamp(6px, 1.4vw, 10px)", fontSize: "clamp(14px, 3.6vw, 18px)", lineHeight: 1.5 },
  subtext: { margin: "0 0 clamp(6px, 1.6vw, 10px)", fontSize: "clamp(12px, 3.2vw, 14px)", opacity: 0.95 },
  quote: {
    margin: "clamp(4px, 1.2vw, 8px) 0 clamp(10px, 2vw, 16px)",
    padding: "clamp(8px, 1.8vw, 12px) clamp(10px, 2.2vw, 14px)",
    borderRadius: "clamp(10px, 2.4vw, 14px)",
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.04)",
    fontSize: "clamp(14px, 3.6vw, 18px)",
  },
  error: {
    margin: "8px 0 0",
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,80,80,0.15)",
    fontSize: "clamp(12px,3.2vw,14px)",
  },
  actions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px, 2vw, 14px)", marginTop: "clamp(4px, 1vw, 8px)" },
  btnGhost: {
    borderRadius: "clamp(12px, 2.6vw, 16px)",
    padding: "clamp(10px, 2.2vw, 12px) 0",
    fontSize: "clamp(14px, 3.6vw, 18px)", fontWeight: 700, color: COLORS.white,
    background: "transparent", border: `2px solid ${COLORS.border}`, cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
  },
  btnPrimary: {
    borderRadius: "clamp(12px, 2.6vw, 16px)",
    padding: "clamp(10px, 2.2vw, 12px) 0",
    fontSize: "clamp(14px, 3.6vw, 18px)", fontWeight: 800, color: COLORS.white,
    background: COLORS.coral, border: "2px solid transparent",
    boxShadow: "0 12px 26px rgba(255,107,107,0.35)", cursor: "pointer",
  },
};
