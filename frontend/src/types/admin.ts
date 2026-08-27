export type AdminVerificationStatus = 'no_solicitado' | 'pendiente' | 'aprobado' | 'rechazado';

export interface AdminVerificationQueueItem {
  userId: string;
  name: string;
  role: 'host' | 'student' | 'advisor';
  basicScore: number;
  requestedAtUtc: string | null;
}

export interface AdminVerificationItem {
  key: string;
  label: string;
  completed: boolean;
}

export interface AdminVerificationDetail {
  userId: string;
  name: string;
  role: 'host' | 'student' | 'advisor';
  membershipTier: 'freemium' | 'premium';
  basicScore: number;
  status: AdminVerificationStatus;
  requestedAtUtc: string | null;
  reviewedAtUtc: string | null;
  rejectionReason: string | null;
  basicItems: AdminVerificationItem[];
  altaConfianzaItems: AdminVerificationItem[];
}