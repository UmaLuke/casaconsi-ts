import React from 'react';
import { Menu, Home, UserPlus, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="navbar bg-base-100 border-b border-base-300 px-4 sm:px-8 sticky top-0 z-50">
      {/* Sección Izquierda: Menú Móvil y Logo */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-200 border border-base-300 rounded-box w-52"
          >
            <li><a href="/como-funciona">¿Cómo funciona?</a></li>
            <li><a href="/buscar-casa">Buscar casa</a></li>
            <li><a href="/ofrecer-casa">Ofrecer casa</a></li>
          </ul>
        </div>
        <a href="/" className="btn btn-ghost normal-case text-xl font-bold tracking-tight gap-2">
          <Home className="h-5 w-5 text-primary" />
          CASA CON SI
        </a>
      </div>

      {/* Sección Central: Navegación de Escritorio */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium">
          <li><a href="/como-funciona" className="hover:text-primary transition-colors">¿Cómo funciona?</a></li>
          <li><a href="/buscar-casa" className="hover:text-primary transition-colors">Buscar casa</a></li>
          <li><a href="/ofrecer-casa" className="hover:text-primary transition-colors">Ofrecer casa</a></li>
        </ul>
      </div>

      {/* Sección Derecha: Acciones de Usuario */}
      <div className="navbar-end gap-2">
        <a href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-2">
          <LogIn className="h-4 w-4" />
          Iniciar Sesión
        </a>
        <a href="/register" className="btn btn-primary btn-sm gap-2">
          <UserPlus className="h-4 w-4" />
          Registrarse
        </a>
      </div>
    </nav>
  );
};