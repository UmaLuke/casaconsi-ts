// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Layouts
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// 2. Todos tus componentes del Landing (¡Ninguno se queda afuera!)
import { Hero } from './components/features/landing/Hero';
import { HowItWorks } from './components/features/landing/HowItWorks';
import { ExploreSpaces } from './components/features/landing/ExploreSpaces';
import { FeaturedVideos } from './components/features/landing/FeaturedVideos';
import { Testimonials } from './components/features/landing/Testimonials';

// 3. Vistas completas
import { LoginPage } from './pages/auth/LoginPage';
// import { LandingPage } from './pages/LandingPage'; // <-- Veo que tienes este archivo, si unificaste el landing ahí, lo usamos luego.

/**
 * Agrupador del Landing Page con TODOS tus componentes.
 */
const LandingPageLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        {/* Tus componentes restaurados */}
        <ExploreSpaces />
        <FeaturedVideos />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <Routes>
        {/* Ruta principal: Muestra toda tu página de inicio intacta */}
        <Route path="/" element={<LandingPageLayout />} />
        
        {/* Ruta de Login: Pantalla dividida limpia */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;