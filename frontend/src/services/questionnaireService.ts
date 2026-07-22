// src/services/questionnaireService.ts
// Espejo del patrón de authService.ts. A diferencia de Auth, estos son los
// primeros endpoints protegidos que consume el frontend: todo request lleva
// el header Authorization con el JWT (ver AuthContext / useAuth).
import { API_URL } from '../config';
import type { StudentQuestionnaireData } from '../types/questionnaire-student';
import type { HostQuestionnaireData } from '../types/questionnaire-host';

export class ProfileError extends Error {}

// --- DTOs de respuesta: espejo de StudentProfileResponseDto / HostProfileResponseDto
// en CasaConSi.Api/DTOs/Profile/*.cs ---
export interface StudentProfileResponseDto {
  id: string;
  dni: string;
  personalData: Omit<StudentQuestionnaireData['personalData'], 'dni' | 'generation'>;
  travelReason: StudentQuestionnaireData['travelReason'];
  locationPreferences: StudentQuestionnaireData['locationPreferences'];
  economicSituation: StudentQuestionnaireData['economicSituation'];
  exchangesOffered: StudentQuestionnaireData['exchangesOffered'];
  habits: StudentQuestionnaireData['habits'];
  health: StudentQuestionnaireData['health'];
  hostPreferences: StudentQuestionnaireData['hostPreferences'];
  personalPresentation: Omit<StudentQuestionnaireData['personalPresentation'], 'profilePhoto' | 'presentationMedia'>;
  profilePhotoUrl: string | null;
  presentationMediaUrl: string | null;
  updatedAt: string;
}

export interface HostProfileResponseDto {
  id: string;
  dni: string;
  personalData: Omit<HostQuestionnaireData['personalData'], 'dni' | 'generation'>;
  workSituation: HostQuestionnaireData['workSituation'];
  housingData: Omit<HostQuestionnaireData['housingData'], 'homePhotos'>;
  exchangesExpected: HostQuestionnaireData['exchangesExpected'];
  health: HostQuestionnaireData['health'];
  habits: HostQuestionnaireData['habits'];
  tenantPreferences: HostQuestionnaireData['tenantPreferences'];
  personalPresentation: Omit<HostQuestionnaireData['personalPresentation'], 'profilePhoto' | 'homeAndRoomPhotos' | 'presentationMedia'>;
  profilePhotoUrl: string | null;
  presentationMediaUrl: string | null;
  homePhotoUrls: string[];
  updatedAt: string;
}

export interface ProfileStatusResponseDto {
  hasProfile: boolean;
}

// --- Payloads de request: mismo shape que StudentProfileRequestDto /
// HostProfileRequestDto en el backend, derivados de los tipos del
// cuestionario para no desalinearse si esos tipos cambian. `dni` y
// `generation` salen de personalData (el backend los maneja aparte: dni
// cifrado, generation se deriva de birthDate del lado del servidor). Los
// campos `File` no viajan acá — se suben aparte, ver uploadStudentPhotos /
// uploadHostPhotos. ---
interface StudentProfilePayload {
  dni: string;
  personalData: Omit<StudentQuestionnaireData['personalData'], 'dni' | 'generation'>;
  travelReason: StudentQuestionnaireData['travelReason'];
  locationPreferences: StudentQuestionnaireData['locationPreferences'];
  economicSituation: StudentQuestionnaireData['economicSituation'];
  exchangesOffered: StudentQuestionnaireData['exchangesOffered'];
  habits: StudentQuestionnaireData['habits'];
  health: StudentQuestionnaireData['health'];
  hostPreferences: StudentQuestionnaireData['hostPreferences'];
  personalPresentation: Omit<StudentQuestionnaireData['personalPresentation'], 'profilePhoto' | 'presentationMedia'>;
}

interface HostProfilePayload {
  dni: string;
  personalData: Omit<HostQuestionnaireData['personalData'], 'dni' | 'generation'>;
  workSituation: HostQuestionnaireData['workSituation'];
  housingData: Omit<HostQuestionnaireData['housingData'], 'homePhotos'>;
  exchangesExpected: HostQuestionnaireData['exchangesExpected'];
  health: HostQuestionnaireData['health'];
  habits: HostQuestionnaireData['habits'];
  tenantPreferences: HostQuestionnaireData['tenantPreferences'];
  personalPresentation: Omit<HostQuestionnaireData['personalPresentation'], 'profilePhoto' | 'homeAndRoomPhotos' | 'presentationMedia'>;
}

const toStudentPayload = (data: StudentQuestionnaireData): StudentProfilePayload => {
  const { personalData, personalPresentation } = data;

  return {
    dni: personalData.dni,
    personalData: {
      fullName: personalData.fullName,
      birthDate: personalData.birthDate,
      gender: personalData.gender,
      nationality: personalData.nationality,
      contactEmail: personalData.contactEmail,
      contactPhone: personalData.contactPhone,
      emergencyContactName: personalData.emergencyContactName,
      emergencyContactRelationship: personalData.emergencyContactRelationship,
      emergencyContactPhone: personalData.emergencyContactPhone,
    },
    travelReason: data.travelReason,
    locationPreferences: data.locationPreferences,
    economicSituation: data.economicSituation,
    exchangesOffered: data.exchangesOffered,
    habits: data.habits,
    health: data.health,
    hostPreferences: data.hostPreferences,
    personalPresentation: {
      motivation: personalPresentation.motivation,
      aboutMe: personalPresentation.aboutMe,
    },
  };
};

// NOTA: HostHousingData.homePhotos (sección 3, "Datos de la vivienda") no se
// envía todavía — ver aviso de inconsistencia en la sesión: se solapa con
// HostPersonalPresentation.homeAndRoomPhotos (sección 8), que sí se sube.
// Falta una decisión de producto sobre si son el mismo set de fotos.
const toHostPayload = (data: HostQuestionnaireData): HostProfilePayload => {
  const { personalData, housingData, personalPresentation } = data;

  return {
    dni: personalData.dni,
    personalData: {
      fullName: personalData.fullName,
      birthDate: personalData.birthDate,
      gender: personalData.gender,
      maritalStatus: personalData.maritalStatus,
      contactEmail: personalData.contactEmail,
      contactPhone: personalData.contactPhone,
      familyReferenceName: personalData.familyReferenceName,
      familyReferenceRelationship: personalData.familyReferenceRelationship,
      familyReferencePhone: personalData.familyReferencePhone,
    },
    workSituation: data.workSituation,
    housingData: {
      fullAddress: housingData.fullAddress,
      neighborhood: housingData.neighborhood,
      housingType: housingData.housingType,
      totalBedrooms: housingData.totalBedrooms,
      availableRooms: housingData.availableRooms,
      amenities: housingData.amenities,
      hasPrivateBathroom: housingData.hasPrivateBathroom,
      accessibility: housingData.accessibility,
      publicTransportDistance: housingData.publicTransportDistance,
    },
    exchangesExpected: data.exchangesExpected,
    health: data.health,
    habits: data.habits,
    tenantPreferences: data.tenantPreferences,
    personalPresentation: {
      motivation: personalPresentation.motivation,
      aboutMe: personalPresentation.aboutMe,
    },
  };
};

const authHeaders = (token: string): HeadersInit => ({ Authorization: `Bearer ${token}` });

const handleProfileResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? 'Ocurrió un error al guardar el cuestionario. Probá de nuevo.';
    throw new ProfileError(message);
  }
  return response.json();
};

export const getProfileStatus = async (token: string): Promise<ProfileStatusResponseDto> => {
  const response = await fetch(`${API_URL}/api/profile/status`, {
    headers: authHeaders(token),
  });
  return handleProfileResponse<ProfileStatusResponseDto>(response);
};

const uploadStudentPhotos = async (
  personalPresentation: StudentQuestionnaireData['personalPresentation'],
  token: string,
): Promise<StudentProfileResponseDto | null> => {
  const { profilePhoto, presentationMedia } = personalPresentation;
  if (!profilePhoto && !presentationMedia) return null;

  const formData = new FormData();
  if (profilePhoto) formData.append('profilePhoto', profilePhoto);
  if (presentationMedia) formData.append('presentationMedia', presentationMedia);

  const response = await fetch(`${API_URL}/api/profile/student/photos`, {
    method: 'POST',
    // Sin 'Content-Type': el browser arma el boundary de multipart solo.
    headers: authHeaders(token),
    body: formData,
  });
  return handleProfileResponse<StudentProfileResponseDto>(response);
};

const uploadHostPhotos = async (
  personalPresentation: HostQuestionnaireData['personalPresentation'],
  token: string,
): Promise<HostProfileResponseDto | null> => {
  const { profilePhoto, homeAndRoomPhotos, presentationMedia } = personalPresentation;
  if (!profilePhoto && homeAndRoomPhotos.length === 0 && !presentationMedia) return null;

  const formData = new FormData();
  if (profilePhoto) formData.append('profilePhoto', profilePhoto);
  if (presentationMedia) formData.append('presentationMedia', presentationMedia);
  homeAndRoomPhotos.forEach((photo) => formData.append('homeAndRoomPhotos', photo));

  const response = await fetch(`${API_URL}/api/profile/host/photos`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  return handleProfileResponse<HostProfileResponseDto>(response);
};

/** Guarda el cuestionario de student completo: datos + fotos (si se cargaron). */
export const submitStudentQuestionnaire = async (
  data: StudentQuestionnaireData,
  token: string,
): Promise<StudentProfileResponseDto> => {
  const response = await fetch(`${API_URL}/api/profile/student`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(toStudentPayload(data)),
  });
  const saved = await handleProfileResponse<StudentProfileResponseDto>(response);
  const withPhotos = await uploadStudentPhotos(data.personalPresentation, token);
  return withPhotos ?? saved;
};

/** Guarda el cuestionario de host completo: datos + fotos (si se cargaron). */
export const submitHostQuestionnaire = async (
  data: HostQuestionnaireData,
  token: string,
): Promise<HostProfileResponseDto> => {
  const response = await fetch(`${API_URL}/api/profile/host`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(toHostPayload(data)),
  });
  const saved = await handleProfileResponse<HostProfileResponseDto>(response);
  const withPhotos = await uploadHostPhotos(data.personalPresentation, token);
  return withPhotos ?? saved;
};
