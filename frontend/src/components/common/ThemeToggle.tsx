// src/components/common/ThemeToggle.tsx
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Calcula el tema inicial leyendo localStorage o la preferencia del sistema.
// Se usa como inicializador perezoso de useState, así evitamos hacer
// setState dentro de un efecto (antipatrón que dispara renders en cascada).
const getInitialIsDarkMode = (): boolean => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return savedTheme === 'dark' || (!savedTheme && prefersDark);
};

export const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialIsDarkMode);

  // Sincronizamos el DOM (clase de Tailwind + atributo de DaisyUI) y la preferencia
  // guardada cada vez que cambia el tema. Este sí es un efecto válido: sincroniza
  // un sistema externo (el DOM/localStorage) con el estado de React.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm md:btn-md text-base-content/70 hover:text-brand-orange transition-colors" aria-label="Cambiar tema">
      {/* El checkbox oculto controla el estado visual del swap de DaisyUI */}
      <input 
        type="checkbox" 
        onChange={toggleTheme} 
        checked={isDarkMode} 
      />
      
      {/* Icono de Sol (Aparece cuando el checkbox está activado/dark) */}
      <Sun className="swap-on size-5" />
      
      {/* Icono de Luna (Aparece cuando el checkbox está desactivado/light) */}
      <Moon className="swap-off size-5" />
    </label>
  );
};
