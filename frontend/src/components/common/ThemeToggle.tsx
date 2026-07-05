import React, { useEffect } from 'react';

export const ThemeToggle: React.FC = () => {
  useEffect(() => {
    // Forzamos a DaisyUI a usar el tema 'black' (negro absoluto)
    // Esto se ejecuta una sola vez al montar la aplicación
    document.documentElement.setAttribute('data-theme', 'black');
    
    // Opcional: Forzamos el esquema de color nativo del navegador a oscuro
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  // Al retornar null, eliminamos el interruptor (sol/luna) de la interfaz
  // sin romper los lugares donde este componente está siendo importado (ej. Header.tsx)
  return null;
};