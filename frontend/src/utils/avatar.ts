// src/utils/avatar.ts
import { API_URL } from '../config';

// User.avatar (cuando existe) es una ruta relativa devuelta por el backend
// (ver AccountService.ToUrl: "/uploads/avatars/{userId}/...") — nunca una URL
// absoluta, así que siempre hay que anteponerle VITE_API_URL. Si no hay
// avatar, se genera uno a partir del nombre (mismo fallback que ya se usaba
// en Header/DashboardPage).
export const resolveAvatarUrl = (avatar: string | undefined, name: string): string =>
  avatar
    ? `${API_URL}${avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

export const resolveUploadedFileUrl = (path: string): string => `${API_URL}${path}`;