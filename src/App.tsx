import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { PageContextProvider } from './context/PageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BillingContextProvider } from './context/BillingContext';
import { GuideProvider } from './context/GuideContext';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ContentLoader, FullPageLoader, RouteLoader } from './components/common/AppLoader';
import { Shell } from './components/layout/Shell';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Not lazy on purpose: the landing page is the default entry for new visitors,
// and the 404 is reused by AdminGuard for non-admin roles.
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PlansPage = lazy(() => import('./pages/PlansPage').then((m) => ({ default: m.PlansPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const AdminGuard = lazy(() => import('./pages/admin/AdminGuard').then((m) => ({ default: m.AdminGuard })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const CustomersPage = lazy(() => import('./pages/CustomersPage').then((m) => ({ default: m.CustomersPage })));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));
const IngestionPage = lazy(() => import('./pages/IngestionPage').then((m) => ({ default: m.IngestionPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })));

const ProtectedDashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast('جهت دسترسی به داشبورد، لطفاً ابتدا وارد حساب کاربری خود شوید.', 'warning');
    }
  }, [isLoading, isAuthenticated, showToast]);

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell>
      <Suspense fallback={<ContentLoader />}>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="ingestion" element={<IngestionPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
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
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BillingContextProvider>
              <PageContextProvider>
                <BrowserRouter>
                  <GuideProvider>
                    <ScrollToTop />
                    <Suspense fallback={<RouteLoader />}>
                      <AppRoutes />
                    </Suspense>
                  </GuideProvider>
                </BrowserRouter>
              </PageContextProvider>
            </BillingContextProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
