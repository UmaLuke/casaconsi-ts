// src/pages/ExploreSpacesPage.tsx
import { useMemo, useState } from 'react';
import { MapPin, User, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useSpaceFilters } from '../hooks/useSpaceFilters';
import { useExchangeRate } from '../hooks/useExchangeRate'; // <-- 1. Importamos tu nuevo hook
import type { Space } from '../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS, DURATION_LABELS, type Generation, type Purpose, type Duration,} from '../types/filters';

const mockSpaces: Space[] = [
  { id: 1, title: 'Habitación Luminosa con Baño Privado', location: 'Centro Sur, a 15 min de la Universidad', neighborhood: 'Centro Sur', price: 150000, currency: 'ARS', hostType: 'Propietario', hostGeneration: 'adulto-mayor', purpose: 'estudiar', duration: 'anual', amenities: ['Wifi', 'Escritorio', 'Cocina compartida'], imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60', verified: true },
  { id: 2, title: 'Anexo Independiente en Casa Familiar', location: 'Barrio Norte, Zona Residencial', neighborhood: 'Barrio Norte', price: 180000, currency: 'ARS', hostType: 'Familia Anfitriona', hostGeneration: 'adulto-mayor', purpose: 'compartir-gastos', duration: 'semestral-cuatrimestral', amenities: ['Entrada independiente', 'Jardín', 'Servicios incluidos'], imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60', verified: true },
  { id: 3, title: 'Espacio de Estudio y Descanso', location: 'Zona Facultades', neighborhood: 'Zona Facultades', price: 130000, currency: 'ARS', hostType: 'Propietario', hostGeneration: 'joven-adulto', purpose: 'estudiar', duration: 'intermitente-ocasional', amenities: ['Silencioso', 'Wifi Alta Velocidad', 'Lavadero'], imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop', verified: false },
  { id: 4, title: 'Habitación en Dúplex Compartido', location: 'Güemes, cerca de bares y plazas', neighborhood: 'Güemes', price: 165000, currency: 'ARS', hostType: 'Propietaria', hostGeneration: 'joven-adulto', purpose: 'compartir-gastos', duration: 'otra-modalidad', amenities: ['Terraza', 'Wifi', 'Cocina compartida'], imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60', verified: true },
  { id: 5, title: 'Cuarto con Vista al Jardín', location: 'Cofico, zona tranquila y arbolada', neighborhood: 'Cofico', price: 140000, currency: 'ARS', hostType: 'Propietario', hostGeneration: 'adulto-mayor', purpose: 'estudiar', duration: 'semestral-cuatrimestral', amenities: ['Jardín', 'Desayuno incluido', 'Wifi'], imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60', verified: true },
];

export const ExploreSpacesPage = () => {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useSpaceFilters();
  
  // 2. Instanciamos el hook de cotización y creamos un estado local para la preferencia del usuario
  const { rate, isLoading } = useExchangeRate();
  const [preferredCurrency, setPreferredCurrency] = useState<'ARS' | 'USD'>('ARS');

  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter((space) => {
      if (filters.neighborhood && !space.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) return false;
      if (filters.generation && space.hostGeneration !== filters.generation) return false;
      if (filters.purpose && space.purpose !== filters.purpose) return false;
      if (filters.duration && space.duration !== filters.duration) return false;
      if (filters.verifiedOnly && !space.verified) return false;
      return true;
    });
  }, [filters]);

  // 3. Actualizamos el formateador para que haga la matemática usando el valor de la API
  const formatPrice = (basePrice: number, baseCurrency: 'ARS' | 'USD') => {
    let finalPrice = basePrice;

    // Si el usuario quiere ver en USD y el precio base está en ARS
    if (preferredCurrency === 'USD' && baseCurrency === 'ARS' && rate) {
      finalPrice = basePrice / rate;
    } 
    // Si el usuario quiere ver en ARS y el precio base estuviera en USD (para futuros inmuebles)
    else if (preferredCurrency === 'ARS' && baseCurrency === 'USD' && rate) {
      finalPrice = basePrice * rate;
    }

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: preferredCurrency,
      maximumFractionDigits: preferredCurrency === 'USD' ? 0 : 0, // Mostramos números enteros para alquileres
    }).format(finalPrice);
  };

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-grow pt-28 md:pt-32 pb-20">
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
                  <label className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Barrio o zona</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Nueva Córdoba"
                    className="input input-bordered input-sm w-full focus-within:outline-brand-teal transition-all"
                    value={filters.neighborhood ?? ''}
                    onChange={(e) => updateFilter('neighborhood', e.target.value || undefined)}
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Anfitrión</span>
                  </label>
                  <select
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
                  <label className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Propósito</span>
                  </label>
                  <select
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
                  <label className="label py-1">
                    <span className="label-text text-sm font-semibold text-base-content/90">Duración</span>
                  </label>
                  <select
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
                  <label className="label cursor-pointer justify-start gap-2 py-1.5 hover:bg-base-200/50 rounded-lg px-2 transition-colors">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm [--chkbg:theme(colors.brand-teal)] [--chkfg:white] border-base-300"
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

          {/* 4. Cabecera de resultados con el Toggle de Moneda */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <p className="text-sm text-base-content/60 font-semibold uppercase tracking-wider">
              {filteredSpaces.length} {filteredSpaces.length === 1 ? 'espacio encontrado' : 'espacios encontrados'}
            </p>
            
            {/* Toggle ARS / USD - Estilo SaaS Premium */}
            <div className="flex items-center gap-3 bg-base-300/80 px-5 py-2.5 rounded-full border border-base-content/5 shadow-inner backdrop-blur-sm w-fit">
              <span 
                className={`text-sm font-black tracking-wide transition-all duration-300 ${
                  preferredCurrency === 'ARS' 
                    ? 'text-brand-teal drop-shadow-[0_0_8px_rgba(0,180,196,0.5)]' 
                    : 'text-base-content/40'
                }`}
              >
                ARS
              </span>
              
              <input 
                type="checkbox" 
                className="toggle toggle-md border-transparent bg-brand-teal/80 hover:bg-brand-teal [--tglbg:#a5f3fc] checked:border-transparent checked:bg-brand-orange/90 checked:hover:bg-brand-orange checked:[--tglbg:#fed7aa] transition-colors shadow-sm" 
                checked={preferredCurrency === 'USD'}
                onChange={(e) => setPreferredCurrency(e.target.checked ? 'USD' : 'ARS')}
                disabled={isLoading}
                aria-label="Cambiar moneda"
              />
              
              <span 
                className={`text-sm font-black tracking-wide flex items-center transition-all duration-300 ${
                  preferredCurrency === 'USD' 
                    ? 'text-brand-orange drop-shadow-[0_0_8px_rgba(0,180,196,0.5)]' 
                    : 'text-base-content/40'
                }`}
              >
                USD
                {isLoading && <span className="loading loading-spinner w-3 h-3 ml-2 opacity-50"></span>}
              </span>
            </div>
          </div>

          {filteredSpaces.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center gap-4 bg-base-100 border border-dashed border-base-300 rounded-3xl shadow-sm">
              <div className="p-4 bg-base-200 rounded-full">
                <SlidersHorizontal className="size-8 text-base-content/40" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">No hay resultados</h3>
                <p className="text-base-content/60 font-medium mt-1 max-w-sm">
                  Intenta ajustar o eliminar algunos filtros para encontrar más espacios.
                </p>
              </div>
              <button 
                onClick={clearFilters} 
                className="btn btn-sm mt-2 bg-brand-teal/10 text-brand-teal border-none hover:bg-brand-teal/20 transition-colors"
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpaces.map((space) => (
                <div
                  key={space.id}
                  className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <figure className="relative h-56 overflow-hidden">
                    <img
                      src={space.imageUrl}
                      alt={`Foto de ${space.title}`}
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
                      {space.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="badge badge-ghost badge-sm text-xs text-base-content/70">
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
                      <button className="btn bg-brand-navy hover:bg-brand-navy/90 text-white w-full transition-colors">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};