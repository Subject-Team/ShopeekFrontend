import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { JalaliDateRangeModal } from '../common/JalaliDateRangeModal';
import { formatJalaliRangeLabel } from '../../utils/jalali';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    dateRangeDays,
    startDate,
    endDate,
    isHistorical,
    setDateRange,
    setIsChatOpen,
  } = usePageContext();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 1024);
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/dashboard/':
        return 'داشبورد اصلی';
      case '/dashboard/analytics':
        return 'تحلیل و آمار فروش';
      case '/dashboard/customers':
        return 'مدیریت مشتریان (CRM)';
      case '/dashboard/ingestion':
        return 'ورود داده‌ها';
      case '/dashboard/settings':
        return 'تنظیمات';
      default:
        return 'داشبورد';
    }
  };

  const showDateFilter =
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/' ||
    location.pathname === '/dashboard/analytics';

  const getDateButtonLabel = () => {
    return formatJalaliRangeLabel(startDate, endDate);
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
          <span className="hidden sm:block font-bold text-slate-900 dark:text-white text-sm md:text-base lg:text-lg truncate max-w-[150px] md:max-w-[250px]">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Range Selector Trigger */}
        {showDateFilter && (
          <div data-guide="date-filter" className="relative">
            <button
              onClick={() => setIsDateModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                isHistorical
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
              title={isHistorical ? 'در حال مشاهده آمار گذشته' : 'انتخاب بازه زمانی'}
            >
              <Calendar className={`w-3.5 h-3.5 ${isHistorical ? 'text-amber-500' : 'text-slate-400'}`} />
              {/* Hide text label on mobile screens to prevent topbar overflow */}
              <span className="hidden sm:inline">
                {getDateButtonLabel()}
              </span>
              {isHistorical && (
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md font-medium">
                  آرشیو
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Jalali Calendar Modal */}
            <JalaliDateRangeModal
              isOpen={isDateModalOpen}
              onClose={() => setIsDateModalOpen(false)}
              startDate={startDate}
              endDate={endDate}
              onApply={(newStart, newEnd) => setDateRange(newStart, newEnd)}
            />
          </div>
        )}


        {/* Floating Chat Drawer Trigger */}
        <button
          data-guide="chat-trigger"
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/25 transition-all duration-200"
          title="دستیار هوشمند"
        >
          <Sparkles className="w-5 h-5" />
          <span className="hidden md:inline">دستیار هوشمند</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          data-guide="theme-toggle"
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
