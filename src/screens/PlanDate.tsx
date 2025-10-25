import React, { useMemo, useState } from "react";

const COLORS = {
  navy: "#0B2A5A",
  navy2: "#102F6A",
  coral: "#FF6B6B",
  blue: "#11A7FF",
  white: "#FFFFFF",
  text: "#EAF0FF",
  fieldBg: "rgba(255,255,255,0.08)",
  fieldBorder: "rgba(255,255,255,0.22)",
  glassTop: "rgba(255,255,255,0.08)",
  glassBottom: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.18)",
};

function HeartsLogo({ size = 56, stroke = 7 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-label="OnlyUS">
      <path d="M64 41c-18 0-33 15-33 33 0 40 56 64 69 83 13-19 69-43 69-83 0-18-15-33-33-33-13 0-24 7-30 17-6-10-17-17-30-17z"
        stroke={COLORS.coral} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-16 5-20 11-4-6-11-11-20-11z"
        transform="translate(-25,0) scale(0.7)"
        stroke={COLORS.blue} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type VenueType = "Café" | "Bar" | "Parc" | "Musée" | "Autre";

export default function PlanDate() {
  const [type, setType] = useState<VenueType>("Café");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [reminder, setReminder] = useState(true);
  const [callBefore, setCallBefore] = useState(true);

  // Valide que la date+heure sont dans le futur (à partir d’aujourd’hui)
  const dateTimeValid = useMemo(() => {
    if (!date || !time) return false;
    const sel = new Date(`${date}T${time}:00`);
    const now = new Date();
    return sel.getTime() > now.getTime();
  }, [date, time]);

  const placeValid = place.trim().length >= 2;
  const canSubmit = placeValid && dateTimeValid;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    console.log("Plan date:", { type, place, date, time, note, reminder, callBefore });
    // prochaine étape: écran de récap / envoi d'invitation
  };

  // min pour l'input date = aujourd’hui
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div style={styles.screen}>
      <div style={styles.container}>
        <div style={styles.header}>
          <HeartsLogo />
          <h1 style={styles.brand}>OnlyUS</h1>
          <h2 style={styles.title}>Planifier une date</h2>
          <p style={styles.subtitle}>Propose un lieu, une date et une heure. Simple et clair.</p>
        </div>

        <form onSubmit={submit} style={styles.form}>
          {/* Type de lieu */}
          <div>
            <label style={styles.label}>Type de lieu</label>
            <div style={styles.typeRow}>
              {(["Café", "Bar", "Parc", "Musée", "Autre"] as VenueType[]).map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      ...styles.typeBtn,
                      background: active ? COLORS.coral : COLORS.fieldBg,
                      color: active ? COLORS.white : COLORS.text,
                      borderColor: active ? "transparent" : COLORS.fieldBorder,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lieu */}
          <label style={styles.label}>
            Lieu (nom exact ou adresse)
            <input
              type="text"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="ex. Café de Flore, 172 Bd Saint-Germain"
              style={{
                ...styles.input,
                borderColor:
                  !place ? COLORS.fieldBorder : placeValid ? "rgba(73,218,131,0.7)" : "rgba(255,107,107,0.7)",
              }}
            />
          </label>

          {/* Date + Heure */}
          <div style={styles.row2}>
            <div style={{ flex: 1 }}>
              <label style={styles.labelSmall}>Date</label>
              <input
                type="date"
                min={todayISO}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: !date ? COLORS.fieldBorder : dateTimeValid ? "rgba(73,218,131,0.7)" : COLORS.fieldBorder,
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.labelSmall}>Heure</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{
                  ...styles.input,
                  borderColor: !time ? COLORS.fieldBorder : dateTimeValid ? "rgba(73,218,131,0.7)" : COLORS.fieldBorder,
                }}
              />
            </div>
          </div>

          {/* Note optionnelle */}
          <label style={styles.label}>
            Message (optionnel)
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. On peut se retrouver devant l’entrée principale 😊"
              style={styles.textarea}
            />
          </label>

          {/* Options */}
          <div style={styles.options}>
            <label style={styles.check}>
              <input
                type="checkbox"
                checked={callBefore}
                onChange={(e) => setCallBefore(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Appel vocal avant la date</span>
            </label>
            <label style={styles.check}>
              <input
                type="checkbox"
                checked={reminder}
                onChange={(e) => setReminder(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Me rappeler 1h avant</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{ ...styles.cta, opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? "pointer" : "not-allowed" }}
          >
            Confirmer l’invitation
          </button>
        </form>
      </div>

      <div style={styles.homeIndicator} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    display: "grid",
    gridTemplateRows: "1fr auto",
    placeItems: "center",
    padding: 20,
    color: COLORS.white,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 600,
    borderRadius: 28,
    padding: "26px 22px 22px",
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
  },
  header: { display: "grid", placeItems: "center", gap: 6, marginBottom: 6, textAlign: "center" as const },
  brand: { margin: 0, fontSize: 32, fontWeight: 800 },
  title: { margin: "2px 0 4px", fontSize: 22, fontWeight: 800, opacity: 0.95 },
  subtitle: { margin: 0, fontSize: 14, opacity: 0.9 },

  form: { display: "flex", flexDirection: "column", gap: 16, marginTop: 10 },

  label: { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, opacity: 0.95 },
  labelSmall: { display: "block", marginBottom: 6, fontSize: 14, opacity: 0.95 },

  typeRow: { display: "flex", flexWrap: "wrap" as const, gap: 10 },
  typeBtn: {
    borderRadius: 16,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 700,
    border: `2px solid ${COLORS.fieldBorder}`,
    cursor: "pointer",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: `2px solid ${COLORS.fieldBorder}`,
    background: COLORS.fieldBg,
    color: COLORS.text,
    outline: "none",
    fontSize: 16,
  },
  row2: { display: "flex", gap: 12 },

  textarea: {
    width: "100%",
    resize: "vertical" as const,
    background: COLORS.fieldBg,
    border: `2px solid ${COLORS.fieldBorder}`,
    color: COLORS.text,
    borderRadius: 14,
    padding: "12px 14px",
    outline: "none",
    fontSize: 16,
    minHeight: 72,
  },

  options: { display: "flex", gap: 16, flexWrap: "wrap" as const, marginTop: 4 },
  check: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, opacity: 0.95 },
  checkbox: { width: 18, height: 18, accentColor: COLORS.coral as any },

  cta: {
    width: "100%",
    border: "none",
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 20,
    padding: "14px 18px",
    fontSize: 18,
    fontWeight: 800,
    boxShadow: "0 12px 28px rgba(255,107,107,0.28)",
    marginTop: 4,
  },

  homeIndicator: {
    height: 5,
    width: 120,
    borderRadius: 999,
    background: "rgba(255,255,255,0.55)",
    marginTop: 10,
  },
};
