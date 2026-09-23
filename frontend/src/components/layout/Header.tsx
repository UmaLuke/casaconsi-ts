// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LoginModal } from '../features/auth/LoginModal';
import { useAuth } from '../../hooks/useAuth';
import { resolveAvatarUrl } from '../../utils/avatar';

export const Header = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const location = useLocation();

  // logout() ya redirige a la landing (ver AuthContext) — no hace falta
  // navegar acá.
  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLoginModal = () => {
    const modal = document.getElementById('login_modal') as HTMLDialogElement | null;
    modal?.showModal();
  };

  // Landing: transparente hasta hacer scroll. Cualquier otra página interna
  // (Explorar, Interesados, Mis espacios, Mensajes, Asesorías, Dashboard,
  // etc.) usa el mismo teal de marca.
  let headerBgClass = '';

  if (location.pathname === '/') {
    headerBgClass = isScrolled
      ? 'bg-brand-teal backdrop-blur-md shadow-sm'
      : 'bg-transparent';
  } else {
    headerBgClass = 'bg-brand-teal backdrop-blur-md shadow-sm border-b border-brand-teal/20';
  }

  return (
    <header className={`fixed top-0 w-full z-50 text-white transition-all duration-300 py-2.5 md:py-3 ${headerBgClass}`}>
      {/* !min-h-0 !py-0 pisan el min-height (4rem) y el padding vertical que
          trae por defecto .navbar de DaisyUI — así la franja se achica al
          tamaño real del contenido (el logo) en vez de un piso fijo de 64px. */}
      <div className="container mx-auto navbar !min-h-0 !py-0 px-4 md:px-7">
        
        {/* --- NAVBAR MOBILE Y LOGO --- */}
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-white hover:bg-white/10" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-lg bg-base-100 rounded-box w-52 text-base-content border border-base-200">
              {!user && (
                <>
                  <li><a href="#como-funciona">¿Cómo funciona?</a></li>
                  <li><a href="#explorar-espacios">Buscar casa</a></li>
                </>
              )}
              {user?.role === 'student' && <li><Link to="/explorar">Explorar Casas</Link></li>}
              {user?.role === 'host' && (
                <>
                  <li><Link to="/interesados">Interesados</Link></li>
                  <li><Link to="/mis-espacios">Mis espacios</Link></li>
                </>
              )}
            </ul>
          </div>
          
          <Link to="/" className="ml-2 lg:ml-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg transition-transform hover:scale-105" aria-label="Volver al inicio">
            <BrandLogo />
          </Link>
        </div>

        {/* --- NAVBAR DESKTOP --- */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 font-medium text-white/90">
            {!user && (
              <>
                <li><a href="#como-funciona" className="hover:text-brand-orange hover:bg-transparent transition-colors">¿Cómo funciona?</a></li>
                <li><a href="#explorar-espacios" className="hover:text-brand-orange hover:bg-transparent transition-colors">Buscar casa</a></li>
                <li><a href="#ofrecer-espacio" className="hover:text-brand-orange hover:bg-transparent transition-colors">Ofrecer casa</a></li>
              </>
            )}
            {user?.role === 'student' && (
              <li><Link to="/explorar" className="hover:text-brand-orange hover:bg-transparent transition-colors">Mis solicitudes</Link></li>
            )}
            {user?.role === 'host' && (
              <>
                <li><Link to="/interesados" className="hover:text-brand-orange hover:bg-transparent transition-colors">Interesados</Link></li>
                <li><Link to="/mis-espacios" className="hover:text-brand-orange hover:bg-transparent transition-colors">Mis espacios</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* --- CONTROLES Y AUTENTICACIÓN --- */}
        <div className="navbar-end gap-2 sm:gap-4 items-center">
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar transition-transform hover:scale-105" aria-label="Menú de usuario">
                <div className="w-9 sm:w-10 rounded-full ring ring-brand-teal ring-offset-transparent ring-offset-2">
                  <img src={resolveAvatarUrl(user.avatar, user.name)} alt={`Avatar de ${user.name}`} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-1 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content border border-base-200">
                <li className="menu-title px-4 py-2 border-b border-base-200 mb-1">
                  <span className="font-bold text-base-content text-sm block truncate">{user.name}</span>
                  <span className="text-xs font-normal text-base-content/60 capitalize block">{user.title ?? user.role}</span>
                </li>
                <li><Link to="/mi-perfil" className="font-medium hover:text-brand-teal transition-colors">Mi perfil</Link></li>
                {user.isAdmin && (
                  <li><Link to="/dashboard" className="font-medium hover:text-brand-teal transition-colors">Ir a mi Panel</Link></li>
                )}
                <li><button onClick={handleLogout} className="text-error font-bold hover:bg-error/10 hover:text-error mt-1 transition-colors">Cerrar Sesión</button></li>
              </ul>
            </div>
          ) : (
            <>
              <button onClick={openLoginModal} className="btn btn-ghost btn-sm md:btn-md flex text-white hover:bg-white/10 transition-colors">
                Iniciar Sesión
              </button>
              <Link to="/register" className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none btn-sm md:btn-md shadow-md transition-transform hover:-translate-y-0.5">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
      <LoginModal />
    </header>
  );
};