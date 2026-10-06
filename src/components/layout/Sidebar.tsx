import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  UploadCloud,
  ReceiptText,
  Settings as SettingsIcon,
  CreditCard,
  ChevronRight,
  Home,
  HelpCircle,
  Headphones,
  Sun,
  Moon,
  LogOut,
  ArrowLeftRight,
  UserPlus,
  Check,
  X,
  Trash2,
} from 'lucide-react';
import { useGuide } from '../../context/GuideContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toPersianDigits } from '../../utils/persian';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { startGuide, isGuideOpen } = useGuide();
  const { theme, toggleTheme } = useTheme();
  const { user, accounts, switchAccount, removeAccount, logout, logoutAll } = useAuth();
  const location = useLocation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState<boolean>(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close accounts popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  const navItems = [
    { path: '/dashboard', label: 'داشبورد اصلی', icon: LayoutDashboard },
    { path: '/dashboard/analytics', label: 'تحلیل و آمار فروش', icon: TrendingUp },
    { path: '/dashboard/customers', label: 'مدیریت مشتریان (CRM)', icon: Users },
    { path: '/dashboard/invoices', label: 'فاکتورهای فروش', icon: ReceiptText },
    { path: '/dashboard/ingestion', label: 'ورود داده‌ها (CSV/Excel)', icon: UploadCloud },
    { path: '/dashboard/settings', label: 'تنظیمات', icon: SettingsIcon },
    { path: '/dashboard/subscription', label: 'اشتراک و پرداخت', icon: CreditCard },
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
        <div className="overflow-y-auto">
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

        {/* User Profile, Multi-Account Switcher, Theme Toggle & Logout Controls */}
        <div className="relative p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50" ref={accountMenuRef}>
          {/* Floating Multi-Account Popover Menu */}
          {isAccountMenuOpen && (
            <div className="absolute bottom-full mb-2 right-2 left-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 space-y-3 font-vazir dir-rtl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">حساب‌های متصل</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 font-bold">
                    {toPersianDigits(accounts.length || (user ? 1 : 0))}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  aria-label="بستن منو"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Accounts List */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-0.5">
                {accounts.map(acc => {
                  const isActive = acc.user.id === user?.id;
                  return (
                    <div
                      key={acc.user.id}
                      className={`group flex items-center justify-between gap-2 p-2 rounded-xl transition-all border ${
                        isActive
                          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-200/80 dark:border-brand-800/60'
                          : 'bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (!isActive) {
                            switchAccount(acc.user.id);
                          }
                          setIsAccountMenuOpen(false);
                        }}
                        className="flex items-center gap-2 min-w-0 flex-1 text-right cursor-pointer"
                        title={isActive ? 'حساب فعال فعلی' : `تغییر به حساب ${acc.user.full_name}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isActive
                              ? 'bg-brand-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          {isActive ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            acc.user.full_name.charAt(0) || 'ک'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {acc.user.full_name}
                            </span>
                            {isActive && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold shrink-0">
                                فعال
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                            {acc.user.phone || acc.user.email || ''}
                          </span>
                        </div>
                      </button>

                      {/* Remove Account action */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          removeAccount(acc.user.id);
                          if (acc.user.id === user?.id && accounts.length <= 1) {
                            setIsAccountMenuOpen(false);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-70 group-hover:opacity-100 transition-all shrink-0"
                        title="حذف نشست این حساب از دستگاه"
                        aria-label={`حذف حساب ${acc.user.full_name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-1.5">
                <Link
                  to="/login"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>افزودن حساب کاربری جدید</span>
                </Link>

                {accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      logoutAll();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] font-semibold transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>خروج از تمام حساب‌ها</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {user ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 hover:bg-brand-500/25 flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-colors"
                  title="تغییر یا مدیریت حساب‌های متصل"
                  aria-label="تغییر یا مدیریت حساب‌ها"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate" title={user.full_name}>
                    {user.full_name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                    {user.email || user.phone || ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
                  aria-label="تغییر تم"
                >
                  {theme === 'light' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="خروج از حساب کاربری"
                  aria-label="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end p-1">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={theme === 'light' ? 'تغییر به حالت تاریک' : 'تغییر به حالت روشن'}
                aria-label="تغییر تم"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

