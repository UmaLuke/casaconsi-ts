// src/components/features/landing/ExploreSpaces.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, CheckCircle2 } from 'lucide-react';
import { SpaceDetailsModal } from '../spaces/SpaceDetailsModal';
import type { DecisionStatus } from '../spaces/MatchDecisionButtons';
import { useAuth } from '../../../hooks/useAuth';
import { getSpaces, SpaceError } from '../../../services/spaceService';
import { registerLikeDecision, MatchError } from '../../../services/matchService';
import type { Space } from '../../../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS } from '../../../types/filters';

// Vitrina del landing: son los mismos espacios reales que /explorar, sólo
// que acá mostramos un recorte (los primeros N que devuelve la API) a modo
// de preview. El resto se ve entrando a "Ver todos los espacios".
const PREVIEW_COUNT = 3;

export const ExploreSpaces = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [decisions, setDecisions] = useState<Record<string, DecisionStatus>>({});
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const detailsModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let cancelled = false;

    getSpaces()
      .then((result) => {
        if (!cancelled) setSpaces(result.slice(0, PREVIEW_COUNT));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof SpaceError ? err.message : 'No se pudieron cargar los espacios.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = (price: number, currency: 'ARS' | 'USD') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // El listado es público (cualquiera puede ver la vitrina), pero el detalle
  // de un espacio pide sesión: sin token abrimos el login (mismo
  // <dialog id="login_modal"> que monta el Header) en vez del modal de
  // detalles. Mismo criterio que usa la página /explorar.
  const handleOpenDetails = (space: Space) => {
    if (!token) {
      const modal = document.getElementById('login_modal') as HTMLDialogElement | null;
      modal?.showModal();
      return;
    }
    setSelectedSpace(space);
    detailsModalRef.current?.showModal();
  };

  // Mismo criterio que "Ver Detalles": sin sesión, "Ver todos los espacios"
  // no navega a /explorar, abre el login.
  const handleViewAll = () => {
    if (!token) {
      const modal = document.getElementById('login_modal') as HTMLDialogElement | null;
      modal?.showModal();
      return;
    }
    navigate('/explorar');
  };

  const handleDecide = async (space: Space, liked: boolean) => {
    if (!token) return;

    setDecisionError(null);
    setDecisions((prev) => ({ ...prev, [space.id]: 'loading' }));

    try {
      await registerLikeDecision(token, space.hostUserId, liked);
      setDecisions((prev) => ({ ...prev, [space.id]: liked ? 'liked' : 'passed' }));
      detailsModalRef.current?.close();
    } catch (err) {
      setDecisions((prev) => ({ ...prev, [space.id]: 'idle' }));
      setDecisionError(err instanceof MatchError ? err.message : 'No se pudo registrar tu decisión. Probá de nuevo.');
    }
  };

  return (
    <section id="explorar-espacios" className="py-20 bg-base-100">
      <div className="container mx-auto px-4 md:px-6">

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
              Explorar Espacios
            </h2>
            <p className="text-base-content/70 text-lg max-w-2xl font-medium">
              Descubre lugares que se adaptan a tus necesidades académicas y de estilo de vida, ofrecidos por anfitriones dispuestos a compartir su espacio.
            </p>
          </div>
          <button
            type="button"
            onClick={handleViewAll}
            className="btn btn-outline border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-colors"
          >
            Ver todos los espacios
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-brand-teal" />
          </div>
        ) : loadError ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
            <p className="text-lg font-medium text-error">{loadError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spaces.map((space) => (
              <div key={space.id} className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                <figure className="relative h-56 overflow-hidden">
                  <img
                    src={space.imageUrl}
                    alt={space.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 badge bg-brand-navy text-white border-none font-bold py-3 shadow-lg backdrop-blur-sm bg-opacity-90">
                    {formatPrice(space.price, space.currency)}
                  </div>
                </figure>

                <div className="card-body p-6 flex-grow flex flex-col">
                  <h3 className="card-title text-lg font-bold text-base-content leading-tight line-clamp-2">
                    {space.title}
                  </h3>

                  <div className="space-y-2 mt-2">
                    <div className="flex items-start gap-2 text-base-content/70 text-sm">
                      <MapPin className="size-4 text-brand-teal shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{space.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-base-content/70 text-sm">
                      <User className="size-4 text-brand-navy dark:text-base-content shrink-0" />
                      <span>Anfitrión: <span className="font-medium text-base-content">{space.hostType}</span></span>
                      {space.verified && (
                        <div className="tooltip tooltip-top before:text-xs" data-tip="Identidad Verificada">
                          <CheckCircle2 className="size-4 text-success" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="badge badge-outline badge-sm border-brand-teal/50 text-brand-teal bg-brand-teal/5 font-medium">
                      {GENERATION_LABELS[space.hostGeneration]}
                    </span>
                    <span className="badge badge-outline badge-sm border-brand-orange/50 text-brand-orange bg-brand-orange/5 font-medium">
                      {PURPOSE_LABELS[space.purpose]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 mb-4">
                    {space.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="badge badge-ghost badge-sm text-xs text-base-content/70">
                        {amenity}
                      </span>
                    ))}
                    {space.amenities.length > 3 && (
                      <span className="badge badge-ghost badge-sm text-xs text-base-content/70">
                        +{space.amenities.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="card-actions justify-end mt-auto border-t border-base-200 pt-5">
                    <button
                      onClick={() => handleOpenDetails(space)}
                      className="btn bg-brand-navy hover:bg-brand-navy/90 text-white w-full transition-colors"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <SpaceDetailsModal
        ref={detailsModalRef}
        space={selectedSpace}
        formatPrice={formatPrice}
        decisionStatus={selectedSpace ? decisions[selectedSpace.id] ?? 'idle' : 'idle'}
        onReject={(space) => handleDecide(space, false)}
        onLike={(space) => handleDecide(space, true)}
      />

      {decisionError && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-error text-sm shadow-lg">
            <span>{decisionError}</span>
            <button onClick={() => setDecisionError(null)} className="btn btn-xs btn-circle btn-ghost" aria-label="Cerrar aviso">✕</button>
          </div>
        </div>
      )}
    </section>
  );
};
