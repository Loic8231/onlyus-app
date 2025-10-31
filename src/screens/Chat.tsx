// src/screens/Chat.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

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
  inputBg: "rgba(255,255,255,0.10)",
  inputBorder: "rgba(255,255,255,0.22)",
};

type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  ts: number;
};

type NavState = { matchId?: string; meId?: string; otherId?: string };

function SettingsButton() {
  const navigate = useNavigate();
  return (
    <button
      style={styles.iconBtn}
      title="Paramètres"
      aria-label="Paramètres"
      onClick={() => navigate("/settings")}
    >
      ⚙️
    </button>
  );
}

function QuitButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      style={styles.iconBtn}
      title="Quitter le match"
      aria-label="Quitter le match"
      onClick={onClick}
    >
      🚪
    </button>
  );
}

function ageFromBirthdate(d?: string | null) {
  if (!d) return undefined;
  const b = new Date(d);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state || {}) as NavState;

  const [meId, setMeId] = useState<string | null>(navState.meId ?? null);
  const [matchId, setMatchId] = useState<string | null>(navState.matchId ?? null);
  const [otherId, setOtherId] = useState<string | null>(navState.otherId ?? null);

  const [otherFirstName, setOtherFirstName] = useState<string>("•");
  const [otherAge, setOtherAge] = useState<number | undefined>(undefined);
  const [otherPhoto, setOtherPhoto] = useState<string | null>(null);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  // 1) user courant
  useEffect(() => {
    (async () => {
      if (meId) return;
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) setMeId(data.user.id);
    })();
  }, [meId]);

  // 2) si pas d’ids fournis -> dernier match
  useEffect(() => {
    (async () => {
      if (!meId || (matchId && otherId)) return;
      const { data: rows } = await supabase
        .from("match_participants")
        .select("match_id, other_user_id, created_at")
        .eq("user_id", meId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (rows?.length) {
        setMatchId(rows[0].match_id);
        setOtherId(rows[0].other_user_id);
      }
    })();
  }, [meId, matchId, otherId]);

  // 3) profil other
  useEffect(() => {
    (async () => {
      if (!otherId) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, birthdate, photo_url")
        .eq("id", otherId)
        .maybeSingle();
      setOtherFirstName(data?.first_name ?? "•");
      setOtherAge(ageFromBirthdate(data?.birthdate));
      setOtherPhoto(data?.photo_url ?? null);
    })();
  }, [otherId]);

  // 4) historique + realtime (avec déduplication)
  useEffect(() => {
    if (!matchId || !meId) return;

    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("match_messages")
        .select("id, match_id, sender_id, text, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.warn("[chat] load messages error:", error);
        return;
      }

      const formatted =
        (data ?? []).map((m) => ({
          id: m.id,
          from: m.sender_id === meId ? "me" : "them",
          text: m.text,
          ts: new Date(m.created_at as any).getTime(),
        })) || [];

      seenIdsRef.current = new Set(formatted.map((m) => m.id));
      setMsgs(formatted);
    })();

    const channel = supabase
      .channel(`mm:${matchId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_messages", filter: `match_id=eq.${matchId}` },
        (payload) => {
          const m = payload.new as any;
          if (seenIdsRef.current.has(m.id)) return;
          seenIdsRef.current.add(m.id);
          setMsgs((arr) => [
            ...arr,
            {
              id: m.id,
              from: m.sender_id === meId ? "me" : "them",
              text: m.text,
              ts: new Date(m.created_at).getTime(),
            },
          ]);
        }
      );

    channel.subscribe();
    return () => {
      channel.unsubscribe();
      mounted = false;
    };
  }, [matchId, meId]);

  // 5) écoute de fin de match → redirige vers /match-closed
  useEffect(() => {
    if (!matchId || !meId) return;

    const ch = supabase
      .channel(`end:${matchId}:${meId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_endings",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as any;
          if (row.recipient_id === meId) {
            navigate("/match-closed", {
              replace: true,
              state: { message: row.message },
            });
          }
        }
      )
      .subscribe();

    return () => {
      ch.unsubscribe();
    };
  }, [matchId, meId, navigate]);

  // scroll + auto-grow
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!areaRef.current) return;
    areaRef.current.style.height = "0px";
    areaRef.current.style.height = Math.min(areaRef.current.scrollHeight, 220) + "px";
  }, [input]);

  const quitMatch = () => navigate("/end-match");

  const send = async () => {
    if (!input.trim() || !meId || !matchId) return;
    const text = input.trim();

    // id client → même id en base pour éviter le doublon Realtime
    const id = crypto.randomUUID();
    const optimistic: Msg = { id, from: "me", text, ts: Date.now() };
    seenIdsRef.current.add(id);
    setMsgs((arr) => [...arr, optimistic]);
    setInput("");

    const { error } = await supabase
      .from("match_messages")
      .insert([{ id, match_id: matchId, sender_id: meId, text }]);
    if (error) console.warn("[chat] insert message error:", error);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (t: number) =>
    new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const title = useMemo(() => {
    const ageText = otherAge != null ? `, ${otherAge}` : "";
    return `${otherFirstName}${ageText}`;
  }, [otherFirstName, otherAge]);

  return (
    <div className="app-safe phone-max" style={styles.screen}>
      {/* Topbar */}
      <header style={styles.topbar}>
        {/* centre : NOM + ÂGE (sans avatar) */}
        <div style={styles.contactWrap}>
          <div style={styles.contactName}>{title}</div>
        </div>

        {/* droite : actions */}
        <div style={styles.actions}>
          {/* 🔗 Appel vocal -> /voice-call */}
          <button
            style={styles.iconBtn}
            title="Appel vocal"
            aria-label="Appel vocal"
            onClick={() => {
              if (!matchId || !meId || !otherId) return;
              navigate("/voice-call", { state: { matchId, meId, otherId } });
            }}
          >
            🎧
          </button>

          {/* 🔗 Voir profil -> avatar cliquable (avec photo) */}
          <button
            style={{ ...styles.iconBtn, padding: 4 }}
            title="Voir profil"
            aria-label="Voir profil"
            onClick={() => {
              if (!otherId) return;
              navigate("/profile-details", { state: { profileId: otherId } });
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: otherPhoto
                  ? `url(${otherPhoto}) center/cover no-repeat`
                  : "linear-gradient(135deg,#FBD3E9,#BB377D)",
                border: `2px solid ${COLORS.border}`,
              }}
            />
          </button>

          <SettingsButton />
          <QuitButton onClick={quitMatch} />
        </div>
      </header>

      {/* Messages */}
      <main style={styles.chatArea}>
        {msgs.map((m) => (
          <div
            key={m.id}
            style={{ ...styles.row, justifyContent: m.from === "me" ? "flex-end" : "flex-start" }}
          >
            <div
              style={{
                ...styles.bubble,
                ...(m.from === "me" ? styles.mine : styles.theirs),
              }}
            >
              <div style={styles.text}>{m.text}</div>
              <div style={styles.time}>{formatTime(m.ts)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      {/* Composer */}
      <footer style={styles.composer}>
        <button
          style={styles.smallIcon}
          title="Ajouter un média"
          aria-label="Ajouter un média"
          onClick={() => console.log("Media")}
        >
          ＋
        </button>
        <textarea
          ref={areaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          style={styles.input}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          style={{
            ...styles.sendBtn,
            opacity: input.trim() ? 1 : 0.6,
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
          title="Envoyer"
          aria-label="Envoyer"
        >
          ➤
        </button>
      </footer>
    </div>
  );
}

/* === Styles === */
const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100svh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    padding: "clamp(8px, 2vw, 14px)",
    paddingBottom: "max(clamp(8px,2vw,14px), env(safe-area-inset-bottom, 10px))",
    gap: "clamp(6px, 1.6vw, 12px)",
  },

  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "clamp(8px, 1.8vw, 12px) clamp(10px, 2.2vw, 14px)",
    borderRadius: "clamp(12px, 2.4vw, 16px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
    gap: "clamp(6px, 1.6vw, 10px)",
  },
  contactWrap: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 1.8vw, 12px)",
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontWeight: 800,
    letterSpacing: 0.2,
    fontSize: "clamp(14px, 3.6vw, 16px)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  actions: { display: "flex", alignItems: "center", gap: "clamp(6px, 1.6vw, 10px)" },
  iconBtn: {
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    color: COLORS.white,
    borderRadius: "clamp(10px, 2vw, 12px)",
    padding: "clamp(4px, 1vw, 6px) clamp(6px, 1.4vw, 8px)",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
    fontSize: "clamp(16px, 3.6vw, 20px)",
  },

  chatArea: {
    overflowY: "auto" as const,
    padding: "clamp(4px, 1vw, 8px) clamp(2px, 0.8vw, 6px)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "clamp(6px, 1.6vw, 10px)",
  },
  row: { display: "flex" },
  bubble: {
    maxWidth: "min(78%, 620px)",
    padding: "clamp(8px, 1.8vw, 12px) clamp(10px, 2.2vw, 14px) clamp(6px, 1.6vw, 10px)",
    borderRadius: "clamp(12px, 2.6vw, 16px)",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    lineHeight: 1.45,
    position: "relative",
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    boxShadow: "0 6px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  mine: {
    background: COLORS.coral,
    borderColor: "transparent",
    color: COLORS.white,
    boxShadow: "0 10px 20px rgba(255,107,107,0.35)",
  },
  theirs: { background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})` },
  text: { whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const },
  time: {
    fontSize: "clamp(10px, 2.6vw, 12px)",
    opacity: 0.8,
    marginTop: "clamp(3px, 0.8vw, 4px)",
    textAlign: "right" as const,
  },

  composer: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "end",
    gap: "clamp(6px, 1.6vw, 10px)",
    padding: "clamp(6px, 1.6vw, 10px)",
    borderRadius: "clamp(12px, 2.4vw, 16px)",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  smallIcon: {
    border: "none",
    background: "transparent",
    color: COLORS.white,
    fontSize: "clamp(18px, 4.4vw, 22px)",
    cursor: "pointer",
    padding: "clamp(2px, 0.6vw, 4px)",
    lineHeight: 1,
  },
  input: {
    width: "100%",
    resize: "none" as const,
    overflow: "hidden",
    background: COLORS.inputBg,
    border: `1px solid ${COLORS.inputBorder}`,
    color: COLORS.text,
    borderRadius: "clamp(10px, 2.2vw, 12px)",
    padding: "clamp(9px, 2.2vw, 12px) clamp(10px, 2.4vw, 14px)",
    outline: "none",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    lineHeight: 1.35,
    maxHeight: "clamp(110px, 24vh, 220px)",
  },
  sendBtn: {
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: "clamp(10px, 2.2vw, 12px)",
    padding: "clamp(8px, 2vw, 10px) clamp(10px, 2.4vw, 12px)",
    fontWeight: 800,
    boxShadow: "0 10px 22px rgba(255,107,107,0.35)",
    fontSize: "clamp(14px, 3.4vw, 16px)",
    lineHeight: 1,
  },
};



