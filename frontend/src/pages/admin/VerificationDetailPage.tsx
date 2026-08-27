// src/pages/admin/VerificationDetailPage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Home, Users, MessageSquare, Settings,
  LogOut, ChevronRight, BarChart3, ShieldCheck,
  ArrowLeft, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { resolveAvatarUrl } from '../../utils/avatar';
import { useAuth } from '../../hooks/useAuth';
import { getVerificationDetail, approveVerification, rejectVerification } from '../../services/adminService';
import type { AdminVerificationDetail } from '../../types/admin';

const ROLE_LABEL: Record<AdminVerificationDetail['role'], string> = {
  host: 'Anfitrión',
  student: 'Estudiante',
  advisor: 'Asesor',
};

const STATUS_LABEL: Record<AdminVerificationDetail['status'], string> = {
  no_solicitado: 'No solicitado',
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
};

export const VerificationDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AdminVerificationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!token || !userId) { setIsLoading(false); return; }
    let cancelled = false;
    getVerificationDetail(token, userId)
      .then((result) => { if (!cancelled) setDetail(result); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [token, userId]);

  const handleApprove = async () => {
    if (!token || !userId) return;
    setIsSaving(true);
    try {
      await approveVerification(token, userId);
      navigate('/dashboard/verificaciones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar la verificación.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!token || !userId || !rejectReason.trim()) return;
    setIsSaving(true);
    try {
      await rejectVerification(token, userId, rejectReason.trim());
      navigate('/dashboard/verificaciones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar la verificación.');
    } finally {
      setIsSaving(false);
    }
  };

  const altaConfianzaCompletedCount = detail?.altaConfianzaItems.filter((i) => i.completed).length ?? 0;
  const totalScore = (detail?.basicScore ?? 0) + altaConfianzaCompletedCount;

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

        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-6 z-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/dashboard" className="hover:text-brand-teal transition-colors">CASA con SI</Link>
            <ChevronRight className="size-4" />
            <Link to="/dashboard/verificaciones" className="hover:text-brand-teal transition-colors">Verificaciones</Link>
            <ChevronRight className="size-4" />
            <span className="text-slate-900 font-bold">{detail?.name ?? '...'}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            <button
              onClick={() => navigate('/dashboard/verificaciones')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-teal hover:text-brand-navy transition-colors"
            >
              <ArrowLeft className="size-4" /> Volver a la cola
            </button>

            {isLoading ? (
              <div className="flex justify-center py-16">
                <span className="loading loading-spinner loading-lg text-brand-teal" />
              </div>
            ) : error ? (
              <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
                <p className="text-lg font-medium text-error">{error}</p>
              </div>
            ) : !detail ? null : (
              <>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="avatar placeholder">
                      <div className="bg-pink-100 text-pink-700 rounded-full w-14 flex items-center justify-center font-bold">
                        {detail.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-900">{detail.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 font-medium">{ROLE_LABEL[detail.role]}</span>
                        <span className="size-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-brand-orange">
                          {detail.membershipTier === 'premium' ? 'Premium' : 'Freemium'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-brand-teal leading-none">
                      {totalScore}<span className="text-sm text-slate-400 font-semibold">/10</span>
                    </p>
                    <p className="text-xs text-slate-400 font-bold mt-1.5">
                      {detail.status === 'pendiente'
                        ? `Básico confirmado · ${detail.altaConfianzaItems.length - altaConfianzaCompletedCount} en revisión`
                        : detail.status === 'aprobado' ? 'Alta confianza confirmada'
                        : detail.status === 'rechazado' ? 'Alta confianza rechazada'
                        : 'Sin solicitud de Alta Confianza'}
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-sm font-extrabold text-slate-900">Básica</p>
                  <p className="text-xs text-slate-400 mb-3">
                    Ítems 1-6 · autodeclarados por la persona, no requieren revisión de staff
                  </p>
                  <ul className="divide-y divide-slate-100">
                    {detail.basicItems.map((item) => (
                      <li key={item.key} className="flex items-center gap-3 py-2.5">
                        <CheckCircle2 className={`size-[18px] flex-shrink-0 ${item.completed ? 'text-green-600' : 'text-slate-300'}`} />
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-sm font-extrabold text-slate-900">
                    Alta confianza <span className="text-brand-orange">— {STATUS_LABEL[detail.status].toLowerCase()}</span>
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    Ítems 7-10 · documentación adjuntada por la persona. Ninguno cuenta para el puntaje hasta que se aprueba.
                  </p>
                  <ul className="divide-y divide-slate-100">
                    {detail.altaConfianzaItems.map((item) => (
                      <li key={item.key} className="flex items-center gap-3 py-2.5">
                        {item.completed ? (
                          <CheckCircle2 className="size-[18px] flex-shrink-0 text-green-600" />
                        ) : (
                          <Clock className="size-[18px] flex-shrink-0 text-brand-orange" />
                        )}
                        <span className="text-sm text-slate-700 flex-1">{item.label}</span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          item.completed ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-brand-orange'
                        }`}>
                          {item.completed ? 'Aprobado' : STATUS_LABEL[detail.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2.5 bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Aprobar confirma los 4 ítems de Alta Confianza: el puntaje pasa de {detail.basicScore}/10 a 10/10 y el nivel sube a
                    "Alta confianza". Rechazar no descuenta lo ya confirmado — solo le pide a la persona que corrija y vuelva a enviar la documentación.
                  </p>
                </div>

                {detail.status === 'rechazado' && detail.rejectionReason && (
                  <div className="bg-error/5 border border-error/20 rounded-xl p-4">
                    <p className="text-xs font-bold text-error mb-1">Último rechazo</p>
                    <p className="text-sm text-slate-600">{detail.rejectionReason}</p>
                  </div>
                )}

                {detail.status === 'pendiente' && (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isSaving}
                      className="btn btn-outline border-error/40 text-error hover:bg-error/10 hover:border-error/40"
                    >
                      <XCircle className="size-4" /> Rechazar
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isSaving}
                      className="btn bg-brand-teal hover:bg-brand-teal/90 text-white border-none"
                    >
                      {isSaving ? <span className="loading loading-spinner loading-sm" /> : <CheckCircle2 className="size-4" />}
                      Aprobar Alta Confianza
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <p className="text-lg font-extrabold text-slate-900">Rechazar verificación</p>
            <p className="text-xs text-slate-400 mt-1">{detail?.name}</p>

            <p className="text-sm font-bold text-slate-700 mt-4 mb-1.5">Motivo del rechazo</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: el certificado de antecedentes penales no se ve legible, pedile que lo vuelva a subir."
              className="textarea textarea-bordered w-full min-h-24 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              La persona va a ver este motivo en su perfil, así puede corregirlo y volver a enviarlo a revisión.
            </p>

            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="btn btn-ghost"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={isSaving || !rejectReason.trim()}
                className="btn bg-error hover:bg-error/90 text-white border-none"
              >
                {isSaving ? <span className="loading loading-spinner loading-sm" /> : null}
                Confirmar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};