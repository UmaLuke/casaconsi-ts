// src/types/match.ts
// Espejo de MatchSummaryDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
export interface MatchSummary {
  id: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  createdAt: string;
}

// Espejo de LikeResponseDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
export interface LikeResponse {
  isMatch: boolean;
  matchId: string | null;
}

// Espejo de MatchFeedItemDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs.
// Un item del feed de descubrimiento (GET /api/match/feed): si el usuario
// autenticado es Student, son perfiles de Host, y viceversa — lo resuelve
// el backend según el rol del token, el frontend no lo necesita saber.
export interface MatchFeedItem {
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  presentationMediaUrl: string | null;
  aboutMe: string;
  neighborhoods: string[];
}
