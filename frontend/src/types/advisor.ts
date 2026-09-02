// src/types/advisor.ts
export type AdvisorySessionType = 'inicial' | 'convivencia' | 'final';
export type AdvisorySessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface AvailabilitySlot {
  time: string; // "HH:mm"
  available: boolean;
}

// Reservas centralizadas: el cliente nunca ve ni elige una asesora puntual
// (ver AdvisoryService.cs en el backend), así que la sesión no trae
// identidad de asesor/a — solo tipo, fecha y estado.
export interface AdvisorySession {
  id: string;
  sessionType: AdvisorySessionType;
  scheduledAt: string; // ISO
  status: AdvisorySessionStatus;
  price: number;
}

export const SESSION_TYPE_LABELS: Record<AdvisorySessionType, { label: string; desc: string }> = {
  inicial: { label: 'Asesoría de Inicio y Acuerdos', desc: 'Acuerdos personalizados y elaboración de contrato' },
  convivencia: { label: 'Asesoría de Revisión y Convivencia', desc: 'Consultoría, prevención y resolución de conflictos' },
  final: { label: 'Asesoría de Cierre', desc: 'Valoración y cierre' },
};

export const SESSION_STATUS_LABELS: Record<AdvisorySessionStatus, string> = {
  pending: 'Pendiente de confirmación',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};
