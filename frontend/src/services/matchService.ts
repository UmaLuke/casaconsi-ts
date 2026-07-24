// src/services/matchService.ts
// Espejo del patrón de questionnaireService.ts: request autenticado con el
// header Authorization. Por ahora solo conecta el listado de matches
// confirmados (GET /api/match) — el feed de descubrimiento (GET /api/match/feed,
// POST /api/match/like) todavía no tiene pantalla en el frontend.
import { API_URL } from '../config';
import type { MatchSummary } from '../types/match';

export class MatchError extends Error {}

// Espejo de MatchSummaryDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
interface MatchSummaryDto {
  id: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  createdAt: string;
}

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleMatchResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? 'No se pudieron cargar tus matches. Probá de nuevo.';
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

export const getMatches = async (token: string): Promise<MatchSummary[]> => {
  const response = await fetch(`${API_URL}/api/match`, {
    headers: authHeaders(token),
  });
  const dtos = await handleMatchResponse<MatchSummaryDto[]>(response);
  return dtos.map(toMatchSummary);
};
