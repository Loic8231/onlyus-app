import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

type GenderOption = "homme" | "femme" | "non-binaire" | "ne-pas-dire" | "autre";

export default function Preferences() {
  const [genderOpen, setGenderOpen] = useState(false);
  const genderWrapRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<Set<GenderOption>>(new Set());
  const [customGender, setCustomGender] = useState("");

  const [minAge, setMinAge] = useState(20);
  const [maxAge, setMaxAge] = useState(35);
  const [distance, setDistance] = useState(50);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  // --- Contexte: onboarding vs édition
  const qs = new URLSearchParams(location.search);
  const fromOnboarding =
    (location.state as any)?.from === "onboarding" || qs.get("from") === "onboarding";

  const BASE_OPTIONS: GenderOption[] = ["homme", "femme", "non-binaire", "ne-pas-dire"];
  const allSelected = BASE_OPTIONS.every((opt) => selected.has(opt));
  const genderValid =
    selected.size > 0 && (!selected.has("autre") || customGender.trim().length > 0);
  const canSubmit = genderValid && minAge < maxAge && !saving;

  // --- Préremplissage
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) return;

      const [pRes, dRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("preferred_genders, preferred_min_age, preferred_max_age")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("profile_preferences")
          .select("distance_km")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      // genders/ages
      if (mounted && pRes.data) {
        const prefs = (pRes.data.preferred_genders ?? []) as string[];
        const next = new Set<GenderOption>();
        prefs.forEach((p) => {
          const v = p as GenderOption;
          if (["homme", "femme", "non-binaire", "ne-pas-dire"].includes(v)) next.add(v);
          else {
            next.add("autre");
            setCustomGender(p);
          }
        });
        if (next.size) setSelected(next);
        if (typeof pRes.data.preferred_min_age === "number") setMinAge(pRes.data.preferred_min_age);
        if (typeof pRes.data.preferred_max_age === "number") setMaxAge(pRes.data.preferred_max_age);
      }

      // distance
      if (mounted && typeof dRes.data?.distance_km === "number") {
        setDistance(dRes.data.distance_km);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const genders = Array.from(selected).map((opt) =>
      opt === "autre" ? customGender.trim() : opt
    );

    setSaving(true);
    setStatus("Enregistrement…");

    const { data: u, error: uErr } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (uErr || !userId) {
      setStatus("Session invalide.");
      setSaving(false);
      return;
    }

    // distance en table dédiée (clé unique user_id) + préférences en profiles
    const [pUpd, dUpd] = await Promise.all([
      supabase
        .from("profiles")
        .update({
          preferred_genders: genders,
          preferred_min_age: minAge,
          preferred_max_age: maxAge,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId),
      supabase
        .from("profile_preferences")
        .upsert(
          {
            user_id: userId,
            distance_km: distance,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" } // ← garantit l’update quand il existe déjà
        ),
    ]);

    if (pUpd.error || dUpd.error) {
      console.error(pUpd.error || dUpd.error);
      setStatus("Erreur lors de l’enregistrement.");
    } else {
      setStatus("✅ Préférences enregistrées.");
      // Route suivante selon le contexte
      if (fromOnboarding) {
        navigate("/interests", { state: { from: "onboarding" } });
      } else {
        navigate("/user-profile");
      }
    }
    setSaving(false);
  };

  // --- UI dropdown
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!genderOpen) return;
      const target = ev.target as Node;
      if (genderWrapRef.current && !genderWrapRef.current.contains(target)) {
        setGenderOpen(false);
      }
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setGenderOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [genderOpen]);

  const toggleOpt = (opt: GenderOption) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) BASE_OPTIONS.forEach((o) => next.delete(o));
      else BASE_OPTIONS.forEach((o) => next.add(o));
      return next;
    });
  };

  const summaryText = (() => {
    if (selected.size === 0) return "Sélectionner…";
    const hasAllBase = BASE_OPTIONS.every((k) => selected.has(k));
    const labelsMap: Record<GenderOption, string> = {
      homme: "Homme",
      femme: "Femme",
      "non-binaire": "Non-binaire",
      "ne-pas-dire": "Je préfère ne pas dire",
      autre: customGender.trim() ? customGender.trim() : "Autre (préciser)",
    };
    if (hasAllBase && !selected.has("autre")) return "Tout";
    const labels = Array.from(selected).map((k) => labelsMap[k]);
    if (hasAllBase && selected.has("autre")) {
      const other = labelsMap["autre"];
      return `Tout${other ? `, ${other}` : ""}`;
    }
    return labels.join(", ");
  })();

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.cardInner}>
        <div style={styles.header}>
          <HeartsLogo />
          <h2 className="h2" style={styles.title}>Tes préférences</h2>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          {/* Je veux voir */}
          <div>
            <label style={styles.label}>Je veux voir</label>
            <div style={styles.genderSelectWrap} ref={genderWrapRef}>
              <button
                type="button"
                onClick={() => setGenderOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={genderOpen}
                style={{
                  ...styles.genderToggle,
                  borderColor: !genderValid && genderOpen ? "rgba(255,107,107,0.7)" : COLORS.border,
                }}
                disabled={saving}
              >
                {summaryText}
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginLeft: "auto" }} aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {genderOpen && (
                <div role="listbox" aria-multiselectable="true" style={styles.genderMenu}>
                  <label
                    style={{
                      ...styles.genderOption,
                      ...(allSelected ? styles.genderOptionActive : {}),
                      borderBottom: `1px dashed ${COLORS.border}`,
                    }}
                  >
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} style={styles.checkbox} />
                    <span>Tout le monde</span>
                  </label>

                  {([
                    ["homme", "Homme"],
                    ["femme", "Femme"],
                    ["non-binaire", "Non-binaire"],
                    ["ne-pas-dire", "Je préfère ne pas dire"],
                  ] as [GenderOption, string][]).map(([key, label]) => {
                    const checked = selected.has(key);
                    return (
                      <label key={key} style={{ ...styles.genderOption, ...(checked ? styles.genderOptionActive : {}) }}>
                        <input type="checkbox" checked={checked} onChange={() => toggleOpt(key)} style={styles.checkbox} />
                        <span>{label}</span>
                      </label>
                    );
                  })}

                  <div
                    style={{
                      ...styles.genderOption,
                      ...(selected.has("autre") ? styles.genderOptionActive : {}),
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <input type="checkbox" checked={selected.has("autre")} onChange={() => toggleOpt("autre")} style={styles.checkbox} />
                    <input
                      type="text"
                      value={customGender}
                      onChange={(e) => setCustomGender(e.target.value)}
                      placeholder="Autre (préciser)"
                      style={styles.genderCustomInput}
                    />
                    <button
                      type="button"
                      onClick={() => setGenderOpen(false)}
                      style={styles.genderSaveBtn}
                      disabled={selected.has("autre") && customGender.trim().length === 0}
                      title="Valider et fermer"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tranche d'âge */}
          <div>
            <label style={styles.label}>Âge entre</label>
            <div style={styles.rangeRow}>
              <input type="number" min={18} max={99} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} style={styles.rangeInput} />
              <span style={{ opacity: 0.9 }}>et</span>
              <input type="number" min={18} max={99} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} style={styles.rangeInput} />
            </div>
          </div>

          {/* Distance */}
          <div>
            <label style={styles.label}>Distance max : {distance} km</label>
            <input type="range" min={5} max={200} value={distance} onChange={(e) => setDistance(Number(e.target.value))} style={styles.slider} />
          </div>

          <PrimaryButton type="submit" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5, marginTop: 4 }}>
            {saving ? "Enregistrement…" : "Continuer"}
          </PrimaryButton>

          <div style={{ minHeight: 18, marginTop: 8, fontSize: 13, opacity: 0.95 }}>{status}</div>
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
  cardInner: { width: "100%", maxWidth: 520, borderRadius: 28, padding: "28px 22px 26px" },
  header: { display: "grid", placeItems: "center", gap: 6, marginBottom: 12, textAlign: "center" as const },
  title: { margin: "2px 0 10px", fontWeight: 800, opacity: 0.95 },
  form: { display: "flex", flexDirection: "column", gap: 22, marginTop: 8 },
  label: { fontSize: 15, opacity: 0.95, marginBottom: 6, display: "block" },
  rangeRow: { display: "flex", gap: 10, alignItems: "center" },
  rangeInput: {
    width: 90,
    padding: "10px 12px",
    borderRadius: 12,
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.text,
    fontSize: 15,
    textAlign: "center" as const,
    outline: "none",
  },
  slider: {
    width: "100%",
    WebkitAppearance: "none",
    appearance: "none",
    height: 6,
    borderRadius: 999,
    background: "rgba(255,255,255,0.25)",
    outline: "none",
  },
  genderSelectWrap: { position: "relative" },
  genderToggle: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 14,
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.text,
    outline: "none",
    fontSize: 16,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  genderMenu: {
    position: "absolute",
    zIndex: 10,
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "rgba(12,25,55,0.96)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
    padding: 8,
    display: "grid",
    gap: 6,
  },
  genderOption: {
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid transparent",
    background: "transparent",
    color: COLORS.white,
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  genderOptionActive: { background: "rgba(255,107,107,0.15)", borderColor: "rgba(255,107,107,0.35)" },
  checkbox: { width: 16, height: 16, accentColor: COLORS.coral as unknown as string, cursor: "pointer" },
  genderCustomInput: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.white,
    outline: "none",
    fontSize: 15,
  },
  genderSaveBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: `2px solid ${COLORS.border}`,
    background: COLORS.coral,
    color: COLORS.white,
    fontWeight: 800,
    cursor: "pointer",
    opacity: 1,
  },
};

