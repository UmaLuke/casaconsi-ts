import type { Generation } from "./filters";

export type UserRole = 'host' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  generation?: Generation;
  isAdmin: boolean; // nuevo
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean; // true mientras se rehidrata la sesión desde localStorage al montar la app
  login: (userData: User, token: string) => void;
  logout: () => void;
}