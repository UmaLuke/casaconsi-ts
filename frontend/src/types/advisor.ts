// src/types/advisor.ts
export interface Advisor {
  id: number;
  name: string;
  specialty: string;
  bio: string;
  pricePerSession: number;
  currency: 'ARS';
  avatarUrl: string;
}