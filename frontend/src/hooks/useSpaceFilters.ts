// src/hooks/useSpaceFilters.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { SpaceFilters, Generation } from '../types/filters';

export const useSpaceFilters = (initialFilters: SpaceFilters = {}) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SpaceFilters>(initialFilters);

  useEffect(() => {
    // Aplicar lógica automática de "Solidaridad Intergeneracional"
    // Si hay un usuario, es estudiante y sabemos su generación:
    if (user && user.role === 'student' && user.generation) {
      // Determinamos la generación opuesta
      const targetGeneration: Generation = 
        user.generation === 'joven-adulto' ? 'adulto-mayor' : 'joven-adulto';
      
      // Actualizamos el filtro sin pisar los que ya haya puesto el usuario
      setFilters((prev) => ({
        ...prev,
        generation: targetGeneration,
      }));
    }
  }, [user]);

  const updateFilter = <K extends keyof SpaceFilters>(key: K, value: SpaceFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    // Al limpiar filtros, volvemos a aplicar el filtro automático si existe el usuario
    if (user && user.role === 'student' && user.generation) {
      setFilters({ 
        generation: user.generation === 'joven-adulto' ? 'adulto-mayor' : 'joven-adulto' 
      });
    } else {
      setFilters({});
    }
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '' && value !== false
  ).length;

  return {
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
  };
};