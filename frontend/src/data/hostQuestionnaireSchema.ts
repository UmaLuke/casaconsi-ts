// src/data/hostQuestionnaireSchema.ts
// Contenido transcripto de "CASA CON SI_contenidos para web luni.pdf",
// sección "OFREZCO CASA CON SI — Para quien tiene habitación disponible" (8 secciones).
// Los `id` de cada campo coinciden con las propiedades de
// HostQuestionnaireData (types/questionnaire-host.ts).

import type { QuestionnaireSectionSchema } from '../types/questionnaire-common';
import { GENERATION_PREFERENCE_OPTIONS, YES_NO_DEPENDE_OPTIONS, YES_NO_OPTIONS } from '../types/questionnaire-common';

export const HOST_QUESTIONNAIRE_SCHEMA: QuestionnaireSectionSchema[] = [
  {
    id: 'personalData',
    title: 'Datos personales',
    badge: 'Obligatorio',
    fields: [
      { id: 'fullName', label: 'Nombre completo', type: 'text', placeholder: 'Luni Pozzo', required: true },
      { id: 'dni', label: 'DNI', type: 'text', placeholder: '12345678', helperText: 'Solo números, sin puntos', required: true },
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
      {
        id: 'maritalStatus', label: 'Estado civil', type: 'select',
        options: [
          { value: 'soltero', label: 'Soltero/a' },
          { value: 'casado', label: 'Casado/a' },
          { value: 'divorciado', label: 'Divorciado/a' },
          { value: 'viudo', label: 'Viudo/a' },
          { value: 'union-convivencial', label: 'Unión convivencial' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { id: 'contactEmail', label: 'Email de contacto', type: 'text', placeholder: 'tu@correo.com', required: true },
      { id: 'contactPhone', label: 'Teléfono de contacto', type: 'text', placeholder: '351 123 4567', required: true },
      { id: 'familyReferenceName', label: 'Contacto de familiar de referencia: nombre', type: 'text' },
      { id: 'familyReferenceRelationship', label: 'Contacto de familiar de referencia: vínculo', type: 'text' },
      { id: 'familyReferencePhone', label: 'Contacto de familiar de referencia: teléfono', type: 'text' },
    ],
  },
  {
    id: 'workSituation',
    title: 'Situación personal y laboral',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'workStatus', label: 'Situación laboral', type: 'select', required: true,
        options: [
          { value: 'activo', label: 'Activo' },
          { value: 'jubilado', label: 'Jubilado' },
          { value: 'retirado', label: 'Retirado' },
          { value: 'desocupado', label: 'Desocupado' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { id: 'professionOrEducation', label: 'Actividad profesional desarrollada / nivel de estudios', type: 'text' },
      { id: 'livesAlone', label: '¿Vivís solo/a actualmente?', type: 'select', options: YES_NO_OPTIONS, required: true },
      { id: 'otherResidents', label: '¿Quiénes más residen en el hogar? (relación, edades)', type: 'textarea', helperText: "Completar si respondiste 'No' a vivir solo/a" },
    ],
  },
  {
    id: 'housingData',
    title: 'Datos de la vivienda',
    badge: 'Obligatorio',
    fields: [
      { id: 'fullAddress', label: 'Dirección completa', type: 'text', required: true },
      { id: 'neighborhood', label: 'Barrio', type: 'text', helperText: 'La selección por mapa interactivo llegará cuando se integre el backend', required: true },
      {
        id: 'housingType', label: 'Tipo de vivienda', type: 'select', required: true,
        options: [{ value: 'casa', label: 'Casa' }, { value: 'departamento', label: 'Departamento' }, { value: 'ph', label: 'PH' }],
      },
      { id: 'totalBedrooms', label: 'Número total de dormitorios en la vivienda', type: 'number', min: 1, required: true },
      { id: 'availableRooms', label: 'Número de habitaciones disponibles para ofrecer', type: 'number', min: 1, required: true },
      {
        id: 'amenities', label: 'Dotaciones', type: 'multiselect',
        options: [
          { value: 'internet', label: 'Internet' },
          { value: 'calefaccion', label: 'Calefacción' },
          { value: 'agua-caliente', label: 'Agua caliente' },
          { value: 'lavadora', label: 'Lavadora' },
          { value: 'ascensor', label: 'Ascensor' },
          { value: 'cochera', label: 'Cochera' },
        ],
      },
      { id: 'hasPrivateBathroom', label: '¿La habitación disponible tiene baño privado?', type: 'select', options: YES_NO_OPTIONS },
      {
        id: 'accessibility', label: 'Accesibilidad', type: 'multiselect',
        options: [
          { value: 'escaleras', label: 'Tiene escaleras' },
          { value: 'rampa', label: 'Tiene rampa' },
          { value: 'ascensor', label: 'Tiene ascensor' },
          { value: 'ninguna', label: 'Ninguna de las anteriores' },
        ],
      },
      { id: 'homePhotos', label: 'Fotos del hogar completo (sala, cocina, baño, habitación disponible)', type: 'images', minCount: 4 },
      { id: 'publicTransportDistance', label: 'Distancia aproximada a transporte público', type: 'text', placeholder: 'Ej: a 3 cuadras de una parada de colectivo' },
    ],
  },
  {
    id: 'exchangesExpected',
    title: 'Intercambios que esperás recibir',
    badge: 'Obligatorio',
    fields: [
      { id: 'expectsMonthlyContribution', label: '¿Esperás un aporte económico mensual?', type: 'select', options: YES_NO_OPTIONS, required: true },
      { id: 'expectedAmountRangeArs', label: 'Monto esperado (rango en ARS)', type: 'text', placeholder: 'Ej: 50.000 - 80.000' },
      {
        id: 'otherExchanges', label: '¿Qué otros intercambios te interesaría recibir?', type: 'multiselect',
        options: [
          { value: 'compania-actividades', label: 'Compañía y actividades compartidas' },
          { value: 'tareas-domesticas', label: 'Ayuda con tareas domésticas (limpieza, cocina, compras)' },
          { value: 'tramites-gestiones', label: 'Acompañamiento en trámites o gestiones' },
          { value: 'asistencia-tecnologica', label: 'Asistencia tecnológica (celular, computadora)' },
          { value: 'oficios-mantenimiento', label: 'Oficios o mantenimiento del hogar' },
          { value: 'clases-mentorias', label: 'Clases, enseñanza o mentorías' },
          { value: 'otro', label: 'Otro' },
        ],
      },
      { id: 'otherExchangeDetail', label: 'Especificar otro intercambio', type: 'text' },
    ],
  },
  {
    id: 'health',
    title: 'Salud y capacidad funcional',
    badge: 'Obligatorio',
    fields: [
      { id: 'currentHealthStatus', label: '¿Cómo describís tu estado de salud actual?', type: 'scale', min: 1, max: 5 },
      { id: 'relevantHealthCondition', label: '¿Tenés alguna condición de salud que consideres importante mencionar?', type: 'textarea' },
      { id: 'dailyActivitySupportDetail', label: '¿Necesitás apoyo para alguna actividad cotidiana? (movilidad, higiene, compras)', type: 'textarea' },
      { id: 'takesScheduledMedication', label: '¿Tomás medicación continua que requiera horarios específicos?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'hasCurrentHelp', label: '¿Contás con algún tipo de ayuda actualmente (familiar, cuidador)?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'currentHelpDetail', label: 'Detalle de la ayuda actual', type: 'text', helperText: "Completar si respondiste 'Sí'" },
    ],
  },
  {
    id: 'habits',
    title: 'Hábitos y estilo de vida',
    badge: 'Obligatorio',
    fields: [
      {
        id: 'smokesAtHome', label: '¿Fumás en el hogar?', type: 'select', required: true,
        options: [{ value: 'si', label: 'Sí' }, { value: 'no', label: 'No' }, { value: 'solo-exterior', label: 'Solo en el exterior' }],
      },
      { id: 'hasPets', label: '¿Tenés mascotas?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'petsDetail', label: '¿Cuáles?', type: 'text', helperText: "Completar si respondiste 'Sí' a mascotas" },
      { id: 'hasMinorChildrenAtHome', label: '¿Tenés hijos/as menores que viven en el hogar?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'freeTimeActivities', label: '¿A qué actividades dedicás tu tiempo libre?', type: 'textarea' },
      { id: 'belongsToAssociation', label: '¿Pertenecés a alguna asociación o colectivo?', type: 'text' },
      { id: 'visitFrequency', label: '¿Recibís visitas de familiares o amistades con frecuencia?', type: 'text', placeholder: 'Ej: casi nunca, algunas veces al mes...' },
      {
        id: 'mealPreference', label: 'Preferencia para las comidas', type: 'select',
        options: [
          { value: 'solo', label: 'Solo/a' },
          { value: 'con-locatario', label: 'Con la persona locataria' },
          { value: 'indistinto', label: 'Indistinto' },
        ],
      },
      { id: 'cleanlinessExpectation', label: 'Nivel de orden y limpieza que esperás en el hogar compartido', type: 'scale', min: 1, max: 5 },
    ],
  },
  {
    id: 'tenantPreferences',
    title: 'Preferencias sobre la persona locataria',
    badge: 'Obligatorio',
    fields: [
      { id: 'preferredGeneration', label: 'Generación preferida', type: 'select', options: GENERATION_PREFERENCE_OPTIONS },
      {
        id: 'preferredTenantGender', label: 'Preferencia de sexo / género', type: 'select',
        options: [{ value: 'indiferente', label: 'Indiferente' }, { value: 'femenino', label: 'Femenino' }, { value: 'masculino', label: 'Masculino' }],
      },
      { id: 'acceptsOtherNationality', label: '¿Aceptarías una persona de otra nacionalidad?', type: 'select', options: YES_NO_DEPENDE_OPTIONS },
      { id: 'tenantCanStayAloneIfHostAway', label: '¿La persona puede quedarse en casa si vos te ausentás?', type: 'select', options: YES_NO_OPTIONS },
      {
        id: 'tenantCanReceiveVisits', label: '¿La persona puede recibir visitas en el hogar?', type: 'select',
        options: [{ value: 'si', label: 'Sí' }, { value: 'con-condiciones', label: 'Con condiciones' }],
      },
      { id: 'acceptsTenantSmoking', label: '¿Aceptarías que la persona locataria fume?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'acceptsTenantPets', label: '¿Aceptarías mascotas del/la locatario/a?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'acceptsTenantChildrenVisiting', label: '¿Aceptarías que tenga hijos/as que frecuenten el hogar?', type: 'select', options: YES_NO_OPTIONS },
      { id: 'nightCurfew', label: 'Horario límite para ingresar al hogar por las noches', type: 'text', placeholder: 'Ej: sin límite, 23:00...' },
      { id: 'dealBreakers', label: 'Otros aspectos que NO aceptarías en la convivencia', type: 'textarea' },
    ],
  },
  {
    id: 'personalPresentation',
    title: 'Presentación personal',
    badge: 'Obligatorio',
    fields: [
      { id: 'motivation', label: '¿Por qué querés participar en CASA CON SI?', type: 'textarea', required: true },
      { id: 'aboutMe', label: 'Contanos algo de vos que te gustaría que sepa la persona locataria', type: 'textarea', required: true },
      { id: 'profilePhoto', label: 'Foto de perfil personal', type: 'image' },
      { id: 'homeAndRoomPhotos', label: 'Fotos del hogar y la habitación disponible', type: 'images', minCount: 4 },
      { id: 'presentationMedia', label: 'Video o audio de presentación (opcional)', type: 'image', accept: 'video/*,audio/*', helperText: 'Opcional' },
    ],
  },
];