import { API_URL } from "../config";
import type { TrustStatus } from "../types/trust";

export async function getTrustStatus(token: string): Promise<TrustStatus> {
  const response = await fetch(`${API_URL}/api/trust/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudo obtener el estado de verificación.");
  return response.json();
}