// src/components/features/landing/Testimonials.tsx
import { Quote } from 'lucide-react';
import type { Review } from '../../../types/testimonial';

export const Testimonials = () => {
  const reviews: Review[] = [
    {
      id: 1,
      text: "Tener la casa tan grande y vacía me daba melancolía. Desde que comparto espacio, la casa volvió a tener vida y me siento mucho más segura.",
      author: "Marta R.",
      role: "Propietaria Anfitriona",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      text: "Pude instalarme cerca de la facultad en un ambiente tranquilo que me permite estudiar. El acuerdo es súper claro y la convivencia excelente.",
      author: "Tomás G.",
      role: "Estudiante Universitario",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop"
    }
  ];

  return (
    <section id="testimonios" className="relative py-20 overflow-hidden">
      
      {/* --- CAPA 1: LA IMAGEN DE FONDO --- */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/fondocomida.png')" 
        }}
      />

      {/* --- CAPA 2: EL FILTRO SUTIL --- */}
      {/* Fijo en brand-navy (independiente del tema) para conservar el look oscuro original */}
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[2px] pointer-events-none" />

      {/* --- CAPA 3: TU CONTENIDO --- */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Historias de Convivencia
          </h2>
          <p className="text-lg text-white/90 font-medium">
            Descubre cómo nuestra plataforma está transformando la manera en que diferentes generaciones comparten y coexisten.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="card bg-brand-navy/40 backdrop-blur-md shadow-xl border border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="card-body relative">
                <Quote className="absolute top-6 right-6 size-10 text-brand-teal/20" />
                
                <p className="text-white/90 font-medium text-lg italic mb-6 relative z-10">
                  "{review.text}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full ring ring-brand-teal ring-offset-transparent ring-offset-2 shadow-md">
                      <img src={review.avatar} alt={review.author} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{review.author}</h4>
                    <p className="text-sm text-brand-teal font-bold">{review.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
