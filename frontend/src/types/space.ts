// src/types/space.ts
import type { Generation, Purpose, Duration } from './filters';

export interface Space {
  id: number;
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
  verified: boolean;
}
