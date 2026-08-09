import type { Generation } from "./filters";

export type UserRole = 'host' | 'student' | 'advisor'; // nuevo

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  profession?: string; 
  generation?: Generation;
  isAdmin: boolean; 
  gallery: string[];
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean; // true mientras se rehidrata la sesión desde localStorage al montar la app
  login: (userData: User, token: string, expiresAt: string) => void;
  logout: () => void;
  // Refresca el user en memoria + localStorage sin tocar el token ni el
  // logout automático — para cuando "Mi perfil" guarda cambios de cuenta
  // (nombre, avatar, email) y hay que reflejarlos en el Header al instante.
  updateUser: (userData: User) => void;
}