import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Sparkles,
  Calendar,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePageContext } from '../../context/PageContext';
import { useAuth } from '../../context/AuthContext';
import { formatPersianNumber } from '../../utils';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { activePage, dateRangeDays, setDateRangeDays, setIsChatOpen } =
    usePageContext();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'داشبورد';
      case 'analytics':
        return 'تحلیل فروش';
      case 'customers':
        return 'مدیریت مشتریان (CRM)';
      case 'ingestion':
        return 'ورود داده‌ها';
      default:
        return 'داشبورد';
    }
  };

  const dateRangeOptions = [
    { value: 7, label: '۷ روز' },
    { value: 14, label: '۱۴ روز' },
    { value: 30, label: '۳۰ روز' },
  ];

  const showDateFilter =
    activePage === 'dashboard' || activePage === 'analytics';

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
          <h2 className="hidden sm:block font-bold text-slate-900 dark:text-white text-sm md:text-base lg:text-lg truncate max-w-[120px] md:max-w-[200px]">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Filter Selection - Desktop (buttons) */}
        {showDateFilter && !isMobile && (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {dateRangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRangeDays(opt.value)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  dateRangeDays === opt.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Date Filter Selection - Mobile (dropdown) */}
        {showDateFilter && isMobile && (
          <div className="relative">
            <select
              value={dateRangeDays}
              onChange={(e) => setDateRangeDays(Number(e.target.value))}
              className="appearance-none pl-7 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 border-0 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            >
              {dateRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        )}

        {/* Floating Chat Drawer Trigger */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all duration-200"
          title="دستیار هوشمند"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden md:inline">دستیار هوشمند</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
          title={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
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
