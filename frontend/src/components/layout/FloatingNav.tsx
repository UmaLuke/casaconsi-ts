// src/components/layout/FloatingNav.tsx
import { NavLink, useLocation } from 'react-router-dom';
import { Home, MessageSquare, GraduationCap, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface FloatingNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: FloatingNavItem[] = [
  { to: '/explorar', label: 'Inicio', icon: Home },
  { to: '/mensajes', label: 'Mensajes', icon: MessageSquare },
  { to: '/asesorias', label: 'Asesorías', icon: GraduationCap },
];

// "/" es la landing pública (sin sesión) y "/dashboard" ya tiene su propio
// sidebar de gestión por rol, así que el flotante no se muestra ahí.
const HIDDEN_ROUTES = ['/', '/dashboard', '/cuestionario/buscar', '/cuestionario/ofrecer'];

export const FloatingNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || HIDDEN_ROUTES.includes(location.pathname)) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-1 rounded-full border border-base-300 bg-base-100/90 p-2 shadow-lg backdrop-blur-md md:flex"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
  );
};