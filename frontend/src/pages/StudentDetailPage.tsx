// src/pages/StudentDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Target, Clock, ArrowLeft } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TrustBadgeCompact } from '../components/common/TrustBadgeCompact';
import { MatchDecisionButtons, type DecisionStatus } from '../components/features/spaces/MatchDecisionButtons';
import { useAuth } from '../hooks/useAuth';
import { getInterestedStudentDetail, registerLikeDecision, MatchError } from '../services/matchService';
import type { StudentDetail } from '../types/match';
import { GENERATION_LABELS } from '../types/filters';
import { API_URL } from '../config';

const LEVEL_LABELS: Record<StudentDetail['trustLevel'], string> = {
  sin_verificar: 'Sin verificar',
  basico: 'Básico',
  alta_confianza: 'Alta confianza',
};

export const StudentDetailPage = () => {
  const { studentUserId } = useParams<{ studentUserId: string }>();
  const { token } = useAuth();

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>('idle');
  const [decisionError, setDecisionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !studentUserId) return;
    let cancelled = false;
    setIsLoading(true);
    getInterestedStudentDetail(token, studentUserId)
      .then((result) => { if (!cancelled) setStudent(result); })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof MatchError ? err.message : 'No se pudo cargar este perfil.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [token, studentUserId]);

  const handleDecide = async (liked: boolean) => {
    if (!student || !token) return;
    setDecisionError(null);
    setDecisionStatus('loading');
    try {
      await registerLikeDecision(token, student.userId, liked);
      setDecisionStatus(liked ? 'liked' : 'passed');
    } catch (err) {
      setDecisionStatus('idle');
      setDecisionError(err instanceof MatchError ? err.message : 'No se pudo registrar tu decisión. Probá de nuevo.');
    }
  };

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <Link to="/interesados" className="inline-flex items-center gap-2 text-brand-teal font-semibold text-sm mb-6">
            <ArrowLeft className="size-4" />
            Volver a interesados
          </Link>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <span className="loading loading-spinner loading-lg text-brand-teal" />
            </div>
          ) : loadError || !student ? (
            <div className="text-center py-24 px-4 border-2 border-dashed border-error/40 rounded-2xl">
              <p className="text-lg font-medium text-error">{loadError ?? 'No encontramos este perfil.'}</p>
            </div>
          ) : (
            <>
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-base-300 mb-6">
                {student.photoUrls.length > 0 ? (
                  <img
                    src={`${API_URL}${student.photoUrls[0]}`}
                    alt={student.fullName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-base-content/30">
                    Sin fotos todavía
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                  {student.fullName}
                </h1>
                <TrustBadgeCompact
                  score={student.trustScore}
                  level={student.trustLevel}
                  levelLabel={LEVEL_LABELS[student.trustLevel]}
                />
              </div>

              <div className="flex flex-wrap gap-4 mb-3">
                <span className="flex items-center gap-1.5 text-sm text-base-content/80">
                  <MapPin className="size-4 text-brand-teal" />
                  {student.preferredNeighborhoods.length > 0
                    ? `Busca en ${student.preferredNeighborhoods.join(', ')}`
                    : 'Sin zona preferida'}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-base-content/80">
                  <Target className="size-4 text-brand-orange" />
                  {student.studyOrWorkSummary}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-base-content/80">
                  <Clock className="size-4 text-brand-orange" />
                  {student.stayDuration || 'Duración no especificada'}
                </span>
              </div>
              <span className="badge badge-outline border-brand-teal/50 text-brand-teal bg-brand-teal/5 font-medium mb-6 inline-block">
                {GENERATION_LABELS[student.generation]}
              </span>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="pt-6 border-t border-base-200">
                    <h2 className="text-sm font-bold text-base-content/90 mb-2">Sobre mí</h2>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {student.aboutMe || 'Todavía no completó esta sección.'}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-base-200">
                    <h2 className="text-sm font-bold text-base-content/90 mb-2">Motivación</h2>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {student.motivation || 'Todavía no completó esta sección.'}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="border border-base-200 rounded-2xl p-5 sticky top-28">
                    <p className="text-sm text-base-content/70 mb-3">
                      ¿Te interesa este perfil para tu publicación?
                    </p>
                    {decisionError && <p className="text-xs text-error mb-3">{decisionError}</p>}
                    <MatchDecisionButtons
                      status={decisionStatus}
                      onReject={() => handleDecide(false)}
                      onLike={() => handleDecide(true)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};