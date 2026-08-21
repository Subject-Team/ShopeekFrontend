import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  UploadCloud,
  Sparkles,
  ChevronRight,
  Home,
  HelpCircle,
  Headphones,
} from 'lucide-react';
import { usePageContext } from '../../context/PageContext';
import { useGuide } from '../../context/GuideContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { setIsChatOpen } = usePageContext();
  const { startGuide, isGuideOpen } = useGuide();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { path: '/dashboard/analytics', label: 'تحلیل و آمار فروش', icon: TrendingUp },
    { path: '/dashboard/customers', label: 'مدیریت مشتریان (CRM)', icon: Users },
    { path: '/dashboard/ingestion', label: 'ورود داده‌ها (CSV/Excel)', icon: UploadCloud },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 bottom-0 z-40 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.svg" alt="logo" width={50} height={50} />
              <div>
                <span className="font-bold text-lg leading-tight text-slate-900 dark:text-white block">
                  شاپیک
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">تحلیل هوشمند فروش</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/dashboard' && location.pathname === '/dashboard/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Quick In-App Guide Launcher */}
            <div className="pt-2">
              <button
                data-guide="sidebar-guide-btn"
                onClick={() => {
                  startGuide();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border ${
                  isGuideOpen
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title="شروع یا بازبینی تور راهنمای سامانه"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>راهنمای سامانه</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold">
                  آموزش
                </span>
              </button>
            </div>

            {/* Support and Home Links */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-3 space-y-1">
              <Link
                to="/contact"
                data-guide="sidebar-help"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              >
                <Headphones className="w-4 h-4 shrink-0 text-slate-400" />
                <span>پشتیبانی و تمدید اشتراک</span>
              </Link>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
              >
                <Home className="w-4 h-4 shrink-0 text-slate-400" />
                <span>صفحه اصلی سایت</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* AI Assistant Callout Box */}
        <div data-guide="sidebar-chat" className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200">دستیار هوشمند شاپیک</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              پاسخ‌گویی سریع به سوالات شما درباره روند فروش و آمار.
            </p>
            <button
              onClick={() => {
                setIsChatOpen(true);
                setIsOpen(false);
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>گفتگو با دستیار</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
