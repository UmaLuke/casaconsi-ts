export type MembershipTier = 'freemium' | 'premium';
export type VerificationLevel = 'sin_verificar' | 'basico' | 'alta_confianza';

export interface TrustItem {
  key: string;
  label: string;
  completed: boolean;
  requiresPremium: boolean;
  locked: boolean;
}

export interface TrustStatus {
  score: number;
  maxScore: number;
  level: VerificationLevel;
  membershipTier: MembershipTier;
  isDemoUser: boolean;
  items: TrustItem[];
}