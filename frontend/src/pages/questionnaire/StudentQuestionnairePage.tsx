// src/pages/questionnaire/StudentQuestionnairePage.tsx
// Se llega acá después de crear la cuenta básica con role: 'student'
// (RegisterForm -> RegisterPage -> navigate('/cuestionario/buscar')).

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2 } from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { QuestionnaireWizard } from '../../components/features/questionnaire/QuestionnaireWizard';
import { STUDENT_QUESTIONNAIRE_SCHEMA } from '../../data/studentQuestionnaireSchema';
import { createEmptyStudentQuestionnaire, type StudentQuestionnaireData } from '../../types/questionnaire-student';
import type { QuestionnaireFieldValue } from '../../types/questionnaire-common';
import { deriveGenerationFromBirthDate } from '../../utils/generation';
import { useAuth } from '../../hooks/useAuth';
import { ProfileError, getStudentProfile, submitStudentQuestionnaire, toStudentQuestionnaireData } from '../../services/questionnaireService';

export const StudentQuestionnairePage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  // Precarga nombre y email desde la cuenta recién creada (RegisterForm) para
  // no pedirlos de nuevo acá — se pisan igual si ya había un perfil guardado
  // (ver el useEffect de abajo) o si la persona los edita a mano.
  const [formData, setFormData] = useState<StudentQuestionnaireData>(() => {
    const empty = createEmptyStudentQuestionnaire();
    if (user) {
      empty.personalData.fullName = user.name;
      empty.personalData.contactEmail = user.email;
    }
    return empty;
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hadExistingProfile, setHadExistingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ver nota equivalente en HostQuestionnairePage.tsx: precarga el perfil ya
  // guardado en vez de arrancar en blanco. Fotos excluidas a propósito.
  useEffect(() => {
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }

    let cancelled = false;

    getStudentProfile(token)
      .then((profile) => {
        if (cancelled || !profile) return;
        setFormData(toStudentQuestionnaireData(profile));
        setHadExistingProfile(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error al cargar el perfil de estudiante existente', error);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleFieldChange = (sectionId: string, fieldId: string, value: QuestionnaireFieldValue) => {
    setFormData((prev) => {
      // El sectionId/fieldId llegan como string desde el schema en tiempo de
      // ejecución: StudentQuestionnaireData no tiene index signature (a
      // propósito, para que cada sección quede tipada de forma estricta), por
      // eso el cast puntual vía `unknown` acá.
      const currentSection = prev[sectionId as keyof StudentQuestionnaireData] as unknown as Record<string, QuestionnaireFieldValue>;
      const updatedSection: Record<string, QuestionnaireFieldValue> = { ...currentSection, [fieldId]: value };

      // Efecto derivado: la fecha de nacimiento calcula automáticamente la Generación (Filtro 2).
      if (sectionId === 'personalData' && fieldId === 'birthDate' && typeof value === 'string') {
        updatedSection.generation = deriveGenerationFromBirthDate(value);
      }

      return { ...prev, [sectionId]: updatedSection } as unknown as StudentQuestionnaireData;
    });
  };

  const handleComplete = async () => {
    if (!token) {
      // No debería pasar: esta página vive detrás de ProtectedRoute.
      setErrorMessage('Tu sesión expiró. Volvé a iniciar sesión.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await submitStudentQuestionnaire(formData, token);
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof ProfileError
        ? error.message
        : 'Ocurrió un error al guardar tu cuestionario. Probá de nuevo.';
      setErrorMessage(message);
      console.error('Error al guardar el cuestionario de student', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-8 space-y-4 text-center">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full text-sm font-semibold">
          <GraduationCap className="size-4" />
          Busco Casa con SI
        </div>
        <p className="text-base-content/60 max-w-md mx-auto">
          Completá tu perfil para poder explorar habitaciones y recibir propuestas de personas anfitrionas.
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="alert alert-error text-sm py-3 max-w-2xl mx-auto mb-6">
          <span>{errorMessage}</span>
        </div>
      )}

      {hadExistingProfile && !isLoadingProfile && (
        <div role="alert" className="alert bg-brand-orange/10 border border-brand-orange/20 text-sm py-3 max-w-2xl mx-auto mb-6">
          <span>
            Ya tenías este cuestionario completado — precargamos tus datos guardados. Las fotos no se muestran acá,
            pero se conservan tal como las subiste salvo que cargues una nueva.
          </span>
        </div>
      )}

      {isLoadingProfile ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-brand-orange" />
        </div>
      ) : (
        <QuestionnaireWizard
          sections={STUDENT_QUESTIONNAIRE_SCHEMA}
          values={formData as unknown as Record<string, Record<string, QuestionnaireFieldValue>>}
          onFieldChange={handleFieldChange}
          onComplete={handleComplete}
          isSubmitting={isSubmitting}
          accentColor="orange"
        />
      )}
    </div>
  );
};