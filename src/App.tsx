import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PageContextProvider, usePageContext } from './context/PageContext';
import { Shell } from './components/layout/Shell';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CustomersPage } from './pages/CustomersPage';
import { IngestionPage } from './pages/IngestionPage';

const AppContent: React.FC = () => {
  const { activePage } = usePageContext();

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
        <PageContextProvider>
          <AppContent />
        </PageContextProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
