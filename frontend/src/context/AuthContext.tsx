// src/context/AuthContext.tsx
import { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { User } from '../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'casaconsi_auth';

interface StoredAuth {
  user: User;
  token: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar la app: intentamos rehidratar la sesión desde localStorage.
  // No validamos el token contra el backend acá (no tenemos un endpoint /me todavía);
  // si el token venció, la próxima llamada autenticada va a fallar con 401 y ahí
  // deberíamos disparar logout() — eso queda pendiente para cuando conectemos
  // el primer endpoint protegido.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const stored: StoredAuth = JSON.parse(raw);
        setUser(stored.user);
        setToken(stored.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: newToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};