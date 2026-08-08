import React from 'react';
import { Menu, Sun, Moon, Sparkles, Calendar, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePageContext } from '../../context/PageContext';
import { useAuth } from '../../context/AuthContext';
import { formatPersianNumber } from '../../utils';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { activePage, dateRangeDays, setDateRangeDays, setIsChatOpen } = usePageContext();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'داشبورد تحلیل فروش';
      case 'analytics': return 'تحلیل جامع و آمار';
      case 'customers': return 'مدیریت مشتریان (CRM)';
      case 'ingestion': return 'ورود و مدیریت داده‌ها';
      default: return 'داشبورد';
    }
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors duration-200 dir-rtl">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="باز کردن منو"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-base lg:text-lg">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Filter Selection */}
        {activePage === 'dashboard' || activePage === 'analytics' ? (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDateRangeDays(d)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  dateRangeDays === d
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {formatPersianNumber(d)} روز
              </button>
            ))}
          </div>
        ) : null}

        {/* Theme Toggle Button (Light/Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
          title={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {/* Floating Chat Drawer Trigger */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 font-semibold text-xs transition-all shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="hidden md:inline">دستیار هوشمند</span>
        </button>

        {/* User Profile & Logout Controls */}
        {user && (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="hidden sm:flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                {user.full_name}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="خروج از حساب کاربری"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
