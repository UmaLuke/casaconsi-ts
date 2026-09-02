// src/components/features/advisory/BookingForm.tsx
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { AdvisorySessionType, AvailabilitySlot } from '../../../types/advisor';
import { SESSION_TYPE_LABELS } from '../../../types/advisor';
import { MonthCalendar } from './MonthCalendar';
import { getAvailability, createAdvisorySession, AdvisoryError } from '../../../services/advisoryService';
import { useAuth } from '../../../hooks/useAuth';

interface BookingFormProps {
  onBooked: () => void;
}

const SESSION_TYPES: AdvisorySessionType[] = ['inicial', 'convivencia', 'final'];
const SESSION_PRICE = 50000;

const formatDateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'long' });

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

// Reservas centralizadas (ver AdvisoryService.cs): el cliente elige tipo de
// sesión + día + horario, nunca una asesora puntual — la profesional que
// atiende se asigna internamente según disponibilidad. Reemplaza al viejo
// BookingModal.tsx (que abría por asesora elegida en un catálogo que ya no
// mostramos). Flujo: tipo -> calendario mensual -> horario real (GET
// /api/advisory/availability, ya descuenta lo ocupado) -> confirmar. Sin
// pasarela de pago todavía (ver Asesorias.md), así que la sesión nace
// "pendiente" y el pago se coordina aparte.
export const BookingForm = ({ onBooked }: BookingFormProps) => {
  const { token } = useAuth();

  const [sessionType, setSessionType] = useState<AdvisorySessionType>('inicial');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setIsLoadingSlots(true);
    setSelectedTime(null);
    getAvailability(selectedDate)
      .then((result) => { if (!cancelled) setSlots(result); })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setIsLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const handleConfirm = async () => {
    if (!token || !selectedDate || !selectedTime) return;
    setIsBooking(true);
    setError(null);
    try {
      await createAdvisorySession(token, { sessionType, date: selectedDate, time: selectedTime });
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof AdvisoryError ? err.message : 'No se pudo reservar la sesión. Probá de nuevo.');
    } finally {
      setIsBooking(false);
    }
  };

  const canConfirm = !!selectedDate && !!selectedTime && !isBooking;

  if (confirmed) {
    return (
      <div className="bg-base-100 border border-base-200 rounded-2xl px-8 py-10 flex flex-col items-center text-center gap-3.5 max-w-xl">
        <div className="size-16 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center">
          <Check className="size-7" />
        </div>
        <p className="text-lg font-extrabold text-base-content">¡Tu asesoría quedó agendada!</p>
        <p className="text-sm text-base-content/65 font-medium max-w-sm">
          {SESSION_TYPE_LABELS[sessionType].label} · {selectedDate && formatDateLabel(selectedDate)} a las {selectedTime} hs.
          Te vamos a confirmar por mensaje qué profesional de nuestro equipo de Trabajo Social te va a atender, junto con el link de la videollamada.
        </p>
        <button type="button" onClick={onBooked} className="btn bg-brand-navy hover:bg-brand-navy/90 text-white border-none mt-1">
          Ver mis sesiones
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start max-w-3xl">
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <p className="text-xs font-bold text-base-content/55 uppercase tracking-wide mb-2.5">Tipo de sesión</p>
          <div className="flex flex-col gap-2">
            {SESSION_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSessionType(t)}
                className={`text-left rounded-xl px-3.5 py-3 border-[1.5px] transition-colors ${
                  sessionType === t
                    ? 'bg-brand-orange/10 border-brand-orange text-[#9a4300]'
                    : 'bg-base-100 border-base-300 text-base-content hover:bg-base-200'
                }`}
              >
                <span className="block font-bold text-sm">{SESSION_TYPE_LABELS[t].label}</span>
                <span className="block text-xs mt-0.5 opacity-75">{SESSION_TYPE_LABELS[t].desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-base-content/55 uppercase tracking-wide mb-2.5">Elegí un día</p>
          <MonthCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>

        {selectedDate && (
          <div>
            <p className="text-xs font-bold text-base-content/55 uppercase tracking-wide mb-2.5">Horario disponible</p>
            {isLoadingSlots ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm text-brand-teal" />
              </div>
            ) : slots.every((s) => !s.available) ? (
              <p className="text-sm text-base-content/60 font-medium">No hay horarios disponibles ese día. Probá con otra fecha.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSelectedTime(s.time)}
                    className={`rounded-[10px] py-2.5 text-[13px] font-bold text-center transition-colors ${
                      !s.available
                        ? 'bg-base-200 text-base-content/30 cursor-not-allowed'
                        : selectedTime === s.time
                          ? 'bg-brand-teal text-white'
                          : 'border border-base-300 text-base-content hover:bg-base-200'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:sticky lg:top-28 bg-base-100 border border-base-200 rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wide">Resumen</p>
          <p className="text-sm font-bold text-base-content mt-2">{SESSION_TYPE_LABELS[sessionType].label}</p>
          <p className="text-[13px] text-base-content/60 font-medium mt-0.5">
            {selectedDate ? formatDateLabel(selectedDate) : 'Elegí un día'} · {selectedTime ?? '—'} hs
          </p>
          <p className="text-[13px] text-base-content/60 font-medium mt-1.5">Videollamada · 50 min</p>
        </div>
        <div className="h-px bg-base-200" />
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-base-content/65">Total</span>
          <span className="text-xl font-extrabold text-brand-navy">{formatPrice(SESSION_PRICE)}</span>
        </div>
        {error && <p className="text-sm text-error font-semibold">{error}</p>}
        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="btn bg-brand-orange hover:bg-brand-orange/90 disabled:bg-base-200 disabled:text-base-content/40 text-white border-none w-full"
        >
          {isBooking ? <span className="loading loading-spinner loading-sm" /> : 'Confirmar y pagar'}
        </button>
        <p className="text-xs text-base-content/50 leading-relaxed">
          La profesional que te va a atender se asigna según disponibilidad dentro de nuestro equipo de Trabajo Social. El pago se coordina fuera de la plataforma por ahora.
        </p>
      </div>
    </div>
  );
};
