// src/pages/MySpacesPage.tsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, Target, CheckCircle2, Plus, Pencil, Pause, Play, Trash2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { EditSpaceModal } from '../components/features/spaces/EditSpaceModal';
import { useAuth } from '../hooks/useAuth';
import { getMine, updateSpaceStatus, deleteSpace, SpaceError } from '../services/spaceService';
import type { Space } from '../types/space';
import { PURPOSE_LABELS } from '../types/filters';

export const MySpacesPage = () => {
  const { token } = useAuth();
  const editModalRef = useRef<HTMLDialogElement>(null);

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getMine(token)
      .then((result) => { if (!cancelled) setSpaces(result); })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof SpaceError ? err.message : 'No se pudieron cargar tus publicaciones.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

  const openEditModal = (space: Space) => {
    setEditingSpace(space);
    editModalRef.current?.showModal();
  };

  const togglePause = async (space: Space) => {
    if (!token) return;
    setActionError(null);
    try {
      const updated = await updateSpaceStatus(token, space.id, !space.isActive);
      setSpaces((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      setActionError(err instanceof SpaceError ? err.message : 'No se pudo actualizar el estado de la publicación.');
    }
  };

  const confirmDelete = async (space: Space) => {
    if (!token) return;
    setActionError(null);
    try {
      await deleteSpace(token, space.id);
      setSpaces((prev) => prev.filter((s) => s.id !== space.id));
    } catch (err) {
      setActionError(err instanceof SpaceError ? err.message : 'No se pudo eliminar la publicación.');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const activeCount = spaces.filter((s) => s.isActive).length;

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Mis espacios</h1>
              <p className="text-base-content/70 text-lg max-w-2xl font-medium">
                {spaces.length} publicaciones · {activeCount} activas en el explorador.
              </p>
            </div>
            <Link to="/mis-espacios/nuevo" className="btn btn-primary gap-2">
              <Plus className="size-4" /> Publicar espacio
            </Link>
          </div>

          {actionError && (
            <div className="mb-6 text-sm text-error bg-error/10 border border-error/20 rounded-xl px-4 py-2.5">
              {actionError}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-brand-teal" />
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
              <p className="text-lg font-medium text-error">{error}</p>
            </div>
          ) : spaces.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
              <Home className="size-10 mx-auto text-base-content/30 mb-4" />
              <p className="text-lg font-medium text-base-content/60">Todavía no publicaste ningún espacio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className={`card bg-base-100 shadow-sm border ${space.isActive ? 'border-base-200' : 'border-warning/30'}`}
                >
                  <figure className="relative aspect-4/3 overflow-hidden bg-base-200">
                    <img
                      src={space.imageUrl}
                      alt={space.title}
                      className={`object-cover w-full h-full ${space.isActive ? '' : 'grayscale brightness-90'}`}
                    />
                    {space.isActive ? (
                      space.verified && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="size-3.5 text-brand-teal" />
                          <span className="text-xs font-bold text-base-content">Verificado</span>
                        </div>
                      )
                    ) : (
                      <div className="absolute top-3 right-3 bg-neutral/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <Pause className="size-3 text-white" />
                        <span className="text-xs font-bold text-white">Pausado</span>
                      </div>
                    )}
                  </figure>
                  <div className="card-body p-4 gap-2">
                    <h3 className="card-title text-base leading-tight">{space.title}</h3>
                    <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-brand-teal" /> {space.neighborhood}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="size-3.5 text-brand-orange" /> {PURPOSE_LABELS[space.purpose]}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-brand-teal">
                      {formatPrice(space.price)}
                      <span className="text-xs font-medium text-base-content/50 ml-1">/mes</span>
                    </p>

                    <div className="mt-auto flex flex-col gap-2">
                      <Link to={`/espacios/${space.id}`} className="btn btn-sm btn-outline justify-center">
                        Ver publicación
                      </Link>

                      {pendingDeleteId === space.id ? (
                        <div className="flex items-center justify-between gap-2 bg-error/10 border border-error/20 rounded-lg px-2.5 py-2">
                          <span className="text-xs font-semibold text-error">¿Eliminar esta publicación?</span>
                          <div className="flex gap-1.5 shrink-0">
                            <button className="btn btn-xs btn-ghost" onClick={() => setPendingDeleteId(null)}>Cancelar</button>
                            <button className="btn btn-xs btn-error text-white" onClick={() => confirmDelete(space)}>Eliminar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-square btn-outline"
                            title="Editar espacio"
                            aria-label="Editar espacio"
                            onClick={() => openEditModal(space)}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            className={`btn btn-sm btn-square ${space.isActive ? 'btn-outline' : 'btn-success text-white'}`}
                            title={space.isActive ? 'Pausar publicación' : 'Reactivar publicación'}
                            aria-label={space.isActive ? 'Pausar publicación' : 'Reactivar publicación'}
                            onClick={() => togglePause(space)}
                          >
                            {space.isActive ? <Pause className="size-4" /> : <Play className="size-4" />}
                          </button>
                          <button
                            className="btn btn-sm btn-square btn-outline btn-error"
                            title="Eliminar publicación"
                            aria-label="Eliminar publicación"
                            onClick={() => setPendingDeleteId(space.id)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <EditSpaceModal
        ref={editModalRef}
        space={editingSpace}
        onSaved={(updated) => {
          setSpaces((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }}
      />
    </div>
  );
};
