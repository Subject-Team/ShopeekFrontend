import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowLeft, LayoutDashboard, LogIn, MessageSquare, Shield, BarChart3 } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';

  return (
    <header className="w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50 font-vazir dir-rtl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo Header */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md shadow-brand-500/20">
            ش
          </div>
          <div>
            <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 block leading-tight">
              شاپیک
            </span>
            <span className="text-[10px] sm:text-xs text-brand-600 font-semibold block">تحلیل هوشمند فروش</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {isLanding ? (
            <a href="#features" className="hover:text-brand-600 transition-colors">قابلیت‌ها</a>
          ) : (
            <Link to="/#features" className="hover:text-brand-600 transition-colors">قابلیت‌ها</Link>
          )}
          <Link
            to="/contact"
            className={`transition-colors ${location.pathname === '/contact' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
          >
            تماس با ما
          </Link>
          <Link
            to="/privacy-policy"
            className={`transition-colors ${location.pathname === '/privacy-policy' ? 'text-brand-600 font-bold' : 'hover:text-brand-600'}`}
          >
            حریم خصوصی
          </Link>
        </nav>

        {/* Desktop Header Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold text-xs transition-all bg-white shadow-2xs"
          >
            ورود / ثبت‌نام
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <span>ورود به داشبورد</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
          aria-label="منوی سایت"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
        </button>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 sm:top-20 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl z-50 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 border-b border-slate-100 pb-4">
            {isLanding ? (
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <span>قابلیت‌های سامانه</span>
              </a>
            ) : (
              <Link
                to="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <span>قابلیت‌های سامانه</span>
              </Link>
            )}

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                location.pathname === '/contact' ? 'bg-brand-50 text-brand-600 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <span>تماس با ما و پشتیبانی</span>
            </Link>

            <Link
              to="/privacy-policy"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                location.pathname === '/privacy-policy' ? 'bg-brand-50 text-brand-600 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-brand-600" />
              <span>سیاست حفظ حریم خصوصی</span>
            </Link>
          </nav>

          {/* Action Buttons inside Mobile Menu */}
          <div className="flex flex-col gap-2.5 pt-1">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs text-center bg-slate-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>ورود / ثبت‌نام حساب</span>
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 text-center flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ورود به داشبورد تحلیلی</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
