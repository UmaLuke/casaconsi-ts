// src/components/features/advisory/MonthCalendar.tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthCalendarProps {
  selectedDate: string | null;
  onSelect: (isoDate: string) => void;
  // Cuántos meses hacia adelante se puede navegar (hoy = mes 0).
  monthsAheadCap?: number;
}

const MONTH_NAMES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

interface CalendarCell {
  key: string;
  blank: boolean;
  num?: number;
  iso?: string;
  disabled?: boolean;
  isToday?: boolean;
}

// Calendario mensual con navegación ‹ mes › — reemplaza la tira de días fija
// (ver docs/vault-casaconsi/modulos/Asesorias.md): así se puede reservar para
// otra semana sin esperar a que llegue. Fines de semana y días pasados
// deshabilitados (las asesorías son de lunes a viernes — ver AdvisoryService.cs).
export const MonthCalendar = ({ selectedDate, onSelect, monthsAheadCap = 2 }: MonthCalendarProps) => {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const todayIso = toISO(today);
  const cursorAbs = cursor.year * 12 + cursor.month;
  const todayAbs = today.getFullYear() * 12 + today.getMonth();
  const prevDisabled = cursorAbs <= todayAbs;
  const nextDisabled = cursorAbs >= todayAbs + monthsAheadCap;

  const first = new Date(cursor.year, cursor.month, 1);
  const startWeekday = (first.getDay() + 6) % 7; // Lunes = 0
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ key: `b${i}`, blank: true });
  for (let dnum = 1; dnum <= daysInMonth; dnum++) {
    const dateObj = new Date(cursor.year, cursor.month, dnum);
    const iso = toISO(dateObj);
    const dow = dateObj.getDay();
    cells.push({
      key: iso,
      blank: false,
      num: dnum,
      iso,
      disabled: dow === 0 || dow === 6 || iso < todayIso,
      isToday: iso === todayIso,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ key: `be${cells.length}`, blank: true });

  const monthName = MONTH_NAMES_ES[cursor.month];
  const monthLabel = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${cursor.year}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          disabled={prevDisabled}
          onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
          className="btn btn-circle btn-xs btn-ghost border border-base-300 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="text-sm font-bold text-base-content min-w-[120px] text-center">{monthLabel}</span>
        <button
          type="button"
          disabled={nextDisabled}
          onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
          className="btn btn-circle btn-xs btn-ghost border border-base-300 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAY_LABELS.map((wd) => (
          <span key={wd} className="text-center text-[11px] font-bold text-base-content/40 uppercase">{wd}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) =>
          c.blank ? (
            <div key={c.key} className="aspect-square" />
          ) : (
            <button
              key={c.key}
              type="button"
              disabled={c.disabled}
              onClick={() => c.iso && onSelect(c.iso)}
              className={`aspect-square rounded-[10px] text-[13px] font-semibold flex items-center justify-center transition-colors ${
                c.disabled
                  ? 'text-base-content/25 cursor-not-allowed'
                  : c.iso === selectedDate
                    ? 'bg-brand-navy text-white'
                    : c.isToday
                      ? 'border-[1.5px] border-brand-navy text-brand-navy hover:bg-brand-navy/5'
                      : 'border border-base-300 text-base-content hover:bg-base-200'
              }`}
            >
              {c.num}
            </button>
          ),
        )}
      </div>
    </div>
  );
};
