// src/components/features/landing/FeaturedVideos.tsx
import { useRef } from 'react';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FeaturedVideo } from '../../../types/video';

export const FeaturedVideos = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const videos: FeaturedVideo[] = [
    { id: "v1", youtubeUrl: "https://www.youtube.com/watch?v=RRNmV8gKn2k", title: "¿Cómo nació Casa Con Sí?", description: "Conecta generaciones mediante acuerdos claros." },
    { id: "v2", youtubeUrl: "https://www.youtube.com/watch?v=bXaL5regHcc", title: "Un poco de solidaridad", description: "Publica tu espacio y maximiza ingresos." },
    { id: "v3", youtubeUrl: "https://www.youtube.com/watch?v=WPqBypuJRWY", title: "Probando como se ven", description: "Paso a paso para tu acuerdo de convivencia." }
  ];

  const getEmbedUrl = (url: string): string => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    const videoId = match ? match[1] : url;
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  };

  // El scroll ahora se mueve exactamente el ancho de un video (el 100% del contenedor)
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth; 
      
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="videos" className="py-20 bg-base-100 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Lado Izquierdo: Encabezado */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-3 bg-brand-orange/10 rounded-full w-fit">
            <PlayCircle className="size-10 text-brand-orange" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-base-content leading-tight">
            Conoce Casa con SI en Acción
          </h2>
          <p className="text-lg text-base-content/70">
            Explora nuestros videos explicativos sobre cómo facilitamos las conexiones intergeneracionales.
          </p>
        </div>

        {/* Lado Derecho: Carrusel Principal */}
        <div className="lg:col-span-9 relative w-full">
          
          {/* Contenedor Principal del Carrusel (Bordes redondeados y sombra) */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-base-300 bg-base-200">
            
            {/* Pista de Scroll */}
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  // w-full asegura que cada video ocupe el 100% del espacio
                  className="w-full flex-none snap-center relative"
                >
                  <figure className="w-full aspect-video bg-black relative">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={getEmbedUrl(video.youtubeUrl)}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </figure>
                  {/* Título en la parte inferior */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-base-content">
                      {video.title}
                    </h3>
                    <p className="text-sm text-base-content/70 mt-1">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Botones Flotantes Superpuestos */}
            {/* pointer-events-none en el wrapper para no bloquear clicks, pero pointer-events-auto en los botones */}
            {/* top-[40%] centra los botones sobre el área del video (ignorando el texto de abajo) */}
            <div className="absolute top-[40%] left-0 right-0 -translate-y-1/2 flex justify-between px-4 pointer-events-none">
              <button 
                onClick={() => scroll('left')}
                className="btn btn-circle btn-neutral pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Ver video anterior"
              >
                <ChevronLeft className="size-6 text-neutral-content" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="btn btn-circle btn-neutral pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Ver video siguiente"
              >
                <ChevronRight className="size-6 text-neutral-content" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};