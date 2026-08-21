// src/pages/SpaceDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, CheckCircle2, Target, Clock, ArrowLeft } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TrustBadgeCompact } from '../components/common/TrustBadgeCompact';
import { MatchDecisionButtons, type DecisionStatus } from '../components/features/spaces/MatchDecisionButtons';
import { useAuth } from '../hooks/useAuth';
import { getSpaceById, SpaceError } from '../services/spaceService';
import { registerLikeDecision, MatchError } from '../services/matchService';
import type { Space } from '../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS, DURATION_LABELS } from '../types/filters';

const LEVEL_LABELS: Record<Space['hostTrustLevel'], string> = {
  sin_verificar: 'Sin verificar',
  basico: 'Básico',
  alta_confianza: 'Alta confianza',
};

export const SpaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const [space, setSpace] = useState<Space | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('idle');
  const [decisionError, setDecisionError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    getSpaceById(id)
      .then((result) => { if (!cancelled) setSpace(result); })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof SpaceError ? err.message : 'No se pudo cargar este espacio.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

  const handleDecide = async (liked: boolean) => {
    if (!space) return;
    if (!token) {
      setDecisionError('Iniciá sesión para marcar match o descartar este espacio.');
      return;
    }
    setDecisionError(null);
    setDecisionStatus('loading');
    try {
      await registerLikeDecision(token, space.hostUserId, liked);
      setDecisionStatus(liked ? 'liked' : 'passed');
    } catch (err) {
      setDecisionStatus('idle');
      setDecisionError(err instanceof MatchError ? err.message : 'No se pudo registrar tu decisión. Probá de nuevo.');
    }
  };

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Link to="/explorar" className="inline-flex items-center gap-2 text-brand-teal font-semibold text-sm mb-6">
            <ArrowLeft className="size-4" />
            Volver a explorar
          </Link>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <span className="loading loading-spinner loading-lg text-brand-teal" />
            </div>
          ) : loadError || !space ? (
            <div className="text-center py-24 px-4 border-2 border-dashed border-error/40 rounded-2xl">
              <p className="text-lg font-medium text-error">{loadError ?? 'No encontramos este espacio.'}</p>
            </div>
          ) : (
            <>
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-base-300 mb-8">
                {space.photoUrls.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`${space.title} — foto ${index + 1} de ${space.photoUrls.length}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      index === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
                {space.photoUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentPhotoIndex((i) => (i === 0 ? space.photoUrls.length - 1 : i - 1))}
                      aria-label="Foto anterior"
                      className="btn btn-circle btn-sm absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none text-base-content shadow-sm"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPhotoIndex((i) => (i === space.photoUrls.length - 1 ? 0 : i + 1))}
                      aria-label="Foto siguiente"
                      className="btn btn-circle btn-sm absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none text-base-content shadow-sm"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      {space.photoUrls.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setCurrentPhotoIndex(index)}
                          aria-label={`Ir a la foto ${index + 1}`}
                          className={`rounded-full transition-all ${
                            index === currentPhotoIndex ? 'size-2 bg-white' : 'size-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {space.verified && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="size-4 text-brand-teal" />
                    <span className="text-xs font-bold text-base-content">Verificado</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mb-3">
                      {space.title}
                    </h1>
                    <div className="flex flex-wrap gap-4 mb-3">
                      <span className="flex items-center gap-1.5 text-sm text-base-content/80">
                        <MapPin className="size-4 text-brand-teal" />
                        {space.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-base-content/80">
                        <Target className="size-4 text-brand-orange" />
                        {PURPOSE_LABELS[space.purpose]}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-base-content/80">
                        <Clock className="size-4 text-brand-orange" />
                        {DURATION_LABELS[space.duration]}
                      </span>
                    </div>
                    <span className="badge badge-outline border-brand-teal/50 text-brand-teal bg-brand-teal/5 font-medium">
                      {GENERATION_LABELS[space.hostGeneration]}
                    </span>
                  </div>

                  <div className="pt-6 border-t border-base-200">
                    <h2 className="text-sm font-bold text-base-content/90 mb-2">Sobre este espacio</h2>
                    <p className="text-sm text-base-content/70 leading-relaxed">{space.description}</p>
                  </div>

                  {space.hostAboutMe && (
                    <div className="pt-6 border-t border-base-200">
                      <h2 className="text-sm font-bold text-base-content/90 mb-3">Sobre el anfitrión</h2>
                      <p className="text-sm text-base-content/70 leading-relaxed italic">&quot;{space.hostAboutMe}&quot;</p>
                    </div>
                  )}

                  {space.amenities.length > 0 && (
                    <div className="pt-6 border-t border-base-200">
                      <h2 className="text-sm font-bold text-base-content/90 mb-3">Comodidades</h2>
                      <div className="flex flex-wrap gap-2">
                        {space.amenities.map((amenity, index) => (
                          <span key={index} className="badge badge-ghost text-xs text-base-content/70">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <div className="border border-base-200 rounded-2xl p-5 sticky top-28">
                    <p className="text-2xl font-black text-brand-teal">
                      {formatPrice(space.price)}
                      <span className="text-sm font-medium text-base-content/50 ml-1">/mes</span>
                    </p>

                    <div className="flex flex-col gap-3 my-4 py-4 border-y border-base-200">
                      <div>
                        <p className="text-sm font-semibold text-base-content">{space.hostName}</p>
                        <p className="text-xs text-base-content/50">Anfitrión</p>
                      </div>
                      <TrustBadgeCompact
                        score={space.hostTrustScore}
                        level={space.hostTrustLevel}
                        levelLabel={LEVEL_LABELS[space.hostTrustLevel]}
                      />
                    </div>

                    {decisionError && <p className="text-xs text-error mb-3">{decisionError}</p>}

                    <MatchDecisionButtons
                      status={decisionStatus}
                      onReject={() => handleDecide(false)}
                      onLike={() => handleDecide(true)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};