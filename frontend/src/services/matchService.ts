// src/services/matchService.ts
// Espejo del patrón de questionnaireService.ts: request autenticado con el
// header Authorization. Conecta el listado de matches confirmados
// (GET /api/match), el feed de descubrimiento (GET /api/match/feed, usado
// por DiscoverPage.tsx) y la decisión de like/pass sobre un perfil
// (POST /api/match/like) — esta última se usa tanto desde DiscoverPage
// (swipe sobre el feed) como desde ExploreSpacesPage/SpaceDetailsModal
// (like/pass sobre el anfitrión dueño de un Space).
import type { MatchSummary, LikeResponse, MatchFeedItem } from '../types/match';
import { apiFetch } from './httpClient';

export class MatchError extends Error {}

// Espejo de MatchSummaryDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
interface MatchSummaryDto {
  id: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  createdAt: string;
}

// Espejo de LikeResponseDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
interface LikeResponseDto {
  isMatch: boolean;
  matchId: string | null;
}

// Espejo de MatchFeedItemDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
interface MatchFeedItemDto {
  userId: string;
  fullName: string;
  profilePhotoUrl: string | null;
  presentationMediaUrl: string | null;
  aboutMe: string;
  neighborhoods: string[];
}

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleMatchResponse = async <T>(
  response: Response,
  fallbackMessage = 'No se pudo completar la operación. Probá de nuevo.',
): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? fallbackMessage;
    // El body?.message cubre los errores de negocio (400 con { message }) que
    // devuelve MatchController. Si esto se dispara, casi siempre es otra cosa
    // (401 por token vencido/inválido, 500 sin body JSON, etc.) — se loguea
    // acá para poder diagnosticarlo en la consola del navegador sin exponer
    // detalles técnicos en el toast del usuario.
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

export const getMatches = async (token: string): Promise<MatchSummary[]> => {
  const response = await apiFetch(`/api/match`, {
    headers: authHeaders(token),
  });
  const dtos = await handleMatchResponse<MatchSummaryDto[]>(
    response,
    'No se pudieron cargar tus matches. Probá de nuevo.',
  );
  return dtos.map(toMatchSummary);
};

// Feed de descubrimiento: perfiles del rol opuesto que el usuario todavía no
// swipeó, ya filtrados por generación opuesta (ver MatchService.GetFeedAsync
// en el backend). Si el usuario autenticado no completó el cuestionario
// (Generation == null), el backend responde 400 con un mensaje claro.
export const getFeed = async (token: string): Promise<MatchFeedItem[]> => {
  const response = await apiFetch(`/api/match/feed`, {
    headers: authHeaders(token),
  });
  const dtos = await handleMatchResponse<MatchFeedItemDto[]>(
    response,
    'No se pudieron cargar los perfiles. Probá de nuevo.',
  );
  return dtos.map(toFeedItem);
};

// Registra la decisión (like/pass) del usuario autenticado sobre un perfil
// (el de `DiscoverPage` en el feed, o el del anfitrión dueño de un Space en
// ExploreSpacesPage/SpaceDetailsModal). El rol (Student/Host) se resuelve en
// el backend a partir del JWT, no hace falta mandarlo.
export const registerLikeDecision = async (
  token: string,
  targetUserId: string,
  liked: boolean,
): Promise<LikeResponse> => {
  const response = await apiFetch(`/api/match/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ targetUserId, liked }),
  });
  const dto = await handleMatchResponse<LikeResponseDto>(
    response,
    'No se pudo registrar tu decisión. Probá de nuevo.',
  );
  return { isMatch: dto.isMatch, matchId: dto.matchId };
};
