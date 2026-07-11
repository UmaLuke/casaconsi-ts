// src/components/features/questionnaire/QuestionnaireWizard.tsx
// Wizard genérico: recorre `sections` una a una, delega el render de cada
// campo a QuestionnaireField, y en la última sección dispara onComplete.
// Se usa tanto para StudentQuestionnairePage como para HostQuestionnairePage.
//
// Además de la navegación entre secciones, resuelve:
// - Campos condicionales (`dependsOn`): un campo solo se muestra (y solo se
//   exige si es obligatorio) cuando otro campo de la misma sección cumple
//   una condición (ej. "¿Cuáles?" de mascotas solo si hasPets === 'si').
// - Validación de obligatorios: no deja avanzar de sección si falta
//   completar un campo `required` que esté visible.
// - Indicador de progreso en forma de puntos, con navegación hacia atrás.

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import type {
  QuestionnaireFieldSchema,
  QuestionnaireFieldType,
  QuestionnaireFieldValue,
  QuestionnaireSectionSchema,
} from '../../../types/questionnaire-common';
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

const ACCENT_BUTTON_CLASS = {
  teal: 'bg-brand-teal hover:bg-brand-teal/90',
  orange: 'bg-brand-orange hover:bg-brand-orange/90',
} as const;

const ACCENT_DOT_CLASS = {
  teal: { current: 'bg-brand-teal', done: 'bg-brand-teal/40' },
  orange: { current: 'bg-brand-orange', done: 'bg-brand-orange/40' },
} as const;

/** ¿Este campo debe mostrarse, según el valor actual del campo del que depende? */
const isFieldVisible = (
  field: QuestionnaireFieldSchema,
  sectionValues: Record<string, QuestionnaireFieldValue>,
): boolean => {
  if (!field.dependsOn) return true;
  const dependencyValue = sectionValues[field.dependsOn.fieldId];

  if (field.dependsOn.includes !== undefined) {
    // `dependsOn.includes` solo tiene sentido para multiselects de strings (ej. barrios, intercambios).
    return Array.isArray(dependencyValue) && (dependencyValue as unknown as string[]).includes(field.dependsOn.includes);
  }
  if (field.dependsOn.equals !== undefined) {
    return dependencyValue === field.dependsOn.equals;
  }
  return true;
};

/** ¿Este valor cuenta como "completado" para un campo obligatorio? */
const isValueFilled = (fieldType: QuestionnaireFieldType, value: QuestionnaireFieldValue): boolean => {
  switch (fieldType) {
    case 'multiselect':
    case 'images':
      return Array.isArray(value) && value.length > 0;
    case 'image':
      return value instanceof File;
    case 'scale':
    case 'number':
      return value !== undefined && value !== null && value !== '';
    case 'auto':
      return true; // se calcula solo, no depende de que la persona lo complete
    default:
      return typeof value === 'string' && value.trim().length > 0;
  }
};

export const QuestionnaireWizard = ({
  sections,
  values,
  onFieldChange,
  onComplete,
  isSubmitting = false,
  accentColor,
}: QuestionnaireWizardProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showValidationError, setShowValidationError] = useState(false);

  const currentSection = sections[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === sections.length - 1;

  const currentSectionValues = values[currentSection.id] ?? {};
  const visibleFields = currentSection.fields.filter((field) => isFieldVisible(field, currentSectionValues));
  const missingRequiredFields = visibleFields.filter(
    (field) => field.required && !isValueFilled(field.type, currentSectionValues[field.id]),
  );

  // Si al tipear se completan los campos que faltaban, la advertencia se retira sola.
  useEffect(() => {
    if (missingRequiredFields.length === 0) setShowValidationError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingRequiredFields.length]);

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    setShowValidationError(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    if (missingRequiredFields.length > 0) {
      setShowValidationError(true);
      return;
    }
    if (isLastStep) {
      void onComplete();
      return;
    }
    goToStep(currentStepIndex + 1);
  };

  const goBack = () => goToStep(Math.max(currentStepIndex - 1, 0));

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
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

      {/* Campos de la sección actual (solo los visibles según dependsOn) */}
      <div className="space-y-5">
        {visibleFields.map((field) => (
          <QuestionnaireField
            key={field.id}
            field={field}
            value={currentSectionValues[field.id]}
            onChange={(value) => onFieldChange(currentSection.id, field.id, value)}
            accentColor={accentColor}
            disabled={isSubmitting}
            invalid={showValidationError && Boolean(field.required) && !isValueFilled(field.type, currentSectionValues[field.id])}
          />
        ))}
      </div>

      {showValidationError && missingRequiredFields.length > 0 && (
        <div role="alert" className="alert bg-error/10 border border-error/20 text-error text-sm py-3">
          Completá los campos obligatorios para continuar: {missingRequiredFields.map((f) => f.label).join(', ')}
        </div>
      )}

      {/* Navegación: Atrás — puntos de progreso — Siguiente/Finalizar */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-base-200">
        <button
          type="button"
          onClick={goBack}
          disabled={isFirstStep || isSubmitting}
          className="btn btn-ghost gap-2 disabled:opacity-0 shrink-0"
        >
          <ArrowLeft className="size-4" />
          Atrás
        </button>

        <div className="flex items-center gap-1.5 flex-wrap justify-center" role="tablist" aria-label="Progreso del cuestionario">
          {sections.map((section, index) => {
            const isCurrent = index === currentStepIndex;
            const isDone = index < currentStepIndex;
            const canNavigate = index <= currentStepIndex;
            const dotColor = isCurrent
              ? ACCENT_DOT_CLASS[accentColor].current
              : isDone
                ? ACCENT_DOT_CLASS[accentColor].done
                : 'bg-base-300';

            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={section.title}
                title={section.title}
                onClick={() => canNavigate && goToStep(index)}
                disabled={!canNavigate || isSubmitting}
                className={`rounded-full transition-all ${isCurrent ? 'size-3' : 'size-2'} ${dotColor} ${
                  canNavigate && !isCurrent ? 'cursor-pointer hover:opacity-70' : ''
                } ${!canNavigate ? 'cursor-not-allowed' : ''}`}
              />
            );
          })}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={`btn text-white border-none shadow-sm gap-2 transition-all shrink-0 ${ACCENT_BUTTON_CLASS[accentColor]}`}
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