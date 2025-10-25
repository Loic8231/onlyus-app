// src/screens/Interests.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

const DEFAULT_TAGS = [
  "Sport","Musculation","Course à pied","Football","Rugby","Tennis",
  "Voyage","Randonnée","Nature","Animaux","Cinéma","Séries",
  "Musique","Concerts","Podcast","Lecture","Écriture","Photo",
  "Cuisine","Pâtisserie","Café","Thé","Jeux vidéo","Tech",
  "Entrepreneuriat","Bourse","Art","Théâtre","Danse","Yoga",
  "Méditation","Bénévolat"
];

export default function Interests() {
  const MIN = 3;
  const MAX = 10;

  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // --- détection du contexte (onboarding vs édition depuis profil)
  const qs = new URLSearchParams(location.search);
  const fromOnboarding =
    (location.state as any)?.from === "onboarding" ||
    qs.get("from") === "onboarding";

  const canSubmit = useMemo(() => selected.length >= MIN && !saving, [selected, saving]);

  // Charger les intérêts existants du profil
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("interests")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted || error || !data) return;

      const existing = (data.interests ?? []) as string[];
      if (existing.length) {
        setSelected(existing);
        // si le profil contient des tags inconnus, on les ajoute à la liste “tags”
        const extras = existing.filter((x) => !DEFAULT_TAGS.includes(x));
        if (extras.length) setTags((t) => [...extras, ...t]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggle = (t: string) => {
    const exist = selected.includes(t);
    if (exist) setSelected((s) => s.filter((x) => x !== t));
    else setSelected((s) => (s.length >= MAX ? s : [...s, t]));
  };

  const normalize = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, " ").replace(/\s*-\s*/g, "-");

  const addCustom = () => {
    const raw = custom.trim();
    if (!raw) return;
    const norm = normalize(raw);
    const exists =
      tags.some((t) => normalize(t) === norm) ||
      selected.some((t) => normalize(t) === norm);
    if (exists) { setCustom(""); return; }

    const label = raw
      .replace(/\s+/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    setTags((arr) => [label, ...arr]);
    setCustom("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setStatus("Enregistrement…");

    const { data: u, error: uErr } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (uErr || !userId) {
      setStatus("Session invalide.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        interests: selected,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setStatus("Erreur lors de l’enregistrement.");
    } else {
      setStatus("✅ Intérêts enregistrés.");
      // ▼ Route suivante selon le contexte
      if (fromOnboarding) {
        navigate("/discover"); // étape suivante de l’onboarding
      } else {
        navigate("/user-profile"); // édition -> retour au profil
      }
    }
    setSaving(false);
  };

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.card}>
        <div style={styles.header}>
          <HeartsLogo />
          <h2 className="h2" style={styles.title}>Centres d’intérêt</h2>
          <p className="p" style={styles.subtitle}>
            Sélectionne au moins {MIN} intérêts (max {MAX}) pour mieux te proposer des profils compatibles.
          </p>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 18 }}>
          {/* Ajout perso */}
          <div style={styles.addRow}>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              placeholder="Ajouter un intérêt (ex. Triathlon)"
              style={styles.addInput}
            />
            <button type="button" onClick={addCustom} style={styles.addBtn}>+</button>
          </div>

          {/* Grille de tags */}
          <div style={styles.tagsGrid}>
            {tags.map((t) => {
              const active = selected.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(t)}
                  style={{
                    ...styles.tag,
                    background: active ? COLORS.coral : "rgba(255,255,255,0.08)",
                    color: active ? COLORS.white : COLORS.text,
                    borderColor: active ? "transparent" : COLORS.border,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Compteur + CTA */}
          <div style={styles.footerRow}>
            <div style={styles.counter}>
              {selected.length}/{MAX} sélectionné{selected.length > 1 ? "s" : ""}
            </div>
            <PrimaryButton type="submit" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
              {saving ? "Enregistrement…" : "Continuer"}
            </PrimaryButton>
          </div>

          <div style={{ minHeight: 18, fontSize: 13, opacity: 0.95 }}>{status}</div>
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
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    color: COLORS.white,
  },
  card: { width: "100%", maxWidth: 620, borderRadius: 28, padding: "28px 22px 24px" },
  header: { display: "grid", placeItems: "center", gap: 6, marginBottom: 8, textAlign: "center" as const },
  title: { margin: "2px 0 6px", fontWeight: 800 },
  subtitle: { margin: "0 0 6px", fontSize: 14, opacity: 0.9 },
  addRow: { display: "flex", gap: 10, alignItems: "center" },
  addInput: {
    flex: 1, padding: "12px 14px", borderRadius: 14, border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)", color: COLORS.text, outline: "none", fontSize: 16,
  },
  addBtn: {
    border: "none", width: 44, height: 44, borderRadius: 12, background: COLORS.coral, color: COLORS.white,
    fontSize: 24, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 22px rgba(255,107,107,0.28)", lineHeight: 0,
  },
  tagsGrid: { display: "flex", flexWrap: "wrap" as const, gap: 10, marginTop: 4 },
  tag: {
    border: `2px solid ${COLORS.border}`, borderRadius: 999, padding: "10px 14px",
    fontSize: 14, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(2px)",
  },
  footerRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 4 },
  counter: { fontSize: 14, opacity: 0.9, flex: 1 },
};
