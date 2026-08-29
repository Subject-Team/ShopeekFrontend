import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MinimalFooter } from './MinimalFooter';
import { ChatDrawer } from '../chat/ChatDrawer';
import { GuideSpotlight } from '../guide/GuideSpotlight';
import { RestrictionBanner } from '../dashboard/RestrictionBanner';
import { useAuth } from '../../context/AuthContext';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200">
      {/* Interactive In-App Spotlight Guide */}
      <GuideSpotlight />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 transition-all duration-300 min-h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:px-8 max-w-7xl w-full mx-auto space-y-6">
          <RestrictionBanner user={user} />
          {children}
        </main>
        {/* Short Dashboard Footer */}
        <MinimalFooter />
      </div>

      {/* Context-Aware AI Chat Assistant Drawer */}
      <ChatDrawer />
    </div>
  );
};
