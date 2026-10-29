import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileQuestion,
  LayoutDashboard,
  ArrowRight,
  ReceiptText,
  TrendingUp,
  Users,
  UploadCloud,
} from 'lucide-react';
import { SEO } from '../components/common/SEO';

interface DashboardQuickLink {
  to: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    to: '/dashboard/invoices',
    title: 'فاکتورهای فروش',
    description: 'مرور و ثبت فاکتورهای فروش',
    icon: ReceiptText,
  },
  {
    to: '/dashboard/analytics',
    title: 'تحلیل و آمار فروش',
    description: 'روند درآمد و نمودارهای دوره‌ای',
    icon: TrendingUp,
  },
  {
    to: '/dashboard/customers',
    title: 'مدیریت مشتریان',
    description: 'لیست، وفاداری و رفتار مشتریان',
    icon: Users,
  },
  {
    to: '/dashboard/ingestion',
    title: 'ورود داده‌ها',
    description: 'بارگذاری اکسل و همگام‌سازی سفارشات',
    icon: UploadCloud,
  },
];

export const DashboardNotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <SEO
        title="صفحه یافت نشد | داشبورد شاپیک"
        description="صفحه یا بخش مورد نظر در داشبورد شاپیک یافت نشد."
      />

      {/* Accessible H1 */}
      <h1 className="sr-only">بخش مورد نظر در داشبورد یافت نشد</h1>

      {/* Main 404 Card inside Dashboard Shell */}
      <div className="glass-card rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-12 text-center relative overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
        {/* Ambient Subtle Glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-36 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          {/* Badge Icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-600 dark:text-brand-400 mb-2 shadow-xs">
            <FileQuestion className="w-10 h-10" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-xs shadow-xs">
              !
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="inline-block text-xs font-bold tracking-wider text-brand-700 dark:text-brand-300 uppercase bg-brand-50 dark:bg-brand-950/70 px-3.5 py-1 rounded-full border border-brand-200 dark:border-brand-800/60">
                کد خطا: ۴۰۴ / بخش نامعتبر
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white pt-2 leading-tight">
              بخش مورد نظر در داشبورد یافت نشد
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto pt-1">
              صفحه یا بخشی که به دنبال آن هستید وجود ندارد، حذف شده یا ممکن است نشانی واردشده به اشتباه تایپ شده باشد.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>بازگشت به داشبورد اصلی</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صفحه قبل</span>
            </button>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="relative z-10 mt-10 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 max-w-3xl mx-auto">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 text-center">
            یا دسترسی سریع به بخش‌های اصلی داشبورد:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-right">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/90 bg-white/60 dark:bg-slate-900/40 hover:border-brand-500/40 hover:bg-brand-50/40 dark:hover:bg-slate-800/60 transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-brand-500 group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
