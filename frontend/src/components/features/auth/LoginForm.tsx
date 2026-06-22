import { useState, type FormEvent } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';

export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isLoading?: boolean;
}

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-4">
        
        {/* Input: Correo Electrónico */}
        <div className="form-control w-full">
          <label className="label px-1 pt-0 pb-2">
            <span className="label-text font-semibold text-base-content/90">Correo electrónico</span>
          </label>
          {/* Solución: Se agregó w-full aquí */}
          <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal focus-within:outline-2 transition-all bg-base-100">
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
            <a href="#" className="label-text-alt link link-hover text-brand-teal font-medium transition-colors hover:text-brand-teal/80">
              ¿Olvidaste tu contraseña?
            </a>
          </label>
          {/* Solución: Se agregó w-full aquí */}
          <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal focus-within:outline-2 transition-all bg-base-100">
            <Lock className="h-5 w-5 text-base-content/40" />
            <input 
              type="password" 
              className="grow" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      {/* Botón de Submit */}
      <button 
        type="submit" 
        className="btn w-full bg-brand-orange hover:bg-brand-orange/90 text-white border-none shadow-sm transition-all"
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verificando...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

      {/* Separador UI */}
      <div className="divider text-base-content/40 text-sm font-medium my-6">O continúa con</div>

      {/* Botón de Social Login */}
      <button 
        type="button" 
        className="btn btn-outline w-full border-base-300 hover:bg-base-200 hover:border-base-400 text-base-content/80 transition-all font-medium"
        disabled={isLoading}
      >
        <img 
          src="https://www.svgrepo.com/show/475656/google-color.svg" 
          className="w-5 h-5 mr-2" 
          alt="Logo de Google" 
          loading="lazy"
        />
        Google
      </button>
    </form>
  );
};
