// src/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm, type RegisterFormData } from '../../components/features/auth/RegisterForm';
import { BrandLogo } from "../../components/common/BrandLogo";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { registerRequest, AuthError } from '../../services/authService';

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (userData: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, token, expiresAt } = await registerRequest(userData);

      // Dejamos a la persona autenticada y la mandamos a completar
      // el cuestionario obligatorio de su rol.
      login(user, token, expiresAt);
      navigate(user.role === 'host' ? '/cuestionario/ofrecer' : '/cuestionario/buscar');
    } catch (error) {
      const message = error instanceof AuthError
        ? error.message
        : 'No pudimos conectar con el servidor. Probá de nuevo en un momento.';
      setErrorMessage(message);
      console.error('Error al registrar', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-base-100 overflow-hidden">
      
      {/* Panel Izquierdo: Visual & Branding (Oculto en móviles) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-base-200 overflow-hidden">
        {/* Imagen de fondo premium */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop')" }}
        />
        {/* Overlay con gradiente corporativo para garantizar legibilidad */}
        <div className="absolute inset-0 bg-linear-to-t from-brand-navy/95 via-brand-navy/70 to-brand-navy/40" />

        {/* Botón de Regreso: reemplaza al logo, fijo arriba a la izquierda.
            z-20 (no z-10): el div del texto hero de más abajo también es
            z-10 y, al venir después en el DOM, ganaba el empate y tapaba
            este link con su caja completa (w-full h-full), aunque
            visualmente esa zona se vea vacía por el justify-end. */}
        <Link
          to="/"
          className="absolute top-12 left-12 lg:top-20 lg:left-20 z-20 inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="size-5" />
          Volver al inicio
        </Link>

        {/* Texto hero: centrado verticalmente */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 lg:p-20 text-white">
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
              Comienza tu historia <br />
              <span className="text-brand-orange">de convivencia.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md font-medium">
              Únete a la red donde propietarios aseguran el rendimiento de sus inmuebles y jóvenes encuentran el lugar ideal para su desarrollo.
            </p>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Formulario de Registro (con su propio scroll interno) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-up p-8 sm:p-12 md:p-16 relative overflow-y-auto">
        
        {/* Botón de Regreso: solo mobile/tablet; en desktop vive en el panel izquierdo */}
        <div className="lg:hidden absolute top-8 left-8">
          <Link to="/" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-8 mt-12 lg:mt-0">
          
          {/* Logo visible solo en móvil */}
          <div className="lg:hidden flex justify-center mb-6">
            <BrandLogo />
          </div>

          {/* Header del Formulario */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
              Crea tu cuenta
            </h2>
            <p className="text-base-content/70">
              Completa tus datos para unirte a CASA CON SI.
            </p>
          </div>

          {/* Mensaje de error del backend (email duplicado, contraseña débil, etc.) */}
          {errorMessage && (
            <div role="alert" className="alert alert-error text-sm py-3">
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Instancia del Formulario */}
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          {/* Footer de navegación */}
          <p className="text-center text-sm text-base-content/70 font-medium">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/" className="text-brand-teal hover:underline font-bold transition-all">
              Vuelve al inicio e inicia sesión
            </Link>
          </p>
        </div>
      </div>
      
    </div>
  );
};