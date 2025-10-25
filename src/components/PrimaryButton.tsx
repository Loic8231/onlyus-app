// src/components/PrimaryButton.tsx
import React from 'react';
import { COLORS, RADIUS, SHADOWS } from '../ui/theme';

export default function PrimaryButton({
  children,
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { style?: React.CSSProperties }) {
  return (
    <button
      className="btn"
      style={{
        width: '100%',
        border: 'none',
        background: COLORS.coral,
        color: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: '16px 20px',
        fontSize: 20,
        fontWeight: 800,
        cursor: 'pointer',
        boxShadow: SHADOWS.btn,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
