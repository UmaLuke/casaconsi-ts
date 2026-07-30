// src/services/authService.ts
import { API_URL } from '../config';
import type { RegisterFormData } from '../components/features/auth/RegisterForm';
import type { LoginFormData } from '../components/features/auth/LoginForm';
import type { User } from '../types/auth';

export interface AuthResult {
  user: User;
  token: string;
  expiresAt: string;
}

// Espejo de AuthResponseDto en CasaConSi.Api/DTOs/Auth/AuthResponseDto.cs
interface AuthResponseDto {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  avatar: string | null;
  title: string | null;
  profession: string | null;
  generation: User['generation'] | null;
  isAdmin: boolean; // nuevo
  token: string;
  expiresAt: string;
}

export class AuthError extends Error {}

const toAuthResult = (dto: AuthResponseDto): AuthResult => ({
  user: {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    avatar: dto.avatar ?? undefined,
    title: dto.title ?? undefined,
    profession: dto.profession ?? undefined,
    generation: dto.generation ?? undefined,
    isAdmin: dto.isAdmin, // nuevo
  },
  token: dto.token,
  expiresAt: dto.expiresAt,
});

const handleAuthResponse = async (response: Response): Promise<AuthResult> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? 'Ocurrió un error inesperado. Probá de nuevo.';
    throw new AuthError(message);
  }
  const dto: AuthResponseDto = await response.json();
  return toAuthResult(dto);
};

export const registerRequest = async (data: RegisterFormData): Promise<AuthResult> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleAuthResponse(response);
};

export const loginRequest = async (data: LoginFormData): Promise<AuthResult> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleAuthResponse(response);
};