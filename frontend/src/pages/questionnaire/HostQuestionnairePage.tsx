// src/pages/questionnaire/HostQuestionnairePage.tsx
// Se llega acá después de crear la cuenta básica con role: 'host'
// (RegisterForm -> RegisterPage -> navigate('/cuestionario/ofrecer')).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { QuestionnaireWizard } from '../../components/features/questionnaire/QuestionnaireWizard';
import { HOST_QUESTIONNAIRE_SCHEMA } from '../../data/hostQuestionnaireSchema';
import { createEmptyHostQuestionnaire, type HostQuestionnaireData } from '../../types/questionnaire-host';
import type { QuestionnaireFieldValue } from '../../types/questionnaire-common';
import { deriveGenerationFromBirthDate } from '../../utils/generation';
import { useAuth } from '../../hooks/useAuth';
import { ProfileError, submitHostQuestionnaire } from '../../services/questionnaireService';

export const HostQuestionnairePage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState<HostQuestionnaireData>(createEmptyHostQuestionnaire());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFieldChange = (sectionId: string, fieldId: string, value: QuestionnaireFieldValue) => {
    setFormData((prev) => {
      // El sectionId/fieldId llegan como string desde el schema en tiempo de
      // ejecución: HostQuestionnaireData no tiene index signature (a
      // propósito, para que cada sección quede tipada de forma estricta), por
      // eso el cast puntual vía `unknown` acá.
      const currentSection = prev[sectionId as keyof HostQuestionnaireData] as unknown as Record<string, QuestionnaireFieldValue>;
      const updatedSection: Record<string, QuestionnaireFieldValue> = { ...currentSection, [fieldId]: value };

      // Efecto derivado: la fecha de nacimiento calcula automáticamente la Generación (Filtro 2).
      if (sectionId === 'personalData' && fieldId === 'birthDate' && typeof value === 'string') {
        updatedSection.generation = deriveGenerationFromBirthDate(value);
      }

      return { ...prev, [sectionId]: updatedSection } as unknown as HostQuestionnaireData;
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
      await submitHostQuestionnaire(formData, token);
      navigate('/dashboard');
    } catch (error) {
      const message = error instanceof ProfileError
        ? error.message
        : 'Ocurrió un error al guardar tu cuestionario. Probá de nuevo.';
      setErrorMessage(message);
      console.error('Error al guardar el cuestionario de host', error);
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
        <div className="inline-flex items-center gap-2 bg-brand-teal/10 text-brand-teal px-4 py-2 rounded-full text-sm font-semibold">
          <Home className="size-4" />
          Ofrezco Casa con SI
        </div>
        <p className="text-base-content/60 max-w-md mx-auto">
          Completá tu perfil para poder publicar tu habitación y recibir propuestas de personas interesadas.
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="alert alert-error text-sm py-3 max-w-2xl mx-auto mb-6">
          <span>{errorMessage}</span>
        </div>
      )}

      <QuestionnaireWizard
        sections={HOST_QUESTIONNAIRE_SCHEMA}
        values={formData as unknown as Record<string, Record<string, QuestionnaireFieldValue>>}
        onFieldChange={handleFieldChange}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
        accentColor="teal"
      />
    </div>
  );
};