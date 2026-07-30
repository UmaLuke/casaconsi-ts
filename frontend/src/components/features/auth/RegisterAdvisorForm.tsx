// src/components/features/auth/RegisterAdvisorForm.tsx
import { useState, type FormEvent } from 'react';
import { Mail, Lock, User, Briefcase, Loader2 } from 'lucide-react';
import type { RegisterFormData } from './RegisterForm';

interface RegisterAdvisorFormProps {
  onSubmit: (data: RegisterFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export const RegisterAdvisorForm = ({ onSubmit, isLoading = false }: RegisterAdvisorFormProps) => {
  const [formData, setFormData] = useState<Omit<RegisterFormData, 'role'>>({
    name: '',
    email: '',
    password: '',
    profession: 'Trabajo Social',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({ ...formData, role: 'advisor' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">

      {/* Input: Nombre completo */}
      <div className="form-control w-full">
        <label className="label px-1 pt-0 pb-2">
          <span className="label-text font-semibold text-base-content/90">Nombre completo</span>
        </label>
        <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal transition-all bg-base-100">
          <User className="h-5 w-5 text-base-content/40" />
          <input
            type="text"
            className="grow"
            placeholder="Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Input: Profesión (temporal, hasta definir el alcance real del módulo) */}
      <div className="form-control w-full">
        <label className="label px-1 pt-0 pb-2">
          <span className="label-text font-semibold text-base-content/90">Profesión</span>
        </label>
        <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal transition-all bg-base-100">
          <Briefcase className="h-5 w-5 text-base-content/40" />
          <input
            type="text"
            className="grow"
            placeholder="Trabajo Social"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Input: Correo electrónico */}
      <div className="form-control w-full">
        <label className="label px-1 pt-0 pb-2">
          <span className="label-text font-semibold text-base-content/90">Correo electrónico</span>
        </label>
        <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal transition-all bg-base-100">
          <Mail className="h-5 w-5 text-base-content/40" />
          <input
            type="email"
            className="grow"
            placeholder="tu@correo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Input: Contraseña */}
      <div className="form-control w-full">
        <label className="label px-1 pt-0 pb-2">
          <span className="label-text font-semibold text-base-content/90">Contraseña</span>
        </label>
        <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal transition-all bg-base-100">
          <Lock className="h-5 w-5 text-base-content/40" />
          <input
            type="password"
            className="grow"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}"
            title="Debe tener al menos 8 caracteres, con una mayúscula, una minúscula, un número y un símbolo."
            disabled={isLoading}
          />
        </label>
        <span className="label-text-alt text-base-content/50 px-1 pt-1">
          Al menos 8 caracteres, con mayúscula, minúscula, número y un símbolo (ej: !@#$).
        </span>
      </div>

      <button
        type="submit"
        className="btn w-full bg-brand-teal hover:bg-brand-teal/90 text-white border-none shadow-sm mt-6 transition-all"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Enviando postulación...
          </>
        ) : (
          'Postularme como asesor'
        )}
      </button>

      <p className="text-xs text-center text-base-content/60 mt-4 leading-relaxed font-medium">
        Formulario temporal: el listado de campos puede cambiar cuando definamos el alcance final del módulo de Asesorías.
      </p>
    </form>
  );
};