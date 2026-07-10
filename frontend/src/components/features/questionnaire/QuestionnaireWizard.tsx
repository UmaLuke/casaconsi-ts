// src/components/features/questionnaire/QuestionnaireWizard.tsx
// Wizard genérico: recorre `sections` una a una, delega el render de cada
// campo a QuestionnaireField, y en la última sección dispara onComplete.
// Se usa tanto para StudentQuestionnairePage como para HostQuestionnairePage.

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { QuestionnaireFieldValue, QuestionnaireSectionSchema } from '../../../types/questionnaire-common';
import { QuestionnaireField } from './QuestionnaireField';

/**
 * `values` se tipa de forma genérica (Record) porque este wizard es reutilizado
 * por ambos cuestionarios (Student y Host), cada uno con su propio tipo de
 * datos estricto. Cada página (StudentQuestionnairePage / HostQuestionnairePage)
 * es responsable de castear su estado tipado al pasarlo acá, y de castearlo de
 * vuelta a su tipo estricto en el `onComplete`/`onFieldChange`.
 */
interface QuestionnaireWizardProps {
  sections: QuestionnaireSectionSchema[];
  values: Record<string, Record<string, QuestionnaireFieldValue>>;
  onFieldChange: (sectionId: string, fieldId: string, value: QuestionnaireFieldValue) => void;
  onComplete: () => void | Promise<void>;
  isSubmitting?: boolean;
  /** host -> teal, student -> orange (coherente con RegisterForm.tsx) */
  accentColor: 'teal' | 'orange';
}

const ACCENT_PROGRESS_CLASS = {
  teal: 'progress-secondary',
  orange: 'progress-accent',
} as const;

const ACCENT_BUTTON_CLASS = {
  teal: 'bg-brand-teal hover:bg-brand-teal/90',
  orange: 'bg-brand-orange hover:bg-brand-orange/90',
} as const;

export const QuestionnaireWizard = ({
  sections,
  values,
  onFieldChange,
  onComplete,
  isSubmitting = false,
  accentColor,
}: QuestionnaireWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentSection = sections[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === sections.length - 1;

  const currentSectionValues = values[currentSection.id] ?? {};

  const goNext = () => {
    if (isLastStep) {
      void onComplete();
      return;
    }
    setCurrentStepIndex((step) => Math.min(step + 1, sections.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentStepIndex((step) => Math.max(step - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-base-content/60">
          <span>Sección {currentStepIndex + 1} de {sections.length}</span>
          <span>{Math.round(((currentStepIndex + 1) / sections.length) * 100)}%</span>
        </div>
        <progress
          className={`progress w-full ${ACCENT_PROGRESS_CLASS[accentColor]}`}
          value={currentStepIndex + 1}
          max={sections.length}
        />
      </div>

      {/* Encabezado de sección */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-extrabold text-base-content tracking-tight">{currentSection.title}</h2>
          {currentSection.badge && (
            <span className="badge badge-sm bg-brand-orange/10 text-brand-orange border-brand-orange/20 font-semibold">
              {currentSection.badge}
            </span>
          )}
        </div>
        <p className="text-sm text-base-content/60">
          Los datos son confidenciales y se usan solo para el proceso de match.
        </p>
      </div>

      {/* Campos de la sección actual */}
      <div className="space-y-5">
        {currentSection.fields.map((field) => (
          <QuestionnaireField
            key={field.id}
            field={field}
            value={currentSectionValues[field.id]}
            onChange={(value) => onFieldChange(currentSection.id, field.id, value)}
            accentColor={accentColor}
            disabled={isSubmitting}
          />
        ))}
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-4 border-t border-base-200">
        <button
          type="button"
          onClick={goBack}
          disabled={isFirstStep || isSubmitting}
          className="btn btn-ghost gap-2 disabled:opacity-0"
        >
          <ArrowLeft className="size-4" />
          Atrás
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={`btn text-white border-none shadow-sm gap-2 transition-all ${ACCENT_BUTTON_CLASS[accentColor]}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando...
            </>
          ) : isLastStep ? (
            <>
              <Check className="size-4" />
              Finalizar cuestionario
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};