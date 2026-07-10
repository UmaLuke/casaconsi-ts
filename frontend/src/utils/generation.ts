// src/utils/generation.ts
// Deriva el campo "Generación (calculada automáticamente)" que piden
// ambos cuestionarios a partir de la fecha de nacimiento.

import type { Generation } from '../types/filters';

/** Edad a partir de la cual, para el modelo de match, alguien es "adulto mayor". */
const EDAD_MINIMA_ADULTO_MAYOR = 60;

export const calculateAge = (birthDateIso: string): number | null => {
  if (!birthDateIso) return null;

  const birthDate = new Date(birthDateIso);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const alreadyHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!alreadyHadBirthdayThisYear) {
    age -= 1;
  }

  return age;
};

/** Deriva la Generation (Filtro 2) a partir de la fecha de nacimiento. */
export const deriveGenerationFromBirthDate = (birthDateIso: string): Generation | null => {
  const age = calculateAge(birthDateIso);
  if (age === null) return null;
  return age >= EDAD_MINIMA_ADULTO_MAYOR ? 'adulto-mayor' : 'joven-adulto';
};