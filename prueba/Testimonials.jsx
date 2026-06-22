// src/components/features/landing/Testimonials.jsx
import { Quote } from 'lucide-react';

export const Testimonials = () => {
  const reviews = [
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
    <section id="testimonios" className="py-20 bg-base-200">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            Historias de Convivencia
          </h2>
          <p className="text-lg text-base-content/70">
            Descubre cómo nuestra plataforma está transformando la manera en que diferentes generaciones comparten y coexisten.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {reviews.map((review) => (
            <div key={review.id} className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body relative">
                <Quote className="absolute top-6 right-6 size-10 text-brand-teal/20" />
                <p className="text-base-content/80 text-lg italic mb-6 relative z-10">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                <div className="avatar">
                    <div className="w-12 h-12 rounded-full ring ring-brand-teal ring-offset-base-100 ring-offset-2">
                      <img src={review.avatar} alt={review.author} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base-content">{review.author}</h4>
                    <p className="text-sm text-base-content/60">{review.role}</p>
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