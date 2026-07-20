import type { Generation } from "./filters";

export type UserRole = 'host' | 'student';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  generation?: Generation;
}

export interface AuthContextValue {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}
