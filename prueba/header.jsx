// src/components/layout/Header.jsx
import { Menu } from 'lucide-react';
import { BrandLogo } from '../common/BranLogo';
import { ThemeToggle } from '../common/ThemeToggle';

export const Header = () => {
  return (
    <header className="bg-base-100 sticky top-0 z-50 border-b border-base-200 shadow-sm">
      <div className="container mx-auto navbar px-4 md:px-6">
        
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden" aria-label="Abrir menú">
              {/* Se adapta al color del texto actual */}
              <Menu className="h-5 w-5 text-base-content" />
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="#como-funciona">¿Como funciona?</a></li>
              <li><a href="#buscar-espacio">Buscar casa</a></li>
              <li><a href="#ofrecer-espacio">Ofrecer casa</a></li>
            </ul>
          </div>
          
          <a href="/" className='ml-2 lg:ml-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded-lg'>
            <BrandLogo/>          
          </a>
        </div>

        <div className="navbar-center hidden lg:flex">
          {/* Uso de text-base-content para que se adapte al tema */}
          <ul className="menu menu-horizontal px-1 font-medium text-base-content/80">
            <li><a href='#como-funciona' className="hover:text-brand-orange hover:bg-transparent transition-colors">¿Como funciona?</a></li>
            <li><a href='#explorar-espacios' className="hover:text-brand-orange hover:bg-transparent transition-colors">Buscar casa</a></li>
            <li><a href='#como-funciona' className="hover:text-brand-orange hover:bg-transparent transition-colors">Ofrecer casa</a></li>
          </ul>
        </div>


        <div className="navbar-end gap-2 sm:gap-4 items-center">
           <ThemeToggle />
          <button className="btn btn-ghost btn-sm md:btn-md text-base-content hidden sm:flex">
            Iniciar Sesión
          </button>
          <button className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none btn-sm md:btn-md shadow-md">
            Registrarse
          </button>
        </div>

      </div>
    </header>
  );
};