// src/components/features/auth/LoginModal.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm, type LoginFormData } from './LoginForm';
import { useAuth } from '../../../hooks/useAuth';
import { loginRequest, AuthError } from '../../../services/authService';

export const LoginModal = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, token } = await loginRequest(credentials);
      login(user, token);

      const modal = document.getElementById('login_modal') as HTMLDialogElement | null;
      if (modal) {
        modal.close();
      }

      navigate('/explorar');
    } catch (error) {
      const message = error instanceof AuthError
        ? error.message
        : 'No pudimos conectar con el servidor. Probá de nuevo en un momento.';
      setErrorMessage(message);
      console.error('Error al iniciar sesión', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    const modal = document.getElementById('login_modal') as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  return (
    <dialog id="login_modal" className="modal modal-bottom sm:modal-middle transition-all duration-300">
      <div className="modal-box p-0 overflow-hidden bg-base-100 shadow-2xl">
        
        {/* Header del Modal */}
        <div className="bg-brand-teal  p-6 flex justify-between items-center border-b border-base-200">
          <div>
            <h3 className="font-extrabold text-2xl text-base-white tracking-tight">¡Hola de nuevo!</h3>
            <p className="text-sm text-base-white/70 mt-1 font-medium">Ingresa a tu cuenta para continuar.</p>
          </div>
          <form method="dialog">
            <button 
              className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:bg-base-300 hover:text-base-content transition-colors"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </form>
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 sm:p-8 flex flex-col items-center gap-4">
          {errorMessage && (
            <div role="alert" className="alert alert-error text-sm py-3 w-full max-w-sm">
              <span>{errorMessage}</span>
            </div>
          )}
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>

        {/* Footer de Registro */}
        <div className="bg-brand-teal p-5 text-center border-t border-brand-teal/10">
          <p className="text-sm text-base-white/70 font-medium">
            ¿Aún no tienes una cuenta?{' '}
            <Link 
              to="/register" 
              className="text-brand-orange hover:text-brand-orange/70 hover:underline font-bold transition-colors"
              onClick={handleCloseModal}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
      
      {/* Clic fuera del modal para cerrar */}
      <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-sm">
        <button>cerrar</button>
      </form>
    </dialog>
  );
};