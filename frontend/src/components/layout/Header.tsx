// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import { LoginModal } from '../features/auth/LoginModal';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColorClass = isScrolled ? 'text-base-content' : 'text-white drop-shadow-md';
  const textMutedClass = isScrolled ? 'text-base-content/80' : 'text-white/90 drop-shadow-md';

  const openLoginModal = () => {
    (document.getElementById('login_modal') as HTMLDialogElement | null)?.showModal();
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-brand-teal/50 backdrop-blur-md border-b border-base-200 shadow-sm py-1 md:py-2' 
          : 'bg-transparent border-transparent py-3 md:py-4'
      }`}
    >
      <div className="container mx-auto navbar px-4 md:px-7">
        
        <div className="navbar-start">
          <div className="dropdown">
            <div 
              tabIndex={0} 
              role="button" 
              className={`btn btn-ghost lg:hidden ${textColorClass} hover:bg-white/10`} 
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </div>
            <ul 
              tabIndex={0} 
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 text-base-content border border-base-200"
            >
              <li><a href="#como-funciona">¿Como funciona?</a></li>
              <li><a href="#explorar-espacios">Buscar casa</a></li>
              <li><a href="#ofrecer-espacio">Ofrecer casa</a></li>
            </ul>
          </div>
          
          <Link 
            to="/" 
            className="ml-2 lg:ml-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg transition-transform hover:scale-105"
            aria-label="Ir a la página de inicio"
          >
            <BrandLogo />          
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className={`menu menu-horizontal px-1 font-medium ${textMutedClass}`}>
            <li><a href="#como-funciona" className="hover:text-brand-orange hover:bg-transparent transition-colors">¿Como funciona?</a></li>
            <li><a href="#explorar-espacios" className="hover:text-brand-orange hover:bg-transparent transition-colors">Buscar casa</a></li>
            <li><a href="#ofrecer-espacio" className="hover:text-brand-orange hover:bg-transparent transition-colors">Ofrecer casa</a></li>
          </ul>
        </div>

        <div className="navbar-end gap-2 sm:gap-4 items-center">
          
          <div className={`${!isScrolled && 'text-white drop-shadow-md'}`}>
            <ThemeToggle />
          </div>

          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar transition-transform hover:scale-105">
                <div className="w-9 sm:w-10 rounded-full ring ring-brand-teal ring-offset-base-100 ring-offset-2">
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Perfil de usuario" />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 text-base-content border border-base-200">
                <li className="menu-title px-4 py-2">
                  <span className="font-bold text-base-content text-sm block truncate">{user.name}</span>
                  <span className="text-xs font-normal text-base-content/60 capitalize block">{user.title ?? user.role}</span>
                </li>
                <div className="divider my-0"></div>
                <li><Link to="/dashboard" className="font-medium">Ir a mi Panel</Link></li>
                <li><Link to="/profile" className="font-medium">Mi Perfil</Link></li>
                <li>
                  <button onClick={logout} className="text-error font-bold hover:bg-error/10 mt-2">
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <button 
                onClick={openLoginModal} 
                className={`btn btn-ghost btn-sm md:btn-md hidden sm:flex ${textColorClass} hover:bg-white/10 hover:text-brand-orange transition-colors`}
              >
                Iniciar Sesión
              </button>
              
              <Link 
                to="/register" 
                className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none btn-sm md:btn-md shadow-md transition-transform hover:scale-105"
              >
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
