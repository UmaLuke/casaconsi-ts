// src/pages/MessagesPage.tsx
import { useEffect, useState } from 'react';
import { Heart, MessageSquare, User as UserIcon } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { getMatches, MatchError } from '../services/matchService';
import type { MatchSummary } from '../types/match';
import { API_URL } from '../config';

export const MessagesPage = () => {
  const { token } = useAuth();
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getMatches(token)
      .then((result) => {
        if (!cancelled) setMatches(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof MatchError ? err.message : 'No se pudieron cargar tus matches.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6 space-y-14">
          {/* Sección Match's */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="space-y-2 md:shrink-0">
                <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
                  Match&apos;s
                </h1>
                <p className="text-base-content/70 text-lg max-w-2xl font-medium">
                  Aquí podrás ver tus conexiones.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-16 rounded-2xl border border-base-200 md:flex-1">
                  <span className="loading loading-spinner loading-lg text-brand-teal" />
                </div>
              ) : error ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl md:flex-1">
                  <p className="text-lg font-medium text-error">{error}</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl md:flex-1">
                  <Heart className="size-10 mx-auto text-base-content/30 mb-4" />
                  <p className="text-lg font-medium text-base-content/60">
                    Todavía no tenés matches confirmados.
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto p-4 rounded-2xl border border-base-200 snap-x snap-mandatory md:flex-1">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="snap-start shrink-0 w-36 flex flex-col items-center gap-2 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm"
                    >
                      <div className="avatar">
                        <div className="w-20 rounded-full ring ring-brand-teal/30 ring-offset-2 ring-offset-base-100 bg-base-200">
                          {match.counterpartPhotoUrl ? (
                            <img
                              src={`${API_URL}${match.counterpartPhotoUrl}`}
                              alt={match.counterpartName}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <UserIcon className="size-8 text-base-content/40" />
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-center truncate w-full">
                        {match.counterpartName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Sección Mensajes */}
          <section>
            <div className="mb-6 space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
                Mensajes
              </h1>
              <p className="text-base-content/70 text-lg max-w-2xl font-medium">
                Acá vas a poder chatear con tus matches.
              </p>
            </div>

            {/* TODO: conectar cuando exista el chat en tiempo real (SignalR). */}
            <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
              <MessageSquare className="size-10 mx-auto text-base-content/30 mb-4" />
              <p className="text-lg font-medium text-base-content/60">
                Todavía no tenés conversaciones activas.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
