// src/screens/FindSpecial.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Thème + composants partagés (Jour 13)
import { COLORS } from '../ui/theme';
import HeartsLogo from '../components/HeartsLogo';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';

export default function FindSpecial() {
  const navigate = useNavigate();

  return (
    <div className="app-safe" style={styles.screen}>
      <Card style={styles.cardInner}>
        <div style={{ display: 'grid', placeItems: 'center' }}>
          <HeartsLogo />
        </div>

        <div style={styles.textBlock}>
          <h1 className="h1" style={styles.title}>Trouve quelqu’un{'\n'}de spécial</h1>

          <p className="p" style={styles.subtitle}>
            Prends le temps de te découvrir
            <br />
            et rencontre une personne
            <br />
            compatible.
          </p>
        </div>

        <PrimaryButton onClick={() => navigate('/signup')}>
          Continuer
        </PrimaryButton>
      </Card>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: '100vh',
    background: `linear-gradient(160deg, ${COLORS.bg1}, ${COLORS.bg2})`,
    display: 'grid',
    placeItems: 'center',
    padding: 16,
    fontFamily:
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    color: COLORS.white,
  },

  // Mise en page interne : logo / texte / bouton (espaces serrés)
  cardInner: {
    textAlign: 'center',
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
    rowGap: 8,
    padding: '20px 22px 16px', // un peu plus compact que la Card par défaut
  },

  textBlock: {
    alignSelf: 'start',
    marginTop: 0,
  },

  title: {
    whiteSpace: 'pre-line',
    margin: '6px 0 8px',
    fontWeight: 800,
    lineHeight: 1.2,
  },

  subtitle: {
    margin: '0 0 8px',
    lineHeight: 1.45,
    opacity: 0.95,
    fontWeight: 500,
  },
};
