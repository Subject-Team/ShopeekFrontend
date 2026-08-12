import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { PublicHeader } from '../components/layout/PublicHeader';
import { MinimalFooter } from '../components/layout/MinimalFooter';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-vazir dir-rtl selection:bg-brand-500 selection:text-white relative overflow-hidden">
      <SEO
        title="صفحه یافت نشد (خطای ۴۰۴) | شاپیک"
        description="متأسفانه آدرس وارد شده در سامانه شاپیک یافت نشد. لطفاً از طریق دکمه بازگشت به صفحه اصلی منتقل شوید."
      />

      {/* Sticky Header */}
      <PublicHeader />

      {/* Ambient Decorative Backdrops */}
      <div className="absolute top-1/4 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main 404 Hero Viewport - Light Theme */}
      <main className="flex-1 flex items-center justify-center p-6 z-10 my-auto">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 shadow-sm mb-2 relative">
            <Search className="w-10 h-10" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-xs">
              !
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-brand-700 uppercase bg-brand-50 px-3.5 py-1 rounded-full border border-brand-200">
              کد خطا: ۴۰۴ / Page Not Found
            </span>

            {/* Single H1 requirement for 404 page */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 pt-2 leading-tight">
              صفحه مورد نظر یافت نشد
            </h1>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-md mx-auto pt-1">
              آدرسی که وارد کرده‌اید وجود ندارد، تغییر یافته یا ممکن است به اشتباه تایپ شده باشد.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <span>ورود به داشبورد</span>
            </Link>
          </div>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};
