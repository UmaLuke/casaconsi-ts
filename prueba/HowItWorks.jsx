// src/components/features/landing/HowItWorks.jsx

export const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      // NUEVO ENFOQUE: Contenedor tipo Avatar/Thumbnail para enmascarar fondos feos
      icon: (
        <div className="avatar mb-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-base-100 shadow-lg ring-1 ring-base-content/5 p-0 flex items-center justify-center transition-transform hover:scale-105">
            {/* mix-blend-multiply ayuda a fundir fondos blancos con el contenedor */}
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
          <div className="w-20 h-20 md:w-20 md:h-20 rounded-2xl bg-base-100 shadow-lg ring-1 ring-base-content/5 p-0 flex items-center justify-center transition-transform hover:scale-105">
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
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-base-100 shadow-lg ring-1 ring-base-content/5 p-0 flex items-center justify-center transition-transform hover:scale-105">
            <img src="/manos.png" alt="Icono de Convivencia" className="w-full h-full object-contain" />
          </div>
        </div>
      ),
      title: "Convivencia Ganar-Ganar",
      description: "Nuestra plataforma facilita el match ideal basándose en perfiles verificados, estableciendo reglas claras para una solidaridad intergeneracional."
    }
  ];

  return (
    <section id="como-funciona" className="py-20 bg-base-200">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            ¿Cómo Funciona?
          </h2>
          <p className="text-lg text-base-content/70">
            Descubre nuestro proceso paso a paso para conectar generaciones.
          </p>
        </div>

        {/* Grilla de Pasos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300">
              <div className="card-body items-center text-center p-8">
                {step.icon}
                <h3 className="card-title text-xl font-bold text-base-content mb-2">
                  {step.title}
                </h3>
                <p className="text-base-content/70 leading-relaxed">
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