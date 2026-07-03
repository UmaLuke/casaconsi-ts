// src/components/layout/Footer.tsx
import { Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaXTwitter } from 'react-icons/fa6';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-teal text-base-content border-t border-base-300">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Contenido Principal del Footer */}
        <div className="footer py-12 md:py-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Columna 1: Marca y Propósito */}
          <aside className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full border border-base-300 bg-white shadow-sm">
                  <img src="/logo1.png" alt="Logo Casa con Si" />
                </div>
              </div>
              <span className="text-xl font-bold text-base-content">
                CASA CON SI
              </span>
            </div>
            <p className="text-base-content/70 leading-relaxed max-w-xs text-sm">
                Fomentando la soliradida y la convivencia intergeneracional para un "ganar-ganar" entre nosotros. Un espacio de apoyo mutuo.              
            </p>
          </aside>

          {/* Columna 2: Plataforma */}
          <nav>
            <h6 className="footer-title text-base-content opacity-100 font-bold mb-4">Plataforma</h6>
            <a href="#como-funciona" className="link link-hover text-base-content/70 hover:text-brand-orange transition-colors">Cómo Funciona</a>
            <a href="#explorar-espacios" className="link link-hover text-base-content/70 hover:text-brand-orange transition-colors">Explorar Espacios</a>
            <a href="#testimonios" className="link link-hover text-base-content/70 hover:text-brand-orange transition-colors">Testimonios</a>
            <a href="#faq" className="link link-hover text-base-content/70 hover:text-brand-orange transition-colors">Preguntas Frecuentes</a>
          </nav>

          {/* Columna 3: Seguridad y Legal */}
          <nav>
            <h6 className="footer-title text-base-content opacity-100 font-bold mb-4">Confianza y Legal</h6>
            <a href="#terminos" className="link link-hover text-base-content/70 hover:text-brand-teal transition-colors">Términos y Condiciones</a>
            <a href="#privacidad" className="link link-hover text-base-content/70 hover:text-brand-teal transition-colors">Política de Privacidad</a>
            <a href="#convivencia" className="link link-hover text-base-content/70 hover:text-brand-teal transition-colors">Guía de Convivencia</a>
            <a href="#verificacion" className="link link-hover text-base-content/70 hover:text-brand-teal transition-colors">Proceso de Verificación</a>
          </nav>

          {/* Columna 4: Comunidad y Contacto */}
          <nav>
            <h6 className="footer-title text-base-content opacity-100 font-bold mb-4">Comunidad</h6>
            <div className="flex gap-2 mb-4">
              <a href="#facebook" className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-brand-navy hover:bg-brand-navy/10 dark:hover:text-white dark:hover:bg-white/10 transition-colors" aria-label="Visitar nuestro Facebook">
                <FaFacebook className="size-5" />
              </a>
              <a href="#instagram" className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-brand-orange hover:bg-brand-orange/10 transition-colors" aria-label="Visitar nuestro Instagram">
                <FaInstagram className="size-5" />
              </a>
              <a href="#twitter" className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors" aria-label="Visitar nuestro Twitter/X">
                <FaXTwitter className="size-5" />
              </a>
            </div>
            <a href="mailto:casaconsi@gmail.com" className="link link-hover flex items-center gap-2 text-base-content/70 hover:text-brand-teal transition-colors text-sm">
              <Mail className="size-4" />
              casaconsi@gmail.com
            </a>
          </nav>
        </div>

        {/* Barra Inferior (Copyright) */}
        <div className="footer footer-center p-6 border-t border-base-300 text-base-content/60 text-sm">
          <aside>
            <p>Copyright © {currentYear} - Todos los derechos reservados por Casa con SI</p>
          </aside>
        </div>

      </div>
    </footer>
  );
};
