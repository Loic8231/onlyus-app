// src/screens/ProfileDetails.tsx
import React, { useEffect, useMemo, useState } from "react";
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
};

type Profile = {
  id: string;
  first_name: string | null;
  birthdate: string | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  photo_url: string | null;
  gallery_urls: string[] | null;
  gender?: string | null;
};

type MatchRow = {
  id: string;
  user1_id: string;
  user2_id: string;
  is_active: boolean | null;
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

export default function ProfileDetails() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { profileId?: string } };

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState<MatchRow | null>(null);

  const [slide, setSlide] = useState(0);

  // --- Inputs ---
  const profileId =
    location?.state?.profileId ||
    // fallback: query ?profileId=...
    new URLSearchParams(window.location.search).get("profileId") ||
    undefined;

  // --- Load current user id
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setViewerId(data.user?.id ?? null);
    });
  }, []);

  // --- Fetch profile + potential active match
  useEffect(() => {
    (async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const { data: p, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, birthdate, city, bio, interests, photo_url, gallery_urls, gender"
        )
        .eq("id", profileId)
        .maybeSingle();

      if (!error) setProfile((p as Profile) ?? null);

      // If we know the viewer, check if there's an active match (with this profile preferably)
      if (viewerId) {
        const { data: matches } = await supabase
          .from("matches")
          .select("id, user1_id, user2_id, is_active")
          .or(`user1_id.eq.${viewerId},user2_id.eq.${viewerId}`)
          .eq("is_active", true);

        // Prefer a match with this profile, otherwise keep any active match (for “back” logic)
        const withThisProfile =
          matches?.find(
            (m) =>
              (m.user1_id === viewerId && m.user2_id === profileId) ||
              (m.user2_id === viewerId && m.user1_id === profileId)
          ) || null;

        setActiveMatch(withThisProfile ?? (matches?.[0] ?? null));
      }

      setLoading(false);
    })();
  }, [profileId, viewerId]);

  // --- Build gallery
  const gallery = useMemo(() => {
    const list: string[] = [];
    if (profile?.photo_url) list.push(profile.photo_url);
    if (profile?.gallery_urls && profile.gallery_urls.length > 0) {
      for (const url of profile.gallery_urls) {
        if (url && typeof url === "string") list.push(url);
      }
    }
    // Fallback gradient if nothing
    return list;
  }, [profile]);

  const age = ageFromBirthdate(profile?.birthdate);
  const name = profile?.first_name ?? "—";

  const prev = () => setSlide((i) => (gallery.length ? (i - 1 + gallery.length) % gallery.length : 0));
  const next = () => setSlide((i) => (gallery.length ? (i + 1) % gallery.length : 0));

  // --- Back button: smart
  const onBack = () => {
    // If we have real history (arrived from Discover/Chat), go back.
    if ((window.history as any).state?.idx > 0) {
      navigate(-1);
      return;
    }
    // Otherwise decide:
    if (activeMatch) {
      navigate("/chat", { state: { matchId: activeMatch.id } });
    } else {
      navigate("/discover");
    }
  };

  const onReport = () => navigate("/settings/help");

  return (
    <div style={styles.screen} className="app-safe">
      <header style={styles.header} className="phone-max">
        <button aria-label="Retour" onClick={onBack} style={styles.backBtn}>
          ←
        </button>
        <div style={{ fontWeight: 800 }}>Profil</div>
        <div style={{ width: 44 }} />
      </header>

      <main className="phone-max" style={styles.main}>
        {loading ? (
          <div style={{ opacity: 0.8, textAlign: "center", marginTop: 24 }}>
            Chargement du profil…
          </div>
        ) : !profile ? (
          <div style={{ opacity: 0.9, textAlign: "center", marginTop: 24 }}>
            Profil introuvable.
          </div>
        ) : (
          <>
            {/* Photo / Carrousel */}
            <div style={styles.photoWrap}>
              <div
                style={{
                  ...styles.photo,
                  background:
                    gallery.length > 0
                      ? `url(${gallery[slide]}) center/cover no-repeat`
                      : `linear-gradient(135deg, #5EFCE8, #736EFE)`,
                }}
              >
                <div style={styles.badgeCity}>{profile.city ?? "—"}</div>
                {gallery.length > 1 && (
                  <>
                    <button style={styles.navCircle} onClick={prev} aria-label="Précédent">
                      ‹
                    </button>
                    <button style={{ ...styles.navCircle, right: 16, left: "auto" }} onClick={next} aria-label="Suivant">
                      ›
                    </button>
                    <div style={styles.dots}>
                      {gallery.map((_, i) => (
                        <span key={i} style={{ ...styles.dot, opacity: i === slide ? 1 : 0.35 }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Infos */}
            <section style={styles.card}>
              <div style={styles.titleLine}>
                <h1 style={styles.title}>
                  {name} {age ? `· ${age}` : ""}
                </h1>
                <button style={styles.reportBtn} onClick={onReport}>
                  Signaler
                </button>
              </div>

              {profile.bio && <p style={styles.bio}>{profile.bio}</p>}

              {profile.interests && profile.interests.length > 0 && (
                <div style={styles.tags}>
                  {profile.interests.map((t) => (
                    <span key={t} style={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <div className="phone-max" style={styles.homeIndicator} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    padding: "16px 16px 10px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    padding: "10px 12px",
    borderRadius: 16,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 44,
    height: 36,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    color: COLORS.white,
    cursor: "pointer",
  },
  main: { display: "grid", gap: 14 },
  photoWrap: { width: "100%", display: "grid", placeItems: "center" },
  photo: {
    width: "100%",
    maxWidth: 520,
    height: "clamp(300px, 52vw, 380px)",
    borderRadius: 22,
    position: "relative",
    overflow: "hidden",
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(135deg, #5EFCE8, #736EFE)`,
  },
  badgeCity: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: COLORS.white,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
  },
  navCircle: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: 999,
    background: "rgba(0,0,0,0.35)",
    border: `1px solid rgba(255,255,255,0.3)`,
    color: COLORS.white,
    fontSize: 24,
    cursor: "pointer",
  },
  dots: {
    position: "absolute",
    left: "50%",
    bottom: 14,
    transform: "translateX(-50%)",
    display: "flex",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: COLORS.white,
  },
  card: {
    maxWidth: 520,
    width: "100%",
    justifySelf: "center",
    padding: "16px 16px 18px",
    borderRadius: 18,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
  },
  titleLine: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: 0.2 },
  reportBtn: {
    padding: "8px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    color: COLORS.white,
    cursor: "pointer",
  },
  bio: { marginTop: 10, marginBottom: 10, opacity: 0.95, lineHeight: 1.5 },
  tags: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  tag: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.08)",
    fontSize: 12,
    fontWeight: 600,
  },
  homeIndicator: {
    height: 5,
    width: 120,
    borderRadius: 999,
    justifySelf: "center",
    background: "rgba(255,255,255,0.55)",
    marginTop: 8,
  },
};