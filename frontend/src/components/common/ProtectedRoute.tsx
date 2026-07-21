// src/components/common/ProtectedRoute.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

// Gate genérico de rutas autenticadas. Espera a que AuthContext termine de
// rehidratar la sesión desde localStorage (isLoading) antes de decidir —
// si no, un refresh redirigiría en falso mientras todavía no sabemos si hay sesión.
export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/explorar" replace />;
  }

  return <>{children}</>;
};