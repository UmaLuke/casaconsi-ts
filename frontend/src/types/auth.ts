// src/types/auth.ts

export type UserRole = 'host' | 'student' | 'Fundadora';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthContextValue {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}
