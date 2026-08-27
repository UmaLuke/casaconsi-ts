import type { AdminVerificationDetail, AdminVerificationQueueItem } from "../types/admin";
import { apiFetch } from "./httpClient";

export async function getVerificationQueue(token: string): Promise<AdminVerificationQueueItem[]> {
  const response = await apiFetch(`/api/admin/verificaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudo obtener la cola de verificaciones.");
  return response.json();
}

export async function getVerificationDetail(token: string, userId: string): Promise<AdminVerificationDetail> {
  const response = await apiFetch(`/api/admin/verificaciones/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudo obtener el detalle de la verificación.");
  return response.json();
}

export async function approveVerification(token: string, userId: string): Promise<AdminVerificationDetail> {
  const response = await apiFetch(`/api/admin/verificaciones/${userId}/aprobar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudo aprobar la verificación.");
  return response.json();
}

export async function rejectVerification(token: string, userId: string, reason: string): Promise<AdminVerificationDetail> {
  const response = await apiFetch(`/api/admin/verificaciones/${userId}/rechazar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error("No se pudo rechazar la verificación.");
  return response.json();
}