// src/context/auth-context.ts
import { createContext } from 'react';
import type { AuthContextValue } from '../types/auth';

// El Context vive en su propio archivo (sin JSX) para que Fast Refresh
// pueda tratar a AuthContext.tsx como un archivo que solo exporta componentes.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
