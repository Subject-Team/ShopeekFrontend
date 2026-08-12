import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, BarChart3, Bot, FileText, ArrowUpLeft } from 'lucide-react';

export const MainFooter: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800 font-vazir dir-rtl">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
                ش
              </div>
              <div>
                <span className="font-bold text-lg text-white">شاپیک</span>
                <p className="text-xs text-slate-400 font-medium">پلتفرم هوشمند تحلیل و مشاوره فروش</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              سامانه تحلیلی شاپیک با بهره‌گیری از هوش مصنوعی، ابزارهای جامع مدیریت مشتریان (CRM) و ربات تلگرام ثبت سریع، راهکاری نوین برای ارتقای فروش کسب‌وکارهای ایرانی ارائه می‌دهد.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>حریم خصوصی تضمین‌شده</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">دسترسی سریع</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpLeft className="w-3 h-3 text-slate-500" />
                  <span>صفحه اصلی</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpLeft className="w-3 h-3 text-slate-500" />
                  <span>ورود / ثبت‌نام حساب</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpLeft className="w-3 h-3 text-slate-500" />
                  <span>داشبورد تحلیلی</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-400 transition-colors flex items-center gap-1.5">
                  <ArrowUpLeft className="w-3 h-3 text-slate-500" />
                  <span>سیاست حفظ حریم خصوصی</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">ویژگی‌های کلیدی</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>تحلیل پیشرفته نمودار و روند فروش</span>
              </li>
              <li className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>مشاور هوشمند کسب‌وکار</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ربات ثبت سریع تلگرام</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ورود داده آسان با فایل Excel / CSV</span>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">قوانین و امنیت</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تمامی داده‌های مالی و حساب کاربران طبق ضوابط الگوریتم‌های استاندارد امنیتی نگهداری شده و اطلاعات شخصی قابل شناسایی قبل از پردازش هوشمند، ناشناس‌سازی می‌گردند.
            </p>
            <div className="pt-1">
              <Link
                to="/privacy-policy"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 underline underline-offset-4"
              >
                <span>مطالعه سند کامل حریم خصوصی</span>
                <ArrowUpLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} شاپیک (Shopeek). تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">حریم خصوصی</Link>
            <Link to="/" className="hover:text-slate-300 transition-colors">صفحه اصلی</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">ورود کاربران</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
