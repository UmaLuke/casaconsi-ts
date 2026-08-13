import type { TrustStatus } from "../types/trust";
import { apiFetch } from "./httpClient";

export async function getTrustStatus(token: string): Promise<TrustStatus> {
  const response = await apiFetch(`/api/trust/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudo obtener el estado de verificación.");
  return response.json();
}