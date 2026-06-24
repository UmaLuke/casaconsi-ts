// src/components/features/landing/ExploreSpaces.tsx
import { Link } from 'react-router-dom';
import { MapPin, User, CheckCircle2 } from 'lucide-react';
import type { Space } from '../../../types/space';

export const ExploreSpaces = () => {
  const mockSpaces: Space[] = [
    {
      id: 1,
      title: "Habitación Luminosa con Baño Privado",
      location: "Centro Sur, a 15 min de la Universidad",
      neighborhood: "Centro Sur",
      price: "$150.000 ARS",
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
      price: "$180.000 ARS",
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
      price: "$130.000 ARS",
      hostType: "Propietario",
      hostGeneration: "joven-adulto",
      purpose: "estudiar",
      duration: "intermitente-ocasional",
      amenities: ["Silencioso", "Wifi Alta Velocidad", "Lavadero"],
      imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=600&auto=format&fit=crop",
      verified: false
    }
  ];

  return (
    <section id="explorar-espacios" className="py-20 bg-white-500">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
              Explorar Espacios
            </h2>
            <p className="text-base-content/70 text-lg max-w-2xl">
              Descubre lugares que se adaptan a tus necesidades académicas y de estilo de vida, ofrecidos por anfitriones dispuestos a compartir su espacio.
            </p>
          </div>
          <Link to="/explorar" className="btn btn-outline border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white hover:border-brand-teal">
            Ver todos los espacios
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockSpaces.map((space) => (
            <div key={space.id} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              <figure className="relative h-60 overflow-hidden">
                <img 
                  src={space.imageUrl} 
                  alt={space.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 badge badge-accent font-bold p-3 shadow-md">
                  {space.price}
                </div>
              </figure>
              
              <div className="card-body p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="card-title text-lg font-bold text-base-content leading-tight">
                    {space.title}
                  </h3>
                </div>
                
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
                  {space.amenities.map((amenity, index) => (
                    <span key={index} className="badge badge-ghost badge-sm">
                      {amenity}
                    </span>
                  ))}
                </div>

                <div className="card-actions justify-end mt-6 border-t border-base-200 pt-4">
                  <button className="btn bg-brand-navy hover:bg-brand-navy/90 text-white w-full">
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
