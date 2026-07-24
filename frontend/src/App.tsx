import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingNav } from './components/layout/FloatingNav';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { ExploreSpacesPage } from './pages/ExploreSpacesPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { StudentQuestionnairePage } from './pages/questionnaire/StudentQuestionnairePage';
import { HostQuestionnairePage } from './pages/questionnaire/HostQuestionnairePage';


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
        <FloatingNav />
        <Routes>
          <Route path="/" element={<LandingPageLayout />} />
          
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cuestionario/buscar" element={<StudentQuestionnairePage />} />
          <Route path="/cuestionario/ofrecer" element={<HostQuestionnairePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/explorar" element={<ExploreSpacesPage />} />
          <Route path="/mensajes" element={<MessagesPage />} />
          <Route path="/asesorias" element={<AdvisoryPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;