// src/types/filters.ts
// Modela el sistema de filtros definido en "casa_con_si__FILTROS.pdf":
// Filtro 2 (generación), Filtro 3 (propósito), Filtro 4 (duración).
// Filtro 1 (busco/ofrezco) no vive aquí: ya lo resuelve el rol del usuario
// (RegisterForm.role / login), no es un filtro sobre el listado de espacios.

/**
 * Las dos generaciones entre las que el match es posible.
 * Regla de negocio: SOLO se puede hacer match entre generaciones distintas
 * (Joven Adulto <-> Adulto Mayor). Es el corazón del modelo de
 * "Solidaridad Intergeneracional".
 */
export type Generation = 'joven-adulto' | 'adulto-mayor';

/** Rango de edad puntual que el usuario selecciona; deriva en una Generation. */
export type AgeRange = '18-25' | '26-40' | '41-60' | '61-75' | '75+';

/**
 * Propósito del alquiler/intercambio.
 * NOTA DE PRODUCTO (pendiente de decisión, ver pág. 3 del PDF de filtros):
 * ¿se lanza con ambos propósitos desde el día uno, o se hace foco solo en
 * estudiantes al principio? El modelo soporta ambos valores; la decisión
 * de negocio solo afecta qué opciones se muestran/promocionan en la UI.
 */
export type Purpose = 'compartir-gastos' | 'estudiar';

export type Duration =
  | 'anual'
  | 'intermitente-ocasional'
  | 'semestral-cuatrimestral'
  | 'otra-modalidad';

/** Filtros activos sobre el listado de espacios en ExploreSpacesPage. */
export interface SpaceFilters {
  neighborhood?: string;
  generation?: Generation;
  purpose?: Purpose;
  duration?: Duration;
  verifiedOnly?: boolean;
}

/** Deriva la Generation a partir de un rango de edad puntual. */
export const ageRangeToGeneration = (ageRange: AgeRange): Generation => {
  return ageRange === '61-75' || ageRange === '75+' ? 'adulto-mayor' : 'joven-adulto';
};

/** Regla de match: solo entre generaciones distintas. */
export const canMatch = (a: Generation, b: Generation): boolean => a !== b;

export const GENERATION_LABELS: Record<Generation, string> = {
  'joven-adulto': 'Joven Adulto',
  'adulto-mayor': 'Adulto Mayor',
};

export const PURPOSE_LABELS: Record<Purpose, string> = {
  'compartir-gastos': 'Compartir gastos',
  estudiar: 'Estudiar',
};

export const DURATION_LABELS: Record<Duration, string> = {
  anual: 'Anual',
  'intermitente-ocasional': 'Intermitente / Ocasional',
  'semestral-cuatrimestral': 'Semestral o Cuatrimestral',
  'otra-modalidad': 'Otra modalidad',
};
