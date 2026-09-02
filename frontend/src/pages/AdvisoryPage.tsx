// src/pages/AdvisoryPage.tsx
import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SessionCard } from '../components/features/advisory/SessionCard';
import { BookingForm } from '../components/features/advisory/BookingForm';
import { useAuth } from '../hooks/useAuth';
import { getMySessions } from '../services/advisoryService';
import type { AdvisorySession } from '../types/advisor';

type Tab = 'reservar' | 'sesiones';

export const AdvisoryPage = () => {
  const { token } = useAuth();

  const [tab, setTab] = useState<Tab>('reservar');
  const [sessions, setSessions] = useState<AdvisorySession[]>([]);

  useEffect(() => {
    if (!token) return;
    getMySessions(token).then(setSessions).catch(() => setSessions([]));
  }, [token]);

  const handleBooked = () => {
    if (token) getMySessions(token).then(setSessions).catch(() => {});
    setTab('sesiones');
  };

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Asesorías</h1>
            <p className="text-base-content/70 text-lg max-w-2xl font-medium">
              Coordiná una consulta con nuestro equipo de Trabajo Social. Asignamos la profesional según disponibilidad y te confirmamos por mensaje.
            </p>
          </div>

          <div className="inline-flex gap-1 bg-base-200 p-1 rounded-full mb-7">
            <button
              type="button"
              onClick={() => setTab('reservar')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${tab === 'reservar' ? 'bg-brand-navy text-white' : 'text-base-content/70 hover:bg-base-100'}`}
            >
              Reservar turno
            </button>
            <button
              type="button"
              onClick={() => setTab('sesiones')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${tab === 'sesiones' ? 'bg-brand-navy text-white' : 'text-base-content/70 hover:bg-base-100'}`}
            >
              Mis sesiones
            </button>
          </div>

          {tab === 'reservar' && <BookingForm onBooked={handleBooked} />}

          {tab === 'sesiones' &&
            (sessions.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
                <GraduationCap className="size-10 mx-auto text-base-content/30 mb-4" />
                <p className="text-lg font-medium text-base-content/60">Todavía no tenés asesorías agendadas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 max-w-2xl">
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};
