// src/types/match.ts
// Espejo de MatchSummaryDto en CasaConSi.Api/DTOs/Match/MatchDtos.cs
export interface MatchSummary {
  id: string;
  counterpartUserId: string;
  counterpartName: string;
  counterpartPhotoUrl: string | null;
  createdAt: string;
}
