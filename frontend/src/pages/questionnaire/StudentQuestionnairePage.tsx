// src/pages/questionnaire/StudentQuestionnairePage.tsx
// Se llega acá después de crear la cuenta básica con role: 'student'
// (RegisterForm -> RegisterPage -> navigate('/cuestionario/buscar')).

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo';
import { QuestionnaireWizard } from '../../components/features/questionnaire/QuestionnaireWizard';
import { STUDENT_QUESTIONNAIRE_SCHEMA } from '../../data/studentQuestionnaireSchema';
import { createEmptyStudentQuestionnaire, type StudentQuestionnaireData } from '../../types/questionnaire-student';
import type { QuestionnaireFieldValue } from '../../types/questionnaire-common';
import { deriveGenerationFromBirthDate } from '../../utils/generation';

export const StudentQuestionnairePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StudentQuestionnaireData>(createEmptyStudentQuestionnaire());
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      // TODO: reemplazar por el POST real al backend .NET cuando esté disponible
      // (services/questionnaireService.ts). Por ahora simulamos guardado exitoso.
      console.log('Cuestionario BUSCO CASA CON SI completo:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      navigate('/dashboard');
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

      <QuestionnaireWizard
        sections={STUDENT_QUESTIONNAIRE_SCHEMA}
        values={formData as unknown as Record<string, Record<string, QuestionnaireFieldValue>>}
        onFieldChange={handleFieldChange}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
        accentColor="orange"
      />
    </div>
  );
};