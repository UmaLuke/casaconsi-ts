import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/features/landing/Hero';
import { HowItWorks } from './components/features/landing/HowItWorks';
import { ExploreSpaces } from './components/features/landing/ExploreSpaces';
import { FeaturedVideos } from './components/features/landing/FeaturedVideos';
import { Testimonials } from './components/features/landing/Testimonials';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';

const LandingPageLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
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
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPageLayout />} />
          
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
