import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Shield,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatsTab } from './admin/StatsTab';
import { UsersTab } from './admin/UsersTab';
import { ErrorsTab } from './admin/ErrorsTab';

type AdminTab = 'stats' | 'users' | 'errors';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  const tabs: { key: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'stats', label: 'آمار', icon: BarChart3 },
    { key: 'users', label: 'کاربران', icon: Users },
    { key: 'errors', label: 'خطاها', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-vazir dir-rtl">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-xs font-bold"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به داشبورد</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">پنل مدیریت</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none">شاپیک</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'users' && <UsersTab currentUserId={user?.id || ''} />}
        {activeTab === 'errors' && <ErrorsTab />}
      </main>
    </div>
  );
};