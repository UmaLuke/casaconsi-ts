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

  const currentUser: User = user || { name: 'Invitado', email: '', role: 'student', avatar: '' };

  const isHost = currentUser.role === 'host';

  return (
    // Se cambia el fondo general a blanco y se asegura el texto oscuro para contraste
    <div className="flex h-screen bg-white font-sans text-slate-900">
      
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/" className="scale-90 origin-left hover:scale-95 transition-transform">
            <BrandLogo />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Principal
          </p>
          
          {/* Se conserva el color teal para la sección activa */}
          <button className="flex items-center gap-3 w-full px-3 py-2 bg-brand-teal/10 text-brand-teal rounded-lg font-medium transition-colors">
            <Home className="size-5" />
            Inicio
          </button>

          {isHost ? (
            <>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                <Home className="size-5" /> Mis Espacios
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                <Users className="size-5" /> Solicitudes
                <span className="ml-auto bg-brand-orange text-white text-xs py-0.5 px-2 rounded-full">3</span>
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                <FileText className="size-5" /> Acuerdos
              </button>
            </>
          ) : (
            <>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                <Search className="size-5" /> Explorar Casas
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                <Heart className="size-5" /> Mis Favoritos
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
                <FileText className="size-5" /> Mis Aplicaciones
              </button>
            </>
          )}

          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">
            Cuenta
          </p>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <MessageSquare className="size-5" /> Mensajes
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <Settings className="size-5" /> Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-brand-teal ring-offset-white ring-offset-1">
                <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} alt="Avatar" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 capitalize truncate">{currentUser.title ?? currentUser.role}</p>
            </div>
            <button onClick={logout} className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Cerrar Sesión">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
        
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-brand-teal transition-colors">CASA con SI</Link>
            <ChevronRight className="size-4" />
            <span className="text-slate-900 font-bold">Panel Principal</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              className="btn btn-ghost btn-circle btn-sm" aria-label="Ver notificaciones">
              <div className="indicator">
                <Bell className="size-5 text-slate-600" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <Link to="/" className="btn btn-outline btn-sm border-slate-200 hover:bg-slate-100 text-slate-600">
              Ir a la web
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  ¡Hola, {currentUser.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-slate-600 mt-1 font-medium">
                  {isHost 
                    ? 'Aquí tienes un resumen de tus espacios y solicitudes.' 
                    : 'Aquí tienes un resumen de tu búsqueda de alojamiento.'}
                </p>
              </div>
              <button className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none shadow-md">
                {isHost ? 'Publicar nuevo espacio' : 'Completar mi perfil'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Tarjetas con fondo blanco y borde naranja */}
              <div className="card bg-white shadow-sm border-2 border-brand-orange">
                <div className="card-body p-6">
                  <h2 className="card-title text-slate-500 text-sm">
                    {isHost ? 'Vistas esta semana' : 'Casas vistas'}
                  </h2>
                  <p className="text-4xl font-black text-slate-900">24</p>
                  <p className="text-xs text-success font-bold mt-2">↗︎ 12% más que la semana pasada</p>
                </div>
              </div>
              <div className="card bg-white shadow-sm border-2 border-brand-orange">
                <div className="card-body p-6">
                  <h2 className="card-title text-slate-500 text-sm">
                    {isHost ? 'Solicitudes pendientes' : 'Mis postulaciones activas'}
                  </h2>
                  <p className="text-4xl font-black text-brand-orange">3</p>
                  <p className="text-xs text-slate-400 font-bold mt-2">Requieren tu atención</p>
                </div>
              </div>
              <div className="card bg-white shadow-sm border-2 border-brand-orange">
                <div className="card-body p-6">
                  <h2 className="card-title text-slate-500 text-sm">Mensajes sin leer</h2>
                  {/* Se conserva el color teal en esta métrica */}
                  <p className="text-4xl font-black text-brand-teal">1</p>
                  <p className="text-xs text-slate-400 font-bold mt-2">En la bandeja de entrada</p>
                </div>
              </div>
            </div>

            {/* Contenedor punteado actualizado */}
            <div className="w-full h-64 bg-white border-2 border-brand-orange border-dashed rounded-2xl flex items-center justify-center">
              <p className="text-slate-400 font-medium text-lg">
                El contenido principal de esta sección irá aquí
              </p>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
};