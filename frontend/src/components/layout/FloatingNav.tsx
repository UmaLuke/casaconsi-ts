// src/components/layout/FloatingNav.tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageSquare, GraduationCap, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface FloatingNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

// "/" es la landing pública (sin sesión) y "/dashboard" ya tiene su propio
// sidebar de gestión por rol, así que el flotante no se muestra ahí.
const HIDDEN_ROUTES = ['/', '/dashboard', '/cuestionario/buscar', '/cuestionario/ofrecer'];

export const FloatingNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || HIDDEN_ROUTES.includes(location.pathname)) return null;

  // "Inicio" depende del rol: el Host descubre perfiles de estudiantes
  // (/descubrir), el Student explora Spaces (/explorar) — mismo criterio que
  // Header.tsx y el redirect post-login de LoginModal.tsx.
  const navItems: FloatingNavItem[] = [
    { to: user.role === 'host' ? '/descubrir' : '/explorar', label: 'Inicio', icon: Home },
    { to: '/mensajes', label: 'Mensajes', icon: MessageSquare },
    { to: '/asesorias', label: 'Asesorías', icon: GraduationCap },
  ];

  return (
    <>
      {/* Desktop / tablet (>= md): barra circular flotante a la izquierda. */}
      <nav
        aria-label="Navegación principal"
        className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-full border border-base-300 bg-base-100/90 p-2 shadow-lg backdrop-blur-md md:flex"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            data-tip={label}
            aria-label={label}
            className={({ isActive }) =>
              `tooltip tooltip-right flex size-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                isActive
                  ? 'bg-brand-teal text-white'
                  : 'text-base-content/60 hover:bg-brand-teal/10 hover:text-brand-teal'
              }`
            }
          >
            <Icon className="size-5" aria-hidden="true" />
          </NavLink>
        ))}
      </nav>

      {/* Mobile (< md): bottom-nav fija, con ícono + label. Las páginas ya
          reservan espacio abajo (pb-20 en su <main>) pensando en esto. */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-base-300 bg-base-100/95 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none ${
                isActive
                  ? 'text-brand-teal'
                  : 'text-base-content/60'
              }`
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};