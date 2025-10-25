// src/screens/UserProfile.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/** ---- Design system ---- */
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
const RADIUS = { lg: 18, md: 14, sm: 10 };
const SHADOWS = {
  soft: "0 10px 30px rgba(0,0,0,0.25)",
  tight: "0 6px 16px rgba(0,0,0,0.18)",
};

/** ---- Icônes ---- */
function BackIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke={COLORS.white} strokeWidth="2" />
      <path
        d="M19.4 15a1 1 0 01.2 1.1l-.4.7a1 1 0 01-1.2.4l-1-.4a7.6 7.6 0 01-1.2.7l-.2 1a1 1 0 01-1 .8h-.8a1 1 0 01-1-.8l-.2-1c-.4-.1-.8-.3-1.2-.5l-1 .4a1 1 0 01-1.2-.4l-.4-.7a1 1 0 01.2-1.1l.8-.7c-.1-.4-.1-.9-.1-1.3 0-.4 0-.9.1-1.3l-.8-.7z"
        stroke={COLORS.white}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ---- Types ---- */
type ProfileRow = {
  id: string;
  first_name: string | null;
  birthdate: string | null;
  photo_url: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  gallery_urls: string[] | null;
  preferred_genders: string[] | null;
  preferred_min_age: number | null;
  preferred_max_age: number | null;
};

function ageFromBirthdate(d?: string | null) {
  if (!d) return undefined;
  const b = new Date(d);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a;
}

/** ---- Styles ---- */
const screenStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: `radial-gradient(1200px 800px at 70% -20%, rgba(17,167,255,0.12), transparent 60%), radial-gradient(900px 700px at -10% 10%, rgba(255,107,107,0.12), transparent 55%), ${COLORS.navy}`,
  color: COLORS.white,
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: `linear-gradient(180deg, ${COLORS.navy2}, ${COLORS.navy})`,
  borderBottom: `1px solid ${COLORS.border}`,
};
const containerStyle: React.CSSProperties = { maxWidth: 980, margin: "0 auto", padding: 16 };
const cardStyle: React.CSSProperties = {
  background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS.lg,
  padding: 18,
  boxShadow: SHADOWS.soft,
};
const textInputStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: COLORS.inputBg,
  color: COLORS.white,
  border: `1px solid ${COLORS.inputBorder}`,
  borderRadius: RADIUS.md,
  outline: "none",
};

/** ---- Page ---- */
export default function UserProfileScreen() {
  const navigate = useNavigate();
  const [row, setRow] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  // Pour le retour intelligent
  const [hasActiveMatch, setHasActiveMatch] = useState(false);

  // distance stockée dans profile_preferences
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // drafts
  const [cityDraft, setCityDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);

  // autosave
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<number | null>(null);

  // inputs fichiers
  const fileInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) { setLoading(false); return; }

      // Charge profil + préférences
      const [{ data: pData }, { data: prefData }] = await Promise.all([
        supabase
          .from("profiles")
          .select(`
            id, first_name, birthdate, photo_url, city, bio, interests, gallery_urls,
            preferred_genders, preferred_min_age, preferred_max_age
          `)
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("profile_preferences")
          .select("distance_km")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);

      // Vérifie s’il existe un match actif
      const { data: active } = await supabase
        .from("matches")
        .select("id")
        .or(`user1.eq.${userId},user2.eq.${userId}`)
        .eq("active", true)
        .limit(1)
        .maybeSingle();

      setHasActiveMatch(!!active?.id);

      const r = (pData as ProfileRow) ?? null;
      setRow(r);
      setCityDraft(r?.city ?? "");
      setBioDraft(r?.bio ?? "");
      setInterests(r?.interests ?? []);
      const g = (r?.gallery_urls ?? []);
      setGallery([g[0] || "", g[1] || "", g[2] || "", g[3] || ""]);

      if (typeof prefData?.distance_km === "number") setDistanceKm(prefData.distance_km);
      setLoading(false);
    })();
  }, []);

  const age = useMemo(() => ageFromBirthdate(row?.birthdate), [row?.birthdate]);
  const name = row?.first_name ?? "Moi";
  const avatar = row?.photo_url ?? null;

  /** ---------- persistance ---------- */
  const persist = async (partial: Partial<ProfileRow>) => {
    if (!row?.id) return;
    try {
      setSaveState("saving");
      const { error } = await supabase
        .from("profiles")
        .update({ ...partial, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (error) throw error;
      setRow((r) => (r ? { ...r, ...partial } : r));
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 800);
    } catch (e) {
      console.error(e);
      setSaveState("error");
    }
  };

  const scheduleSave = (partial: Partial<ProfileRow>, delay = 600) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      persist(partial);
    }, delay) as unknown as number;
  };

  /** ---------- intérêts ---------- */
  const addInterest = () => {
    const t = newInterest.trim();
    if (!t) return;
    if (interests.includes(t)) { setNewInterest(""); return; }
    const next = [...interests, t];
    setInterests(next);
    setNewInterest("");
    scheduleSave({ interests: next });
  };
  const removeInterest = (t: string) => {
    const next = interests.filter((x) => x !== t);
    setInterests(next);
    scheduleSave({ interests: next });
  };

  /** ---------- uploads Storage ---------- */
  async function uploadImageToBucket(relPath: string, file: File): Promise<string | null> {
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(relPath, file, { cacheControl: "3600", upsert: true });
    if (upErr) {
      console.error(upErr);
      alert("Échec de l’upload de l’image.");
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(relPath);
    return data.publicUrl ?? null;
  }

  // — Avatar
  const onPickAvatar = () => avatarInputRef.current?.click();
  const onFileAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("Image invalide."); return; }

    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;

    const ext = f.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const url = await uploadImageToBucket(path, f);
    if (!url) return;

    await persist({ photo_url: url });
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // — Galerie (4 slots)
  const onPickSlot = (idx: number) => fileInputsRef.current[idx]?.click();

  const onFileSlot = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { alert("Image invalide."); return; }

    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;

    const ext = f.name.split(".").pop() || "jpg";
    const path = `${userId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const url = await uploadImageToBucket(path, f);
    if (!url) return;

    setGallery((arr) => {
      const next = [...arr];
      next[idx] = url;
      persist({ gallery_urls: next.filter(Boolean) });
      return next;
    });

    if (fileInputsRef.current[idx]) fileInputsRef.current[idx]!.value = "";
  };

  const clearSlot = (idx: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGallery((arr) => {
      const next = [...arr];
      next[idx] = "";
      persist({ gallery_urls: next.filter(Boolean) });
      return next;
    });
    if (fileInputsRef.current[idx]) fileInputsRef.current[idx]!.value = "";
  };

  /** ---------- autosave ville/bio ---------- */
  useEffect(() => {
    if (!row?.id) return;
    scheduleSave({ city: cityDraft || null });
  }, [cityDraft]); // eslint-disable-line

  useEffect(() => {
    if (!row?.id) return;
    scheduleSave({ bio: bioDraft || null });
  }, [bioDraft]); // eslint-disable-line

  /** ---------- résumé des préférences ---------- */
  const prefSummary = useMemo(() => {
    const g = row?.preferred_genders ?? [];
    const ageMin = row?.preferred_min_age ?? undefined;
    const ageMax = row?.preferred_max_age ?? undefined;
    const dist = distanceKm ?? undefined;

    const labelMap: Record<string, string> = {
      homme: "Homme",
      femme: "Femme",
      "non-binaire": "Non-binaire",
      "ne-pas-dire": "Ne pas dire",
    };
    const gText =
      g.length === 0
        ? "—"
        : g.every((v) => ["homme", "femme", "non-binaire", "ne-pas-dire"].includes(v)) && g.length >= 4
        ? "Tout le monde"
        : g.map((x) => labelMap[x] || x).join(", ");

    const ageText = ageMin && ageMax ? `${ageMin}–${ageMax} ans` : "—";
    const distText = dist ? `${dist} km` : "—";

    return { gText, ageText, distText };
  }, [row?.preferred_genders, row?.preferred_min_age, row?.preferred_max_age, distanceKm]);

  /** ---------- retour intelligent (avec replace) ---------- */
  const handleSmartBack = () => {
    if (hasActiveMatch) navigate("/chat", { replace: true });
    else navigate("/discover", { replace: true });
  };

  if (loading) {
    return <div style={{ color: "#fff", padding: 20 }}>Chargement…</div>;
  }

  return (
    <div style={screenStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <button
          aria-label="Retour"
          onClick={handleSmartBack}
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <BackIcon />
        </button>
        <div style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 10 }}>
          Mon profil
          {saveState !== "idle" && (
            <span
              style={{
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(255,255,255,0.08)",
              }}
            >
              {saveState === "saving" ? "Sauvegarde…" : saveState === "saved" ? "✔ Sauvegardé" : "⚠︎ Erreur"}
            </span>
          )}
        </div>
        <button
          aria-label="Paramètres"
          onClick={() => navigate("/settings")}
          style={{ background: "transparent", border: "none", cursor: "pointer" }}
        >
          <SettingsIcon />
        </button>
      </header>

      {/* Contenu */}
      <main style={containerStyle}>
        {/* Identité */}
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={onFileAvatar}
              />
              <button
                onClick={onPickAvatar}
                title="Changer la photo de profil"
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: "pointer",
                  borderRadius: 999,
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="avatar"
                    style={{ width: 86, height: 86, borderRadius: 999, objectFit: "cover", boxShadow: SHADOWS.tight }}
                  />
                ) : (
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      borderRadius: 999,
                      background: "transparent",
                      border: `2px dashed ${COLORS.inputBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.text,
                      boxShadow: SHADOWS.tight,
                    }}
                  >
                    <span style={{ fontSize: 12, opacity: 0.8 }}>Photo</span>
                  </div>
                )}
              </button>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 22 }}>
                  {name}
                  {age ? `, ${age}` : ""}
                </h1>
              </div>

              {/* Ville */}
              <div style={{ color: COLORS.text, marginTop: 8, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <input value={cityDraft} onChange={(e) => setCityDraft(e.target.value)} placeholder="Ville" style={{ ...textInputStyle, minWidth: 180 }} />
              </div>
            </div>
          </div>
        </section>

        {/* ▼ Préférences de découverte */}
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Préférences de découverte</h2>
            <button
              onClick={() => navigate("/preferences?from=profile", { state: { from: "profile" } })}
              style={{
                padding: "10px 14px",
                background: COLORS.coral,
                color: COLORS.white,
                border: "none",
                borderRadius: RADIUS.md,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Modifier
            </button>
          </div>
          <div style={{ color: COLORS.text, display: "grid", gap: 6 }}>
            <div>
              <strong>Genre voulu :</strong> {prefSummary.gText}
            </div>
            <div>
              <strong>Âge :</strong> {prefSummary.ageText}
            </div>
            <div>
              <strong>Distance max :</strong> {prefSummary.distText}
            </div>
          </div>
        </section>

        {/* Galerie photos */}
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Photos</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[0, 1, 2, 3].map((idx) => {
              const src = gallery[idx] || "";
              return (
                <div key={idx} style={{ position: "relative", aspectRatio: "1 / 1" }}>
                  <input
                    ref={(el) => (fileInputsRef.current[idx] = el)}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => onFileSlot(idx, e)}
                  />

                  {src ? (
                    <>
                      <img
                        src={src}
                        alt={`photo-${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: RADIUS.lg,
                          boxShadow: SHADOWS.tight,
                        }}
                      />
                      {/* croix = supprimer */}
                      <button
                        onClick={(e) => clearSlot(idx, e)}
                        title="Supprimer"
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.55)",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 18,
                          fontWeight: 800,
                          lineHeight: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 2,
                        }}
                      >
                        ×
                      </button>
                      {/* couche “remplacer” */}
                      <button
                        onClick={() => onPickSlot(idx)}
                        title="Remplacer"
                        style={{
                          position: "absolute",
                          inset: 0,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          borderRadius: RADIUS.lg,
                          zIndex: 1,
                        }}
                      />
                    </>
                  ) : (
                    <button
                      onClick={() => onPickSlot(idx)}
                      aria-label="Ajouter une photo"
                      style={{
                        ...cardStyle,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderStyle: "dashed",
                        borderColor: COLORS.inputBorder,
                        cursor: "pointer",
                        fontSize: 28,
                        fontWeight: 800,
                        color: COLORS.text,
                        padding: 0,
                      }}
                    >
                      +
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bio */}
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>À propos</h2>
          </div>
          <textarea
            value={bioDraft}
            onChange={(e) => setBioDraft(e.target.value)}
            placeholder="Écris quelque chose qui te représente."
            style={{
              width: "100%",
              minHeight: 110,
              marginTop: 12,
              padding: 12,
              background: COLORS.inputBg,
              color: COLORS.white,
              border: `1px solid ${COLORS.inputBorder}`,
              borderRadius: RADIUS.md,
              resize: "vertical",
              outline: "none",
            }}
          />
        </section>

        {/* Centres d'intérêt */}
        <section style={{ ...cardStyle, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Centres d'intérêt</h2>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest();
                }
              }}
              placeholder="Ajouter un intérêt"
              style={{ ...textInputStyle, minWidth: 220 }}
            />
            <button
              onClick={addInterest}
              style={{
                padding: "10px 14px",
                background: COLORS.coral,
                color: COLORS.white,
                border: "none",
                borderRadius: RADIUS.md,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Ajouter
            </button>
          </div>

          {interests.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {interests.map((i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    margin: 6,
                    borderRadius: RADIUS.md,
                    background: COLORS.coral,
                    color: COLORS.white,
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1,
                    boxShadow: SHADOWS.tight,
                  }}
                >
                  {i}
                  <button
                    onClick={() => removeInterest(i)}
                    style={{
                      marginLeft: 4,
                      background: "rgba(0,0,0,0.15)",
                      border: "none",
                      color: COLORS.white,
                      borderRadius: 12,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                    title="Retirer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: COLORS.text }}>Ajoute au moins 3 centres d'intérêt pour de meilleurs matchs.</div>
          )}
        </section>

        <div style={{ height: 24 }} />
      </main>
    </div>
  );
}
