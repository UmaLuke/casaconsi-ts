import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { ExploreSpacesPage } from './pages/ExploreSpacesPage';

const LandingPageLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">
        <LandingPage />
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
          <Route path="/explorar" element={<ExploreSpacesPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
