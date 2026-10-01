import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MinimalFooter } from './MinimalFooter';
import { GuideSpotlight } from '../guide/GuideSpotlight';
import { RestrictionBanner } from '../dashboard/RestrictionBanner';
import { useAuth } from '../../context/AuthContext';
import { usePageContext } from '../../context/PageContext';
import { fetchBillingOverview } from '../../services/api';
import type { BillingOverview } from '../../types';

// Mounted only while the drawer is open so the react-markdown/unified stack
// stays out of the dashboard's initial load.
const ChatDrawer = lazy(() => import('../chat/ChatDrawer').then((m) => ({ default: m.ChatDrawer })));

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const { user } = useAuth();
  const { isChatOpen } = usePageContext();

  useEffect(() => {
    let active = true;
    fetchBillingOverview()
      .then((data) => {
        if (active) setBilling(data);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, []);

  const debt = billing?.wallet ? Math.max(0, -billing.wallet.purchased_balance) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Interactive In-App Spotlight Guide */}
      <GuideSpotlight />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:ms-64 transition-all duration-300 min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} billing={billing} />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <RestrictionBanner user={user} debt={debt} />
          {children}
        </main>
        {/* Short Dashboard Footer */}
        <MinimalFooter />
      </div>

      {/* Context-Aware AI Chat Assistant Drawer */}
      {isChatOpen && (
        <Suspense fallback={null}>
          <ChatDrawer />
        </Suspense>
      )}
    </div>
  );
};
