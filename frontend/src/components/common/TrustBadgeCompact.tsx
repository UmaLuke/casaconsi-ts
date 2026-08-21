// src/components/common/TrustBadgeCompact.tsx
import type { VerificationLevel } from '../../types/trust';

interface TrustBadgeCompactProps {
  score: number;
  maxScore?: number;
  level: VerificationLevel;
  levelLabel: string;
  hideLabel?: boolean;
}

const RING_BORDER: Record<VerificationLevel, string> = {
  sin_verificar: 'border-base-content/30',
  basico: 'border-brand-orange',
  alta_confianza: 'border-brand-teal',
};

const LABEL_COLOR: Record<VerificationLevel, string> = {
  sin_verificar: 'text-base-content/50',
  basico: 'text-brand-orange',
  alta_confianza: 'text-brand-teal',
};

export const TrustBadgeCompact = ({ score, maxScore = 10, level, levelLabel, hideLabel = false}: TrustBadgeCompactProps) => (
  <div className="flex items-center gap-2">
    <div
      className={`flex items-center justify-center size-10 rounded-full border-2 text-[11px] font-bold text-base-content shrink-0 ${RING_BORDER[level]}`}
    >
      {score}/{maxScore}
    </div>
    {!hideLabel && <span className={`text-sm font-semibold ${LABEL_COLOR[level]}`}>{levelLabel}</span>}
  </div>
);