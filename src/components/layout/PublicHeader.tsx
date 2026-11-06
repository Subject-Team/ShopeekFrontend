import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogIn, MessageSquare, Shield, BarChart3, BookOpen, Tags, Zap } from 'lucide-react';

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
        className={`w-full fixed top-0 left-0 right-0 z-50 font-vazir dir-rtl transition-colors duration-150 ease-in-out ${
          scrolled ? 'py-2 shadow-[0_1px_3px_rgba(31,27,22,0.04)] border-b border-[rgba(31,27,22,0.08)] bg-[#fdfbf7]/85 backdrop-blur-md' : 'py-3 bg-transparent border-transparent'
        } ${
          // Hide header on mobile when scrolled, keep visible on desktop
          scrolled ? 'lg:translate-y-0 -translate-y-full' : 'translate-y-0'
        }`}
      >
        <div
          className={`mx-auto flex items-center justify-between transition-[height,padding] duration-200 ease-in-out ${
            scrolled ? 'max-w-full px-4 sm:px-8 h-14' : 'max-w-7xl px-4 sm:px-6 h-16 sm:h-20'
          }`}
        >
          {/* Left side: Brand Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link to="/" className="flex items-center gap-3 shrink-0" onClick={() => {
              setMobileMenuOpen(false);
              if (isLanding) window.scrollTo({ top: 0, behavior: 'smooth' });
            }}>
              <img src="/images/logo.svg" alt="logo" className="transition-[width] duration-200 ease-in-out" width={scrolled ? 50 : 80} />
              <div>
                <span className={`font-semibold tracking-tight text-[#1f1b16] block leading-tight transition-all duration-200 ${
                  scrolled ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
                }`}>
                  شاپیک
                </span>
                {!scrolled && (
                  <span className="text-[10px] sm:text-xs text-[#00856f] font-medium block transition-opacity duration-200">
                    تحلیل هوشمند فروش
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav
            className={`hidden lg:flex items-center gap-6 text-sm font-medium text-[#5c544d] transition-all duration-200 ease-in-out ${
              scrolled
                ? 'right-40'
                : 'right-1/2 translate-x-1/2'
            } absolute`}
          >
            {isLanding ? (
              <a href="#how-it-works" className="hover:text-[#00856f] transition-colors duration-150">نحوه کارکرد</a>
            ) : (
              <Link to="/#how-it-works" className="hover:text-[#00856f] transition-colors duration-150">نحوه کارکرد</Link>
            )}
            <Link
              to="/plans"
              className={`transition-colors duration-150 ${location.pathname === '/plans' ? 'text-[#00856f] font-semibold' : 'hover:text-[#00856f]'}`}
            >
              طرح‌ها
            </Link>
            <Link
              to="/blog"
              className={`transition-colors duration-150 ${location.pathname.startsWith('/blog') ? 'text-[#00856f] font-semibold' : 'hover:text-[#00856f]'}`}
            >
              وبلاگ
            </Link>
            <Link
              to="/contact"
              className={`transition-colors duration-150 ${location.pathname === '/contact' ? 'text-[#00856f] font-semibold' : 'hover:text-[#00856f]'}`}
            >
              تماس با ما
            </Link>
            <Link
              to="/legal"
              className={`transition-colors duration-150 ${location.pathname.startsWith('/legal') ? 'text-[#00856f] font-semibold' : 'hover:text-[#00856f]'}`}
            >
              حریم خصوصی و شرایط
            </Link>
          </nav>

          {/* Right side: Action Buttons */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="rounded-lg border border-[rgba(31,27,22,0.12)] hover:bg-[#efe9df] bg-[#fdfbf7] text-[#1f1b16] font-medium text-xs px-4 py-2 transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center gap-2"
            >
              <span>ورود به داشبورد</span>
              <LayoutDashboard className="w-4 h-4 text-[#5c544d]" />
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-[#00856f] hover:bg-[#007360] text-white font-medium text-xs px-4 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors duration-150 flex items-center gap-2"
            >
              <span>ورود / ثبت‌نام</span>
              <LogIn className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile/Tablet Hamburger Button - hidden when scrolled */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg text-[#1f1b16] hover:bg-[#efe9df] transition-colors duration-150 border border-[rgba(31,27,22,0.10)] ${
              scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
            }`}
            aria-label="منوی سایت"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#1f1b16]" /> : <Menu className="w-6 h-6 text-[#1f1b16]" />}
          </button>
        </div>
      </header>

      {/* Floating Mobile/Tablet Action Bar (hamburger + CTA) - visible only when scrolled */}
      <div
        className={`lg:hidden fixed top-3 left-4 z-50 flex items-center gap-2 dir-rtl transition-all duration-200 ${
          scrolled ? 'opacity-100 translate-y-2' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <Link
          to="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00856f] hover:bg-[#007360] text-white font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-colors duration-150 whitespace-nowrap"
        >
          <Zap className="w-4 h-4" />
          <span>شروع رایگان</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#fdfbf7]/95 border border-[rgba(31,27,22,0.12)] shadow-[0_4px_16px_rgba(31,27,22,0.08)] text-[#1f1b16] backdrop-blur-md"
          aria-label="منوی شناور سایت"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#1f1b16]" /> : <Menu className="w-6 h-6 text-[#1f1b16]" />}
        </button>
      </div>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className={`lg:block transition-[height] duration-200 ${scrolled ? 'h-14' : 'h-16 sm:h-20'}`} />

      {/* Mobile/Tablet Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#12110f]/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu Overlay */}
      {(
        <div className={`${mobileMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"} lg:hidden fixed inset-x-0 top-0 bg-[#fdfbf7]/98 backdrop-blur-xl border-b border-[rgba(31,27,22,0.08)] shadow-[0_8px_24px_rgba(31,27,22,0.08)] z-40 p-6 ${scrolled ? 'pt-4' : 'pt-24 sm:pt-28'} space-y-4 duration-200`}>
          <nav className="flex flex-col space-y-2 text-sm font-medium text-[#5c544d] border-b border-[rgba(31,27,22,0.08)] pb-4">
            {isLanding ? (
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#efe9df] transition-colors duration-150"
              >
                <BarChart3 className="w-4 h-4 text-[#00856f]" />
                <span>نحوه کارکرد شاپیک</span>
              </a>
            ) : (
              <Link
                to="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#efe9df] transition-colors duration-150"
              >
                <BarChart3 className="w-4 h-4 text-[#00856f]" />
                <span>نحوه کارکرد شاپیک</span>
              </Link>
            )}

            <Link
              to="/plans"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-150 ${
                location.pathname === '/plans' ? 'bg-[#efe9df] text-[#00856f] font-semibold' : 'hover:bg-[#efe9df]'
              }`}
            >
              <Tags className="w-4 h-4 text-[#00856f]" />
              <span>طرح‌ها و تعرفه‌ها</span>
            </Link>

            <Link
              to="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-150 ${
                location.pathname.startsWith('/blog') ? 'bg-[#efe9df] text-[#00856f] font-semibold' : 'hover:bg-[#efe9df]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#00856f]" />
              <span>وبلاگ و مقالات</span>
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-150 ${
                location.pathname === '/contact' ? 'bg-[#efe9df] text-[#00856f] font-semibold' : 'hover:bg-[#efe9df]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#00856f]" />
              <span>تماس با ما و پشتیبانی</span>
            </Link>

            <Link
              to="/legal"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-150 ${
                location.pathname.startsWith('/legal') ? 'bg-[#efe9df] text-[#00856f] font-semibold' : 'hover:bg-[#efe9df]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#00856f]" />
              <span>حریم خصوصی و شرایط</span>
            </Link>
          </nav>

          <div className="flex flex-col gap-2 pt-1">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-lg border border-[rgba(31,27,22,0.12)] text-[#1f1b16] font-medium text-xs text-center bg-[#fdfbf7] hover:bg-[#efe9df] flex items-center justify-center gap-2 transition-colors duration-150"
            >
              <LayoutDashboard className="w-4 h-4 text-[#5c544d]" />
              <span>ورود به داشبورد</span>
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-lg bg-[#00856f] hover:bg-[#007360] text-white font-medium text-xs shadow-[0_1px_2px_rgba(0,0,0,0.06)] text-center flex items-center justify-center gap-2 transition-colors duration-150"
            >
              <LogIn className="w-4 h-4" />
              <span>ورود / ثبت‌نام حساب</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
