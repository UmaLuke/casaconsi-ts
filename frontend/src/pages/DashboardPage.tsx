// src/pages/DashboardPage.tsx
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  Home, Users, MessageSquare, Settings, 
  LogOut, Bell, ChevronRight, BarChart3, ShieldCheck
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

// Acceso exclusivo de administración. El gate real vive en <ProtectedRoute requireAdmin>
// (App.tsx) — para cuando se renderiza este componente, user ya no es null y
// user.isAdmin ya es true. El chequeo de abajo es solo un resguardo defensivo.
export const DashboardPage = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900">
      
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/" className="scale-90 origin-left hover:scale-95 transition-transform">
            <BrandLogo />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">
            Administración
          </p>

          <button className="flex items-center gap-3 w-full px-3 py-2 bg-brand-teal/10 text-brand-teal rounded-lg font-medium transition-colors">
            <Home className="size-5" />
            Inicio
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <Users className="size-5" /> Usuarios
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <BarChart3 className="size-5" /> Estadísticas
          </button>
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <ShieldCheck className="size-5" /> Verificaciones
          </button>

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
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} alt="Avatar" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">Administrador</p>
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
            <span className="text-slate-900 font-bold">Panel de Administración</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-circle btn-sm" aria-label="Ver notificaciones">
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
            
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Panel de Administración
              </h1>
              <p className="text-slate-600 mt-1 font-medium">
                Vista general de la plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-white shadow-sm border-2 border-brand-orange">
                <div className="card-body p-6">
                  <h2 className="card-title text-slate-500 text-sm">Usuarios registrados</h2>
                  <p className="text-4xl font-black text-slate-900">—</p>
                  <p className="text-xs text-slate-400 font-bold mt-2">Pendiente de conectar</p>
                </div>
              </div>
              <div className="card bg-white shadow-sm border-2 border-brand-orange">
                <div className="card-body p-6">
                  <h2 className="card-title text-slate-500 text-sm">Espacios publicados</h2>
                  <p className="text-4xl font-black text-brand-orange">—</p>
                  <p className="text-xs text-slate-400 font-bold mt-2">Pendiente de conectar</p>
                </div>
              </div>
              <div className="card bg-white shadow-sm border-2 border-brand-orange">
                <div className="card-body p-6">
                  <h2 className="card-title text-slate-500 text-sm">Verificaciones pendientes</h2>
                  <p className="text-4xl font-black text-brand-teal">—</p>
                  <p className="text-xs text-slate-400 font-bold mt-2">Pendiente de conectar</p>
                </div>
              </div>
            </div>

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