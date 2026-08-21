// src/types/match.ts
import type { Generation } from './filters';
import type { VerificationLevel } from './trust';

export interface MatchSummary {
  id: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  createdAt: string;
}

export interface LikeResponse {
  isMatch: boolean;
  matchId: string | null;
}

export interface MatchFeedItem {
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  presentationMediaUrl: string | null;
  aboutMe: string;
  neighborhoods: string[];
}

// Espejo de InterestedStudentDto — card de InterestedStudentsPage.tsx
export interface InterestedStudent {
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  studyOrWorkSummary: string;
  trustScore: number;
  trustLevel: VerificationLevel;
}

// Espejo de StudentDetailDto — StudentDetailPage.tsx
export interface StudentDetail {
  userId: string;
  fullName: string;
  photoUrls: string[];
  aboutMe: string;
  motivation: string;
  preferredNeighborhoods: string[];
  studyOrWorkSummary: string;
  stayDuration: string;
  generation: Generation;
  trustScore: number;
  trustLevel: VerificationLevel;
}