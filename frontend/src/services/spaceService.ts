// src/services/spaceService.ts
import { API_URL } from '../config';
import type { Space } from '../types/space';
import type { Generation, Purpose, Duration } from '../types/filters';

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
  title: string;
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
  verified: boolean;
}

const toImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return PLACEHOLDER_IMAGE_URL;
  // ExternalImageUrl (seed/demo) ya es absoluta; una foto real subida viene
  // como ruta relativa del backend (/uploads/...).
  return imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`;
};

const toSpace = (dto: SpaceResponseDto): Space => ({
  id: dto.id,
  title: dto.title,
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
  verified: dto.verified,
});

export const getSpaces = async (): Promise<Space[]> => {
  const response = await fetch(`${API_URL}/api/space`);
  if (!response.ok) {
    throw new SpaceError('No se pudieron cargar los espacios. Probá de nuevo.');
  }
  const dtos: SpaceResponseDto[] = await response.json();
  return dtos.map(toSpace);
};