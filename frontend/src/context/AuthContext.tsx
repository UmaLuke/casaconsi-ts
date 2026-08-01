// src/context/AuthContext.tsx
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { User } from '../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'casaconsi_auth';

interface StoredAuth {
  user: User;
  token: string;
  expiresAt: string;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = () => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Programa un logout automático para el momento exacto en que vence el
  // token (expiresAt viene del backend, ver AuthResponseDto.ExpiresAt).
  // Si ya venció, desloguea de una.
  const scheduleAutoLogout = (expiresAt: string) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    const msUntilExpiry = new Date(expiresAt).getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    logoutTimerRef.current = setTimeout(logout, msUntilExpiry);
  };

  // Al montar la app: intentamos rehidratar la sesión desde localStorage.
  // Si expiresAt ya pasó, deslogueamos directo (ProtectedRoute redirige a
  // "/" apenas user queda null). Si sigue vigente, programamos el logout
  // automático para cuando corresponda.
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const stored: StoredAuth = JSON.parse(raw);
        const isExpired = new Date(stored.expiresAt).getTime() <= Date.now();

        if (isExpired) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setUser(stored.user);
          setToken(stored.token);
          scheduleAutoLogout(stored.expiresAt);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData: User, newToken: string, expiresAt: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: newToken, expiresAt }));
    scheduleAutoLogout(expiresAt);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};