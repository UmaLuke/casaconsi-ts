// src/pages/DashboardPage.tsx
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Home, Search, Heart, MessageSquare, Settings, 
  LogOut, Bell, ChevronRight, Users, FileText 
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';
import type { User } from '../types/auth';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  // Si alguien entra sin estar logueado, podríamos redirigirlo (lo haremos luego)
  // Por ahora, simulamos un usuario si recargas la página rápido
  const currentUser: User = user || { name: 'Invitado', email: '', role: 'student', avatar: '' };

  // Definimos qué menú mostrar según el rol
  const isHost = currentUser.role === 'host' || currentUser.role === 'Fundadora';

  return (
    <div className="flex h-screen bg-base-200/50 font-sans">
      
      {/* SIDEBAR (Menú Lateral Izquierdo) */}
      <aside className="w-64 bg-base-100 border-r border-base-300 flex flex-col hidden md:flex">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-base-300">
          <Link to="/" className="scale-90 origin-left hover:scale-95 transition-transform">
            <BrandLogo />
          </Link>
        </div>

        {/* Navegación del Sidebar */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2 mt-4">
            Principal
          </p>
          
          <button className="flex items-center gap-3 w-full px-3 py-2 bg-brand-teal/10 text-brand-teal rounded-lg font-medium transition-colors">
            <Home className="size-5" />
            Inicio
          </button>

          {isHost ? (
            // MENÚ ANFITRIÓN
            <>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
                <Home className="size-5" /> Mis Espacios
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
                <Users className="size-5" /> Solicitudes
                <span className="ml-auto bg-brand-orange text-white text-xs py-0.5 px-2 rounded-full">3</span>
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
                <FileText className="size-5" /> Acuerdos
              </button>
            </>
          ) : (
            // MENÚ ESTUDIANTE
            <>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
                <Search className="size-5" /> Explorar Casas
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
                <Heart className="size-5" /> Mis Favoritos
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
                <FileText className="size-5" /> Mis Aplicaciones
              </button>
            </>
          )}

          <p className="px-3 text-xs font-bold text-base-content/50 uppercase tracking-wider mb-2 mt-6">
            Cuenta
          </p>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
            <MessageSquare className="size-5" /> Mensajes
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-base-content/70 hover:bg-base-200 hover:text-base-content rounded-lg font-medium transition-colors">
            <Settings className="size-5" /> Configuración
          </button>
        </nav>

        {/* Footer del Sidebar (Usuario) */}
        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-brand-teal ring-offset-base-100 ring-offset-1">
                <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} alt="Avatar" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-base-content truncate">{currentUser.name}</p>
              <p className="text-xs text-base-content/60 capitalize truncate">{currentUser.role}</p>
            </div>
            <button onClick={logout} className="p-2 text-base-content/50 hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Cerrar Sesión">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Cabecera Superior */}
        <header className="h-16 bg-base-100/80 backdrop-blur-md border-b border-base-300 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-2 text-sm text-base-content/60 font-medium">
            <Link to="/" className="hover:text-brand-teal transition-colors">CASA con SI</Link>
            <ChevronRight className="size-4" />
            <span className="text-base-content font-bold">Panel Principal</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-circle btn-sm">
              <div className="indicator">
                <Bell className="size-5 text-base-content/70" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <Link to="/" className="btn btn-outline btn-sm border-base-300 hover:bg-base-200 text-base-content/70">
              Ir a la web
            </Link>
          </div>
        </header>

        {/* Contenido del Dashboard */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Mensaje de Bienvenida */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
                  ¡Hola, {currentUser.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-base-content/70 mt-1 font-medium">
                  {isHost 
                    ? 'Aquí tienes un resumen de tus espacios y solicitudes.' 
                    : 'Aquí tienes un resumen de tu búsqueda de alojamiento.'}
                </p>
              </div>
              <button className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none shadow-md">
                {isHost ? 'Publicar nuevo espacio' : 'Completar mi perfil'}
              </button>
            </div>

            {/* Tarjetas de Estadísticas (Mockup) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h2 className="card-title text-base-content/70 text-sm">
                    {isHost ? 'Vistas esta semana' : 'Casas vistas'}
                  </h2>
                  <p className="text-4xl font-black text-base-content">24</p>
                  <p className="text-xs text-success font-bold mt-2">↗︎ 12% más que la semana pasada</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h2 className="card-title text-base-content/70 text-sm">
                    {isHost ? 'Solicitudes pendientes' : 'Mis postulaciones activas'}
                  </h2>
                  <p className="text-4xl font-black text-brand-orange">3</p>
                  <p className="text-xs text-base-content/50 font-bold mt-2">Requieren tu atención</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-6">
                  <h2 className="card-title text-base-content/70 text-sm">Mensajes sin leer</h2>
                  <p className="text-4xl font-black text-brand-teal">1</p>
                  <p className="text-xs text-base-content/50 font-bold mt-2">En la bandeja de entrada</p>
                </div>
              </div>
            </div>

            {/* Área en blanco para el futuro contenido */}
            <div className="w-full h-64 bg-base-100 border border-base-200 border-dashed rounded-2xl flex items-center justify-center">
              <p className="text-base-content/40 font-medium text-lg">
                El contenido principal de esta sección irá aquí
              </p>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};
