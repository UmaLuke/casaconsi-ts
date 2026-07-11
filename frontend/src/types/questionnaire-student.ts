// src/types/questionnaire-student.ts
// Modela el cuestionario "BUSCO CASA CON SI" (rol: student), tal como está
// definido en "CASA CON SI_contenidos para web luni.pdf" (9 secciones).
// Al integrar el backend .NET, este tipo debe alinearse con el DTO que
// exponga el endpoint de creación/edición de cuestionario de estudiante.

import type { Generation } from './filters';
import type { GenerationPreference, YesNo, YesNoDepende } from './questionnaire-common';

// --- 1. Datos personales ---
export interface StudentPersonalData {
  fullName: string;
  dni: string;
  birthDate: string; // ISO (yyyy-mm-dd)
  /** Calculada automáticamente a partir de birthDate, ver utils/generation.ts */
  generation: Generation | null;
  gender: string;
  nationality: string;
  contactEmail: string;
  contactPhone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
}

// --- 2. Motivo de traslado y actividad ---
export type TravelReason = 'estudios' | 'trabajo' | 'proyecto-personal' | 'otro';
export type StayDuration = '4-6-meses' | 'hasta-1-anio' | 'mas-1-anio';

export interface StudentTravelReason {
  reason: TravelReason;
  reasonOther: string;
  /** Institución, carrera, año, horario estimado de cursado (si estudia). */
  studyDetails: string;
  /** Tipo de trabajo, horario, si continuará durante la estadía (si trabaja). */
  workDetails: string;
  stayDuration: StayDuration;
  availableFrom: string; // fecha ISO
}

// --- 3. Preferencias de ubicación ---
export interface StudentLocationPreferences {
  preferredNeighborhoods: string[];
  /** Se completa solo si preferredNeighborhoods incluye 'otro'. */
  preferredNeighborhoodsOther: string;
  excludedNeighborhoods: string[];
  /** Se completa solo si excludedNeighborhoods incluye 'otro'. */
  excludedNeighborhoodsOther: string;
  proximityNeeds: string;
}

// --- 4. Situación económica ---
export type IncomeSource = 'beca' | 'trabajo' | 'familia' | 'ahorros' | 'prestacion-social';

export interface StudentEconomicSituation {
  monthlyIncomeRange: string;
  incomeSources: IncomeSource[];
  canPayMonthlyContribution: YesNo;
  contributionRangeArs: string;
}

// --- 5. Intercambios que podés ofrecer ---
export type StudentExchangeOffered =
  | 'compania-actividades'
  | 'tareas-domesticas'
  | 'asistencia-tecnologica'
  | 'clases-mentorias'
  | 'oficios-mantenimiento'
  | 'otro';

export interface StudentExchangesOffered {
  offerings: StudentExchangeOffered[];
  otherOffering: string;
}

// --- 6. Hábitos y estilo de vida ---
export type SmokingHabit = 'si' | 'no' | 'solo-exterior';
export type MealPreferenceStudent = 'solo' | 'con-anfitrion' | 'indistinto';

export interface StudentHabits {
  smokes: SmokingHabit;
  hasPets: YesNo;
  petsDetail: string;
  hasChildrenAtHome: YesNo;
  usualScheduleOut: string;
  usualScheduleBack: string;
  visitFrequency: string;
  weekendAbsenceFrequency: string;
  mealPreference: MealPreferenceStudent;
  cooksRegularly: YesNo;
  /** Escala 1-5 */
  cleanlinessExpectation: number;
  relevantAllergies: string;
}

// --- 7. Salud ---
export type HealthCoverage = 'obra-social' | 'prepaga' | 'pami' | 'sin-cobertura';

export interface StudentHealth {
  relevantHealthCondition: string;
  needsDailySupport: YesNo;
  dailySupportDetail: string;
  healthCoverage: HealthCoverage;
}

// --- 8. Preferencias sobre la persona anfitriona ---
export interface StudentHostPreferences {
  preferredGeneration: GenerationPreference;
  preferredHostGender: string;
  acceptsCoupleHost: YesNo;
  botherIfHostSmokes: YesNoDepende;
  acceptsPetsAtHome: YesNoDepende;
  acceptsHostChildren: YesNo;
  otherResidentsCount: number;
  dealBreakers: string;
}

// --- 9. Presentación personal ---
export interface StudentPersonalPresentation {
  motivation: string;
  aboutMe: string;
  profilePhoto: File | null;
  presentationMedia: File | null;
}

export interface StudentQuestionnaireData {
  personalData: StudentPersonalData;
  travelReason: StudentTravelReason;
  locationPreferences: StudentLocationPreferences;
  economicSituation: StudentEconomicSituation;
  exchangesOffered: StudentExchangesOffered;
  habits: StudentHabits;
  health: StudentHealth;
  hostPreferences: StudentHostPreferences;
  personalPresentation: StudentPersonalPresentation;
}

export const createEmptyStudentQuestionnaire = (): StudentQuestionnaireData => ({
  personalData: {
    fullName: '',
    dni: '',
    birthDate: '',
    generation: null,
    gender: '',
    nationality: '',
    contactEmail: '',
    contactPhone: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  },
  travelReason: {
    reason: 'estudios',
    reasonOther: '',
    studyDetails: '',
    workDetails: '',
    stayDuration: 'hasta-1-anio',
    availableFrom: '',
  },
  locationPreferences: {
    preferredNeighborhoods: [],
    preferredNeighborhoodsOther: '',
    excludedNeighborhoods: [],
    excludedNeighborhoodsOther: '',
    proximityNeeds: '',
  },
  economicSituation: {
    monthlyIncomeRange: '',
    incomeSources: [],
    canPayMonthlyContribution: 'si',
    contributionRangeArs: '',
  },
  exchangesOffered: {
    offerings: [],
    otherOffering: '',
  },
  habits: {
    smokes: 'no',
    hasPets: 'no',
    petsDetail: '',
    hasChildrenAtHome: 'no',
    usualScheduleOut: '',
    usualScheduleBack: '',
    visitFrequency: '',
    weekendAbsenceFrequency: '',
    mealPreference: 'indistinto',
    cooksRegularly: 'si',
    cleanlinessExpectation: 3,
    relevantAllergies: '',
  },
  health: {
    relevantHealthCondition: '',
    needsDailySupport: 'no',
    dailySupportDetail: '',
    healthCoverage: 'sin-cobertura',
  },
  hostPreferences: {
    preferredGeneration: 'indiferente',
    preferredHostGender: '',
    acceptsCoupleHost: 'si',
    botherIfHostSmokes: 'depende',
    acceptsPetsAtHome: 'depende',
    acceptsHostChildren: 'si',
    otherResidentsCount: 0,
    dealBreakers: '',
  },
  personalPresentation: {
    motivation: '',
    aboutMe: '',
    profilePhoto: null,
    presentationMedia: null,
  },
});