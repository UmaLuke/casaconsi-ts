// src/components/features/landing/ExploreSpaces.tsx
import { Link } from 'react-router-dom';
import { MapPin, User, CheckCircle2 } from 'lucide-react';
import type { Space } from '../../../types/space';
import { GENERATION_LABELS, PURPOSE_LABELS, } from '../../../types/filters';

export const ExploreSpaces = () => {
  // Actualizamos el mock de datos para cumplir con la interfaz estricta (price como número, y currency)
  const mockSpaces: Space[] = [
    {
      id: 1,
      title: "Habitación Luminosa con Baño Privado",
      location: "Centro Sur, a 15 min de la Universidad",
      neighborhood: "Centro Sur",
      price: 150000,
      currency: 'ARS',
      hostType: "Propietario",
      hostGeneration: "adulto-mayor",
      purpose: "estudiar",
      duration: "anual",
      amenities: ["Wifi", "Escritorio", "Cocina compartida"],
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60",
      verified: true
    },
    {
      id: 2,
      title: "Anexo Independiente en Casa Familiar",
      location: "Barrio Norte, Zona Residencial",
      neighborhood: "Barrio Norte",
      price: 180000,
      currency: 'ARS',
      hostType: "Familia Anfitriona",
      hostGeneration: "adulto-mayor",
      purpose: "compartir-gastos",
      duration: "semestral-cuatrimestral",
      amenities: ["Entrada independiente", "Jardín", "Servicios incluidos"],
      imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60",
      verified: true
    },
    {
      id: 3,
      title: "Espacio de Estudio y Descanso",
      location: "Zona Facultades",
      neighborhood: "Zona Facultades",
      price: 130000,
      currency: 'ARS',
      hostType: "Propietario",
      hostGeneration: "joven-adulto",
      purpose: "estudiar",
      duration: "intermitente-ocasional",
      amenities: ["Silencioso", "Wifi Alta Velocidad", "Lavadero"],
      imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop",
      verified: false
    }
  ];

  // Función nativa para formatear el número como moneda en la UI
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="explorar-espacios" className="py-20 bg-base-100">
      <div  className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
              Explorar Espacios
            </h2>
            <p className="text-base-content/70 text-lg max-w-2xl font-medium">
              Descubre lugares que se adaptan a tus necesidades académicas y de estilo de vida, ofrecidos por anfitriones dispuestos a compartir su espacio.
            </p>
          </div>
          <Link to="/explorar" className="btn btn-outline border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-colors">
            Ver todos los espacios
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockSpaces.map((space) => (
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
                  <button className="btn bg-brand-navy hover:bg-brand-navy/90 text-white w-full transition-colors">
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};