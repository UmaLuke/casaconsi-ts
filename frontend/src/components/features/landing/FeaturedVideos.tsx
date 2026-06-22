// src/components/features/landing/FeaturedVideos.tsx
import { PlayCircle } from 'lucide-react';
import type { FeaturedVideo } from '../../../types/video';

export const FeaturedVideos = () => {
  // Datos de tus videos (Ahora puedes pegar URLs completas o solo los IDs)
  const videos: FeaturedVideo[] = [
    {
      id: "v1",
      youtubeUrl: "https://www.youtube.com/watch?v=RRNmV8gKn2k&list=RDiuLR8iPwWB4&index=3", // Puedes usar URL completa
      title: "¿Cómo nació Casa Con Sí?",
      description: "Conoce cómo nuestra plataforma conecta generaciones mediante acuerdos claros y beneficiosos."
    },
    {
      id: "v2",
      youtubeUrl: "https://www.youtube.com/watch?v=bXaL5regHcc&list=RDiuLR8iPwWB4&index=4", // O puedes usar el formato corto de "Compartir"
      title: "Un poco de solidaridad en el corazón",
      description: "Aprende a publicar tu espacio, establecer reglas de convivencia y maximizar tus ingresos."
    },
    {
      id: "v3",
      youtubeUrl: "https://www.youtube.com/watch?v=WPqBypuJRWY&list=RDWPqBypuJRWY&start_radio=1", // O simplemente el ID puro, ¡todo funcionará!
      title: "Probando como se ven",
      description: "Paso a paso para buscar locación, verificar anfitriones y firmar tu acuerdo de convivencia."
    }
  ];

  // Función utilitaria para extraer el ID de cualquier formato de URL de YouTube
  const getEmbedUrl = (url: string): string => {
    let videoId = url;
    // Expresión regular para encontrar el ID en formatos youtube.com o youtu.be
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    
    if (match && match[1]) {
      videoId = match[1]; // Extrae el ID si es una URL completa
    }
    
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`; 
    // Notas de pulido: rel=0 evita videos recomendados de otros canales al final. modestbranding=1 limpia el logo.
  };

  return (
    <section id="videos" className="py-20 bg-base-100">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Encabezado de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-brand-orange/10 rounded-full">
              <PlayCircle className="size-10 text-brand-orange" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            Conoce Casa con SI en Acción
          </h2>
          <p className="text-lg text-base-content/70">
            Explora nuestros videos explicativos para entender cómo facilitamos las conexiones intergeneracionales.
          </p>
        </div>

        {/* Grilla de Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="card bg-base-200 shadow-xl border border-base-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
              
              <figure className="w-full aspect-video bg-black relative">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={getEmbedUrl(video.youtubeUrl)}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </figure>
              
              <div className="card-body p-6">
                <h3 className="card-title text-lg font-bold text-base-content leading-tight">
                  {video.title}
                </h3>
                {/* Opcional: Mantener la descripción o dejar solo el título para un diseño más limpio */}
                <p className="text-base-content/70 text-sm mt-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
