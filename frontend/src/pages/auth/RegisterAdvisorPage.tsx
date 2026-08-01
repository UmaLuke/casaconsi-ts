// src/pages/auth/RegisterAdvisorPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterAdvisorForm } from '../../components/features/auth/RegisterAdvisorForm';
import type { RegisterFormData } from '../../components/features/auth/RegisterForm';
import { BrandLogo } from "../../components/common/BrandLogo";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { registerRequest, AuthError } from '../../services/authService';

export const RegisterAdvisorPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (userData: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user, token, expiresAt } = await registerRequest(userData);
      login(user, token, expiresAt);
      // Los advisor no tienen cuestionario post-registro (todavía) — los
      // mandamos directo a /asesorias.
      navigate('/asesorias');
    } catch (error) {
      const message = error instanceof AuthError
        ? error.message
        : 'No pudimos conectar con el servidor. Probá de nuevo en un momento.';
      setErrorMessage(message);
      console.error('Error al registrar asesor', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-base-100 overflow-hidden">

      <div className="hidden lg:flex lg:w-1/2 relative bg-base-200 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-brand-navy/95 via-brand-navy/70 to-brand-navy/40" />

        <Link
          to="/"
          className="absolute top-12 left-12 lg:top-20 lg:left-20 z-20 inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold transition-colors"
        >
          <ArrowLeft className="size-5" />
          Volver al inicio
        </Link>

        <div className="relative z-10 w-full h-full flex flex-col justify-end p-12 lg:p-20 text-white">
          <div className="space-y-6">
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
              Sumá tu experiencia <br />
              <span className="text-brand-teal">profesional.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md font-medium">
              Acompañá a anfitriones y estudiantes en sus acuerdos de convivencia dentro de la red Casa con Sí.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-up p-8 sm:p-12 md:p-16 relative overflow-y-auto">

        <div className="lg:hidden absolute top-8 left-8">
          <Link to="/" className="btn btn-ghost btn-sm gap-2 text-base-content/70 hover:text-base-content">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-8 mt-12 lg:mt-0">

          <div className="lg:hidden flex justify-center mb-6">
            <BrandLogo />
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
              Postulate como asesor
            </h2>
            <p className="text-base-content/70">
              Completá tus datos para ser parte de nosotros.
            </p>
          </div>

          {errorMessage && (
            <div role="alert" className="alert alert-error text-sm py-3">
              <span>{errorMessage}</span>
            </div>
          )}

          <RegisterAdvisorForm onSubmit={handleRegister} isLoading={isLoading} />

          <p className="text-center text-sm text-base-content/70 font-medium">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/" className="text-brand-teal hover:underline font-bold transition-all">
              Volvé al inicio e iniciá sesión
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};