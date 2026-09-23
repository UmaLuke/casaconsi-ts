// src/components/features/spaces/EditSpaceModal.tsx
import { forwardRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import {
  updateSpace,
  updateSpaceStatus,
  deleteSpacePhoto,
  reorderSpacePhotos,
  uploadPhotos,
  SpaceError,
} from '../../../services/spaceService';
import type { Space } from '../../../types/space';

interface EditSpaceModalProps {
  space: Space | null;
  onSaved: (updated: Space) => void;
}

// Modal de edición de una publicación (MySpacesPage). Se mantiene siempre
// montado y se controla imperativamente vía ref (showModal/close) — mismo
// patrón <dialog> nativo + DaisyUI que SpaceDetailsModal y LoginModal.
export const EditSpaceModal = forwardRef<HTMLDialogElement, EditSpaceModalProps>(
  ({ space, onSaved }, ref) => {
    const { token } = useAuth();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // El modal queda siempre montado y se reutiliza para cualquier space que
    // se abra — hay que resetear el formulario cada vez que cambia el space
    // (mismo cuidado que el índice del carrusel en SpaceDetailsModal).
    useEffect(() => {
      if (!space) return;
      setTitle(space.title);
      setPrice(String(space.price));
      setNeighborhood(space.neighborhood);
      setDescription(space.description);
      setIsActive(space.isActive);
      setPhotoUrls(space.photoUrls);
      setError(null);
    }, [space]);

    const closeModal = () => {
      if (ref && typeof ref !== 'function') {
        ref.current?.close();
      }
    };

    const movePhoto = async (from: number, to: number) => {
      if (!token || !space || to < 0 || to >= photoUrls.length) return;
      const previous = photoUrls;
      const reordered = [...previous];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(to, 0, moved);
      const order = reordered.map((url) => previous.indexOf(url));
      setPhotoUrls(reordered);
      try {
        const updated = await reorderSpacePhotos(token, space.id, order);
        setPhotoUrls(updated.photoUrls);
      } catch (err) {
        setPhotoUrls(previous);
        setError(err instanceof SpaceError ? err.message : 'No se pudo reordenar las fotos.');
      }
    };

    const removePhoto = async (index: number) => {
      if (!token || !space) return;
      try {
        const updated = await deleteSpacePhoto(token, space.id, index);
        setPhotoUrls(updated.photoUrls);
      } catch (err) {
        setError(err instanceof SpaceError ? err.message : 'No se pudo borrar la foto.');
      }
    };

    const addPhotos = async (files: FileList | null) => {
      if (!token || !space || !files || files.length === 0) return;
      try {
        const updated = await uploadPhotos(token, space.id, Array.from(files));
        setPhotoUrls(updated.photoUrls);
      } catch (err) {
        setError(err instanceof SpaceError ? err.message : 'No se pudieron subir las fotos.');
      }
    };

    const handleSubmit = async () => {
      if (!token || !space) return;
      setError(null);
      setIsSaving(true);
      try {
        let updated = await updateSpace(token, space.id, {
          title,
          description,
          location: space.location,
          neighborhood,
          hostType: space.hostType,
          price: Number(price),
          purpose: space.purpose,
          duration: space.duration,
          amenities: space.amenities,
        });
        if (isActive !== space.isActive) {
          updated = await updateSpaceStatus(token, space.id, isActive);
        }
        onSaved(updated);
        closeModal();
      } catch (err) {
        setError(err instanceof SpaceError ? err.message : 'No se pudieron guardar los cambios.');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <dialog ref={ref} id="edit_space_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 bg-base-100 shadow-2xl max-w-lg max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
            <h3 className="font-extrabold text-lg text-base-content">Editar espacio</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost" aria-label="Cerrar modal">✕</button>
            </form>
          </div>

          {space && (
            <>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-136px)]">
                <label className="form-control">
                  <span className="label-text font-semibold mb-1.5">Título</span>
                  <input className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="form-control">
                    <span className="label-text font-semibold mb-1.5">Precio (ARS/mes)</span>
                    <input type="number" min={0} className="input input-bordered w-full" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </label>
                  <label className="form-control">
                    <span className="label-text font-semibold mb-1.5">Barrio</span>
                    <input className="input input-bordered w-full" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                  </label>
                </div>

                <label className="form-control">
                  <span className="label-text font-semibold mb-1.5">Descripción</span>
                  <textarea className="textarea textarea-bordered w-full min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>

                <div>
                  <span className="label-text font-semibold mb-1.5 block">Fotos</span>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))] gap-2">
                    {photoUrls.map((url, i) => (
                      <div key={url} className="relative aspect-square w-full rounded-lg overflow-hidden border border-base-200 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute bottom-0.5 left-0.5 bg-brand-navy text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Portada
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-end justify-center gap-1 pb-1 opacity-0 group-hover:opacity-100 transition">
                          <button type="button" className="btn btn-circle btn-xs" onClick={() => movePhoto(i, i - 1)} aria-label="Mover antes">
                            <ChevronLeft className="size-3" />
                          </button>
                          <button type="button" className="btn btn-circle btn-xs" onClick={() => movePhoto(i, i + 1)} aria-label="Mover después">
                            <ChevronRight className="size-3" />
                          </button>
                          <button type="button" className="btn btn-circle btn-xs btn-error text-white" onClick={() => removePhoto(i)} aria-label="Eliminar foto">
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-square w-full rounded-lg border-2 border-dashed border-base-300 flex flex-col items-center justify-center gap-1 text-base-content/50 cursor-pointer hover:border-primary hover:text-primary text-[10px] font-semibold">
                      <Plus className="size-4" />
                      Agregar
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(e.target.files)} />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm font-semibold text-base-content">Publicación activa</span>
                  <input type="checkbox" className="toggle toggle-success" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                </div>

                {error && <p className="text-sm text-error">{error}</p>}
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-base-200 bg-base-200/40">
                <button type="button" className="btn btn-outline btn-sm" onClick={closeModal} disabled={isSaving}>Cancelar</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>

        <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-sm">
          <button>cerrar</button>
        </form>
      </dialog>
    );
  }
);

EditSpaceModal.displayName = 'EditSpaceModal';
