// src/components/features/auth/LoginModal.tsx
import { Link } from 'react-router-dom';
import { LoginForm, type LoginFormData } from './LoginForm';
import { useAuth } from '../../../hooks/useAuth';
import type { User } from '../../../types/auth';

export const LoginModal = () => {
  const { login } = useAuth();

  const handleLogin = async (credentials: LoginFormData) => {
    const mockUser: User = {
      name: "Luni Pozzo",
      email: credentials.email,
      role: "Fundadora",
      avatar: "/casa1.png"
    };
    
    login(mockUser);
    (document.getElementById('login_modal') as HTMLDialogElement | null)?.close();
  };

  const handleCloseModal = () => {
    (document.getElementById('login_modal') as HTMLDialogElement | null)?.close();
  };

  return (
    <dialog id="login_modal" className="modal modal-bottom sm:modal-middle transition-all duration-300">
      <div className="modal-box p-0 overflow-hidden bg-base-100 shadow-2xl">
        
        {/* Cabecera del Modal */}
        <div className="bg-brand-teal/50 p-6 flex justify-between items-center border-b border-base-300">
          <div>
            <h3 className="font-extrabold text-2xl text-base-content tracking-tight">¡Hola de nuevo!</h3>
            <p className="text-sm text-base-content/70 mt-1 font-medium">Ingresa a tu cuenta para continuar.</p>
          </div>
          <form method="dialog">
            {/* Botón para cerrar (la 'X') */}
            <button 
              className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:bg-base-300 hover:text-base-content transition-colors"
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </form>
        </div>

        {/* Cuerpo del Modal (Inyectamos el formulario independiente) */}
        <div className="p-6 sm:p-8 flex justify-center">
          <LoginForm onSubmit={handleLogin} isLoading={false} />
        </div>

        {/* Pie del Modal */}
        <div className="bg-brand-teal/50 p-5 text-center border-t border-base-300">
          <p className="text-sm text-base-content/70 font-medium">
            ¿Aún no tienes una cuenta?{' '}
            {/* Redirige a registro y cierra el modal al mismo tiempo */}
            <Link 
              to="/register" 
              className="text-brand-orange hover:text-brand-orange/80 hover:underline font-bold transition-colors"
              onClick={handleCloseModal}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

      </div>
      
      {/* Overlay oscuro: permite cerrar el modal haciendo clic fuera de la caja */}
      <form method="dialog" className="modal-backdrop bg-base-content/20 backdrop-blur-sm">
        <button>cerrar</button>
      </form>
    </dialog>
  );
};
