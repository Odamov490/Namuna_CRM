import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext.jsx';
import { ToastContainer, LoadingPage } from './components/ui/index.jsx';
import Navbar from './components/layout/Navbar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SamplesPage   from './pages/SamplesPage.jsx';
import ScanPage      from './pages/ScanPage.jsx';
import LabsPage      from './pages/LabsPage.jsx';
import AlertsPage    from './pages/AlertsPage.jsx';
import AdminPage     from './pages/AdminPage.jsx';
import AuthPage      from './pages/AuthPage.jsx';
import ProfilePage   from './pages/ProfilePage.jsx';

function ProtectedRoute({ children }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingPage />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, userProfile, authLoading } = useApp();
  if (authLoading) return <LoadingPage />;
  if (!user) return <Navigate to="/auth" replace />;
  if (userProfile?.role !== 'super_admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, authLoading, toasts } = useApp();

  if (authLoading) return <LoadingPage text="Tizim yuklanmoqda..." />;

  return (
    <>
      <Navbar />
      <main className={user ? 'pt-16' : ''}>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/samples" element={<ProtectedRoute><SamplesPage /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
          <Route path="/labs" element={<ProtectedRoute><LabsPage /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
