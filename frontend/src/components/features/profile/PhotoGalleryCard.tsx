// src/components/features/profile/PhotoGalleryCard.tsx
// Galería de fotos de la cuenta (distinta de Space.PhotoPaths) — vive en
// "Mi perfil" > "Datos de cuenta", debajo de la card de nombre/avatar.
// Mismo patrón que AccountTab.handleAvatarChange: sube/borra al toque, sin
// botón de "guardar" aparte.
import { useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { resolveUploadedFileUrl } from '../../../utils/avatar';
import { uploadGalleryPhoto, removeGalleryPhoto, AccountError } from '../../../services/accountService';
import type { User } from '../../../types/auth';

const MAX_PHOTOS = 10;

interface PhotoGalleryCardProps {
  user: User;
  token: string;
  onUpdated: (u: User) => void;
}

export const PhotoGalleryCard = ({ user, token, onUpdated }: PhotoGalleryCardProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [removingUrl, setRemovingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const gallery = user.gallery ?? [];

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      onUpdated(await uploadGalleryPhoto(file, token));
    } catch (err) {
      setError(err instanceof AccountError ? err.message : 'No se pudo subir la foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (photoUrl: string) => {
    setError(null);
    setRemovingUrl(photoUrl);
    try {
      onUpdated(await removeGalleryPhoto(photoUrl, token));
    } catch (err) {
      setError(err instanceof AccountError ? err.message : 'No se pudo eliminar la foto.');
    } finally {
      setRemovingUrl(null);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body gap-4">
        <div>
          <h2 className="card-title text-base">Mi galería de fotos</h2>
          <p className="text-sm text-base-content/60">
            Mostrá tu espacio o tu onda con hasta {MAX_PHOTOS} fotos.
          </p>
        </div>

        {error && <p className="text-sm font-medium text-error">{error}</p>}

        <div className="grid grid-cols-3 gap-3">
          {gallery.map((photoUrl) => (
            <div key={photoUrl} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={resolveUploadedFileUrl(photoUrl)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Eliminar foto"
                onClick={() => handleRemove(photoUrl)}
                disabled={removingUrl === photoUrl}
                className="absolute top-1.5 right-1.5 btn btn-circle btn-xs btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {removingUrl === photoUrl ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
              </button>
            </div>
          ))}

          {gallery.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-lg border-2 border-dashed border-base-300 flex flex-col items-center justify-center gap-1 text-base-content/50 hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              {isUploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              <span className="text-xs">Agregar</span>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};