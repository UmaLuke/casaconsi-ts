// src/components/common/PasswordInput.tsx
import { useState, type InputHTMLAttributes } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  className?: string;
}

/**
 * Input de contraseña con botón para mostrar/ocultar el valor.
 * Reemplaza el bloque <label><Lock/><input type="password"/></label>
 * repetido en los formularios de auth y en el perfil de cuenta.
 */
export const PasswordInput = ({ className = 'grow', ...inputProps }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="input input-bordered flex items-center gap-3 w-full focus-within:outline-brand-teal focus-within:outline-2 transition-all bg-base-100">
      <Lock className="h-5 w-5 text-base-content/40 shrink-0" />
      <input type={visible ? 'text' : 'password'} className={className} {...inputProps} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="shrink-0 text-base-content/40 hover:text-base-content/70 transition-colors"
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </label>
  );
};
