import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowLeft, LayoutDashboard, LogIn, MessageSquare, Shield, BarChart3 } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Header Component */}
      <header
        className={`w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40 font-vazir dir-rtl transition-all duration-300 ease-in-out ${
          scrolled ? 'py-1.5 shadow-md bg-white/95' : 'py-3 shadow-2xs bg-white/85'
        } ${
          /* On mobile when scrolled, hide top header bar background while floating button remains */
          scrolled ? '-translate-y-full md:translate-y-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'translate-y-0 opacity-100 pointer-events-auto'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
            scrolled ? 'max-w-full px-4 sm:px-8 h-14' : 'max-w-7xl px-4 sm:px-6 h-16 sm:h-20'
          }`}
        >
          {/* Right Group: Brand Logo & Immediately Adjacent Navigation Links */}
          <div className="flex items-center gap-6 lg:gap-8 transition-all duration-300">
            <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0" onClick={() => setMobileMenuOpen(false)}>
              <div
                className={`rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold transition-all duration-300 ${
                  scrolled ? 'w-8 h-8 sm:w-9 sm:h-9 text-lg shadow-sm' : 'w-9 h-9 sm:w-11 sm:h-11 text-xl sm:text-2xl shadow-md shadow-brand-500/20'
                }`}
              >
                ش
              </div>
              <div>
                <span className={`font-black tracking-tight text-slate-900 block leading-tight transition-all duration-300 ${
                  scrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                }`}>
                  شاپیک
                </span>
                {!scrolled && (
                  <span className="text-[10px] sm:text-xs text-brand-600 font-semibold block transition-all duration-300">
                    تحلیل هوشمند فروش
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation Links (Stuck Beside Logo on the Right Side) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 transition-all duration-300">
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
          </div>

          {/* Left Group: Action Buttons (Move Left towards edge on desktop) */}
          <div className="hidden md:flex items-center gap-3 shrink-0 transition-all duration-300">
            <Link
              to="/login"
              className={`rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 font-semibold text-xs transition-all bg-white shadow-2xs ${
                scrolled ? 'px-3.5 py-2' : 'px-4 py-2.5'
              }`}
            >
              ورود / ثبت‌نام
            </Link>
            <Link
              to="/dashboard"
              className={`rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 ${
                scrolled ? 'px-3.5 py-2' : 'px-4 py-2.5'
              }`}
            >
              <span>ورود به داشبورد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Unscrolled Mobile Hamburger Button Inside Header */}
          {!scrolled && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
              aria-label="منوی سایت"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
            </button>
          )}
        </div>
      </header>

      {/* Scrolled Mobile Floating Hamburger Hover Button */}
      {scrolled && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed top-3 right-4 z-50 p-2.5 rounded-2xl bg-white/95 border border-slate-300 shadow-xl text-slate-900 backdrop-blur-md transition-all duration-300 animate-in fade-in zoom-in-90"
          aria-label="منوی شناور سایت"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
        </button>
      )}

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
    </>
  );
};
