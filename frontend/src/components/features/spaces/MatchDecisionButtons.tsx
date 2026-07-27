// src/components/features/spaces/MatchDecisionButtons.tsx
import { X, Check } from 'lucide-react';

export type DecisionStatus = 'idle' | 'loading' | 'liked' | 'passed';

interface MatchDecisionButtonsProps {
  status: DecisionStatus;
  onReject: () => void;
  onLike: () => void;
  className?: string;
}

// Par de botones (X para rechazar / tilde verde para marcar match) que se
// usa tanto en la card de ExploreSpacesPage como en SpaceDetailsModal, contra
// el mismo estado de decisión por Space (ver ExploreSpacesPage.decisions).
export const MatchDecisionButtons = ({ status, onReject, onLike, className = '' }: MatchDecisionButtonsProps) => {
  if (status === 'liked') {
    return (
      <div className={`flex items-center justify-center gap-2 text-sm font-bold text-success ${className}`}>
        <Check className="size-4" />
        <span>¡Le diste Like!</span>
      </div>
    );
  }

  if (status === 'passed') {
    return (
      <div className={`flex items-center justify-center gap-2 text-sm font-medium text-base-content/50 ${className}`}>
        <X className="size-4" />
        <span>Descartado</span>
      </div>
    );
  }

  const isLoading = status === 'loading';

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onReject}
        disabled={isLoading}
        aria-label="Rechazar"
        className="btn btn-circle btn-sm border-error/40 bg-error/10 hover:bg-error hover:text-white text-error disabled:opacity-50"
      >
        <X className="size-4" />
      </button>
      <button
        type="button"
        onClick={onLike}
        disabled={isLoading}
        aria-label="Marcar match"
        className="btn btn-circle btn-sm border-success/40 bg-success/10 hover:bg-success hover:text-white text-success disabled:opacity-50"
      >
        {isLoading ? <span className="loading loading-spinner loading-xs" /> : <Check className="size-4" />}
      </button>
    </div>
  );
};
