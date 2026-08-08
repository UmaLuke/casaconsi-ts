// src/components/features/spaces/SpaceDetailsModal.tsx
import { forwardRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, User, CheckCircle2, Clock, Target } from 'lucide-react';
import type { Space } from '../../../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS, DURATION_LABELS } from '../../../types/filters';
import { MatchDecisionButtons, type DecisionStatus } from './MatchDecisionButtons';

interface SpaceDetailsModalProps {
  space: Space | null;
  formatPrice: (price: number, currency: 'ARS' | 'USD') => string;
  decisionStatus: DecisionStatus;
  onReject: (space: Space) => void;
  onLike: (space: Space) => void;
}

// Modal de detalle de un espacio. Se mantiene siempre montado (fuera del
// .map de la grilla) y se controla imperativamente vía ref (showModal/close),
// siguiendo el mismo patrón <dialog> nativo + DaisyUI que LoginModal.
export const SpaceDetailsModal = forwardRef<HTMLDialogElement, SpaceDetailsModalProps>(
  ({ space, formatPrice, decisionStatus, onReject, onLike }, ref) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // El modal queda siempre montado y se reutiliza para cualquier space que
    // se abra (ver comentario debajo) — hay que resetear el índice del
    // carrusel cada vez que cambia el space, si no arranca en la última foto
    // que se haya visto de otro anuncio.
    useEffect(() => {
      setCurrentPhotoIndex(0);
    }, [space?.id]);

    return (
      <dialog ref={ref} id="space_details_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 bg-base-100 shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          {space && (
            <>
              <div className="relative h-64 w-full overflow-hidden rounded-t-2xl bg-base-300">
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
                      onClick={() =>
                        setCurrentPhotoIndex((i) => (i === 0 ? space.photoUrls.length - 1 : i - 1))
                      }
                      aria-label="Foto anterior"
                      className="btn btn-circle btn-sm absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none text-base-content shadow-sm"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPhotoIndex((i) => (i === space.photoUrls.length - 1 ? 0 : i + 1))
                      }
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

                <form method="dialog">
                  <button
                    className="btn btn-sm btn-circle absolute top-3 right-3 bg-white/90 hover:bg-white border-none text-base-content shadow-sm"
                    aria-label="Cerrar modal"
                  >
                    ✕
                  </button>
                </form>
                {space.verified && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="size-4 text-brand-teal" />
                    <span className="text-xs font-bold text-base-content">Verificado</span>
                  </div>
                )}
                <div className="absolute top-3 right-14 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-base font-black text-brand-teal">
                    {formatPrice(space.price, space.currency)}
                  </span>
                  <span className="text-xs font-medium text-base-content/60 ml-1">/mes</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <h3 className="font-extrabold text-2xl text-base-content tracking-tight">
                  {space.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-base-content/80">
                    <MapPin className="size-4 text-brand-teal shrink-0" />
                    <span>{space.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/80">
                    <User className="size-4 text-brand-navy shrink-0" />
                    <span>Anfitrión: <span className="font-medium">{space.hostName}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/80">
                    <Target className="size-4 text-brand-orange shrink-0" />
                    <span>{PURPOSE_LABELS[space.purpose]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-base-content/80">
                    <Clock className="size-4 text-brand-orange shrink-0" />
                    <span>{DURATION_LABELS[space.duration]}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-outline border-brand-teal/50 text-brand-teal bg-brand-teal/5 font-medium">
                    {GENERATION_LABELS[space.hostGeneration]}
                  </span>
                </div>

                {space.amenities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-base-content/90 mb-2">Comodidades</h4>
                    <div className="flex flex-wrap gap-2">
                      {space.amenities.map((amenity, index) => (
                        <span key={index} className="badge badge-ghost text-xs text-base-content/70">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-base-200">
                  <MatchDecisionButtons
                    status={decisionStatus}
                    onReject={() => onReject(space)}
                    onLike={() => onLike(space)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-sm">
          <button>cerrar</button>
        </form>
      </dialog>
    );
  }
);

SpaceDetailsModal.displayName = 'SpaceDetailsModal';
