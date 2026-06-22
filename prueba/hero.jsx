// src/components/features/landing/Hero.jsx
import { Home, Users } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      
      {/* --- CAPA 1: LA IMAGEN DE FONDO --- */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/fondo1.png')" 
        }}
      />

      {/* --- CAPA 2: EL FILTRO GLOBAL (Para leer el texto izquierdo) --- */}
      <div className="absolute inset-0 bg-gradient-to-r from-base-100/10 via-base-100/10 to-transparent pointer-events-none" />

      {/* --- CAPA 3: TU CONTENIDO --- */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Lado del Texto (Propuesta de Valor) */}
        <div className="space-y-8">
          <div className="space-y-4">
            {/* Textos limpios, sin sombras artificiales */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-base-content leading-tight">
              Conectando <span className="text-brand-teal">Generaciones</span> y Hogares
            </h1>
            <p className="text-lg md:text-xl text-base-content/90 max-w-xl font-medium">
              Un lugar de union entre generaciones, donde la juventud se apoya en la experiencia de los mayores, fomentando la convivencia solidaria y el apoyo mutuo.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="#explorar-espacios" 
              className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none btn-lg gap-3 shadow-lg"
            >
              <Home className="size-5" />
              Explorar Espacios
            </a>
            
            <a 
              href="#como-funciona" 
              className="btn btn-outline border-brand-teal bg-brand-teal/40 backdrop-blur-sm hover:bg-brand-teal hover:text-white hover:border-brand-teal btn-lg gap-3 shadow-lg"
            >
              <Users className="size-5" />
              Saber Más
            </a>
          </div>
          
          <div className="pt-4 border-t border-base-content/20">
            <p className="text-sm font-semibold text-base-content/80">
              Un modelo "ganar-ganar" para todas las etapas de la vida.
            </p>
          </div>
        </div>
        
        {/* Lado Derecho: Tarjeta Translúcida */}
        <div className="flex justify-center md:justify-end">
          {/* MAGIA AQUÍ: 
            bg-base-100/10 -> Casi transparente (10% color, 90% transparente)
            backdrop-blur-md -> Desenfoque medio de cristal
          */}
          <div className="w-full max-w-md aspect-square bg-base-50/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center p-8 shadow-xl border border-base-content/10 relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-base-80 to-transparent" />
            <div className="text-left space-y-4 z-10 w-full">
              <h3 className="text-2xl font-extrabold text-brand-orange">
                ¡Bienvenido/a a CASA con SI!
              </h3>
              
              <div className="italic text-base-content text-white font-medium text-lg leading-relaxed space-y-2">
                <p>Gracias por elegirnos. Soy Luni, fundadora del programa, y quiero acompañarte en esta experiencia de convivencia solidaria.</p>
                <p>Te invitamos a recorrer la plataforma y leer las instrucciones de uso para aprovechar todas sus herramientas.</p>
              </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full ring ring-brand-teal ring-offset-transparent ring-offset-2 shadow-md">
                    <img src="/casa1.png" alt="Lucia Pozzo" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-brand-teal text-lg  leading-none">Lucia Pozzo</p>
                  <p className="text-sm text-brand-teal/60 mt-1 font-bold">Fundadora</p>
                </div>
              </div>
            </div>

          </div>
        </div>     

      </div>
    </section>
  );
};