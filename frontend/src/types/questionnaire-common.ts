// src/types/questionnaire-common.ts
// Tipos genéricos que describen la ESTRUCTURA (schema) de un cuestionario:
// qué secciones tiene, qué campos hay en cada una y cómo deben renderizarse.
// Los datos reales que completa cada rol viven en questionnaire-student.ts
// y questionnaire-host.ts, tipados de forma estricta por entidad.

export type YesNo = 'si' | 'no';
export type YesNoDepende = 'si' | 'no' | 'depende';

/** Preferencia de generación de la contraparte (Filtro 2, ver types/filters.ts). */
export type GenerationPreference =
  | 'joven'
  | 'adulto-joven'
  | 'adulto'
  | 'adulto-mayor'
  | 'mayor'
  | 'indiferente';

export const YES_NO_OPTIONS: QuestionnaireOption[] = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

export const YES_NO_DEPENDE_OPTIONS: QuestionnaireOption[] = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'depende', label: 'Depende' },
];

export const GENERATION_PREFERENCE_OPTIONS: QuestionnaireOption[] = [
  { value: 'joven', label: 'Joven' },
  { value: 'adulto-joven', label: 'Adulto joven' },
  { value: 'adulto', label: 'Adulto' },
  { value: 'adulto-mayor', label: 'Adulto mayor' },
  { value: 'mayor', label: 'Mayor' },
  { value: 'indiferente', label: 'Indiferente' },
];

/** Tipos de campo soportados por el renderer genérico QuestionnaireField. */
export type QuestionnaireFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'scale'
  | 'image'
  | 'images'
  | 'auto';

export interface QuestionnaireOption {
  value: string;
  label: string;
}

/** Valor que puede tomar cualquier campo dentro del estado del formulario. */
export type QuestionnaireFieldValue = string | string[] | number | File | File[] | null | undefined;

export interface QuestionnaireFieldSchema {
  /** Debe coincidir con el nombre de la propiedad en el tipo de datos de la sección. */
  id: string;
  label: string;
  type: QuestionnaireFieldType;
  helperText?: string;
  /** Para 'select' y 'multiselect'. */
  options?: QuestionnaireOption[];
  /** Para 'scale' (por defecto 1) y 'number'. */
  min?: number;
  /** Para 'scale' (por defecto 5) y 'number'. */
  max?: number;
  /** Para 'images': cantidad mínima recomendada (ej. 4 fotos del hogar). */
  minCount?: number;
  /** Para 'image'/'images': override del atributo `accept` del input file (ej. "video/*,audio/*"). */
  accept?: string;
  placeholder?: string;
  required?: boolean;
}

export interface QuestionnaireSectionSchema {
  id: string;
  title: string;
  badge?: string;
  fields: QuestionnaireFieldSchema[];
}

/** Estado genérico de un cuestionario en progreso: sectionId -> fieldId -> valor. */
export type QuestionnaireValues = Record<string, Record<string, QuestionnaireFieldValue>>;