// src/screens/EndMatchModal.tsx
import React, { useEffect, useMemo, useState } from "react";
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

type NavState = { matchId?: string; meId?: string; otherId?: string };

const DEFAULT_MESSAGE = "Je préfère qu'on en reste là, bon courage pour la suite.";

export default function EndMatchModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state || {}) as NavState;

  const [busy, setBusy] = useState(false);
  const [meId, setMeId] = useState<string | null>(navState.meId ?? null);
  const [matchId, setMatchId] = useState<string | null>(navState.matchId ?? null);
  const [otherId, setOtherId] = useState<string | null>(navState.otherId ?? null);

  // 1) Récupère mon user id si absent
  useEffect(() => {
    (async () => {
      if (meId) return;
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) setMeId(data.user.id);
    })();
  }, [meId]);

  // 2) Déduit matchId/otherId si pas passés en state (on prend le dernier match)
  useEffect(() => {
    (async () => {
      if (!meId || (matchId && otherId)) return;
      const { data, error } = await supabase
        .from("match_participants")
        .select("match_id, other_user_id, created_at")
        .eq("user_id", meId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) {
        console.warn("[end] participants lookup error:", error);
        return;
      }
      if (data?.length) {
        setMatchId(data[0].match_id);
        setOtherId(data[0].other_user_id);
      }
    })();
  }, [meId, matchId, otherId]);

  const canConfirm = useMemo(() => !!meId && !!matchId && !!otherId && !busy, [meId, matchId, otherId, busy]);

  const handleCancel = () => {
    navigate("/chat");
  };

  /**
   * Étapes côté BDD :
   *  A) Notifier l’autre via une petite table d’événements (match_endings)
   *  B) Supprimer tous les messages de ce match (match_messages)
   *  C) Mettre fin au match (ici: supprimer les 2 participants du match → il disparaît)
   *
   * Notes :
   *  - L’écran Chat doit écouter en temps réel `match_endings` (event 'INSERT') pour rediriger l’autre
   *    vers /match-closed (voir bloc d’abonnement qu’on ajoutera ensuite).
   */
  const handleConfirm = async () => {
    if (!canConfirm || !meId || !matchId || !otherId) return;
    setBusy(true);

    // A) Enregistre un "événement de fin" pour l'autre (il déclenchera la redirection en temps réel)
    const { error: endErr } = await supabase
      .from("match_endings")
      .insert([{ match_id: matchId, sender_id: meId, recipient_id: otherId, message: DEFAULT_MESSAGE }]);
    if (endErr) {
      console.warn("[end] match_endings insert error:", endErr);
      // on continue quand même (soft-fail) pour ne pas bloquer l’utilisateur
    }

    // B) Supprime tous les messages de ce match
    const { error: delMsgErr } = await supabase
      .from("match_messages")
      .delete()
      .eq("match_id", matchId);
    if (delMsgErr) {
      console.warn("[end] delete messages error:", delMsgErr);
      // on continue malgré tout
    }

    // C) Met fin au match : on supprime les 2 lignes de match_participants
    const { error: delPartErr } = await supabase
      .from("match_participants")
      .delete()
      .eq("match_id", matchId);
    if (delPartErr) {
      console.warn("[end] delete participants error:", delPartErr);
      // on continue malgré tout
    }

    setBusy(false);
    // L’utilisateur qui met fin → va sur l’écran “match terminé”
    navigate("/match-ended", { replace: true });
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
          <h2 id="end-title" style={styles.title}>
            Quitter ce match
          </h2>

          <p id="end-desc" style={styles.text}>
            Voulez-vous mettre fin à ce match ?
          </p>

          <p style={styles.subtext}>Cela enverra le message suivant :</p>

          <blockquote style={styles.quote}>
            « {DEFAULT_MESSAGE} »
          </blockquote>

          <div style={styles.actions}>
            <button style={styles.btnGhost} onClick={handleCancel} disabled={busy}>
              Annuler
            </button>

            <button
              style={{
                ...styles.btnPrimary,
                opacity: canConfirm ? 1 : 0.6,
                cursor: canConfirm ? "pointer" : "not-allowed",
              }}
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {busy ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* === Styles : responsive + clamp + safe areas === */
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100svh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
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
    width: "100%",
    maxWidth: 560,
    borderRadius: "clamp(18px, 3.2vw, 28px)",
    padding: "clamp(16px, 3.2vw, 24px) clamp(16px, 3.2vw, 22px) clamp(14px, 2.6vw, 20px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `2px solid ${COLORS.border}`,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  title: {
    margin: 0,
    fontSize: "clamp(20px, 5.4vw, 32px)",
    fontWeight: 800,
    textAlign: "center",
    lineHeight: 1.1,
  },
  text: {
    margin: "clamp(10px, 2vw, 14px) 0 clamp(6px, 1.4vw, 10px)",
    fontSize: "clamp(14px, 3.6vw, 18px)",
    lineHeight: 1.5,
  },
  subtext: {
    margin: "0 0 clamp(6px, 1.6vw, 10px)",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    opacity: 0.95,
  },
  quote: {
    margin: "clamp(4px, 1.2vw, 8px) 0 clamp(10px, 2vw, 16px)",
    padding: "clamp(8px, 1.8vw, 12px) clamp(10px, 2.2vw, 14px)",
    borderRadius: "clamp(10px, 2.4vw, 14px)",
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.04)",
    fontSize: "clamp(14px, 3.6vw, 18px)",
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "clamp(10px, 2vw, 14px)",
    marginTop: "clamp(4px, 1vw, 8px)",
  },
  btnGhost: {
    borderRadius: "clamp(12px, 2.6vw, 16px)",
    padding: "clamp(10px, 2.2vw, 12px) 0",
    fontSize: "clamp(14px, 3.6vw, 18px)",
    fontWeight: 700,
    color: COLORS.white,
    background: "transparent",
    border: `2px solid ${COLORS.border}`,
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
  },
  btnPrimary: {
    borderRadius: "clamp(12px, 2.6vw, 16px)",
    padding: "clamp(10px, 2.2vw, 12px) 0",
    fontSize: "clamp(14px, 3.6vw, 18px)",
    fontWeight: 800,
    color: COLORS.white,
    background: COLORS.coral,
    border: "2px solid transparent",
    boxShadow: "0 12px 26px rgba(255,107,107,0.35)",
    cursor: "pointer",
  },
};
