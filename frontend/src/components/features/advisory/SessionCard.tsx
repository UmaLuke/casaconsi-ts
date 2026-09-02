// src/components/features/advisory/SessionCard.tsx
import { CalendarCheck } from 'lucide-react';
import type { AdvisorySession } from '../../../types/advisor';
import { SESSION_TYPE_LABELS, SESSION_STATUS_LABELS } from '../../../types/advisor';

const STATUS_STYLES: Record<AdvisorySession['status'], string> = {
  pending: 'bg-warning/15 text-warning-content border border-warning/30',
  confirmed: 'bg-brand-teal text-white',
  completed: 'bg-base-300 text-base-content/70',
  cancelled: 'bg-error/15 text-error border border-error/30',
};

interface SessionCardProps {
  session: AdvisorySession;
}

// Reservas centralizadas: la sesión no trae identidad de asesor/a (ver
// types/advisor.ts), así que mostramos "Equipo de Trabajo Social" en vez de
// un nombre puntual.
export const SessionCard = ({ session }: SessionCardProps) => {
  const date = new Date(session.scheduledAt);
  const dateLabel = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeLabel = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center gap-4 bg-base-100 border border-base-200 rounded-2xl px-5 py-4">
      <div className="size-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center flex-none">
        <CalendarCheck className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-base-content truncate">{SESSION_TYPE_LABELS[session.sessionType].label}</p>
        <p className="text-sm text-base-content/60 font-medium truncate">
          {dateLabel}, {timeLabel} hs · Equipo de Trabajo Social
        </p>
      </div>
      <span className={`flex-none text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[session.status]}`}>
        {SESSION_STATUS_LABELS[session.status]}
      </span>
    </div>
  );
};
