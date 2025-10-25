// src/components/BackButton.tsx
import React from 'react';
import { COLORS, RADIUS, SHADOWS } from '../ui/theme';

export default function BackButton({ onClick, title = 'Retour' }: { onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick ?? (() => window.history.back())}
      aria-label="Retour"
      title={title}
      style={{
        border: `1px solid ${COLORS.border}`,
        background: `linear-gradient(180deg, ${COLORS.glassTop}, ${COLORS.glassBottom})`,
        borderRadius: RADIUS.md,
        padding: '6px 10px',
        fontSize: 18,
        cursor: 'pointer',
        boxShadow: `0 6px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)`,
        color: COLORS.white,
        lineHeight: 1,
      }}
    >
      ←
    </button>
  );
}