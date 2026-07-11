// src/data/studentQuestionnaireSchema.ts
// Contenido transcripto de "CASA CON SI_contenidos para web luni.pdf",
// sección "BUSCO CASA CON SI — Para quien busca alojamiento" (9 secciones).
// Los `id` de cada campo coinciden con las propiedades de
// StudentQuestionnaireData (types/questionnaire-student.ts).

import type { QuestionnaireSectionSchema } from '../types/questionnaire-common';
import { GENERATION_PREFERENCE_OPTIONS, YES_NO_DEPENDE_OPTIONS, YES_NO_OPTIONS } from '../types/questionnaire-common';

const CORDOBA_BARRIOS_OPTIONS = [
  { value: 'nueva-cordoba', label: 'Nueva Córdoba' },
  { value: 'centro', label: 'Centro' },
  { value: 'cerro-de-las-rosas', label: 'Cerro de las Rosas' },
  { value: 'alta-cordoba', label: 'Alta Córdoba' },
  { value: 'general-paz', label: 'General Paz' },
  { value: 'guemes', label: 'Güemes' },
  { value: 'alberdi', label: 'Alberdi' },
  { value: 'villa-belgrano', label: 'Villa Belgrano' },
  { value: 'otro', label: 'Otro' },
];

export const STUDENT_QUESTIONNAIRE_SCHEMA: QuestionnaireSectionSchema[] = [
  {
    id: 'personalData',
    title: 'Datos personales',
    badge: 'Obligatorio',
    fields: [
      { id: 'fullName', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez', required: true },
      { id: 'dni', label: 'DNI', type: 'text', placeholder: '30123456', helperText: 'Solo números, sin puntos', required: true },
      { id: 'birthDate', label: 'Fecha de nacimiento', type: 'date', required: true },
      { id: 'generation', label: 'Generación', type: 'auto', helperText: 'Se calcula automáticamente a partir de tu fecha de nacimiento' },
      {
        id: 'gender', label: 'Sexo / género', type: 'select', required: true,
        options: [
          { value: 'femenino', label: 'Femenino' },
          { value: 'masculino', label: 'Masculino' },
          { value: 'no-binario', label: 'No binario' },
          { value: 'prefiero-no-decir', label: 'Prefiero no decir' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { id: 'nationality', label: 'Nacionalidad', type: 'text', placeholder: 'Argentina' },
      { id: 'contactEmail', label: 'Email de contacto', type: 'text', placeholder: 'tu@correo.com', required: true },
      { id: 'contactPhone', label: 'Teléfono de contacto', type: 'text', placeholder: '351 123 4567', required: true },
      { id: 'emergencyContactName', label: 'Contacto de emergencia: nombre', type: 'text', required: true },
      { id: 'emergencyContactRelationship', label: 'Contacto de emergencia: vínculo', type: 'text', placeholder: 'Madre, hermano, amigo/a...', required: true },
      { id: 'emergencyContactPhone', label: 'Contacto de emergencia: teléfono', type: 'text', required: true },
    ],
  },
  {
    id: 'travelReason',
    title: 'Motivo de traslado y actividad',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'reason', label: '¿Por qué te trasladás a Córdoba?', type: 'select', required: true,
        options: [
          { value: 'estudios', label: 'Estudios universitarios / terciarios' },
          { value: 'trabajo', label: 'Trabajo o empleo' },
          { value: 'proyecto-personal', label: 'Proyecto personal o emprendimiento' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { id: 'reasonOther', label: 'Especificar otro motivo', type: 'text', dependsOn: { fieldId: 'reason', equals: 'otro' } },
      { id: 'studyDetails', label: 'Si estudiás: institución, carrera, año y horario estimado de cursado', type: 'textarea', dependsOn: { fieldId: 'reason', equals: 'estudios' } },
      { id: 'workDetails', label: 'Si trabajás: tipo de trabajo, horario y si continuará durante la estadía', type: 'textarea', dependsOn: { fieldId: 'reason', equals: 'trabajo' } },
      {
        id: 'stayDuration', label: 'Tiempo estimado de estadía', type: 'select', required: true,
        options: [
          { value: '4-6-meses', label: '4 a 6 meses' },
          { value: 'hasta-1-anio', label: 'Hasta 1 año' },
          { value: 'mas-1-anio', label: 'Más de 1 año' },
        ],
      },
      { id: 'availableFrom', label: '¿Cuándo podés incorporarte?', type: 'date', required: true },
    ],
  },
  {
    id: 'locationPreferences',
    title: 'Preferencias de ubicación',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'preferredNeighborhoods', label: 'Barrios o zonas preferidas de Córdoba', type: 'multiselect',
        options: CORDOBA_BARRIOS_OPTIONS,
        helperText: 'Selección múltiple. La búsqueda por mapa interactivo llegará cuando se integre el backend.',
      },
      {
        id: 'preferredNeighborhoodsOther', label: 'Especificar otro barrio (preferido)', type: 'text',
        dependsOn: { fieldId: 'preferredNeighborhoods', includes: 'otro' },
      },
      {
        id: 'excludedNeighborhoods', label: 'Barrios o zonas donde NO vivirías', type: 'multiselect',
        options: CORDOBA_BARRIOS_OPTIONS,
      },
      {
        id: 'excludedNeighborhoodsOther', label: 'Especificar otro barrio (a excluir)', type: 'text',
        dependsOn: { fieldId: 'excludedNeighborhoods', includes: 'otro' },
      },
      { id: 'proximityNeeds', label: '¿Necesitás estar cerca de algún punto específico?', type: 'text', placeholder: 'Ej: mi facultad, mi trabajo...' },
    ],
  },
  {
    id: 'economicSituation',
    title: 'Situación económica',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'monthlyIncomeRange', label: 'Ingresos mensuales aproximados', type: 'select', required: true,
        options: [
          { value: 'menos-150000', label: 'Menos de $150.000' },
          { value: '150000-300000', label: '$150.000 - $300.000' },
          { value: '300000-500000', label: '$300.000 - $500.000' },
          { value: 'mas-500000', label: 'Más de $500.000' },
        ],
      },
      {
        id: 'incomeSources', label: 'Origen de ingresos', type: 'multiselect', required: true,
        options: [
          { value: 'beca', label: 'Beca' },
          { value: 'trabajo', label: 'Trabajo' },
          { value: 'familia', label: 'Familia' },
          { value: 'ahorros', label: 'Ahorros' },
          { value: 'prestacion-social', label: 'Prestación social' },
        ],
      },
      { id: 'canPayMonthlyContribution', label: '¿Podés pagar un aporte económico mensual por la habitación?', type: 'select', options: YES_NO_OPTIONS, required: true },
      { id: 'contributionRangeArs', label: 'Rango de aporte que podés ofrecer (ARS mensuales)', type: 'text', placeholder: 'Ej: 50.000 - 80.000', dependsOn: { fieldId: 'canPayMonthlyContribution', equals: 'si' } },
    ],
  },
  {
    id: 'exchangesOffered',
    title: 'Intercambios que podés ofrecer',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'offerings', label: '¿Qué podés ofrecer además (o en vez) del aporte económico?', type: 'multiselect', required: true,
        options: [
          { value: 'compania-actividades', label: 'Compañía y actividades compartidas' },
          { value: 'tareas-domesticas', label: 'Tareas domésticas (limpieza, cocina, compras, trámites)' },
          { value: 'asistencia-tecnologica', label: 'Asistencia tecnológica (cel, compu, redes)' },
          { value: 'clases-mentorias', label: 'Clases o mentorías (idiomas, música, arte, informática)' },
          { value: 'oficios-mantenimiento', label: 'Oficios o mantenimiento (electricidad, plomería, pintura)' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { id: 'otherOffering', label: 'Especificar otro intercambio', type: 'text', dependsOn: { fieldId: 'offerings', includes: 'otro' } },
    ],
  },
  {
    id: 'habits',
    title: 'Hábitos y estilo de vida',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'smokes', label: '¿Fumás?', type: 'select', required: true,
        options: [{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'solo-exterior', label: 'Solo en el exterior' }],
      },
      { id: 'hasPets', label: '¿Tenés mascotas?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'petsDetail', label: '¿Cuáles?', type: 'text', dependsOn: { fieldId: 'hasPets', equals: 'si' } },
      { id: 'hasChildrenAtHome', label: '¿Tenés hijos/as que vivirán en el hogar?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'usualScheduleOut', label: '¿A qué hora salís habitualmente?', type: 'text', placeholder: 'Ej: 8:00' },
      { id: 'usualScheduleBack', label: '¿A qué hora volvés habitualmente?', type: 'text', placeholder: 'Ej: 20:00' },
      {
        id: 'visitFrequency', label: '¿Con qué frecuencia recibís visitas en casa?', type: 'select',
        options: [{ value: 'nunca', label: 'Nunca' }, { value: 'ocasional', label: 'Ocasional' }, { value: 'frecuente', label: 'Frecuente' }],
      },
      { id: 'weekendAbsenceFrequency', label: '¿Te ausentás los fines de semana?', type: 'text', placeholder: 'Ej: casi siempre, a veces, nunca' },
      {
        id: 'mealPreference', label: 'Las comidas las preferís', type: 'select',
        options: [
          { value: 'solo', label: 'Solo/a' },
          { value: 'con-anfitrion', label: 'Con la persona anfitriona' },
          { value: 'indistinto', label: 'Indistinto' },
        ],
      },
      { id: 'cooksRegularly', label: '¿Cocinás habitualmente?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'cleanlinessExpectation', label: 'Nivel de orden y limpieza que esperás en el hogar', type: 'scale', min: 1, max: 10 },
      { id: 'relevantAllergies', label: '¿Tenés alguna alergia relevante (alimentaria, medicamentos, otros)?', type: 'text' },
    ],
  },
  {
    id: 'health',
    title: 'Salud',
    badge: 'Obligatorio',
    fields: [
      { id: 'relevantHealthCondition', label: '¿Tenés alguna condición de salud que consideres importante mencionar?', type: 'textarea' },
      { id: 'needsDailySupport', label: '¿Necesitás algún tipo de apoyo para actividades cotidianas?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'dailySupportDetail', label: 'Detalle del apoyo necesario', type: 'text', dependsOn: { fieldId: 'needsDailySupport', equals: 'si' } },
      {
        id: 'healthCoverage', label: 'Cobertura de salud', type: 'select',
        options: [
          { value: 'obra-social', label: 'Obra social' },
          { value: 'prepaga', label: 'Prepaga' },
          { value: 'pami', label: 'PAMI' },
          { value: 'sin-cobertura', label: 'Sin cobertura' },
        ],
      },
    ],
  },
  {
    id: 'hostPreferences',
    title: 'Preferencias sobre la persona anfitriona',
    badge: 'Obligatorio',
    fields: [
      { id: 'preferredGeneration', label: 'Generación preferida', type: 'select', options: GENERATION_PREFERENCE_OPTIONS },
      {
        id: 'preferredHostGender', label: 'Preferencia de sexo / género de la persona anfitriona', type: 'select',
        options: [{ value: 'indiferente', label: 'Indiferente' }, { value: 'femenino', label: 'Femenino' }, { value: 'masculino', label: 'Masculino' }],
      },
      { id: 'acceptsCoupleHost', label: '¿Aceptarías convivir con una pareja o matrimonio?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'botherIfHostSmokes', label: '¿Te molestaría que la persona anfitriona fume?', type: 'select', options: YES_NO_DEPENDE_OPTIONS },
      { id: 'acceptsPetsAtHome', label: '¿Aceptarías un hogar con mascotas?', type: 'select', options: YES_NO_DEPENDE_OPTIONS },
      { id: 'acceptsHostChildren', label: '¿Aceptarías que la persona anfitriona tenga hijos/as en el hogar?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'otherResidentsCount', label: '¿Cuántas personas más residen en el hogar donde alquilarías?', type: 'number', min: 0 },
      { id: 'dealBreakers', label: 'Otros aspectos que NO aceptarías en la convivencia', type: 'textarea' },
    ],
  },
  {
    id: 'personalPresentation',
    title: 'Presentación personal',
    badge: 'Obligatorio',
    fields: [
      { id: 'motivation', label: '¿Por qué querés participar en CASA CON SI?', type: 'textarea', required: true },
      { id: 'aboutMe', label: 'Contanos algo de vos que te gustaría que sepa la persona anfitriona', type: 'textarea', required: true },
      { id: 'profilePhoto', label: 'Foto de perfil personal', type: 'image' },
      { id: 'presentationMedia', label: 'Video o audio de presentación (opcional)', type: 'image', accept: 'video/*,audio/*', helperText: 'Opcional' },
    ],
  },
];