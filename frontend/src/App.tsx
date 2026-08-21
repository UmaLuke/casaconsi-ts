import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { FloatingNav } from './components/layout/FloatingNav';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthProvider } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ExploreSpacesPage } from './pages/ExploreSpacesPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { StudentQuestionnairePage } from './pages/questionnaire/StudentQuestionnairePage';
import { HostQuestionnairePage } from './pages/questionnaire/HostQuestionnairePage';
import {RegisterAdvisorPage} from './pages/auth/RegisterAdvisorPage';
import { SpaceDetailPage } from './pages/SpaceDetailPage';
import { InterestedStudentsPage } from './pages/InterestedStudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';


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
    // AuthProvider va adentro de Router: así puede usar useNavigate() para
    // mandar a la landing apenas se dispara logout() (manual o automático
    // por vencimiento de token), sin depender de que cada página esté
    // detrás de ProtectedRoute.
    <Router>
      <AuthProvider>
        <FloatingNav />
        <Routes>
          <Route path="/" element={<LandingPageLayout />} />

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/asesor" element={<RegisterAdvisorPage />} />
          <Route
            path="/cuestionario/buscar"
            element={
              <ProtectedRoute>
                <StudentQuestionnairePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cuestionario/ofrecer"
            element={
              <ProtectedRoute>
                <HostQuestionnairePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/explorar" element={<ExploreSpacesPage />} />
          <Route path="/espacios/:id" element={<SpaceDetailPage />} />
          <Route
            path="/descubrir"
            element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/interesados"
            element={
              <ProtectedRoute>
                <InterestedStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interesados/:studentUserId"
            element={
              <ProtectedRoute>
                <StudentDetailPage />
              </ProtectedRoute>
            }
          />

          <Route path="/asesorias" element={<AdvisoryPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;