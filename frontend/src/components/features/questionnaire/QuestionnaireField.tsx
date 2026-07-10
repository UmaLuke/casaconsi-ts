// src/components/features/questionnaire/QuestionnaireField.tsx
// Renderer genérico: recibe la definición de UN campo (schema) + su valor
// actual, y dibuja el input correcto. Mantiene la misma identidad visual
// que RegisterForm.tsx (input-bordered, focus-within:outline-brand-*, etc.)

import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { QuestionnaireFieldSchema, QuestionnaireFieldValue } from '../../../types/questionnaire-common';
import { GENERATION_LABELS } from '../../../types/filters';

interface QuestionnaireFieldProps {
  field: QuestionnaireFieldSchema;
  value: QuestionnaireFieldValue;
  onChange: (value: QuestionnaireFieldValue) => void;
  /** host -> teal, student -> orange (coherente con RegisterForm.tsx) */
  accentColor: 'teal' | 'orange';
  disabled?: boolean;
}

const ACCENT_CLASSES = {
  teal: {
    focusInput: 'focus-within:outline-brand-teal focus:outline-brand-teal',
    activePill: 'bg-brand-teal text-white border-brand-teal',
  },
  orange: {
    focusInput: 'focus-within:outline-brand-orange focus:outline-brand-orange',
    activePill: 'bg-brand-orange text-white border-brand-orange',
  },
} as const;

const FieldLabel = ({ label, helperText, required }: { label: string; helperText?: string; required?: boolean }) => (
  <label className="label px-1 pt-0 pb-2 flex-col items-start">
    <span className="label-text font-semibold text-base-content/90">
      {label}
      {required && <span className="text-brand-orange ml-1">*</span>}
    </span>
    {helperText && <span className="label-text-alt text-base-content/50 mt-0.5">{helperText}</span>}
  </label>
);

/** Convierte un FileList del input a un array de File, sin usar `any`. */
const fileListToArray = (fileList: FileList | null): File[] => (fileList ? Array.from(fileList) : []);

export const QuestionnaireField = ({ field, value, onChange, accentColor, disabled = false }: QuestionnaireFieldProps) => {
  const accent = ACCENT_CLASSES[accentColor];

  switch (field.type) {
    case 'text': {
      const stringValue = typeof value === 'string' ? value : '';
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <label className={`input input-bordered flex items-center gap-3 w-full transition-all bg-base-100 ${accent.focusInput}`}>
            <input
              type="text"
              className="grow"
              placeholder={field.placeholder}
              value={stringValue}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              required={field.required}
            />
          </label>
        </div>
      );
    }

    case 'number': {
      const numericValue = typeof value === 'number' ? value : typeof value === 'string' ? value : '';
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <label className={`input input-bordered flex items-center gap-3 w-full transition-all bg-base-100 ${accent.focusInput}`}>
            <input
              type="number"
              className="grow"
              min={field.min}
              max={field.max}
              value={numericValue}
              onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={disabled}
              required={field.required}
            />
          </label>
        </div>
      );
    }

    case 'date': {
      const dateValue = typeof value === 'string' ? value : '';
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <label className={`input input-bordered flex items-center gap-3 w-full transition-all bg-base-100 ${accent.focusInput}`}>
            <input
              type="date"
              className="grow"
              value={dateValue}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              required={field.required}
            />
          </label>
        </div>
      );
    }

    case 'textarea': {
      const textValue = typeof value === 'string' ? value : '';
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <textarea
            className={`textarea textarea-bordered w-full transition-all bg-base-100 ${accent.focusInput}`}
            rows={3}
            placeholder={field.placeholder}
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={field.required}
          />
        </div>
      );
    }

    case 'select': {
      const selectValue = typeof value === 'string' ? value : '';
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <select
            className={`select select-bordered w-full transition-all bg-base-100 ${accent.focusInput}`}
            value={selectValue}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={field.required}
          >
            <option value="" disabled>Seleccionar...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      );
    }

    case 'multiselect': {
      const selectedValues = Array.isArray(value) ? (value as string[]) : [];
      const toggleOption = (optionValue: string) => {
        const isSelected = selectedValues.includes(optionValue);
        onChange(isSelected ? selectedValues.filter((v) => v !== optionValue) : [...selectedValues, optionValue]);
      };
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <div className="flex flex-wrap gap-2">
            {field.options?.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  disabled={disabled}
                  className={`btn btn-sm h-auto py-2 normal-case font-medium transition-all ${
                    isSelected ? accent.activePill : 'btn-outline border-base-300 text-base-content/70 hover:bg-base-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case 'scale': {
      const min = field.min ?? 1;
      const max = field.max ?? 5;
      const scaleValue = typeof value === 'number' ? value : min;
      const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
          <div className="flex gap-2">
            {steps.map((step) => (
              <button
                type="button"
                key={step}
                onClick={() => onChange(step)}
                disabled={disabled}
                aria-pressed={scaleValue === step}
                className={`btn btn-sm size-10 p-0 normal-case font-bold transition-all ${
                  scaleValue === step ? accent.activePill : 'btn-outline border-base-300 text-base-content/70 hover:bg-base-200'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      );
    }

    case 'image': {
      const fileValue = value instanceof File ? value : null;
      return <ImageField field={field} file={fileValue} onChange={(file) => onChange(file)} disabled={disabled} />;
    }

    case 'images': {
      const filesValue = Array.isArray(value) && value.every((item) => item instanceof File) ? (value as File[]) : [];
      return (
        <ImagesField
          field={field}
          files={filesValue}
          onChange={(files) => onChange(files)}
          disabled={disabled}
        />
      );
    }

    case 'auto': {
      // Se usa hoy solo para "generation": mostramos la etiqueta legible en vez del valor crudo.
      const generationValue = typeof value === 'string' ? value : null;
      const displayLabel = generationValue && generationValue in GENERATION_LABELS
        ? GENERATION_LABELS[generationValue as keyof typeof GENERATION_LABELS]
        : 'Completá tu fecha de nacimiento';
      return (
        <div className="form-control w-full">
          <FieldLabel label={field.label} helperText={field.helperText} />
          <div className="input input-bordered flex items-center w-full bg-base-200/60 text-base-content/70 font-medium">
            {displayLabel}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

/** Input de una sola imagen (ej. foto de perfil), con preview y opción de reemplazar/quitar. */
const ImageField = ({
  field,
  file,
  onChange,
  disabled,
}: {
  field: QuestionnaireFieldSchema;
  file: File | null;
  onChange: (file: File | null) => void;
  disabled: boolean;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="form-control w-full">
      <FieldLabel label={field.label} helperText={field.helperText} required={field.required} />
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt={field.label} className="size-20 rounded-lg object-cover border border-base-300" />
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              aria-label={`Quitar ${field.label}`}
              className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-base-100 border-base-300"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <label className="size-20 rounded-lg border-2 border-dashed border-base-300 flex items-center justify-center cursor-pointer hover:border-brand-teal transition-colors shrink-0">
            <ImagePlus className="size-6 text-base-content/40" />
            <input
              type="file"
              className="hidden"
              accept={field.accept ?? 'image/*'}
              disabled={disabled}
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>
    </div>
  );
};

/** Input de múltiples imágenes (ej. fotos del hogar), con grilla de previews. */
const ImagesField = ({
  field,
  files,
  onChange,
  disabled,
}: {
  field: QuestionnaireFieldSchema;
  files: File[];
  onChange: (files: File[]) => void;
  disabled: boolean;
}) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = (newFiles: File[]) => onChange([...files, ...newFiles]);
  const removeFileAt = (index: number) => onChange(files.filter((_, i) => i !== index));

  const helper = field.minCount
    ? `${field.helperText ? field.helperText + ' · ' : ''}${files.length}/${field.minCount} fotos cargadas (mínimo recomendado)`
    : field.helperText;

  return (
    <div className="form-control w-full">
      <FieldLabel label={field.label} helperText={helper} required={field.required} />
      <div className="flex flex-wrap gap-3">
        {previewUrls.map((url, index) => (
          <div key={url} className="relative">
            <img src={url} alt={`${field.label} ${index + 1}`} className="size-20 rounded-lg object-cover border border-base-300" />
            <button
              type="button"
              onClick={() => removeFileAt(index)}
              disabled={disabled}
              aria-label={`Quitar foto ${index + 1}`}
              className="btn btn-circle btn-xs absolute -top-2 -right-2 bg-base-100 border-base-300"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <label className="size-20 rounded-lg border-2 border-dashed border-base-300 flex items-center justify-center cursor-pointer hover:border-brand-teal transition-colors shrink-0">
          <ImagePlus className="size-6 text-base-content/40" />
          <input
            type="file"
            className="hidden"
            accept={field.accept ?? 'image/*'}
            multiple
            disabled={disabled}
            onChange={(e) => addFiles(fileListToArray(e.target.files))}
          />
        </label>
      </div>
    </div>
  );
};