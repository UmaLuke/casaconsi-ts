// src/services/httpClient.ts
// Wrapper único sobre fetch para requests a la API. Objetivo puntual: cuando
// el backend devuelve 401 (token inválido/revocado ANTES de su vencimiento
// natural — ban, cambio de rol, etc.; el caso de vencimiento normal ya lo
// cubre expiresAt en AuthContext), disparar un logout automático.
//
// Los services (authService, spaceService, etc.) son funciones planas fuera
// del árbol de React: no tienen acceso a AuthContext ni a useNavigate. Para
// no acoplarlos al Context, se usa un CustomEvent en window — AuthContext.tsx
// se suscribe y llama a logout() cuando lo recibe.
import { API_URL } from '../config';

export const UNAUTHORIZED_EVENT = 'casaconsi:unauthorized';

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const response = await fetch(`${API_URL}${path}`, init);

  // Solo dispara logout si el request iba autenticado (llevaba
  // Authorization). Un 401 en /api/auth/login o /register es simplemente
  // "credenciales incorrectas" — no hay sesión que invalidar.
  const hadAuthHeader = new Headers(init.headers).has('Authorization');
  if (response.status === 401 && hadAuthHeader) {
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
  }

  return response;
};
