// src/types/space.ts
import type { Generation, Purpose, Duration } from './filters';
import type { VerificationLevel } from './trust';

export interface Space {
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
  imageUrl: string;
  photoUrls: string[];
  verified: boolean;
  isActive: boolean;
  hostAboutMe: string | null;
  hostTrustScore: number;
  hostTrustLevel: VerificationLevel;
}

// Espejo exacto de CreateSpaceRequestDto (CasaConSi.Api/DTOs/Space/SpaceDtos.cs).
export interface CreateSpacePayload {
  title: string;
  description: string;
  location: string;
  neighborhood: string;
  hostType: string;
  price: number;
  purpose: Purpose;
  duration: Duration;
  amenities: string[];
}

// Espejo exacto de UpdateSpaceRequestDto — mismos campos que CreateSpacePayload.
export type UpdateSpacePayload = CreateSpacePayload;
