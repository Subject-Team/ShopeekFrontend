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
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Header - fixed at top */}
      <header
        className={`w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md fixed top-0 left-0 right-0 z-50 font-vazir dir-rtl transition-all duration-300 ease-in-out ${
          scrolled ? 'py-1.5 shadow-md bg-white/95' : 'py-3 shadow-2xs bg-white/85'
        } ${
          // Hide header on mobile when scrolled, keep visible on desktop
          scrolled ? 'md:translate-y-0 -translate-y-full' : 'translate-y-0'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
            scrolled ? 'max-w-full px-4 sm:px-8 h-14' : 'max-w-7xl px-4 sm:px-6 h-16 sm:h-20'
          }`}
        >
          {/* Left side: Brand Logo */}
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
          </div>

          {/* Center: Navigation Links */}
          <nav
            className={`hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 transition-all duration-300 ease-in-out ${
              scrolled
                ? 'right-36'
                : 'left-1/2 -translate-x-1/3'
            } absolute`}
          >
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

          {/* Right side: Action Buttons */}
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

          {/* Mobile Hamburger Button - hidden when scrolled */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 ${
              scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
            aria-label="منوی سایت"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
          </button>
        </div>
      </header>

      {/* Floating Mobile Hamburger Button - visible only on mobile when scrolled */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`md:hidden fixed top-3 left-4 transform z-50 p-2.5 rounded-2xl bg-white/95 border border-slate-300 shadow-xl text-slate-900 backdrop-blur-md transition-all duration-300 ${
          scrolled ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        aria-label="منوی شناور سایت"
      >
        {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
      </button>


      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className={`md:block transition-all duration-300 ${scrolled ? 'h-14' : 'h-16 sm:h-20'}`} />

      {/* Mobile Drawer Menu Overlay */}
      {(
        <div className={`${mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}md:hidden fixed inset-x-0 top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-2xl z-40 p-5 ${scrolled? 'pt-4' : 'pt-24 sm:pt-28'} space-y-4 duration-200`}>
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
              <span>ورود به داشبورد</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
