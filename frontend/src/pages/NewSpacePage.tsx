// src/pages/NewSpacePage.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { createSpace, uploadPhotos, SpaceError } from '../services/spaceService';
import type { Purpose, Duration } from '../types/filters';
import { PURPOSE_LABELS, DURATION_LABELS } from '../types/filters';

// Sugerencias rápidas — Amenities es texto libre en el backend (List<string>,
// ver DemoSpaceSeeder.cs), no una checklist fija. Estas son solo atajos.
const SUGGESTED_AMENITIES = [
  'Wifi', 'Escritorio', 'Cocina compartida', 'Jardín', 'Desayuno incluido',
  'Entrada independiente', 'Servicios incluidos',
];

export const NewSpacePage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [hostType, setHostType] = useState('');
  const [price, setPrice] = useState('');
  const [purpose, setPurpose] = useState<Purpose>('estudiar');
  const [duration, setDuration] = useState<Duration>('anual');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityDraft, setAmenityDraft] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAmenity = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed]);
    }
    setAmenityDraft('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await createSpace(token, {
        title, description, location, neighborhood, hostType,
        price: Number(price), purpose, duration, amenities,
      });
      if (photos.length > 0) {
        await uploadPhotos(token, created.id, photos);
      }
      navigate('/mis-espacios');
    } catch (err) {
      setError(err instanceof SpaceError ? err.message : 'No se pudo publicar el espacio. Probá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="mb-8 space-y-2">
            <h1 className="text-3xl font-extrabold text-base-content tracking-tight">Publicar un espacio</h1>
            <p className="text-base-content/70 font-medium">Va a aparecer en el explorador apenas lo publiques.</p>
          </div>

          <form onSubmit={handleSubmit} className="border border-base-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <label className="form-control">
                <span className="label-text font-semibold mb-1.5">Título</span>
                <input className="input input-bordered w-full" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Habitación luminosa con baño privado" />
              </label>
              <label className="form-control">
                <span className="label-text font-semibold mb-1.5">Descripción</span>
                <textarea className="textarea textarea-bordered w-full min-h-24" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Contales a los estudiantes cómo es tu hogar y qué hace especial esta convivencia..." />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="form-control">
                  <span className="label-text font-semibold mb-1.5">Ubicación (descriptiva)</span>
                  <input className="input input-bordered w-full" required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej. a 15 min de la Universidad" />
                </label>
                <label className="form-control">
                  <span className="label-text font-semibold mb-1.5">Barrio</span>
                  <input className="input input-bordered w-full" required value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ej. Nueva Córdoba" />
                </label>
              </div>
              <label className="form-control">
                <span className="label-text font-semibold mb-1.5">Vos sos...</span>
                <input className="input input-bordered w-full" required value={hostType} onChange={(e) => setHostType(e.target.value)} placeholder="Ej. Propietaria, Familia Anfitriona" />
              </label>
            </div>

            <div className="space-y-4 pt-6 border-t border-base-200">
              <label className="form-control max-w-48">
                <span className="label-text font-semibold mb-1.5">Precio mensual (ARS)</span>
                <input type="number" min={0} className="input input-bordered w-full" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="90000" />
              </label>

              <div>
                <span className="label-text font-semibold mb-1.5 block">Propósito</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(PURPOSE_LABELS) as Purpose[]).map((p) => (
                    <button key={p} type="button" onClick={() => setPurpose(p)}
                      className={`btn btn-sm rounded-full ${purpose === p ? 'btn-primary' : 'btn-outline'}`}>
                      {PURPOSE_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="label-text font-semibold mb-1.5 block">Duración</span>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(DURATION_LABELS) as Duration[]).map((d) => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={`btn btn-sm rounded-full ${duration === d ? 'btn-primary' : 'btn-outline'}`}>
                      {DURATION_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="label-text font-semibold mb-1.5 block">Comodidades</span>
                <div className="flex flex-wrap gap-2 mb-2">
                  {amenities.map((a) => (
                    <span key={a} className="badge badge-ghost gap-1.5 text-base-content/70">
                      {a}
                      <button type="button" onClick={() => setAmenities((prev) => prev.filter((x) => x !== a))} aria-label={`Quitar ${a}`}>
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input input-bordered input-sm flex-1"
                    placeholder="Ej. Wifi, Jardín, Desayuno incluido"
                    value={amenityDraft}
                    onChange={(e) => setAmenityDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(amenityDraft); } }}
                  />
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addAmenity(amenityDraft)}>Agregar</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUGGESTED_AMENITIES.filter((s) => !amenities.includes(s)).map((s) => (
                    <button key={s} type="button" onClick={() => addAmenity(s)} className="badge badge-outline text-xs text-base-content/60">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-base-200">
              <span className="label-text font-semibold mb-1.5 block">Fotos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="file-input file-input-bordered w-full"
                onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              />
              <p className="text-xs text-base-content/50">Se suben después de crear la publicación (POST /api/space/{'{id}'}/photos).</p>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar espacio'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};