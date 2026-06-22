// src/components/features/landing/HowItWorks.tsx
import type { ProcessStep } from '../../../types/process-step';

export const HowItWorks = () => {
  const steps: ProcessStep[] = [
    {
      id: 1,
      icon: (
        <div className="avatar mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-transparent p-0 flex items-center justify-center transition-transform hover:scale-105">
            <img src="/casa1.png" alt="Icono de Anfitriones" className="w-full h-full object-contain" />
          </div>
        </div>
      ),
      title: "Anfitriones",
      description: "Anfitriones con capacidad instalada disponible pueden optimizar sus propiedades, ofreciendo espacios de locación seguros mientras fomentan un impacto social positivo."
    },
    {
      id: 2,
      icon: (
        <div className="avatar mb-6">
          <div className="w-20 h-20 md:w-20 md:h-20 rounded-2xl bg-transparent  p-0 flex items-center justify-center transition-transform hover:scale-105">
            <img src="/gente.png" alt="Icono de Estudiantes" className="w-full h-full object-contain" />
          </div>
        </div>
      ),
      title: "Estudiantes y Jóvenes",
      description: "Encuentra un entorno tranquilo y adecuado para tus estudios universitarios o primeros pasos profesionales, accediendo a espacios de calidad."
    },
    {
      id: 3,
      icon: (
        <div className="avatar mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-transparent p-0 flex items-center justify-center transition-transform hover:scale-105">
            <img src="/manos.png" alt="Icono de Convivencia" className="w-full h-full object-contain" />
          </div>
        </div>
      ),
      title: "Convivencia Ganar-Ganar",
      description: "Nuestra plataforma facilita el match ideal basándose en perfiles verificados, estableciendo reglas claras para una solidaridad intergeneracional."
    }
  ];

  return (
    /* 1. Quitamos bg-base-200 y lo hacemos relative con overflow-hidden para las capas */
    <section id="como-funciona" className="relative py-10 overflow-hidden">
      
      {/* --- CAPA 1: LA IMAGEN DE FONDO --- */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          // Reemplaza esto con la ruta de tu nueva imagen
          backgroundImage: "url('/fondo2.png')" 
        }}
      />

      {/* --- CAPA 2: EL FILTRO GLOBAL (Overlay) --- */}
      {/* Usamos un fondo al 80% con un ligero desenfoque para que las tarjetas no pierdan contraste */}
      <div className="absolute inset-0 bg-base-200/40 backdrop-blur-[2px] pointer-events-none" />

      {/* --- CAPA 3: TU CONTENIDO --- */}
      {/* Añadimos relative z-10 para que todo flote sobre la imagen y el filtro */}
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content drop-shadow-sm">
            ¿Cómo Funciona?
          </h2>
          <p className="text-lg text-base-content/90 font-medium drop-shadow-sm">
            Descubre nuestro proceso paso a paso para conectar generaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            /* Hacemos las tarjetas ligeramente translúcidas (bg-base-100/90) y agregamos hover animado */
            <div 
              key={step.id} 
              className="card bg-base-80/10 backdrop-blur-md shadow-xl border border-base-content/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="card-body items-center text-center p-8">
                {step.icon}
                <h3 className="card-title text-xl font-bold text-base-content mb-2">
                  {step.title}
                </h3>
                <p className="text-base-content/80 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
