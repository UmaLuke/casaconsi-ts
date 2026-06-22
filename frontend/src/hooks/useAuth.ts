// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import type { AuthContextValue } from '../types/auth';

// Hook personalizado para consumir AuthContext fácilmente.
// Vive en su propio archivo (en vez de junto al Provider) porque Fast Refresh
// de React solo funciona de forma confiable cuando un archivo exporta únicamente componentes.
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
};
