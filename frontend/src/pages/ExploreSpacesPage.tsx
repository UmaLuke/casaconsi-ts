// src/pages/ExploreSpacesPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { MapPin, User, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useSpaceFilters } from '../hooks/useSpaceFilters';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { getSpaces, SpaceError } from '../services/spaceService';
import type { Space } from '../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS, DURATION_LABELS, type Generation, type Purpose, type Duration } from '../types/filters';

export const ExploreSpacesPage = () => {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useSpaceFilters();

  const { rate, isLoading } = useExchangeRate();
  const [preferredCurrency, setPreferredCurrency] = useState<'ARS' | 'USD'>('ARS');

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);
  const [spacesError, setSpacesError] = useState<string | null>(null);

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
      <main className="grow pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">

          <div className="mb-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              Explorar Espacios
            </h1>
            <p className="text-base-content/70 text-lg max-w-2xl font-medium">
              Encuentra el espacio ideal. Los filtros se adaptan automáticamente para ofrecerte las mejores opciones de convivencia.
            </p>
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
                          <span className="truncate">{space.hostType}</span>
                        </div>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button className="btn btn-primary btn-sm w-full text-white bg-brand-teal hover:bg-brand-teal/90 border-none">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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
      <Footer />
    </div>
  );
};