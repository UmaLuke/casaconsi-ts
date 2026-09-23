// src/services/spaceService.ts
import { API_URL } from '../config';
import type { Space, CreateSpacePayload, UpdateSpacePayload } from '../types/space';
import type { Generation, Purpose, Duration } from '../types/filters';
import { apiFetch } from './httpClient';

export class SpaceError extends Error {}

// Placeholder para espacios sin fotos subidas todavía (recién creados) ni
// ExternalImageUrl de seed. types/space.ts exige `imageUrl: string` sin
// nulos, así que el fallback se resuelve acá, en un solo lugar.
const PLACEHOLDER_IMAGE_URL =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60';

// Espejo de SpaceResponseDto en CasaConSi.Api/DTOs/Space/SpaceDtos.cs.
interface SpaceResponseDto {
  id: string;
  hostUserId: string;
  hostName: string;
  title: string;
  description: string;
  location: string;
  neighborhood: string;
  price: number;
  currency: 'ARS' | 'USD';
  hostType: string;
  hostGeneration: Generation;
  purpose: Purpose;
  duration: Duration;
  amenities: string[];
  imageUrl: string | null;
  photoUrls: string[];
  verified: boolean;
  isActive: boolean;
  hostAboutMe: string | null;
  hostTrustScore: number;
  hostTrustLevel: Space['hostTrustLevel'];
}

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const resolvePhotoUrl = (url: string): string => (url.startsWith('http') ? url : `${API_URL}${url}`);

const toImageUrl = (imageUrl: string | null): string =>
  imageUrl ? resolvePhotoUrl(imageUrl) : PLACEHOLDER_IMAGE_URL;

const toPhotoUrls = (photoUrls: string[]): string[] =>
  photoUrls.length > 0 ? photoUrls.map(resolvePhotoUrl) : [PLACEHOLDER_IMAGE_URL];

const toSpace = (dto: SpaceResponseDto): Space => ({
  id: dto.id,
  hostUserId: dto.hostUserId,
  hostName: dto.hostName,
  title: dto.title,
  description: dto.description,
  location: dto.location,
  neighborhood: dto.neighborhood,
  price: dto.price,
  currency: dto.currency,
  hostType: dto.hostType,
  hostGeneration: dto.hostGeneration,
  purpose: dto.purpose,
  duration: dto.duration,
  amenities: dto.amenities,
  imageUrl: toImageUrl(dto.imageUrl),
  photoUrls: toPhotoUrls(dto.photoUrls),
  verified: dto.verified,
  isActive: dto.isActive,
  hostAboutMe: dto.hostAboutMe,
  hostTrustScore: dto.hostTrustScore,
  hostTrustLevel: dto.hostTrustLevel,
});

export const getSpaces = async (): Promise<Space[]> => {
  const response = await apiFetch(`/api/space`);
  if (!response.ok) {
    throw new SpaceError('No se pudieron cargar los espacios. Probá de nuevo.');
  }
  const dtos: SpaceResponseDto[] = await response.json();
  return dtos.map(toSpace);
};

export const getSpaceById = async (id: string): Promise<Space> => {
  const response = await apiFetch(`/api/space/${id}`);
  if (!response.ok) {
    throw new SpaceError(
      response.status === 404 ? 'Este espacio ya no está disponible.' : 'No se pudo cargar este espacio. Probá de nuevo.',
    );
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};

// GET /api/space/mine — [Authorize(Roles = "Host")]
export const getMine = async (token: string): Promise<Space[]> => {
  const response = await apiFetch(`/api/space/mine`, { headers: authHeaders(token) });
  if (!response.ok) {
    throw new SpaceError('No se pudieron cargar tus publicaciones. Probá de nuevo.');
  }
  const dtos: SpaceResponseDto[] = await response.json();
  return dtos.map(toSpace);
};

// POST /api/space — [Authorize(Roles = "Host")]. El body tiene que calzar
// 1:1 con CreateSpaceRequestDto — el backend hoy no acepta nada más que esto
// (nada de dormitorios/baño/mascotas/fumador: no existen en el modelo Space).
export const createSpace = async (token: string, payload: CreateSpacePayload): Promise<Space> => {
  const response = await apiFetch(`/api/space`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new SpaceError('No se pudo publicar el espacio. Revisá los datos e intentá de nuevo.');
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};

// POST /api/space/{id}/photos — [Authorize(Roles = "Host")], valida dueño.
// El nombre del campo del FormData tiene que ser "photos" (calza con el
// parámetro `[FromForm] List<IFormFile> photos` del controller).
export const uploadPhotos = async (token: string, spaceId: string, files: File[]): Promise<Space> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const response = await apiFetch(`/api/space/${spaceId}/photos`, {
    method: 'POST',
    headers: authHeaders(token), // sin Content-Type: fetch arma el boundary del multipart solo
    body: formData,
  });
  if (!response.ok) {
    throw new SpaceError('El espacio se publicó, pero no se pudieron subir las fotos. Probá subirlas de nuevo.');
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};

// PUT /api/space/{id} — [Authorize(Roles = "Host")], valida dueño.
export const updateSpace = async (token: string, spaceId: string, payload: UpdateSpacePayload): Promise<Space> => {
  const response = await apiFetch(`/api/space/${spaceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new SpaceError('No se pudieron guardar los cambios. Probá de nuevo.');
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};

// PATCH /api/space/{id}/status — [Authorize(Roles = "Host")], valida dueño.
export const updateSpaceStatus = async (token: string, spaceId: string, isActive: boolean): Promise<Space> => {
  const response = await apiFetch(`/api/space/${spaceId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) {
    throw new SpaceError(isActive ? 'No se pudo reactivar la publicación.' : 'No se pudo pausar la publicación.');
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};

// DELETE /api/space/{id} — [Authorize(Roles = "Host")], valida dueño.
export const deleteSpace = async (token: string, spaceId: string): Promise<void> => {
  const response = await apiFetch(`/api/space/${spaceId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw new SpaceError('No se pudo eliminar la publicación. Probá de nuevo.');
  }
};

// DELETE /api/space/{id}/photos/{index} — [Authorize(Roles = "Host")], valida dueño.
export const deleteSpacePhoto = async (token: string, spaceId: string, index: number): Promise<Space> => {
  const response = await apiFetch(`/api/space/${spaceId}/photos/${index}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    throw new SpaceError('No se pudo borrar la foto. Probá de nuevo.');
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};

// PUT /api/space/{id}/photos/order — [Authorize(Roles = "Host")], valida dueño.
// `order`: índices actuales de photoUrls en el orden deseado, ej. [2, 0, 1].
export const reorderSpacePhotos = async (token: string, spaceId: string, order: number[]): Promise<Space> => {
  const response = await apiFetch(`/api/space/${spaceId}/photos/order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ order }),
  });
  if (!response.ok) {
    throw new SpaceError('No se pudo guardar el nuevo orden de fotos. Probá de nuevo.');
  }
  const dto: SpaceResponseDto = await response.json();
  return toSpace(dto);
};
