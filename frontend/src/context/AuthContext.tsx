// src/context/AuthContext.tsx
import { useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { User } from '../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

// Creamos el Proveedor (quien envuelve la app y reparte los datos)
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null); // null significa que no hay nadie logueado

  // Función para iniciar sesión (Simulada por ahora)
  const login = (userData: User) => {
    // Aquí luego conectaremos con el backend real
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
