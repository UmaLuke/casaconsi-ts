// src/pages/ProfilePage.tsx
// "Mi perfil": todo lo relacionado a la configuración de la CUENTA (datos de
// acceso, seguridad) + el perfil de match (host/student), acá mismo agrupado
// en acordeón por sección — ver QuestionnaireAccordion. No reemplaza al
// wizard (`/cuestionario/*`, primera vez post-registro), pero cubre la
// re-edición sin salir de "Mi perfil".
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { User as UserIcon, Mail, Camera, Loader2, ShieldCheck, FileEdit } from 'lucide-react';
import { PasswordInput } from '../components/common/PasswordInput';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { resolveAvatarUrl } from '../utils/avatar';
import { updateName, uploadAvatar, changePassword, changeEmail, AccountError } from '../services/accountService';
import { QuestionnaireAccordion } from '../components/features/questionnaire/QuestionnaireAccordion';
import { HOST_QUESTIONNAIRE_SCHEMA } from '../data/hostQuestionnaireSchema';
import { STUDENT_QUESTIONNAIRE_SCHEMA } from '../data/studentQuestionnaireSchema';
import { createEmptyHostQuestionnaire, type HostQuestionnaireData } from '../types/questionnaire-host';
import { createEmptyStudentQuestionnaire, type StudentQuestionnaireData } from '../types/questionnaire-student';
import type { QuestionnaireFieldValue } from '../types/questionnaire-common';
import { deriveGenerationFromBirthDate } from '../utils/generation';
import {
  ProfileError,
  getHostProfile,
  getStudentProfile,
  submitHostQuestionnaire,
  submitStudentQuestionnaire,
  toHostQuestionnaireData,
  toStudentQuestionnaireData,
} from '../services/questionnaireService';
import type { User } from '../types/auth';
import { getTrustStatus} from "../services/trustService";
import type { TrustStatus} from "../types/trust";
import { TrustBadge } from "../components/common/TrustBadge";
import { PremiumBadge } from "../components/common/PremiumBadge";
import { PhotoGalleryCard } from '../components/features/profile/PhotoGalleryCard';

type ProfileTab = 'cuenta' | 'seguridad' | 'match';

type FormMessage = { type: 'success' | 'error'; text: string } | null;

const ROLE_LABELS: Record<string, string> = {
  host: 'Anfitrión',
  student: 'Estudiante',
  advisor: 'Asesor',
};

const LEVEL_LABELS: Record<TrustStatus['level'], string> = {
  sin_verificar: 'Sin verificar',
  basico: 'Básico',
  alta_confianza: 'Alta confianza',
};

export const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('cuenta');

  if (!user || !token) return null;

  return (
    <div data-theme="light" className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="grow pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
              Mi perfil
            </h1>
            <p className="text-base-content/70 text-lg font-medium">
              Configurá tus datos de cuenta, tu seguridad y tu perfil de match.
            </p>
          </div>

          <div role="tablist" className="tabs tabs-boxed bg-base-200 w-fit">
            <button
              role="tab"
              className={`tab gap-2 ${activeTab === 'cuenta' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('cuenta')}
            >
              <UserIcon className="size-4" /> Datos de cuenta
            </button>
            <button
              role="tab"
              className={`tab gap-2 ${activeTab === 'seguridad' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('seguridad')}
            >
              <ShieldCheck className="size-4" /> Seguridad
            </button>
            {(user.role === 'student' || user.role === 'host') && (
              <button
                role="tab"
                className={`tab gap-2 ${activeTab === 'match' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('match')}
              >
                <FileEdit className="size-4" /> Mi perfil de match
              </button>
            )}
          </div>

          {activeTab === 'cuenta' && <AccountTab user={user} token={token} onUpdated={updateUser} />}
          {activeTab === 'seguridad' && <SecurityTab token={token} onUpdated={updateUser} />}
          {activeTab === 'match' && <MatchProfileTab role={user.role} token={token} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- Tab: Datos de cuenta (nombre + avatar) ---
const AccountTab = ({ user, token, onUpdated }: { user: User; token: string; onUpdated: (u: User) => void }) => {
  const [name, setName] = useState(user.name);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);
  const [trustStatus, setTrustStatus] = useState<TrustStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTrustStatus(token)
      .then((status) => {
        if (!cancelled) setTrustStatus(status);
      })
      .catch((err) => console.error('Error al obtener el estado de confianza', err));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSaveName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setIsSavingName(true);
    try {
      const updated = await updateName(name.trim(), token);
      onUpdated(updated);
      setMessage({ type: 'success', text: 'Nombre actualizado.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof AccountError ? err.message : 'No se pudo guardar el nombre.' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setIsUploadingAvatar(true);
    try {
      const updated = await uploadAvatar(file, token);
      onUpdated(updated);
      setMessage({ type: 'success', text: 'Foto de perfil actualizada.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof AccountError ? err.message : 'No se pudo subir la foto.' });
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className='card bg-base-100 border border-base-200 shadow-sm'>  
        <div className="card-body gap-6">
          {/* Avatar + insignia de confianza */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-brand-teal ring-offset-base-100 ring-offset-2">
                  <img src={resolveAvatarUrl(user.avatar, user.name)} alt={`Avatar de ${user.name}`} />
                </div>
              </div>
              <label className="btn btn-outline btn-sm gap-2">
                {isUploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            {trustStatus && (
              <div className="flex flex-col items-end gap-2">
                <TrustBadge
                  score={Math.min(trustStatus.score)}
                  maxScore={trustStatus.maxScore}
                  level={trustStatus.level}
                  levelLabel={LEVEL_LABELS[trustStatus.level]}
                />
                <PremiumBadge achieved={trustStatus.level === 'alta_confianza'} />
              </div>
            )}
          </div>

          {/* Nombre */}
          <form onSubmit={handleSaveName} className="space-y-3">
            <div className="form-control w-full">
              <label className="label px-1 pb-2">
                <span className="label-text font-semibold">Nombre completo</span>
              </label>
              <label className="input input-bordered flex items-center gap-3 w-full">
                <UserIcon className="h-5 w-5 text-base-content/40" />
                <input
                  type="text"
                  className="grow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSavingName}
                />
              </label>
            </div>

            <div className="form-control w-full">
              <label className="label px-1 pb-2">
                <span className="label-text font-semibold">Correo electrónico</span>
              </label>
              <label className="input input-bordered flex items-center gap-3 w-full bg-base-200/60">
                <Mail className="h-5 w-5 text-base-content/40" />
                <input type="email" className="grow" value={user.email} disabled readOnly />
              </label>
              <span className="label-text-alt text-base-content/50 px-1 pt-1">
                Para cambiar el correo, usá la pestaña "Seguridad".
              </span>
            </div>

            <div className="form-control w-full">
              <label className="label px-1 pb-2">
                <span className="label-text font-semibold">Rol</span>
              </label>
              <span className="badge badge-lg capitalize">{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>

            {message && (
              <p className={`text-sm font-medium ${message.type === 'success' ? 'text-success' : 'text-error'}`}>
                {message.text}
              </p>
            )}

            <button type="submit" className="btn bg-brand-orange hover:bg-brand-orange/90 text-white border-none" disabled={isSavingName}>
              {isSavingName ? <Loader2 className="size-4 animate-spin" /> : 'Guardar nombre'}
            </button>
          </form>
        </div>
      </div>

      <PhotoGalleryCard user={user} token={token} onUpdated={onUpdated} />
    </div>
  );
};

// --- Tab: Seguridad (contraseña + email) ---
const SecurityTab = ({ token, onUpdated }: { token: string; onUpdated: (u: User) => void }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<FormMessage>(null);

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<FormMessage>(null);

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage(null);
    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword, token);
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof AccountError ? err.message : 'No se pudo cambiar la contraseña.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailMessage(null);
    setIsChangingEmail(true);
    try {
      const updated = await changeEmail(newEmail.trim(), emailPassword, token);
      onUpdated(updated);
      setEmailMessage({ type: 'success', text: 'Correo actualizado.' });
      setNewEmail('');
      setEmailPassword('');
    } catch (err) {
      setEmailMessage({ type: 'error', text: err instanceof AccountError ? err.message : 'No se pudo cambiar el correo.' });
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
      {/* Cambiar contraseña */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Cambiar contraseña</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <PasswordInput
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={isChangingPassword}
            />
            <PasswordInput
              placeholder="Nueva contraseña (mín. 8)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={isChangingPassword}
            />
            {passwordMessage && (
              <p className={`text-sm font-medium ${passwordMessage.type === 'success' ? 'text-success' : 'text-error'}`}>
                {passwordMessage.text}
              </p>
            )}
            <button type="submit" className="btn btn-outline btn-sm" disabled={isChangingPassword}>
              {isChangingPassword ? <Loader2 className="size-4 animate-spin" /> : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>

      {/* Cambiar email */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body gap-4">
          <h2 className="card-title text-base">Cambiar correo electrónico</h2>
          <form onSubmit={handleChangeEmail} className="space-y-3">
            <label className="input input-bordered flex items-center gap-3 w-full">
              <Mail className="h-5 w-5 text-base-content/40" />
              <input
                type="email"
                className="grow"
                placeholder="Nuevo correo"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                disabled={isChangingEmail}
              />
            </label>
            <PasswordInput
              placeholder="Contraseña actual"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
              disabled={isChangingEmail}
            />
            {emailMessage && (
              <p className={`text-sm font-medium ${emailMessage.type === 'success' ? 'text-success' : 'text-error'}`}>
                {emailMessage.text}
              </p>
            )}
            <button type="submit" className="btn btn-outline btn-sm" disabled={isChangingEmail}>
              {isChangingEmail ? <Loader2 className="size-4 animate-spin" /> : 'Actualizar correo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Tab: Mi perfil de match ---
// Muestra las secciones del cuestionario (host u student, según el rol) en
// acordeón — precarga lo ya guardado (mismo mapeo que usan las páginas del
// wizard, ver questionnaireService.ts) y guarda con el mismo submit* que usa
// el wizard, así que queda 100% alineado con esa validación/persistencia.
const MatchProfileTab = ({ role, token }: { role: User['role']; token: string }) => {
  if (role === 'host') return <HostMatchProfile token={token} />;
  return <StudentMatchProfile token={token} />;
};

const HostMatchProfile = ({ token }: { token: string }) => {
  const [formData, setFormData] = useState<HostQuestionnaireData>(createEmptyHostQuestionnaire());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  useEffect(() => {
    let cancelled = false;
    getHostProfile(token)
      .then((profile) => {
        if (!cancelled && profile) setFormData(toHostQuestionnaireData(profile));
      })
      .catch((err) => console.error('Error al cargar el perfil de anfitrión existente', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleFieldChange = (sectionId: string, fieldId: string, value: QuestionnaireFieldValue) => {
    setFormData((prev) => {
      const currentSection = prev[sectionId as keyof HostQuestionnaireData] as unknown as Record<string, QuestionnaireFieldValue>;
      const updatedSection: Record<string, QuestionnaireFieldValue> = { ...currentSection, [fieldId]: value };
      if (sectionId === 'personalData' && fieldId === 'birthDate' && typeof value === 'string') {
        updatedSection.generation = deriveGenerationFromBirthDate(value);
      }
      return { ...prev, [sectionId]: updatedSection } as unknown as HostQuestionnaireData;
    });
  };

  const handleSave = async () => {
    setMessage(null);
    setIsSaving(true);
    try {
      await submitHostQuestionnaire(formData, token);
      setMessage({ type: 'success', text: 'Perfil de anfitrión actualizado.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ProfileError ? err.message : 'No se pudo guardar el perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {message && (
        <p className={`text-sm font-medium ${message.type === 'success' ? 'text-success' : 'text-error'}`}>{message.text}</p>
      )}
      <QuestionnaireAccordion
        sections={HOST_QUESTIONNAIRE_SCHEMA}
        values={formData as unknown as Record<string, Record<string, QuestionnaireFieldValue>>}
        onFieldChange={handleFieldChange}
        onSave={handleSave}
        isSaving={isSaving}
        accentColor="teal"
      />
    </div>
  );
};

const StudentMatchProfile = ({ token }: { token: string }) => {
  const [formData, setFormData] = useState<StudentQuestionnaireData>(createEmptyStudentQuestionnaire());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage>(null);

  useEffect(() => {
    let cancelled = false;
    getStudentProfile(token)
      .then((profile) => {
        if (!cancelled && profile) setFormData(toStudentQuestionnaireData(profile));
      })
      .catch((err) => console.error('Error al cargar el perfil de estudiante existente', err))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleFieldChange = (sectionId: string, fieldId: string, value: QuestionnaireFieldValue) => {
    setFormData((prev) => {
      const currentSection = prev[sectionId as keyof StudentQuestionnaireData] as unknown as Record<string, QuestionnaireFieldValue>;
      const updatedSection: Record<string, QuestionnaireFieldValue> = { ...currentSection, [fieldId]: value };
      if (sectionId === 'personalData' && fieldId === 'birthDate' && typeof value === 'string') {
        updatedSection.generation = deriveGenerationFromBirthDate(value);
      }
      return { ...prev, [sectionId]: updatedSection } as unknown as StudentQuestionnaireData;
    });
  };

  const handleSave = async () => {
    setMessage(null);
    setIsSaving(true);
    try {
      await submitStudentQuestionnaire(formData, token);
      setMessage({ type: 'success', text: 'Perfil de estudiante actualizado.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ProfileError ? err.message : 'No se pudo guardar el perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {message && (
        <p className={`text-sm font-medium ${message.type === 'success' ? 'text-success' : 'text-error'}`}>{message.text}</p>
      )}
      <QuestionnaireAccordion
        sections={STUDENT_QUESTIONNAIRE_SCHEMA}
        values={formData as unknown as Record<string, Record<string, QuestionnaireFieldValue>>}
        onFieldChange={handleFieldChange}
        onSave={handleSave}
        isSaving={isSaving}
        accentColor="orange"
      />
    </div>
  );
};
