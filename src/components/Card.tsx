// src/components/Card.tsx
import React from 'react';
import { COLORS, RADIUS, SHADOWS } from '../ui/theme';

export default function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="phone-max"
      style={{
        width: '100%',
        borderRadius: RADIUS.xl,
        padding: '40px 28px 28px',
        background: `linear-gradient(180deg, ${COLORS.cardTop}, ${COLORS.cardBottom})`,
        boxShadow: SHADOWS.card,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
