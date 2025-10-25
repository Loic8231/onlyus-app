// src/components/HeartsLogo.tsx
import React from 'react';
import { COLORS } from '../ui/theme';

export default function HeartsLogo({
  size = 75,
  stroke = 12,
}: { size?: number; stroke?: number }) {
  return (
    <svg width={size * 2} height={size * 2} viewBox="0 0 300 250" fill="none" aria-label="OnlyUS">
      <path
        d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-19 5-25 11-6-6-16-11-25-11z"
        transform="translate(10,-28) scale(1.17)"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M129 66c-12 0-22 10-22 22 0 27 38 43 47 56 9-13 47-29 47-56 0-12-10-22-22-22-9 0-19 5-25 11-6-6-16-11-25-11z"
        transform="translate(-110,-70) scale(1.5)"
        fill="none"
        stroke={COLORS.coral}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="140"
        y="210"
        textAnchor="middle"
        fontSize="60"
        fontWeight="800"
        fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
        fill={COLORS.white}
      >
        OnlyUS
      </text>
    </svg>
  );
}