// src/pages/InterestedStudentsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, User as UserIcon } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { TrustBadgeCompact } from '../components/common/TrustBadgeCompact';
import { useAuth } from '../hooks/useAuth';
import { getInterestedStudents, MatchError } from '../services/matchService';
import type { InterestedStudent } from '../types/match';
import { API_URL } from '../config';

export const InterestedStudentsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState<InterestedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getInterestedStudents(token)
      .then((result) => { if (!cancelled) setStudents(result); })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof MatchError ? err.message : 'No se pudieron cargar los estudiantes interesados.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20 md:pl-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              Interesados en tu publicación
            </h1>
            <p className="text-base-content/70 text-lg max-w-2xl font-medium">
              Estudiantes que ya mostraron interés — decidí si también avanzás vos.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-brand-teal" />
            </div>
          ) : error ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-error/40 rounded-2xl">
              <p className="text-lg font-medium text-error">{error}</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-base-300 rounded-2xl">
              <UserRound className="size-10 mx-auto text-base-content/30 mb-4" />
              <p className="text-lg font-medium text-base-content/60">
                Todavía nadie mostró interés en tu publicación.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {students.map((student) => (
                <button
                  key={student.userId}
                  onClick={() => navigate(`/interesados/${student.userId}`)}
                  className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow text-left"
                >
                  <figure className="relative aspect-4/3 overflow-hidden bg-base-200">
                    {student.profilePhotoUrl ? (
                      <img
                        src={`${API_URL}${student.profilePhotoUrl}`}
                        alt={student.fullName}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <UserIcon className="size-10 text-base-content/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full shadow-sm">
                      <TrustBadgeCompact score={student.trustScore} level={student.trustLevel} levelLabel="" hideLabel />
                    </div>
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="card-title text-base leading-tight">{student.fullName}</h3>
                    <p className="text-sm text-base-content/70 truncate">{student.studyOrWorkSummary}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};