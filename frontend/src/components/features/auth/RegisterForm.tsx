// src/components/features/auth/RegisterForm.tsx
import { useState, type FormEvent } from 'react';
import { Mail, Lock, User, Loader2, Home, GraduationCap } from 'lucide-react';

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'host' | 'student';
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export const RegisterForm = ({ onSubmit, isLoading = false }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    role: 'student', // Por defecto
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm mx-auto">
      
      {/* Selector de Rol (Anfitrión / Estudiante) */}
      <div className="form-control w-full">
        <label className="label px-1 pt-0 pb-2">
          <span className="label-text font-semibold text-base-content/90">¿Cómo quieres participar?</span>
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'host' })}
            className={`flex-1 btn h-auto py-3 flex flex-col gap-2 transition-all ${
              formData.role === 'host' 
                ? 'bg-brand-teal/10 border-brand-teal text-brand-teal hover:bg-brand-teal/20' 
                : 'btn-outline border-base-300 text-base-content/70 hover:bg-base-200'
            }`}
          >
            <Home className="size-5" />
            <span className="text-xs font-bold">Ofrecer Casa</span>
          </button>
          
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'student' })}
            className={`flex-1 btn h-auto py-3 flex flex-col gap-2 transition-all ${
              formData.role === 'student' 
                ? 'bg-brand-orange/10 border-brand-orange text-brand-orange hover:bg-brand-orange/20' 
                : 'btn-outline border-base-300 text-base-content/70 hover:bg-base-200'
            }`}
          >
            <GraduationCap className="size-5" />
            <span className="text-xs font-bold">Buscar Casa</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input: Nombre Completo */}
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

        {/* Input: Correo Electrónico */}
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
              placeholder="Mínimo 6 caracteres" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      {/* Botón de Submit */}
      <button 
        type="submit" 
        className="btn w-full bg-brand-orange hover:bg-brand-orange/90 text-white border-none shadow-sm mt-6 transition-all"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta'
        )}
      </button>

      {/* Términos y condiciones */}
      <p className="text-xs text-center text-base-content/60 mt-4 leading-relaxed font-medium">
        Al registrarte, aceptas nuestros <a href="#" className="underline hover:text-brand-teal transition-colors">Términos de Servicio</a> y <a href="#" className="underline hover:text-brand-teal transition-colors">Política de Privacidad</a>.
      </p>
    </form>
  );
};
