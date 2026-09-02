// src/components/features/landing/Advisors.tsx
import { Link } from 'react-router-dom';
import { Sparkles, Handshake, ShieldCheck, ClipboardCheck } from 'lucide-react';

const SERVICES = [
  {
    icon: Handshake,
    title: 'Mediación inicial',
    desc: 'Acuerdos personalizados y elaboración del contrato de convivencia.',
    color: 'text-brand-orange bg-brand-orange/10',
  },
  {
    icon: ShieldCheck,
    title: 'Mediación de convivencia',
    desc: 'Consultoría, prevención y resolución de conflictos durante la estadía.',
    color: 'text-brand-teal bg-brand-teal/10',
  },
  {
    icon: ClipboardCheck,
    title: 'Mediación final',
    desc: 'Valoración y cierre del proceso de convivencia.',
    color: 'text-brand-navy bg-brand-navy/10',
  },
];

// Reservas centralizadas (decisión del 2/9 con Lucía): ya no mostramos
// nombres ni fotos de asesoras puntuales acá — la sección presenta al
// equipo de Trabajo Social como conjunto y a los tres tipos de asesoría que
// ofrece. Antes esto traía el catálogo real vía getAdvisors() (carrusel de
// tarjetas por asesora); ya no hace falta ese fetch.
export const Advisors = () => {
  return (
    <section id="asesorias" className="py-20 bg-base-200 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

        {/* Lado Izquierdo: Encabezado + CTA para profesionales */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-3 bg-brand-orange/10 rounded-full w-fit">
            <Sparkles className="size-10 text-brand-orange" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-base-content leading-tight">
            Asesorías con nuestro equipo de Trabajo Social
          </h2>
          <p className="text-lg text-base-content/70">
            Un equipo de licenciadas en Trabajo Social con matrícula activa te acompaña en cada etapa de la convivencia.
          </p>
          <Link
            to="/register/asesor"
            className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none shadow-sm w-full sm:w-auto"
          >
            Postularme como asesor
          </Link>
        </div>

        {/* Lado Derecho: los tres tipos de asesoría que ofrece el equipo */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              <div className="card-body p-5 gap-3">
                <div className={`size-12 rounded-full flex items-center justify-center ${service.color}`}>
                  <service.icon className="size-6" />
                </div>
                <h3 className="font-extrabold text-base text-base-content leading-tight">{service.title}</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
