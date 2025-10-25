// src/screens/CreateProfile.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import { COLORS } from "../ui/theme";
import HeartsLogo from "../components/HeartsLogo";
import Card from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";

export default function CreateProfile() {
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [birth, setBirth] = useState("");

  // ▼▼ Ville
  const [city, setCity] = useState("");
  // ▲▲

  const [gender, setGender] =
    useState<"" | "homme" | "femme" | "non-binaire" | "ne-pas-dire" | "autre">("");
  const [customGender, setCustomGender] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const genderWrapRef = useRef<HTMLDivElement | null>(null);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const age = useMemo(() => {
    if (!birth) return null;
    const b = new Date(birth);
    const t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return a;
  }, [birth]);

  const firstNameValid = firstName.trim().length >= 2;
  const ageValid = age !== null && age >= 18 && age < 100;
  const photoValid = !!photoUrl || !!file;
  const genderValid =
    (gender && gender !== "autre") || (gender === "autre" && customGender.trim().length > 0);
  const cityValid = city.trim().length >= 2;

  const canSubmit = firstNameValid && ageValid && photoValid && genderValid && cityValid && !saving;

  const onPickPhoto = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Fichier non valide (image requise).");
      return;
    }
    setError("");
    setFile(f);
    setPhotoUrl(URL.createObjectURL(f)); // preview
  };

  async function uploadAvatarIfNeeded(userId: string): Promise<string | null> {
    if (!file) return null;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { cacheControl: "3600", upsert: true });
    if (upErr) {
      console.error("upload error:", upErr);
      setError("Échec de l’upload de la photo (tu peux réessayer plus tard).");
      return null;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl ?? null;
  }

  /**
   * Géocodage robuste :
   * 1) essaie la RPC Postgres "geocode_city" (si tu l’as créée côté Supabase),
   * 2) sinon fallback sur Nominatim (OpenStreetMap) côté client.
   */
  async function geocodeCity(cityName: string): Promise<{ lat?: number; lon?: number } | null> {
    const input = cityName.trim();
    if (!input) return null;

    // --- Tentative via RPC
    try {
      const { data, error } = await supabase.rpc("geocode_city", { city_input: input });
      if (!error && data && typeof data.lat === "number" && typeof data.lon === "number") {
        return { lat: data.lat, lon: data.lon };
      }
      if (error) console.warn("geocode_city RPC error:", error.message);
    } catch (e) {
      console.warn("geocode_city RPC not available:", e);
    }

    // --- Fallback Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        input
      )}&limit=1&addressdetails=0`;
      const res = await fetch(url, {
        // Nominatim recommande d’identifier l’app ; en front on ne peut pas
        // changer l’en-tête User-Agent, mais on garde une requête propre.
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return null;
      const json = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (!json?.length) return null;
      const first = json[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    } catch (e) {
      console.warn("Nominatim fallback error:", e);
    }

    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError("");

    const { data: userData, error: uErr } = await supabase.auth.getUser();
    if (uErr || !userData.user?.id) {
      setSaving(false);
      setError("Session invalide. Réessaie de te connecter.");
      return;
    }
    const userId = userData.user.id;

    const genderValue = gender === "autre" ? customGender.trim() : gender;
    let finalPhotoUrl = photoUrl;

    // Upload Storage si fichier présent
    const uploaded = await uploadAvatarIfNeeded(userId);
    if (uploaded) finalPhotoUrl = uploaded;

    // Géocodage ville (RPC puis fallback Nominatim)
    const geo = await geocodeCity(city);

    // Enregistre / met à jour le profil
    const payload: any = {
      id: userId,
      first_name: firstName.trim(),
      birthdate: birth,
      gender: genderValue,
      city: city.trim(),
      photo_url: finalPhotoUrl || null,
      profile_complete: true,
      updated_at: new Date().toISOString(),
    };
    if (geo?.lat != null && geo?.lon != null) {
      payload.city_lat = geo.lat;
      payload.city_lng = geo.lon;
    }

    const { error: dbErr } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (dbErr) {
      console.error(dbErr);
      setError("Impossible d’enregistrer le profil pour le moment.");
      setSaving(false);
      return;
    }

    // (Optionnel) initialise les préférences de position pour Discover
    // On ignore silencieusement si la table/colonnes n’existent pas.
    if (geo?.lat != null && geo?.lon != null) {
      try {
        await supabase
          .from("profile_preferences")
          .upsert(
            {
              user_id: userId,
              home_lat: geo.lat,
              home_lng: geo.lon,
              // un défaut raisonnable (modifiable ensuite dans Preferences)
              distance_km: 50,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
      } catch (e) {
        console.warn("profile_preferences upsert skipped:", e);
      }
    }

    setSaving(false);
    // ▼ flag onboarding pour la page Preferences
    navigate("/preferences?from=onboarding", { state: { from: "onboarding" } });
  };

  // Fermer le menu Genre (outside/Escape)
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

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.cardInner}>
        <div style={styles.header}>
          <HeartsLogo />
          <h2 className="h2" style={styles.title}>
            Crée ton profil
          </h2>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          {/* Photo */}
          <div style={styles.photoRow}>
            <div style={{ position: "relative", transform: "translateX(8px)" }}>
              <div style={styles.photoFrame}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Aperçu" style={styles.photoImg} />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <button type="button" onClick={onPickPhoto} style={styles.photoBtn} disabled={saving}>
                Importer une photo
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
          </div>

          {/* Ville */}
          <label style={styles.label}>
            Ville
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="ex. Paris"
              style={{
                ...styles.input,
                borderColor:
                  city.length === 0 ? COLORS.border : cityValid ? "rgba(73,218,131,0.7)" : "rgba(255,107,107,0.7)",
              }}
              autoComplete="address-level2"
              disabled={saving}
            />
          </label>

          {/* Genre */}
          <div aria-label="Genre" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={styles.label}>Genre</span>
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
                {(() => {
                  if (gender === "homme") return "Homme";
                  if (gender === "femme") return "Femme";
                  if (gender === "non-binaire") return "Non-binaire";
                  if (gender === "ne-pas-dire") return "Je préfère ne pas dire";
                  if (gender === "autre") return customGender.trim() ? customGender : "Autre (préciser)";
                  return "Sélectionner…";
                })()}
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginLeft: "auto" }} aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {genderOpen && (
                <div role="listbox" style={styles.genderMenu}>
                  {["homme", "femme", "non-binaire", "ne-pas-dire"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={gender === (opt as any)}
                      onClick={() => {
                        setGender(opt as any);
                        setGenderOpen(false);
                      }}
                      style={{
                        ...styles.genderOption,
                        ...(gender === (opt as any) ? styles.genderOptionActive : {}),
                      }}
                    >
                      {opt === "homme"
                        ? "Homme"
                        : opt === "femme"
                        ? "Femme"
                        : opt === "non-binaire"
                        ? "Non-binaire"
                        : "Je préfère ne pas dire"}
                    </button>
                  ))}

                  <div style={styles.genderCustomRow}>
                    <input
                      type="text"
                      value={customGender}
                      onChange={(e) => {
                        setCustomGender(e.target.value);
                        if (gender !== "autre") setGender("autre");
                      }}
                      placeholder="Autre (préciser)"
                      style={styles.genderCustomInput}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => setGenderOpen(false)}
                      style={styles.genderSaveBtn}
                      disabled={gender === "autre" && customGender.trim().length === 0}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prénom */}
          <label style={styles.label}>
            Prénom
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="ex. Loïc"
              style={{
                ...styles.input,
                borderColor:
                  firstName.length === 0 ? COLORS.border : firstNameValid ? "rgba(73,218,131,0.7)" : "rgba(255,107,107,0.7)",
              }}
              autoComplete="given-name"
              disabled={saving}
            />
          </label>

          {/* Date de naissance */}
          <label style={styles.label}>
            Date de naissance
            <input
              type="date"
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              style={{
                ...styles.input,
                color: COLORS.text,
                borderColor: !birth ? COLORS.border : ageValid ? "rgba(73,218,131,0.7)" : "rgba(255,107,107,0.7)",
              }}
              disabled={saving}
            />
          </label>

          {age !== null && !ageValid && <div style={styles.error}>Tu dois avoir au moins 18 ans.</div>}
          {error && <div style={styles.error}>{error}</div>}

          <PrimaryButton type="submit" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
            {saving ? "Enregistrement…" : "Continuer"}
          </PrimaryButton>
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
  cardInner: { width: "100%", maxWidth: 520, borderRadius: 28, padding: "28px 22px 22px" },
  header: { display: "grid", placeItems: "center", gap: 6, marginBottom: 6, textAlign: "center" as const },
  title: { margin: "2px 0 10px", fontWeight: 800, opacity: 0.95 },
  form: { display: "flex", flexDirection: "column", gap: 16, marginTop: 8 },
  photoRow: { display: "grid", placeItems: "center", gap: 8 },
  photoFrame: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: `2px solid ${COLORS.border}`,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoBtn: {
    display: "block",
    margin: "16px auto 0",
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 20,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(255,107,107,0.28)",
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
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid transparent",
    background: "transparent",
    color: COLORS.white,
    cursor: "pointer",
    fontWeight: 700,
  },
  genderOptionActive: { background: "rgba(255,107,107,0.15)", borderColor: "rgba(255,107,107,0.35)" },
  genderCustomRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
    paddingTop: 4,
    borderTop: `1px dashed ${COLORS.border}`,
    marginTop: 4,
  },
  genderCustomInput: {
    padding: "12px 12px",
    borderRadius: 12,
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.white,
    outline: "none",
    fontSize: 15,
  },
  genderSaveBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: `2px solid ${COLORS.border}`,
    background: COLORS.coral,
    color: COLORS.white,
    fontWeight: 800,
    cursor: "pointer",
    opacity: 1,
  },
  label: { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, opacity: 0.95 },
  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 14,
    border: `2px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    color: COLORS.text,
    outline: "none",
    fontSize: 16,
    caretColor: COLORS.white,
  },
  error: { color: "#FFD2D2", fontSize: 13, marginTop: -6 },
};
