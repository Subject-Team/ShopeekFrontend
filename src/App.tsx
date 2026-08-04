import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PageContextProvider, usePageContext } from './context/PageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Shell } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CustomersPage } from './pages/CustomersPage';
import { IngestionPage } from './pages/IngestionPage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const { activePage } = usePageContext();
  const { isAuthenticated, isLoading } = useAuth();

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
    return <LoginPage />;
  }

  return (
    <Shell>
      {activePage === 'dashboard' && <DashboardPage />}
      {activePage === 'analytics' && <AnalyticsPage />}
      {activePage === 'customers' && <CustomersPage />}
      {activePage === 'ingestion' && <IngestionPage />}
    </Shell>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <PageContextProvider>
            <AppContent />
          </PageContextProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
