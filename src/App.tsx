import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { PageContextProvider } from './context/PageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Shell } from './components/layout/Shell';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CustomersPage } from './pages/CustomersPage';
import { IngestionPage } from './pages/IngestionPage';
import { NotFoundPage } from './pages/NotFoundPage';

const ProtectedDashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast('جهت دسترسی به داشبورد، لطفاً ابتدا وارد حساب کاربری خود شوید.', 'warning');
    }
  }, [isLoading, isAuthenticated, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center text-slate-100 font-vazir dir-rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">در حال بارگذاری سامانه شاپیک...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="ingestion" element={<IngestionPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Shell>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth Login / Register Page */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privacy Policy Main Page & Legacy Path Redirect */}
      <Route path="/privacy-policy" element={<PrivacyPage />} />
      <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

      {/* Protected Dashboard Section with Sub-routes */}
      <Route path="/dashboard/*" element={<ProtectedDashboardLayout />} />

      {/* Catch-all 404 Page (Rendered in-place without redirect) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PageContextProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </PageContextProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
