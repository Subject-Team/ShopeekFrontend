import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { PageContextProvider } from './context/PageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GuideProvider } from './context/GuideContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { Shell } from './components/layout/Shell';
import { LandingPage } from './pages/LandingPage';
import { LegalPage } from './pages/LegalPage';
import { ContactPage } from './pages/ContactPage';
import { BlogPage } from './pages/BlogPage';
import { PlansPage } from './pages/PlansPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CustomersPage } from './pages/CustomersPage';
import { IngestionPage } from './pages/IngestionPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminGuard } from './pages/AdminPage';

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
        <Route path="settings" element={<SettingsPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
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

      {/* Contact Support Page */}
      <Route path="/contact" element={<ContactPage />} />

      {/* Public Plans Comparison Page */}
      <Route path="/plans" element={<PlansPage />} />

      {/* Blog & Articles Pages */}
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />

      {/* Unified Legal Page (Terms of Service + Privacy Policy) & Legacy Path Redirects */}
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/privacy-policy" element={<Navigate to="/legal" replace />} />
      <Route path="/privacy" element={<Navigate to="/legal" replace />} />

      {/* Protected Dashboard Section with Sub-routes */}
      <Route path="/dashboard/*" element={<ProtectedDashboardLayout />} />

      {/* Admin Panel (standalone layout, role-gated) */}
      <Route path="/admin" element={<AdminGuard />} />

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
              <GuideProvider>
                <ScrollToTop />
                <AppRoutes />
              </GuideProvider>
            </BrowserRouter>
          </PageContextProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
