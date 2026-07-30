// src/components/features/landing/Advisors.tsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Advisor } from '../../../types/advisor';

export const Advisors = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const mockAdvisors: Advisor[] = [
    {
      id: 1,
      name: "Luni Pozzo",
      specialty: "Convivencia intergeneracional",
      bio: "Acompaño a anfitriones y estudiantes en los primeros acuerdos de convivencia: expectativas, límites y comunicación.",
      pricePerSession: 15000,
      currency: 'ARS',
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=60",
    },
  ];

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="asesorias" className="py-20 bg-base-200 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Lado Izquierdo: Encabezado + CTA para profesionales */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-3 bg-brand-orange/10 rounded-full w-fit">
            <Sparkles className="size-10 text-brand-orange" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-base-content leading-tight">
            Formá parte de Casa con Sí
          </h2>
          <p className="text-lg text-base-content/70">
            ¿Sos profesional en Trabajo Social y querés formar parte de la Comunidad Casa con Sí?
          </p>
          <Link
            to="/register/asesor"
            className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none shadow-sm w-full sm:w-auto"
          >
            Postularme como asesor
          </Link>
        </div>

        {/* Lado Derecho: Carrusel de asesores que ya forman parte */}
        <div className="lg:col-span-9 relative w-full max-w-xl ml-auto">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth w-full pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mockAdvisors.map((advisor) => (
              <div
                key={advisor.id}
                className="w-60 sm:w-80 flex-none snap-start card bg-base-100 shadow-sm border border-base-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <figure className="relative h-70 overflow-hidden">
                  <img
                    src={advisor.avatarUrl}
                    alt={advisor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                </figure>

                <div className="card-body p-5">
                  <h3 className="card-title text-lg font-bold text-base-content leading-tight">
                    {advisor.name}
                  </h3>
                  <span className="badge badge-outline badge-sm border-brand-orange/50 text-brand-orange bg-brand-orange/5 font-medium w-fit">
                    {advisor.specialty}
                  </span>
                  <p className="text-base-content/70 text-sm mt-2 line-clamp-3">
                    {advisor.bio}
                  </p>
                  <div className="flex justify-end mt-3">
                    <span className="badge bg-brand-teal text-white border-none font-bold py-3 shadow-lg backdrop-blur-sm">
                      {formatPrice(advisor.pricePerSession, advisor.currency)} / sesión
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones flotantes del carrusel */}
          <div className="absolute top-[40%] left-0 right-0 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
            <button
              onClick={() => scroll('left')}
              className="btn btn-circle btn-ghost border-none shadow-none pointer-events-auto opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Ver asesor anterior"
            >
              <ChevronLeft className="size-7 text-base-content" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="btn btn-circle btn-ghost border-none shadow-none pointer-events-auto opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Ver asesor siguiente"
            >
              <ChevronRight className="size-7 text-base-content" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};