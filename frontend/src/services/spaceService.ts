// src/services/spaceService.ts
import { API_URL } from '../config';
import type { Space } from '../types/space';
import type { Generation, Purpose, Duration } from '../types/filters';
import { apiFetch } from './httpClient';

export class SpaceError extends Error {}

// Placeholder para espacios sin fotos subidas todavía (recién creados) ni
// ExternalImageUrl de seed. types/space.ts exige `imageUrl: string` sin
// nulos, así que el fallback se resuelve acá, en un solo lugar.
const PLACEHOLDER_IMAGE_URL =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60';

// Espejo de SpaceResponseDto en CasaConSi.Api/DTOs/Space/SpaceDtos.cs.
// `imageUrl` es honesto acá (puede ser null: un Space recién creado sin
// fotos no tiene ninguna) — el null se resuelve en toSpace(), no en el DTO.
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
  hostAboutMe: string | null;
  hostTrustScore: number;
  hostTrustLevel: Space['hostTrustLevel']; // VerificationLevel
}

// ExternalImageUrl (seed/demo) ya es absoluta; una foto real subida (Space o
// HostProfile, ambas vía FileStorageService) viene como ruta relativa del
// backend (/uploads/...).
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