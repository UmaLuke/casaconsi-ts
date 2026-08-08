// src/components/features/questionnaire/QuestionnaireAccordion.tsx
// Variante de QuestionnaireWizard para "Mi perfil de match" (ver
// ProfilePage.tsx): en vez de recorrer las secciones paso a paso, las
// muestra todas colapsadas en acordeón (una abierta a la vez) para poder
// editar cualquiera sin tener que recorrer las demás. Reutiliza
// QuestionnaireField para cada campo, y isFieldVisible/isValueFilled
// (exportados desde QuestionnaireWizard) para los condicionales `dependsOn`
// y para el chip de completitud de cada sección.
//
// A diferencia del wizard, acá el guardado es uno solo para todo el
// cuestionario (el backend no soporta guardar una sección sola — PUT
// /api/profile/host|student espera el DTO completo), así que "Guardar
// cambios" valida los obligatorios de TODAS las secciones antes de llamar a
// onSave, no solo de la sección abierta.
import { useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import type { QuestionnaireFieldValue, QuestionnaireSectionSchema } from '../../../types/questionnaire-common';
import { QuestionnaireField } from './QuestionnaireField';
import { isFieldVisible, isValueFilled } from './QuestionnaireWizard';

interface QuestionnaireAccordionProps {
  sections: QuestionnaireSectionSchema[];
  values: Record<string, Record<string, QuestionnaireFieldValue>>;
  onFieldChange: (sectionId: string, fieldId: string, value: QuestionnaireFieldValue) => void;
  onSave: () => void | Promise<void>;
  isSaving?: boolean;
  /** host -> teal, student -> orange (coherente con QuestionnaireWizard/RegisterForm) */
  accentColor: 'teal' | 'orange';
}

const ACCENT_BUTTON_CLASS = {
  teal: 'bg-brand-teal hover:bg-brand-teal/90',
  orange: 'bg-brand-orange hover:bg-brand-orange/90',
} as const;

const ACCENT_BADGE_CLASS = {
  teal: 'bg-brand-teal/10 text-brand-teal',
  orange: 'bg-brand-orange/10 text-brand-orange',
} as const;

/** Campos visibles de una sección que son obligatorios y todavía no están completos. */
const missingFieldsOf = (
  section: QuestionnaireSectionSchema,
  sectionValues: Record<string, QuestionnaireFieldValue>,
) =>
  section.fields.filter(
    (field) =>
      isFieldVisible(field, sectionValues) &&
      field.required &&
      !isValueFilled(field.type, sectionValues[field.id]),
  );

export const QuestionnaireAccordion = ({
  sections,
  values,
  onFieldChange,
  onSave,
  isSaving = false,
  accentColor,
}: QuestionnaireAccordionProps) => {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sections[0]?.id ?? null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSectionId((current) => (current === sectionId ? null : sectionId));
  };

  const handleSave = async () => {
    const sectionsWithMissing = sections
      .map((section) => ({ section, missing: missingFieldsOf(section, values[section.id] ?? {}) }))
      .filter(({ missing }) => missing.length > 0);

    if (sectionsWithMissing.length > 0) {
      setOpenSectionId(sectionsWithMissing[0].section.id);
      setValidationError(
        `Faltan datos obligatorios en: ${sectionsWithMissing.map(({ section }) => section.title).join(', ')}.`,
      );
      return;
    }

    setValidationError(null);
    await onSave();
  };

  return (
    <div className="space-y-3">
      {validationError && (
        <div role="alert" className="alert bg-error/10 border border-error/20 text-error text-sm py-3">
          {validationError}
        </div>
      )}

      {sections.map((section) => {
        const sectionValues = values[section.id] ?? {};
        const missing = missingFieldsOf(section, sectionValues);
        const isOpen = openSectionId === section.id;
        const visibleFields = section.fields.filter((field) => isFieldVisible(field, sectionValues));

        return (
          <div key={section.id} className="border border-base-200 rounded-xl bg-base-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-base-content">{section.title}</span>
                {missing.length === 0 ? (
                  <span className={`badge badge-sm gap-1 border-none ${ACCENT_BADGE_CLASS[accentColor]}`}>
                    <Check className="size-3" /> Completo
                  </span>
                ) : (
                  <span className="badge badge-sm badge-outline border-base-300 text-base-content/50">
                    Faltan datos
                  </span>
                )}
              </div>
              <ChevronDown className={`size-4 text-base-content/40 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-5 pt-1 space-y-5 border-t border-base-200">
                {visibleFields.map((field) => (
                  <QuestionnaireField
                    key={field.id}
                    field={field}
                    value={sectionValues[field.id]}
                    onChange={(value) => onFieldChange(section.id, field.id, value)}
                    accentColor={accentColor}
                    disabled={isSaving}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        aria-busy={isSaving}
        className={`btn text-white border-none shadow-sm gap-2 w-full sm:w-auto ${ACCENT_BUTTON_CLASS[accentColor]}`}
      >
        {isSaving ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Guardando...
          </>
        ) : (
          'Guardar cambios'
        )}
      </button>
    </div>
  );
};
