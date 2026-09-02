// src/services/advisoryService.ts
import type { AvailabilitySlot, AdvisorySession, AdvisorySessionType, AdvisorySessionStatus } from '../types/advisor';
import { apiFetch } from './httpClient';

export class AdvisoryError extends Error {}

interface AvailabilitySlotDto {
  time: string;
  available: boolean;
}

interface AdvisorySessionDto {
  id: string;
  sessionType: AdvisorySessionType;
  scheduledAt: string;
  status: AdvisorySessionStatus;
  price: number;
}

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleAdvisoryResponse = async <T>(
  response: Response,
  fallbackMessage = 'No se pudo completar la operación. Probá de nuevo.',
): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? fallbackMessage;
    if (!body?.message) {
      console.error(`[advisoryService] ${response.status} ${response.url} sin mensaje de error legible.`, body);
    }
    throw new AdvisoryError(message);
  }
  return response.json();
};

const toSession = (dto: AdvisorySessionDto): AdvisorySession => ({
  id: dto.id,
  sessionType: dto.sessionType,
  scheduledAt: dto.scheduledAt,
  status: dto.status,
  price: dto.price,
});

// date en formato "YYYY-MM-DD". Reservas centralizadas: no hay advisorId —
// la disponibilidad es la del equipo (ver AdvisoryController.cs).
export const getAvailability = async (date: string): Promise<AvailabilitySlot[]> => {
  const response = await apiFetch(`/api/advisory/availability?date=${date}`);
  return handleAdvisoryResponse<AvailabilitySlotDto[]>(response, 'No se pudo cargar la disponibilidad. Probá de nuevo.');
};

export const createAdvisorySession = async (
  token: string,
  params: { sessionType: AdvisorySessionType; date: string; time: string },
): Promise<AdvisorySession> => {
  const response = await apiFetch('/api/advisory/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      sessionType: params.sessionType,
      date: params.date,
      time: params.time,
    }),
  });
  const dto = await handleAdvisoryResponse<AdvisorySessionDto>(response, 'No se pudo reservar la sesión. Probá de nuevo.');
  return toSession(dto);
};

export const getMySessions = async (token: string): Promise<AdvisorySession[]> => {
  const response = await apiFetch('/api/advisory/sessions/mine', { headers: authHeaders(token) });
  const dtos = await handleAdvisoryResponse<AdvisorySessionDto[]>(response, 'No se pudieron cargar tus sesiones. Probá de nuevo.');
  return dtos.map(toSession);
};
