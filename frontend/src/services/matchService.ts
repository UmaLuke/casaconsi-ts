// src/services/matchService.ts
import type { MatchSummary, LikeResponse, MatchFeedItem, InterestedStudent, StudentDetail } from '../types/match';
import { apiFetch } from './httpClient';

export class MatchError extends Error {}

interface MatchSummaryDto {
  id: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  createdAt: string;
}

interface LikeResponseDto {
  isMatch: boolean;
  matchId: string | null;
}

interface MatchFeedItemDto {
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  presentationMediaUrl: string | null;
  aboutMe: string;
  neighborhoods: string[];
}

interface InterestedStudentDto {
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  studyOrWorkSummary: string;
  trustScore: number;
  trustLevel: InterestedStudent['trustLevel'];
}

interface StudentDetailDto {
  userId: string;
  fullName: string;
  photoUrls: string[];
  aboutMe: string;
  motivation: string;
  preferredNeighborhoods: string[];
  studyOrWorkSummary: string;
  stayDuration: string;
  generation: StudentDetail['generation'];
  trustScore: number;
  trustLevel: StudentDetail['trustLevel'];
}

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleMatchResponse = async <T>(
  response: Response,
  fallbackMessage = 'No se pudo completar la operación. Probá de nuevo.',
): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? fallbackMessage;
    if (!body?.message) {
      console.error(`[matchService] ${response.status} ${response.url} sin mensaje de error legible.`, body);
    }
    throw new MatchError(message);
  }
  return response.json();
};

const toMatchSummary = (dto: MatchSummaryDto): MatchSummary => ({
  id: dto.id,
  counterpartUserId: dto.counterpartUserId,
  counterpartName: dto.counterpartName,
  counterpartPhotoUrl: dto.counterpartPhotoUrl,
  createdAt: dto.createdAt,
});

const toFeedItem = (dto: MatchFeedItemDto): MatchFeedItem => ({
  userId: dto.userId,
  fullName: dto.fullName,
  profilePhotoUrl: dto.profilePhotoUrl,
  presentationMediaUrl: dto.presentationMediaUrl,
  aboutMe: dto.aboutMe,
  neighborhoods: dto.neighborhoods,
});

const toInterestedStudent = (dto: InterestedStudentDto): InterestedStudent => ({
  userId: dto.userId,
  fullName: dto.fullName,
  profilePhotoUrl: dto.profilePhotoUrl,
  studyOrWorkSummary: dto.studyOrWorkSummary,
  trustScore: dto.trustScore,
  trustLevel: dto.trustLevel,
});

const toStudentDetail = (dto: StudentDetailDto): StudentDetail => ({
  userId: dto.userId,
  fullName: dto.fullName,
  photoUrls: dto.photoUrls,
  aboutMe: dto.aboutMe,
  motivation: dto.motivation,
  preferredNeighborhoods: dto.preferredNeighborhoods,
  studyOrWorkSummary: dto.studyOrWorkSummary,
  stayDuration: dto.stayDuration,
  generation: dto.generation,
  trustScore: dto.trustScore,
  trustLevel: dto.trustLevel,
});

export const getMatches = async (token: string): Promise<MatchSummary[]> => {
  const response = await apiFetch(`/api/match`, { headers: authHeaders(token) });
  const dtos = await handleMatchResponse<MatchSummaryDto[]>(response, 'No se pudieron cargar tus matches. Probá de nuevo.');
  return dtos.map(toMatchSummary);
};

export const getFeed = async (token: string): Promise<MatchFeedItem[]> => {
  const response = await apiFetch(`/api/match/feed`, { headers: authHeaders(token) });
  const dtos = await handleMatchResponse<MatchFeedItemDto[]>(response, 'No se pudieron cargar los perfiles. Probá de nuevo.');
  return dtos.map(toFeedItem);
};

export const registerLikeDecision = async (token: string, targetUserId: string, liked: boolean): Promise<LikeResponse> => {
  const response = await apiFetch(`/api/match/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ targetUserId, liked }),
  });
  const dto = await handleMatchResponse<LikeResponseDto>(response, 'No se pudo registrar tu decisión. Probá de nuevo.');
  return { isMatch: dto.isMatch, matchId: dto.matchId };
};

export const getInterestedStudents = async (token: string): Promise<InterestedStudent[]> => {
  const response = await apiFetch(`/api/match/interested`, { headers: authHeaders(token) });
  const dtos = await handleMatchResponse<InterestedStudentDto[]>(response, 'No se pudieron cargar los estudiantes interesados. Probá de nuevo.');
  return dtos.map(toInterestedStudent);
};

export const getInterestedStudentDetail = async (token: string, studentUserId: string): Promise<StudentDetail> => {
  const response = await apiFetch(`/api/match/interested/${studentUserId}`, { headers: authHeaders(token) });
  const dto = await handleMatchResponse<StudentDetailDto>(response, 'No se pudo cargar este perfil. Probá de nuevo.');
  return toStudentDetail(dto);
};