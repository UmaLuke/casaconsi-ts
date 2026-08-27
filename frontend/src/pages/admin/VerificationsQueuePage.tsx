// src/pages/admin/VerificationsQueuePage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Users, MessageSquare, Settings,
  LogOut, Bell, ChevronRight, BarChart3, ShieldCheck, Clock,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { resolveAvatarUrl } from '../../utils/avatar';
import { useAuth } from '../../hooks/useAuth';
import { getVerificationQueue } from '../../services/adminService';
import type { AdminVerificationQueueItem } from '../../types/admin';

const ROLE_LABEL: Record<AdminVerificationQueueItem['role'], string> = {
  host: 'Anfitrión',
  student: 'Estudiante',
  advisor: 'Asesor',
};

export const VerificationsQueuePage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<AdminVerificationQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setIsLoading(false); return; }
    let cancelled = false;
    getVerificationQueue(token)
      .then((result) => { if (!cancelled) setItems(result); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar la cola de verificaciones.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

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

          <Link to="/dashboard" className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <Home className="size-5" />
            Inicio
          </Link>
          <button disabled className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 rounded-lg font-medium cursor-not-allowed">
            <Users className="size-5" /> Usuarios
          </button>
          <button disabled className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 rounded-lg font-medium cursor-not-allowed">
            <BarChart3 className="size-5" /> Estadísticas
          </button>
          <Link to="/dashboard/verificaciones" className="flex items-center gap-3 w-full px-3 py-2 bg-brand-teal/10 text-brand-teal rounded-lg font-medium transition-colors">
            <ShieldCheck className="size-5" /> Verificaciones
          </Link>

          <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">
            Cuenta
          </p>
          <button disabled className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 rounded-lg font-medium cursor-not-allowed">
            <MessageSquare className="size-5" /> Mensajes
          </button>
          <button disabled className="flex items-center gap-3 w-full px-3 py-2 text-slate-300 rounded-lg font-medium cursor-not-allowed">
            <Settings className="size-5" /> Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-brand-teal ring-offset-white ring-offset-1">
                <img src={resolveAvatarUrl(user.avatar, user.name)} alt="Avatar" />
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
            <Link to="/dashboard" className="hover:text-brand-teal transition-colors">CASA con SI</Link>
            <ChevronRight className="size-4" />
            <span className="text-slate-900 font-bold">Verificaciones</span>
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
          <div className="max-w-5xl mx-auto space-y-6">

            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Verificaciones
              </h1>
              <p className="text-slate-600 mt-1 font-medium">
                Perfiles Premium que solicitaron pasar a Alta Confianza y esperan aprobación manual de staff.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg text-brand-teal" />
              </div>
            ) : error ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
                <p className="text-lg font-medium text-error">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <ShieldCheck className="size-10 mx-auto text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-400">
                  No hay solicitudes de Alta Confianza pendientes.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left font-bold px-6 py-3">Persona</th>
                      <th className="text-left font-bold px-6 py-3">Rol</th>
                      <th className="text-left font-bold px-6 py-3">Básico</th>
                      <th className="text-left font-bold px-6 py-3">Solicitado</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.userId} className="border-t border-slate-100 hover:bg-slate-50/60">
                        <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-slate-600">{ROLE_LABEL[item.role]}</td>
                        <td className="px-6 py-4 text-slate-600">{item.basicScore}/6</td>
                        <td className="px-6 py-4 text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {item.requestedAtUtc ? new Date(item.requestedAtUtc).toLocaleDateString('es-AR') : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => navigate(`/dashboard/verificaciones/${item.userId}`)}
                            className="btn btn-sm bg-brand-teal hover:bg-brand-teal/90 text-white border-none"
                          >
                            Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
};