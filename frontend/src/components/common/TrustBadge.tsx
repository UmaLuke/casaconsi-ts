import { Check, BadgeCheck } from 'lucide-react';
import type { VerificationLevel } from '../../types/trust';

type TrustBadgeProps = {
  score: number;
  maxScore?: number;
  level: VerificationLevel;
  levelLabel?: string;
  size?: number;
};

const RING_COLOR: Record<VerificationLevel, string> = {
  sin_verificar: 'text-base-content/30',
  basico: 'text-brand-orange',
  alta_confianza: 'text-brand-teal',
};

const LABEL_COLOR: Record<VerificationLevel, string> = {
  sin_verificar: 'text-base-content/50',
  basico: 'text-brand-orange',
  alta_confianza: 'text-brand-teal',
};

export const TrustBadge = ({ score, maxScore = 10, level, levelLabel, size = 88 }: TrustBadgeProps) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={RING_COLOR[level]}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeWidth={6} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={6}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-base-content font-bold" style={{ fontSize: size * 0.24 }}>
            {score}/{maxScore}
          </text>
        </svg>

        {level === 'basico' && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-6 rounded-full bg-brand-orange border-2 border-base-100">
            <Check className="size-3.5 text-white" strokeWidth={3} />
          </span>
        )}
        {level === 'alta_confianza' && (
           <BadgeCheck className="absolute -top-1 -right-1 size-7 text-brand-teal fill-base-100" strokeWidth={2} />
        )}
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-base-content">Puntos de confianza</span>
        {levelLabel && <span className={`text-sm font-medium ${LABEL_COLOR[level]}`}>{levelLabel}</span>}
      </div>
    </div>
  );
};