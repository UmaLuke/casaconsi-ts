// src/types/auth.ts

export type UserRole = 'host' | 'student';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  /** Título de display opcional (ej. "Fundadora") para cuentas especiales.
   *  No es un rol de negocio: no debe usarse para lógica de permisos. */
  title?: string;
}

export interface AuthContextValue {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}
