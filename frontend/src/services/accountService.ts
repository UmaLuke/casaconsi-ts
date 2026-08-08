// src/services/accountService.ts
// Espejo del patrón de questionnaireService.ts: endpoints protegidos, todo
// request lleva el header Authorization con el JWT. Cubre la CUENTA (nombre,
// email, password, avatar) — distinto del perfil de match (host/student),
// que sigue viviendo en questionnaireService.ts.
import { API_URL } from '../config';
import type { User } from '../types/auth';

export class AccountError extends Error {}

// Espejo de AccountResponseDto en CasaConSi.Api/DTOs/Account/AccountDtos.cs
interface AccountResponseDto {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  avatar: string | null;
  title: string | null;
  profession: string | null;
  generation: User['generation'] | null;
  isAdmin: boolean;
}

const toUser = (dto: AccountResponseDto): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  role: dto.role,
  avatar: dto.avatar ?? undefined,
  title: dto.title ?? undefined,
  profession: dto.profession ?? undefined,
  generation: dto.generation ?? undefined,
  isAdmin: dto.isAdmin,
});

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleAccountResponse = async (response: Response): Promise<User> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? 'Ocurrió un error inesperado. Probá de nuevo.';
    throw new AccountError(message);
  }
  const dto: AccountResponseDto = await response.json();
  return toUser(dto);
};

export const getMe = async (token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/account/me`, {
    headers: authHeaders(token),
  });
  return handleAccountResponse(response);
};

export const updateName = async (name: string, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/account/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name }),
  });
  return handleAccountResponse(response);
};

export const uploadAvatar = async (avatar: File, token: string): Promise<User> => {
  const formData = new FormData();
  formData.append('avatar', avatar);

  const response = await fetch(`${API_URL}/api/account/avatar`, {
    method: 'POST',
    // Sin 'Content-Type': el browser arma el boundary de multipart solo.
    headers: authHeaders(token),
    body: formData,
  });
  return handleAccountResponse(response);
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  token: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/account/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? 'Ocurrió un error inesperado. Probá de nuevo.';
    throw new AccountError(message);
  }
};

export const changeEmail = async (
  newEmail: string,
  currentPassword: string,
  token: string,
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/account/email`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ newEmail, currentPassword }),
  });
  return handleAccountResponse(response);
};
