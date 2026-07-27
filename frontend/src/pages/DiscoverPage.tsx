// src/pages/DiscoverPage.tsx
// Pantalla de descubrimiento/swipe: un perfil a la vez, con like (✓) o pass (✕).
// Conecta GET /api/match/feed (perfiles del rol opuesto todavía no swipeados,
// ya filtrados por generación) y POST /api/match/like (mismo endpoint que usa
// ExploreSpacesPage/SpaceDetailsModal para el like/pass sobre un Space).
// El backend resuelve el rol (Student ve Hosts, Host ve Students) según el JWT
// — este componente no necesita saberlo.
import { useEffect, useState } from 'react';
import { MapPin, User as UserIcon, Sparkles } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MatchDecisionButtons, type DecisionStatus } from '../components/features/spaces/MatchDecisionButtons';
import { useAuth } from '../hooks/useAuth';
import { getFeed, registerLikeDecision, MatchError } from '../services/matchService';
import type { MatchFeedItem } from '../types/match';
import { API_URL } from '../config';

export const DiscoverPage = () => {
  const { token } = useAuth();

  const [queue, setQueue] = useState<MatchFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('idle');
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [matchBanner, setMatchBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getFeed(token)
      .then((result) => {
        if (!cancelled) setQueue(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof MatchError ? err.message : 'No se pudieron cargar los perfiles.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const current = queue[0] ?? null;

  const handleDecide = async (liked: boolean) => {
    if (!token || !current) return;

    setDecisionError(null);
    setDecisionStatus('loading');

    try {
      const result = await registerLikeDecision(token, current.userId, liked);
      setQueue((prev) => prev.slice(1));
      setDecisionStatus('idle');
      if (result.isMatch) {
        setMatchBanner(`¡Es un match con ${current.fullName}!`);
      }
    } catch (err) {
      setDecisionStatus('idle');
      setDecisionError(err instanceof MatchError ? err.message : 'No se pudo registrar tu decisión. Probá de nuevo.');
    }
  };

  const photoUrl = current?.profilePhotoUrl
    ? `${API_URL}${current.profilePhotoUrl}`
    : null;

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-xl">

          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              Descubrir perfiles
            </h1>
            <p className="text-base-content/70 text-lg font-medium">
              Marcá ✓ si te interesa o ✕ para pasar al siguiente. Si ambos se marcan, ¡es un match!
            </p>
          </div>

          {matchBanner && (
            <div role="alert" className="alert bg-success/10 border border-success/30 text-success mb-6">
              <Sparkles className="size-5" />
              <span className="font-bold">{matchBanner}</span>
              <button onClick={() => setMatchBanner(null)} className="btn btn-xs btn-circle btn-ghost" aria-label="Cerrar aviso">✕</button>
            </div>
          )}

          {decisionError && (
            <div role="alert" className="alert alert-error text-sm mb-6">
              <span>{decisionError}</span>
              <button onClick={() => setDecisionError(null)} className="btn btn-xs btn-circle btn-ghost" aria-label="Cerrar aviso">✕</button>
            </div>
          )}

          {!token ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
              <p className="text-lg font-medium text-base-content/60">Iniciá sesión para ver perfiles.</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-brand-teal" />
            </div>
          ) : loadError ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
              <p className="text-lg font-medium text-error">{loadError}</p>
            </div>
          ) : !current ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
              <UserIcon className="size-10 mx-auto text-base-content/30 mb-4" />
              <p className="text-lg font-medium text-base-content/60">
                No hay más perfiles por ahora. Volvé a pasar más tarde.
              </p>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-lg border border-base-200 overflow-hidden">
              <figure className="relative h-80 w-full overflow-hidden bg-base-200">
                {photoUrl ? (
                  <img src={photoUrl} alt={current.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <UserIcon className="size-20 text-base-content/20" />
                  </div>
                )}
              </figure>

              <div className="card-body p-6 sm:p-8 space-y-4">
                <h2 className="font-extrabold text-2xl text-base-content tracking-tight">
                  {current.fullName}
                </h2>

                {current.neighborhoods.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {current.neighborhoods.map((neighborhood) => (
                      <span key={neighborhood} className="badge badge-outline border-brand-teal/50 text-brand-teal bg-brand-teal/5 font-medium gap-1">
                        <MapPin className="size-3" />
                        {neighborhood}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-base-content/80 leading-relaxed">{current.aboutMe}</p>

                <div className="pt-4 border-t border-base-200">
                  <MatchDecisionButtons
                    status={decisionStatus}
                    onReject={() => handleDecide(false)}
                    onLike={() => handleDecide(true)}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};
