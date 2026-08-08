// src/types/space.ts
import type { Generation, Purpose, Duration } from './filters';

export interface Space {
  id: string;
  hostUserId: string;
  hostName: string;
  title: string;
  location: string;
  /** Nombre corto y canónico del barrio/zona, usado para filtrar (distinto de `location`, que es descriptivo). */
  neighborhood: string;
  price: number;
  currency: 'ARS'|'USD';
  hostType: string;
  hostGeneration: Generation;
  purpose: Purpose;
  duration: Duration;
  amenities: string[];
  imageUrl: string;
  /** Para el carrusel del modal de detalle — ver SpaceResponseDto.PhotoUrls. Siempre tiene al menos 1 elemento (mismo placeholder que imageUrl si no hay fotos reales). */
  photoUrls: string[];
  verified: boolean;
}
