// src/types/index.ts
export type { User, UserRole, AuthContextValue } from './auth';
export type { Space } from './space';
export type { MatchSummary } from './match';
export type { FeaturedVideo } from './video';
export type { Review } from './testimonial';
export type { ProcessStep } from './process-step';
export type { Generation, AgeRange, Purpose, Duration, SpaceFilters } from './filters';
export { ageRangeToGeneration, canMatch, GENERATION_LABELS, PURPOSE_LABELS, DURATION_LABELS } from './filters';
export type { StudentQuestionnaireData } from './questionnaire-student';
export { createEmptyStudentQuestionnaire } from './questionnaire-student';
export type { HostQuestionnaireData } from './questionnaire-host';
export { createEmptyHostQuestionnaire } from './questionnaire-host';
export type {
  QuestionnaireFieldType,
  QuestionnaireOption,
  QuestionnaireFieldValue,
  QuestionnaireFieldSchema,
  QuestionnaireSectionSchema,
  QuestionnaireValues,
  GenerationPreference,
  YesNo,
  YesNoDepende,
} from './questionnaire-common';