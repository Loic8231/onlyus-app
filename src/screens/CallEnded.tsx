import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  navy: '#0B2A5A',
  navy2: '#102F6A',
  coral: '#FF6B6B',
  blue: '#11A7FF',
  white: '#FFFFFF',
  text: '#EAF0FF',
  glassTop: 'rgba(255,255,255,0.08)',
  glassBottom: 'rgba(255,255,255,0.02)',
  border: 'rgba(255,255,255,0.18)',
  inputBg: 'rgba(255,255,255,0.10)',
  inputBorder: 'rgba(255,255,255,0.22)',
};

export default function CallEnded() {
  const navigate = useNavigate();

  const contact = useMemo(
    () => ({ name: 'Emma', age: 27, duration: 6 * 60 + 32 }),
    []
  );
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [note, setNote] = useState('');

  const mm = String(Math.floor(contact.duration / 60)).padStart(2, '0');
  const ss = String(contact.duration % 60).padStart(2, '0');
  const canSubmit = rating > 0;

  // Auto-retour vers Chat après 3s si l'utilisateur ne touche à rien
  useEffect(() => {
    const t = setTimeout(() => {
      if (rating === 0 && note.trim().length === 0) {
        navigate('/chat', { replace: true });
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [navigate, rating, note]);

  const submit = () => {
    if (!canSubmit) return;
    console.log('Call feedback:', { rating, note });
    navigate('/chat', { replace: true });
  };

  const quick = (action: 'date' | 'chat' | 'report') => {
    console.log('Action:', action);
    if (action === 'chat') navigate('/chat', { replace: true }); // 🔗 Continuer à discuter → Chat
    if (action === 'report') navigate('/end-match');
    if (action === 'date') navigate('/chat'); // à brancher plus tard sur un vrai flow "proposer un date"
  };

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        {/* Avatar + résumé */}
        <div style={styles.header}>
          <div style={styles.avatarWrap}>
            <div
              style={{
                ...styles.avatar,
                background: 'linear-gradient(135deg,#FBD3E9,#BB377D)',
              }}
            />
          </div>
          <h2 style={styles.name}>
            {contact.name}, {contact.age}
          </h2>
          <div style={styles.duration}>
            Appel terminé — {mm}:{ss}
          </div>
        </div>

        {/* Étoiles */}
        <div style={styles.starsRow} aria-label="Note de l'appel">
          {Array.from({ length: 5 }).map((_, i) => {
            const n = i + 1;
            const active = (hover || rating) >= n;
            return (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                style={styles.starBtn}
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3.5l2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 18.8 6.4 20.9l1.1-6.3-4.6-4.5 6.3-.9L12 3.5z"
                    fill={active ? COLORS.coral : 'transparent'}
                    stroke={COLORS.coral}
                    strokeWidth="2"
                  />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Feedback libre */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Un mot sur l'appel (optionnel)…"
          rows={3}
          style={styles.textarea}
        />

        {/* Actions rapides */}
        <div style={styles.quickRow}>
          <button style={styles.quickBtn} onClick={() => quick('date')}>
            Proposer un date
          </button>
          <button style={styles.quickBtn} onClick={() => quick('chat')}>
            Continuer à discuter
          </button>
          <button
            style={{
              ...styles.quickBtn,
              background: 'transparent',
              borderColor: COLORS.border,
            }}
            onClick={() => quick('report')}
          >
            Quitter ce match
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            ...styles.cta,
            opacity: canSubmit ? 1 : 0.6,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          Valider
        </button>
      </div>

      <div style={styles.homeIndicator} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100vh',
    background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.navy2})`,
    color: COLORS.white,
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    display: 'grid',
    gridTemplateRows: '1fr auto',
    padding: '16px 16px 10px',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    justifySelf: 'center',
    borderRadius: 22,
    padding: '18px 16px',
    background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      '0 18px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  header: {
    display: 'grid',
    placeItems: 'center',
    gap: 6,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: '50%',
    border: `2px solid ${COLORS.border}`,
    background: COLORS.glassTop,
    overflow: 'hidden',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  },
  avatar: { width: '100%', height: '100%' },
  name: { margin: '8px 0 2px', fontSize: 20, fontWeight: 800 },
  duration: { fontSize: 13, opacity: 0.9 },

  starsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    margin: '10px 0 8px',
  },
  starBtn: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 2,
  },

  textarea: {
    width: '100%',
    resize: 'vertical' as const,
    background: COLORS.inputBg,
    border: `1px solid ${COLORS.inputBorder}`,
    color: COLORS.text,
    borderRadius: 12,
    padding: '10px 12px',
    outline: 'none',
    fontSize: 14,
    lineHeight: 1.4,
    minHeight: 72,
  },

  quickRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10,
    marginTop: 12,
  },
  quickBtn: {
    border: 'none',
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 14,
    padding: '10px 10px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(255,107,107,0.28)',
  },

  cta: {
    width: '100%',
    border: 'none',
    background: COLORS.coral,
    color: COLORS.white,
    borderRadius: 18,
    padding: '12px 16px',
    fontSize: 18,
    fontWeight: 800,
    boxShadow: '0 12px 28px rgba(255,107,107,0.35)',
    marginTop: 12,
  },

  homeIndicator: {
    height: 5,
    width: 120,
    borderRadius: 999,
    justifySelf: 'center',
    background: 'rgba(255,255,255,0.55)',
    marginTop: 10,
  },
};
