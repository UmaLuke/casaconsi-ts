// src/types/questionnaire-host.ts
// Modela el cuestionario "OFREZCO CASA CON SI" (rol: host), tal como está
// definido en "CASA CON SI_contenidos para web luni.pdf" (8 secciones).
// Al integrar el backend .NET, este tipo debe alinearse con el DTO que
// exponga el endpoint de creación/edición de cuestionario de anfitrión.

import type { Generation } from './filters';
import type { GenerationPreference, YesNo, YesNoDepende } from './questionnaire-common';

// --- 1. Datos personales ---
export type MaritalStatus =
  | 'soltero'
  | 'casado'
  | 'divorciado'
  | 'viudo'
  | 'union-convivencial'
  | 'otro';

export interface HostPersonalData {
  fullName: string;
  dni: string;
  birthDate: string; // ISO (yyyy-mm-dd)
  /** Calculada automáticamente a partir de birthDate, ver utils/generation.ts */
  generation: Generation | null;
  gender: string;
  maritalStatus: MaritalStatus;
  contactEmail: string;
  contactPhone: string;
  familyReferenceName: string;
  familyReferenceRelationship: string;
  familyReferencePhone: string;
}

// --- 2. Situación personal y laboral ---
export type WorkStatus = 'activo' | 'jubilado' | 'retirado' | 'desocupado' | 'otro';

export interface HostWorkSituation {
  workStatus: WorkStatus;
  professionOrEducation: string;
  livesAlone: YesNo;
  /** Relación y edades de quienes más residen en el hogar. */
  otherResidents: string;
}

// --- 3. Datos de la vivienda ---
export type HousingType = 'casa' | 'departamento' | 'ph';
export type Amenity = 'internet' | 'calefaccion' | 'agua-caliente' | 'lavadora' | 'ascensor' | 'cochera';
export type AccessibilityFeature = 'escaleras' | 'rampa' | 'ascensor' | 'ninguna';

export interface HostHousingData {
  fullAddress: string;
  neighborhood: string;
  housingType: HousingType;
  totalBedrooms: number;
  availableRooms: number;
  amenities: Amenity[];
  hasPrivateBathroom: YesNo;
  accessibility: AccessibilityFeature[];
  homePhotos: File[];
  publicTransportDistance: string;
}

// --- 4. Intercambios que esperás recibir ---
export type HostExchangeExpected =
  | 'compania-actividades'
  | 'tareas-domesticas'
  | 'tramites-gestiones'
  | 'asistencia-tecnologica'
  | 'oficios-mantenimiento'
  | 'clases-mentorias'
  | 'otro';

export interface HostExchangesExpected {
  expectsMonthlyContribution: YesNo;
  expectedAmountRangeArs: string;
  otherExchanges: HostExchangeExpected[];
  otherExchangeDetail: string;
}

// --- 5. Salud y capacidad funcional ---
export interface HostHealth {
  /** Escala 1-5 (1 = muy mala, 5 = muy buena). */
  currentHealthStatus: number;
  relevantHealthCondition: string;
  dailyActivitySupportDetail: string;
  takesScheduledMedication: YesNo;
  hasCurrentHelp: YesNo;
  currentHelpDetail: string;
}

// --- 6. Hábitos y estilo de vida ---
export type SmokingHabit = 'si' | 'no' | 'solo-exterior';
export type MealPreferenceHost = 'solo' | 'con-locatario' | 'indistinto';

export interface HostHabits {
  smokesAtHome: SmokingHabit;
  hasPets: YesNo;
  petsDetail: string;
  hasMinorChildrenAtHome: YesNo;
  freeTimeActivities: string;
  belongsToAssociation: string;
  visitFrequency: string;
  mealPreference: MealPreferenceHost;
  /** Escala 1-5 */
  cleanlinessExpectation: number;
}

// --- 7. Preferencias sobre la persona locataria ---
export interface HostTenantPreferences {
  preferredGeneration: GenerationPreference;
  preferredTenantGender: string;
  acceptsOtherNationality: YesNoDepende;
  tenantCanStayAloneIfHostAway: YesNo;
  tenantCanReceiveVisits: 'si' | 'con-condiciones';
  acceptsTenantSmoking: YesNo;
  acceptsTenantPets: YesNo;
  acceptsTenantChildrenVisiting: YesNo;
  nightCurfew: string;
  dealBreakers: string;
}

// --- 8. Presentación personal ---
export interface HostPersonalPresentation {
  motivation: string;
  aboutMe: string;
  profilePhoto: File | null;
  /** Mínimo 4 fotos del hogar y la habitación disponible. */
  homeAndRoomPhotos: File[];
  presentationMedia: File | null;
}

export interface HostQuestionnaireData {
  personalData: HostPersonalData;
  workSituation: HostWorkSituation;
  housingData: HostHousingData;
  exchangesExpected: HostExchangesExpected;
  health: HostHealth;
  habits: HostHabits;
  tenantPreferences: HostTenantPreferences;
  personalPresentation: HostPersonalPresentation;
}

export const createEmptyHostQuestionnaire = (): HostQuestionnaireData => ({
  personalData: {
    fullName: '',
    dni: '',
    birthDate: '',
    generation: null,
    gender: '',
    maritalStatus: 'soltero',
    contactEmail: '',
    contactPhone: '',
    familyReferenceName: '',
    familyReferenceRelationship: '',
    familyReferencePhone: '',
  },
  workSituation: {
    workStatus: 'activo',
    professionOrEducation: '',
    livesAlone: 'si',
    otherResidents: '',
  },
  housingData: {
    fullAddress: '',
    neighborhood: '',
    housingType: 'casa',
    totalBedrooms: 1,
    availableRooms: 1,
    amenities: [],
    hasPrivateBathroom: 'no',
    accessibility: [],
    homePhotos: [],
    publicTransportDistance: '',
  },
  exchangesExpected: {
    expectsMonthlyContribution: 'si',
    expectedAmountRangeArs: '',
    otherExchanges: [],
    otherExchangeDetail: '',
  },
  health: {
    currentHealthStatus: 3,
    relevantHealthCondition: '',
    dailyActivitySupportDetail: '',
    takesScheduledMedication: 'no',
    hasCurrentHelp: 'no',
    currentHelpDetail: '',
  },
  habits: {
    smokesAtHome: 'no',
    hasPets: 'no',
    petsDetail: '',
    hasMinorChildrenAtHome: 'no',
    freeTimeActivities: '',
    belongsToAssociation: '',
    visitFrequency: '',
    mealPreference: 'indistinto',
    cleanlinessExpectation: 3,
  },
  tenantPreferences: {
    preferredGeneration: 'indiferente',
    preferredTenantGender: '',
    acceptsOtherNationality: 'depende',
    tenantCanStayAloneIfHostAway: 'si',
    tenantCanReceiveVisits: 'si',
    acceptsTenantSmoking: 'no',
    acceptsTenantPets: 'no',
    acceptsTenantChildrenVisiting: 'si',
    nightCurfew: '',
    dealBreakers: '',
  },
  personalPresentation: {
    motivation: '',
    aboutMe: '',
    profilePhoto: null,
    homeAndRoomPhotos: [],
    presentationMedia: null,
  },
});