// src/pages/ExploreSpacesPage.tsx
import { useMemo, useState } from 'react';
import { MapPin, User, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import type { Space } from '../types/space';
import {
  GENERATION_LABELS,
  PURPOSE_LABELS,
  DURATION_LABELS,
  type Generation,
  type Purpose,
  type Duration,
  type SpaceFilters,
} from '../types/filters';

// Dataset simulado más amplio que el teaser de la landing, pensado para
// poder probar combinaciones reales de los 3 filtros (generación, propósito, duración).
const mockSpaces: Space[] = [
  {
    id: 1,
    title: 'Habitación Luminosa con Baño Privado',
    location: 'Centro Sur, a 15 min de la Universidad',
    neighborhood: 'Centro Sur',
    price: '$150.000 ARS',
    hostType: 'Propietario',
    hostGeneration: 'adulto-mayor',
    purpose: 'estudiar',
    duration: 'anual',
    amenities: ['Wifi', 'Escritorio', 'Cocina compartida'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60',
    verified: true,
  },
  {
    id: 2,
    title: 'Anexo Independiente en Casa Familiar',
    location: 'Barrio Norte, Zona Residencial',
    neighborhood: 'Barrio Norte',
    price: '$180.000 ARS',
    hostType: 'Familia Anfitriona',
    hostGeneration: 'adulto-mayor',
    purpose: 'compartir-gastos',
    duration: 'semestral-cuatrimestral',
    amenities: ['Entrada independiente', 'Jardín', 'Servicios incluidos'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60',
    verified: true,
  },
  {
    id: 3,
    title: 'Espacio de Estudio y Descanso',
    location: 'Zona Facultades',
    neighborhood: 'Zona Facultades',
    price: '$130.000 ARS',
    hostType: 'Propietario',
    hostGeneration: 'joven-adulto',
    purpose: 'estudiar',
    duration: 'intermitente-ocasional',
    amenities: ['Silencioso', 'Wifi Alta Velocidad', 'Lavadero'],
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop',
    verified: false,
  },
  {
    id: 4,
    title: 'Habitación en Dúplex Compartido',
    location: 'Güemes, cerca de bares y plazas',
    neighborhood: 'Güemes',
    price: '$165.000 ARS',
    hostType: 'Propietaria',
    hostGeneration: 'joven-adulto',
    purpose: 'compartir-gastos',
    duration: 'otra-modalidad',
    amenities: ['Terraza', 'Wifi', 'Cocina compartida'],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60',
    verified: true,
  },
  {
    id: 5,
    title: 'Cuarto con Vista al Jardín',
    location: 'Cofico, zona tranquila y arbolada',
    neighborhood: 'Cofico',
    price: '$140.000 ARS',
    hostType: 'Propietario',
    hostGeneration: 'adulto-mayor',
    purpose: 'estudiar',
    duration: 'semestral-cuatrimestral',
    amenities: ['Jardín', 'Desayuno incluido', 'Wifi'],
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop&q=60',
    verified: true,
  },
  {
    id: 6,
    title: 'Loft Independiente sobre Garaje',
    location: 'Nueva Córdoba, a pasos de la facultad',
    neighborhood: 'Nueva Córdoba',
    price: '$190.000 ARS',
    hostType: 'Familia Anfitriona',
    hostGeneration: 'joven-adulto',
    purpose: 'estudiar',
    duration: 'anual',
    amenities: ['Entrada independiente', 'Cochera', 'Wifi'],
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop&q=60',
    verified: false,
  },
  {
    id: 7,
    title: 'Habitación Cálida en Casa de Familia',
    location: 'Alta Córdoba, ambiente hogareño',
    neighborhood: 'Alta Córdoba',
    price: '$120.000 ARS',
    hostType: 'Propietaria',
    hostGeneration: 'adulto-mayor',
    purpose: 'compartir-gastos',
    duration: 'intermitente-ocasional',
    amenities: ['Comidas compartidas', 'Wifi', 'Lavadero'],
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&auto=format&fit=crop&q=60',
    verified: true,
  },
  {
    id: 8,
    title: 'Espacio Moderno en PH Renovado',
    location: 'General Paz, edificio reciclado',
    neighborhood: 'General Paz',
    price: '$175.000 ARS',
    hostType: 'Propietario',
    hostGeneration: 'joven-adulto',
    purpose: 'compartir-gastos',
    duration: 'otra-modalidad',
    amenities: ['Wifi Alta Velocidad', 'Escritorio', 'Terraza'],
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=60',
    verified: false,
  },
];

const EMPTY_FILTERS: SpaceFilters = {};

export const ExploreSpacesPage = () => {
  const [filters, setFilters] = useState<SpaceFilters>(EMPTY_FILTERS);

  const filteredSpaces = useMemo(() => {
    return mockSpaces.filter((space) => {
      if (filters.neighborhood && !space.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) {
        return false;
      }
      if (filters.generation && space.hostGeneration !== filters.generation) {
        return false;
      }
      if (filters.purpose && space.purpose !== filters.purpose) {
        return false;
      }
      if (filters.duration && space.duration !== filters.duration) {
        return false;
      }
      if (filters.verifiedOnly && !space.verified) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== '' && value !== false).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-28 md:pt-32 pb-20 bg-base-200/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-base-content">Explorar Espacios</h1>
            <p className="text-base-content/70 text-lg max-w-2xl">
              Filtrá por generación del anfitrión, propósito y duración para encontrar el espacio que mejor encaje con tu búsqueda.
            </p>
          </div>

          {/* Barra de filtros */}
          <div className="card bg-base-100 shadow-md border border-base-200 mb-10">
            <div className="card-body p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4 text-base-content/80">
                <SlidersHorizontal className="size-5 text-brand-teal" />
                <h2 className="font-bold">Filtros</h2>
                {activeFilterCount > 0 && (
                  <span className="badge badge-sm bg-brand-orange text-white border-none">{activeFilterCount}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Barrio o zona</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Nueva Córdoba"
                    className="input input-bordered input-sm w-full"
                    value={filters.neighborhood ?? ''}
                    onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value || undefined })}
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Generación del anfitrión</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.generation ?? ''}
                    onChange={(e) =>
                      setFilters({ ...filters, generation: (e.target.value || undefined) as Generation | undefined })
                    }
                  >
                    <option value="">Todas</option>
                    {Object.entries(GENERATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Propósito</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.purpose ?? ''}
                    onChange={(e) => setFilters({ ...filters, purpose: (e.target.value || undefined) as Purpose | undefined })}
                  >
                    <option value="">Todos</option>
                    {Object.entries(PURPOSE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Duración</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.duration ?? ''}
                    onChange={(e) =>
                      setFilters({ ...filters, duration: (e.target.value || undefined) as Duration | undefined })
                    }
                  >
                    <option value="">Todas</option>
                    {Object.entries(DURATION_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium">Verificación</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 py-1.5">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-secondary"
                      checked={filters.verifiedOnly ?? false}
                      onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked || undefined })}
                    />
                    <span className="label-text text-sm">Solo verificados</span>
                  </label>
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="btn btn-ghost btn-xs gap-1 text-base-content/60 hover:text-error"
                  >
                    <X className="size-3.5" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resultados */}
          <p className="text-sm text-base-content/60 mb-4 font-medium">
            {filteredSpaces.length} {filteredSpaces.length === 1 ? 'espacio encontrado' : 'espacios encontrados'}
          </p>

          {filteredSpaces.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center gap-3 bg-base-100 border border-dashed border-base-300 rounded-2xl">
              <p className="text-base-content/60 font-medium text-lg">
                No encontramos espacios con esos filtros.
              </p>
              <button onClick={() => setFilters(EMPTY_FILTERS)} className="btn btn-sm btn-outline border-brand-teal text-brand-teal">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpaces.map((space) => (
                <div
                  key={space.id}
                  className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <figure className="relative h-60 overflow-hidden">
                    <img
                      src={space.imageUrl}
                      alt={space.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 badge badge-accent font-bold p-3 shadow-md">{space.price}</div>
                  </figure>

                  <div className="card-body p-6">
                    <h3 className="card-title text-lg font-bold text-base-content leading-tight">{space.title}</h3>

                    <div className="flex items-center gap-2 text-base-content/70 text-sm mt-2">
                      <MapPin className="size-4 text-brand-teal" />
                      <span>{space.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-base-content/70 text-sm mt-1">
                      <User className="size-4 text-brand-navy dark:text-base-content" />
                      <span>Anfitrión: {space.hostType}</span>
                      {space.verified && (
                        <div className="tooltip tooltip-top" data-tip="Identidad Verificada">
                          <CheckCircle2 className="size-4 text-success" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="badge badge-outline badge-sm border-brand-teal text-brand-teal">
                        {GENERATION_LABELS[space.hostGeneration]}
                      </span>
                      <span className="badge badge-outline badge-sm border-brand-orange text-brand-orange">
                        {PURPOSE_LABELS[space.purpose]}
                      </span>
                      <span className="badge badge-ghost badge-sm">{DURATION_LABELS[space.duration]}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {space.amenities.map((amenity) => (
                        <span key={amenity} className="badge badge-ghost badge-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="card-actions justify-end mt-6 border-t border-base-200 pt-4">
                      <button className="btn bg-brand-navy hover:bg-brand-navy/90 text-white w-full">Ver Detalles</button>
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
