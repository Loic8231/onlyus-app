// src/screens/Discover.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
};

type NearbyRow = {
  id: string;
  first_name: string | null;
  birthdate: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  photo_url: string | null;
  distance_km?: number | null;
};

type RawProfile = {
  id: string;
  first_name: string | null;
  birthdate: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
  city_lat: number | null;
  city_lng: number | null;
};

type CardProfile = {
  id: string;
  name: string;
  age?: number;
  city: string;
  bio: string;
  interests: string[];
  photoUrl?: string | null;
  distance_km?: number | null;
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

// Haversine (km)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function Discover() {
  const [index, setIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [items, setItems] = useState<CardProfile[]>([]);
  const [userPhoto, setUserPhoto] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Chargement des profils proches
  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!userId) {
        setItems([]);
        setLoading(false);
        return;
      }

      // 1) Lecture de MES coord et rayon
      const { data: me } = await supabase
        .from("profiles")
        .select("photo_url, lat, lng, city_lat, city_lng, preferred_distance_km")
        .eq("id", userId)
        .maybeSingle();

      if (me?.photo_url) setUserPhoto(me.photo_url || "");

      // radius : profile_preferences.distance_km > profiles.preferred_distance_km > 50
      const { data: pref } = await supabase
        .from("profile_preferences")
        .select("distance_km")
        .eq("user_id", userId)
        .maybeSingle();

      const myLat =
        (me as any)?.lat ?? (me as any)?.city_lat ?? null;
      const myLon =
        (me as any)?.lng ?? (me as any)?.city_lng ?? null;
      const radius =
        (pref as any)?.distance_km ??
        (me as any)?.preferred_distance_km ??
        50;

      if (myLat == null || myLon == null) {
        setItems([]);
        setLoading(false);
        return;
      }

      // 2) Tentative RPC (si dispo)
      let mapped: CardProfile[] | null = null;
      try {
        const { data, error } = await supabase.rpc("find_nearby_profiles", {
          p_user_id: userId,
          p_lat: myLat,
          p_lon: myLon,
          p_radius_km: radius,
          p_limit: 30,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          const rows = (data as NearbyRow[]) || [];
          mapped = rows.map((r) => ({
            id: r.id,
            name: r.first_name ?? "—",
            age: ageFromBirthdate(r.birthdate),
            city: r.city ?? "—",
            bio: r.bio ?? "",
            interests: r.interests ?? [],
            photoUrl: r.photo_url ?? null,
            distance_km: r.distance_km ?? null,
          }));
        }
      } catch {
        // ignore RPC errors, we will fallback
      }

      // 3) Fallback sans RPC : select + filtre JS par distance
      if (!mapped) {
        const { data: raw, error: selErr } = await supabase
          .from("profiles")
          .select(
            "id, first_name, birthdate, city, bio, interests, photo_url, lat, lng, city_lat, city_lng"
          )
          .neq("id", userId) // pas moi
          .not("photo_url", "is", null) // un minimum pour la carte
          .limit(200);

        if (selErr || !raw) {
          setItems([]);
          setLoading(false);
          return;
        }

        const filtered = (raw as RawProfile[])
          .map((p) => {
            const plat = p.lat ?? p.city_lat ?? null;
            const plon = p.lng ?? p.city_lng ?? null;
            if (plat == null || plon == null) return null;
            const d = haversineKm(myLat, myLon, plat, plon);
            return { p, d };
          })
          .filter(Boolean)
          .filter((x) => (x as any).d <= radius)
          .sort((a: any, b: any) => a.d - b.d)
          .slice(0, 30);

        mapped = filtered.map(({ p, d }: any) => ({
          id: p.id,
          name: p.first_name ?? "—",
          age: ageFromBirthdate(p.birthdate),
          city: p.city ?? "—",
          bio: p.bio ?? "",
          interests: p.interests ?? [],
          photoUrl: p.photo_url ?? null,
          distance_km: d,
        }));
      }

      setItems(mapped);
      setLoading(false);
    })();
  }, []);

  const profile = useMemo(
    () => (items.length > 0 ? items[index % items.length] : null),
    [index, items]
  );

  // ❌ Passer un profil
  const pass = async () => {
    if (!profile) return;
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;

    await supabase.from("passes").insert([{ user_id: userId, target_id: profile.id }]);
    setShowInfo(false);
    setItems((prev) => prev.filter((p) => p.id !== profile.id));
  };

  // ❤️ Liker un profil
  const like = async () => {
    if (!profile) return;
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase.rpc("create_like_and_maybe_match", {
      p_liker_id: userId,
      p_liked_id: profile.id,
    });

    if (error) {
      console.warn("like error:", error.message);
      return;
    }

    if (data?.[0]?.matched) {
      navigate("/match", { state: { matchId: data[0].match_id } });
    } else {
      setItems((prev) => prev.filter((p) => p.id !== profile.id));
    }

    setShowInfo(false);
  };

  const openSettings = () => navigate("/settings");
  const openProfileDetails = () => {
    if (profile) navigate("/profile-details", { state: { profileId: profile.id } });
  };

  return (
    <div className="app-safe" style={styles.screen}>
      <header style={styles.topbar} className="phone-max">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {userPhoto ? (
            <img src={userPhoto} alt="Moi" style={styles.avatar} />
          ) : (
            <div style={styles.avatarFallback}>🙂</div>
          )}
          <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>OnlyUS</div>
        </div>

        <div style={styles.right}>
          <button onClick={openSettings} style={styles.iconBtn} aria-label="Paramètres">
            ⚙️
          </button>
        </div>
      </header>

      <main style={styles.wrap} className="phone-max">
        {loading ? (
          <div style={{ opacity: 0.8, marginTop: 40 }}>Recherche de profils...</div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 14, opacity: 0.9, textAlign: "center" }}>
            Aucun profil à proximité pour l’instant.<br />
            Vérifie ta ville ou ton rayon de recherche.
          </div>
        ) : (
          <>
            <div style={styles.card}>
              <div
                style={{
                  ...styles.photo,
                  background: profile?.photoUrl
                    ? `url(${profile.photoUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, #5EFCE8, #736EFE)`,
                }}
              >
                <div style={styles.badgeCity}>{profile?.city ?? "—"}</div>
              </div>

              <div style={styles.meta}>
                <div style={styles.nameLine}>
                  <span style={styles.name}>{profile?.name ?? "—"}</span>
                  <span style={styles.age}>{profile?.age ? ` ${profile.age}` : ""}</span>
                </div>

                {!showInfo ? (
                  <button
                    onClick={() => setShowInfo(true)}
                    style={styles.smallLink}
                    disabled={!profile}
                  >
                    Voir les infos
                  </button>
                ) : (
                  <div style={styles.infoBlock}>
                    <p style={styles.bio}>{profile?.bio || "—"}</p>
                    <div style={styles.tags}>
                      {(profile?.interests ?? []).map((t) => (
                        <span key={t} style={styles.tag}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {typeof profile?.distance_km === "number" && (
                      <div style={{ marginTop: 8, opacity: 0.85 }}>
                        ~{profile.distance_km.toFixed(1)} km
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.actions}>
              <button
                onClick={pass}
                style={{ ...styles.actionBtn, borderColor: "rgba(255,255,255,0.35)" }}
                aria-label="Passer"
                title="Passer"
                disabled={!profile}
              >
                ✖️
              </button>
              <button
                onClick={openProfileDetails}
                style={{ ...styles.actionBtn, borderColor: "rgba(255,255,255,0.35)" }}
                aria-label="Détails"
                title="Voir les détails"
                disabled={!profile}
              >
                ℹ️
              </button>
              <button
                onClick={like}
                style={{
                  ...styles.actionBtn,
                  background: COLORS.coral,
                  borderColor: "transparent",
                  color: COLORS.white,
                }}
                aria-label="Aimer"
                title="Aimer"
                disabled={!profile}
              >
                ❤️
              </button>
            </div>
          </>
        )}
      </main>

      <div style={styles.homeIndicator} className="phone-max" />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    padding: "16px 16px 10px",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 16,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    objectFit: "cover",
    border: `2px solid ${COLORS.border}`,
  },
  avatarFallback: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.15)",
    border: `2px solid ${COLORS.border}`,
    fontSize: 14,
  },
  right: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    display: "grid",
    placeItems: "center",
    width: 36,
    height: 36,
    borderRadius: 12,
    cursor: "pointer",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
  },
  wrap: { display: "grid", placeItems: "center" },
  card: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 22,
    overflow: "hidden",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
  },
  photo: { height: "clamp(300px, 52vw, 380px)", position: "relative" },
  badgeCity: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: COLORS.white,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },
  meta: { padding: "14px 14px 16px" },
  nameLine: {
    fontSize: 26,
    fontWeight: 800,
    display: "flex",
    alignItems: "baseline",
  },
  name: { letterSpacing: 0.2 },
  age: { opacity: 0.95, fontWeight: 700 },
  smallLink: {
    marginTop: 6,
    fontSize: 14,
    background: "transparent",
    color: "#CFE7FF",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
  infoBlock: { marginTop: 8 },
  bio: { margin: "0 0 8px", fontSize: 14, opacity: 0.95, lineHeight: 1.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: 600,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 12,
    marginTop: 12,
    maxWidth: 460,
    width: "100%",
    justifySelf: "center",
  },
  actionBtn: {
    borderRadius: 18,
    padding: "12px 0",
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
    border: "2px solid",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    color: COLORS.white,
  },
  homeIndicator: {
    height: 5,
    width: 120,
    borderRadius: 999,
    justifySelf: "center",
    background: "rgba(255,255,255,0.55)",
    marginTop: 10,
  },
};


