// src/pages/ExploreSpacesPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, User, CheckCircle2, SlidersHorizontal, X, LayoutGrid, UserRound } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SpaceDetailsModal } from '../components/features/spaces/SpaceDetailsModal';
import { MatchDecisionButtons, type DecisionStatus } from '../components/features/spaces/MatchDecisionButtons';
import { useSpaceFilters } from '../hooks/useSpaceFilters';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useAuth } from '../hooks/useAuth';
import { getSpaces, SpaceError } from '../services/spaceService';
import { registerLikeDecision, MatchError } from '../services/matchService';
import type { Space } from '../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS, DURATION_LABELS, type Generation, type Purpose, type Duration } from '../types/filters';

export const ExploreSpacesPage = () => {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useSpaceFilters();
  const { token } = useAuth();

  const { rate, isLoading } = useExchangeRate();
  const [preferredCurrency, setPreferredCurrency] = useState<'ARS' | 'USD'>('ARS');

  // Vista de demo para el cliente: "grid" es la grilla de cards actual,
  // "profile" reutiliza el estilo de card grande de DiscoverPage, al estilo
  // Tinder: un solo espacio a la vez, sin botón para "pasar" sin decidir —
  // la única forma de avanzar es marcando like (✓) o pass (✕).
  const [viewMode, setViewMode] = useState<'grid' | 'profile'>('grid');
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [spacesError, setSpacesError] = useState<string | null>(null);

  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const detailsModalRef = useRef<HTMLDialogElement>(null);

  // Estado de la decisión (like/pass) por Space.id, compartido entre la
  // card de la grilla y el modal de detalles para que queden sincronizados.
  const [decisions, setDecisions] = useState<Record<string, DecisionStatus>>({});
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // Ver el detalle de un espacio (foto grande, comodidades, like/pass) pide
  // sesión — sin token abrimos el login (mismo <dialog id="login_modal">
  // que monta el Header) en vez del modal de detalles.
  const handleOpenDetails = (space: Space) => {
    if (!token) {
      const modal = document.getElementById('login_modal') as HTMLDialogElement | null;
      modal?.showModal();
      return;
    }
    setSelectedSpace(space);
    detailsModalRef.current?.showModal();
  };

  const handleDecide = async (space: Space, liked: boolean) => {
    if (!token) {
      setDecisionError('Iniciá sesión para marcar match o descartar un perfil.');
      return;
    }

    setDecisionError(null);
    setDecisions((prev) => ({ ...prev, [space.id]: 'loading' }));

    try {
      await registerLikeDecision(token, space.hostUserId, liked);
      setDecisions((prev) => ({ ...prev, [space.id]: liked ? 'liked' : 'passed' }));
      // En la vista "Perfil" esto hace que el siguiente espacio de la cola
      // ocupe el lugar automáticamente (no afecta a la grilla, que sigue
      // mostrando todos los espacios con su badge de decisión).
      setSwipedIds((prev) => new Set(prev).add(space.id));
      detailsModalRef.current?.close();
    } catch (err) {
      setDecisions((prev) => ({ ...prev, [space.id]: 'idle' }));
      setDecisionError(err instanceof MatchError ? err.message : 'No se pudo registrar tu decisión. Probá de nuevo.');
    }
  };

  useEffect(() => {
    let cancelled = false;

    getSpaces()
      .then((result) => {
        if (!cancelled) setSpaces(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setSpacesError(err instanceof SpaceError ? err.message : 'No se pudieron cargar los espacios.');
      })
      .finally(() => {
        if (!cancelled) setSpacesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      if (filters.neighborhood && !space.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) return false;
      if (filters.generation && space.hostGeneration !== filters.generation) return false;
      if (filters.purpose && space.purpose !== filters.purpose) return false;
      if (filters.duration && space.duration !== filters.duration) return false;
      if (filters.verifiedOnly && !space.verified) return false;
      return true;
    });
  }, [filters, spaces]);

  // Cola de la vista "Perfil": los espacios ya decididos (like o pass) se
  // sacan de encima; el primero que queda es el que se muestra.
  const profileQueue = useMemo(
    () => filteredSpaces.filter((space) => !swipedIds.has(space.id)),
    [filteredSpaces, swipedIds],
  );
  const currentProfileSpace = profileQueue[0] ?? null;

  const formatPrice = (basePrice: number, baseCurrency: 'ARS' | 'USD') => {
    let finalPrice = basePrice;

    if (preferredCurrency === 'USD' && baseCurrency === 'ARS' && rate) {
      finalPrice = basePrice / rate;
    } else if (preferredCurrency === 'ARS' && baseCurrency === 'USD' && rate) {
      finalPrice = basePrice * rate;
    }

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: preferredCurrency,
      maximumFractionDigits: preferredCurrency === 'USD' ? 0 : 0,
    }).format(finalPrice);
  };

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6">

          <div className="mb-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
                Explorar Espacios
              </h1>
              <p className="text-base-content/70 text-lg max-w-2xl font-medium">
                Encuentra el espacio ideal. Los filtros se adaptan automáticamente para ofrecerte las mejores opciones de convivencia.
              </p>
            </div>

            {/* Toggle de demo: permite mostrarle al cliente ambas versiones sin tocar código. */}
            <div className="join border border-base-300 rounded-full p-0.5 bg-base-100 shrink-0 self-start" role="group" aria-label="Cambiar vista de espacios">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`btn btn-xs join-item rounded-full gap-1.5 border-none ${
                  viewMode === 'grid' ? 'bg-brand-teal text-white' : 'btn-ghost text-base-content/60'
                }`}
              >
                <LayoutGrid className="size-3.5" />
                Cuadrícula
              </button>
              <button
                type="button"
                onClick={() => setViewMode('profile')}
                aria-pressed={viewMode === 'profile'}
                className={`btn btn-xs join-item rounded-full gap-1.5 border-none ${
                  viewMode === 'profile' ? 'bg-brand-teal text-white' : 'btn-ghost text-base-content/60'
                }`}
              >
                <UserRound className="size-3.5" />
                Perfil
              </button>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 shadow-sm border border-base-200 mb-8 overflow-visible">
            <input type="checkbox" className="peer" aria-label="Alternar panel de filtros" />

            <div className="collapse-title flex items-center gap-3 p-5 md:px-6 md:py-4 peer-checked:pb-2 transition-all">
              <div className="flex items-center gap-2 text-base-content/90">
                <SlidersHorizontal className="size-5 text-brand-teal" />
                <h2 className="font-bold text-lg select-none">Filtros</h2>
              </div>
              {activeFilterCount > 0 && (
                <span className="badge badge-sm bg-brand-orange text-white border-none font-bold">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="collapse-content px-5 md:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">

                <div className="form-control">
                  <label htmlFor="filter-neighborhood" className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Barrio o zona</span>
                  </label>
                  <input
                    id="filter-neighborhood"
                    type="text"
                    placeholder="Ej: Nueva Córdoba"
                    className="input input-bordered input-sm w-full focus-within:outline-brand-teal transition-all"
                    value={filters.neighborhood ?? ''}
                    onChange={(e) => updateFilter('neighborhood', e.target.value || undefined)}
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="filter-generation" className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Anfitrión</span>
                  </label>
                  <select
                    id="filter-generation"
                    className="select select-bordered select-sm w-full focus-within:outline-brand-teal transition-all"
                    value={filters.generation ?? ''}
                    onChange={(e) => updateFilter('generation', (e.target.value || undefined) as Generation | undefined)}
                  >
                    <option value="">Cualquier generación</option>
                    {Object.entries(GENERATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label htmlFor="filter-purpose" className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Propósito</span>
                  </label>
                  <select
                    id="filter-purpose"
                    className="select select-bordered select-sm w-full focus-within:outline-brand-teal transition-all"
                    value={filters.purpose ?? ''}
                    onChange={(e) => updateFilter('purpose', (e.target.value || undefined) as Purpose | undefined)}
                  >
                    <option value="">Cualquiera</option>
                    {Object.entries(PURPOSE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label htmlFor="filter-duration" className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Duración</span>
                  </label>
                  <select
                    id="filter-duration"
                    className="select select-bordered select-sm w-full focus-within:outline-brand-teal transition-all"
                    value={filters.duration ?? ''}
                    onChange={(e) => updateFilter('duration', (e.target.value || undefined) as Duration | undefined)}
                  >
                    <option value="">Todas</option>
                    {Object.entries(DURATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Seguridad</span>
                  </label>
                  <label htmlFor="filter-verified" className="label cursor-pointer justify-start gap-2 py-1.5 hover:bg-base-200/50 rounded-lg px-2 transition-colors">
                    <input
                      id="filter-verified"
                      type="checkbox"
                      className="checkbox checkbox-sm [--chkbg:var(--color-brand-teal)] [--chkfg:white] border-base-300"
                      checked={filters.verifiedOnly ?? false}
                      onChange={(e) => updateFilter('verifiedOnly', e.target.checked || undefined)}
                    />
                    <span className="label-text text-sm font-medium">Solo verificados</span>
                  </label>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-6 flex justify-end border-t border-base-200 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <X className="size-4" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold text-base-content">
              {filteredSpaces.length} {filteredSpaces.length === 1 ? 'espacio encontrado' : 'espacios encontrados'}
            </h2>

            <div className="flex items-center gap-2">
              <label htmlFor="currency-select" className="text-sm font-medium text-base-content/70">Moneda:</label>
              <select
                id="currency-select"
                className="select select-bordered select-sm focus-within:outline-brand-teal"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value as 'ARS' | 'USD')}
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {spacesLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-brand-teal" />
            </div>
          ) : spacesError ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
              <p className="text-lg font-medium text-error">{spacesError}</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredSpaces.map((space) => (
                    <div key={space.id} className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group flex flex-col">
                      <figure className="relative aspect-4/3 overflow-hidden">
                        <img src={space.imageUrl} alt={space.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        {space.verified && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="size-4 text-brand-teal" />
                            <span className="text-xs font-bold text-base-content">Verificado</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
                          <span className="text-sm font-black text-brand-teal">
                            {isLoading ? '...' : formatPrice(space.price, space.currency)}
                          </span>
                          <span className="text-xs font-medium text-base-content/60 ml-1">/mes</span>
                        </div>
                      </figure>
                      <div className="card-body p-6 grow flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="card-title text-lg leading-tight group-hover:text-brand-teal transition-colors">{space.title}</h3>
                        </div>
                        <div className="space-y-2 mt-auto pt-4 border-t border-base-100">
                          <div className="flex items-center gap-2 text-sm text-base-content/70">
                            <MapPin className="size-4 shrink-0" />
                            <span className="truncate">{space.neighborhood}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-base-content/70">
                            <User className="size-4 shrink-0" />
                            <span className="truncate">{space.hostName}</span>
                          </div>
                        </div>
                        <div className="card-actions justify-end mt-4">
                          <button
                            onClick={() => handleOpenDetails(space)}
                            className="btn btn-primary btn-sm w-full text-white bg-brand-teal hover:bg-brand-teal/90 border-none"
                          >
                            Ver detalles
                          </button>
                        </div>
                        <MatchDecisionButtons
                          status={decisions[space.id] ?? 'idle'}
                          onReject={() => handleDecide(space, false)}
                          onLike={() => handleDecide(space, true)}
                          className="mt-3"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentProfileSpace ? (
                /* Vista "Perfil": estilo Tinder — un solo espacio a la vez, mismo
                   look de card grande que DiscoverPage. Sin botón para "pasar";
                   la única salida es decidir like (✓) o pass (✕). */
                <div className="max-w-xl mx-auto">
                  <div className="card bg-base-100 shadow-lg border border-base-200 overflow-hidden">
                    <figure className="relative h-80 w-full overflow-hidden bg-base-200">
                      <img src={currentProfileSpace.imageUrl} alt={currentProfileSpace.title} className="w-full h-full object-cover" />
                      {currentProfileSpace.verified && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="size-4 text-brand-teal" />
                          <span className="text-xs font-bold text-base-content">Verificado</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
                        <span className="text-sm font-black text-brand-teal">
                          {isLoading ? '...' : formatPrice(currentProfileSpace.price, currentProfileSpace.currency)}
                        </span>
                        <span className="text-xs font-medium text-base-content/60 ml-1">/mes</span>
                      </div>
                    </figure>

                    <div className="card-body p-6 sm:p-8 space-y-4">
                      <h2 className="font-extrabold text-2xl text-base-content tracking-tight">
                        {currentProfileSpace.title}
                      </h2>

                      <div className="flex items-center gap-2 text-sm text-base-content/70">
                        <User className="size-4 shrink-0" />
                        <span className="truncate">Anfitrión: {currentProfileSpace.hostName}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-outline border-brand-teal/50 text-brand-teal bg-brand-teal/5 font-medium gap-1">
                          <MapPin className="size-3" />
                          {currentProfileSpace.neighborhood}
                        </span>
                        <span className="badge badge-outline border-base-300 text-base-content/70 font-medium">
                          {PURPOSE_LABELS[currentProfileSpace.purpose]}
                        </span>
                        <span className="badge badge-outline border-base-300 text-base-content/70 font-medium">
                          {DURATION_LABELS[currentProfileSpace.duration]}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-base-200 space-y-3">
                        <button
                          onClick={() => handleOpenDetails(currentProfileSpace)}
                          className="btn btn-primary btn-sm w-full text-white bg-brand-teal hover:bg-brand-teal/90 border-none"
                        >
                          Ver detalles
                        </button>
                        <MatchDecisionButtons
                          status={decisions[currentProfileSpace.id] ?? 'idle'}
                          onReject={() => handleDecide(currentProfileSpace, false)}
                          onLike={() => handleDecide(currentProfileSpace, true)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : filteredSpaces.length > 0 ? (
                <div className="max-w-xl mx-auto text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
                  <UserRound className="size-10 mx-auto text-base-content/30 mb-4" />
                  <p className="text-lg font-medium text-base-content/60">
                    Ya viste todos los espacios disponibles.
                  </p>
                  <button onClick={() => setSwipedIds(new Set())} className="btn btn-outline btn-sm mt-4">
                    Volver a empezar
                  </button>
                </div>
              ) : null}

              {filteredSpaces.length === 0 && (
                <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl mt-6">
                  <p className="text-lg font-medium text-base-content/60">No se encontraron espacios con esos filtros.</p>
                  <button onClick={clearFilters} className="btn btn-outline btn-sm mt-4">Limpiar filtros</button>
                </div>
              )}
            </>
          )}

        </div>
      </main>

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

      <Footer />
    </div>
  );
};